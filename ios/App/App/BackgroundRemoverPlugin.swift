import Capacitor
import UIKit
import Vision

/**
 * Cuts the main object out of a photo on the device with Apple Vision's
 * foreground mask (the same model behind "lift subject" in Photos, iOS 17+).
 * No network API is involved. The iOS twin of BackgroundRemoverPlugin.java:
 * soft edges, stray islands removed, cropped with a small margin.
 *
 * JS: BackgroundRemover.removeBackground({ image: <base64 JPEG/PNG> }) → { image: <base64 PNG> }
 *     BackgroundRemover.suggestNames({ image }) → { names: [string] }  (Vision image classification, on the device)
 * Below iOS 17 (or in the Simulator) it rejects, and the app keeps the whole photo.
 */
@objc(BackgroundRemoverPlugin)
public class BackgroundRemoverPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BackgroundRemoverPlugin"
    public let jsName = "BackgroundRemover"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "removeBackground", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "suggestNames", returnType: CAPPluginReturnPromise)
    ]

    /// Names for the object in the photo, best first. The cut-out is laid on white first
    /// (transparency would read as black). Never fails: no names is a fine answer.
    @objc func suggestNames(_ call: CAPPluginCall) {
        guard let image = call.getString("image"),
              let data = Data(base64Encoded: image, options: .ignoreUnknownCharacters),
              let src = UIImage(data: data) else {
            call.resolve(["names": [String]()])
            return
        }
        DispatchQueue.global(qos: .userInitiated).async {
            let format = UIGraphicsImageRendererFormat()
            format.scale = 1
            let onWhite = UIGraphicsImageRenderer(size: src.size, format: format).image { ctx in
                UIColor.white.setFill()
                ctx.fill(CGRect(origin: .zero, size: src.size))
                src.draw(at: .zero)
            }
            guard let cg = onWhite.cgImage else { call.resolve(["names": [String]()]); return }
            let request = VNClassifyImageRequest()
            do {
                try VNImageRequestHandler(cgImage: cg, options: [:]).perform([request])
            } catch {
                call.resolve(["names": [String]()])
                return
            }
            let names = (request.results ?? [])
                .filter { $0.confidence > 0.12 }
                .sorted { $0.confidence > $1.confidence }
                .prefix(8)
                .map { $0.identifier.replacingOccurrences(of: "_", with: " ") }
            call.resolve(["names": Array(names)])
        }
    }

    @objc func removeBackground(_ call: CAPPluginCall) {
        guard let image = call.getString("image") else {
            call.reject("image is required")
            return
        }
        guard let data = Data(base64Encoded: image, options: .ignoreUnknownCharacters),
              let cgImage = UIImage(data: data)?.cgImage else {
            call.reject("Could not read the photo")
            return
        }
        guard #available(iOS 17.0, *) else {
            call.reject("Cut-outs need iOS 17 or newer")
            return
        }
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                guard let png = try BackgroundRemoverPlugin.cutout(cgImage) else {
                    call.reject("No object found in the photo")
                    return
                }
                call.resolve(["image": png.base64EncodedString()])
            } catch {
                CAPLog.print("[BackgroundRemover] failed: \(error)")
                call.reject("Background removal failed", nil, error)
            }
        }
    }

    @available(iOS 17.0, *)
    private static func cutout(_ cgImage: CGImage) throws -> Data? {
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        let request = VNGenerateForegroundInstanceMaskRequest()
        try handler.perform([request])
        guard let observation = request.results?.first, !observation.allInstances.isEmpty else { return nil }
        // every object Vision found, at the photo's size; removeSmallIslands keeps the main one(s)
        let mask = try observation.generateScaledMaskForImage(forInstances: observation.allInstances, from: handler)

        let w = cgImage.width, h = cgImage.height
        // RGBA, premultiplied, rows top to bottom (like Vision's mask)
        guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                                  space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue),
              let data = ctx.data else { return nil }
        ctx.draw(cgImage, in: CGRect(x: 0, y: 0, width: w, height: h))
        let pixels = UnsafeMutableBufferPointer(start: data.bindMemory(to: UInt8.self, capacity: ctx.bytesPerRow * h), count: ctx.bytesPerRow * h)
        let stride = ctx.bytesPerRow

        softCutout(pixels, stride: stride, mask: mask, width: w, height: h)
        removeSmallIslands(pixels, stride: stride, width: w, height: h)
        guard let box = contentBox(pixels, stride: stride, width: w, height: h),
              let cropped = ctx.makeImage()?.cropping(to: box) else { return nil }
        return UIImage(cgImage: cropped).pngData()
    }

    /// Alpha from Vision's per-pixel confidence: below LOW is background, above HIGH
    /// fully object, smooth in between (like the Android version).
    private static func softCutout(_ pixels: UnsafeMutableBufferPointer<UInt8>, stride: Int, mask: CVPixelBuffer, width w: Int, height h: Int) {
        let LOW: Float = 0.3, HIGH: Float = 0.7
        CVPixelBufferLockBaseAddress(mask, .readOnly)
        defer { CVPixelBufferUnlockBaseAddress(mask, .readOnly) }
        guard let base = CVPixelBufferGetBaseAddress(mask) else { return }
        let mw = CVPixelBufferGetWidth(mask), mh = CVPixelBufferGetHeight(mask)
        let rowBytes = CVPixelBufferGetBytesPerRow(mask)
        for y in 0..<h {
            let row = base.advanced(by: min(y * mh / h, mh - 1) * rowBytes).assumingMemoryBound(to: Float32.self)
            for x in 0..<w {
                var t = (row[min(x * mw / w, mw - 1)] - LOW) / (HIGH - LOW)
                t = max(0, min(1, t))
                t = t * t * (3 - 2 * t) // smoothstep
                let i = y * stride + x * 4
                // premultiplied: scale colour with alpha
                pixels[i] = UInt8(Float(pixels[i]) * t)
                pixels[i + 1] = UInt8(Float(pixels[i + 1]) * t)
                pixels[i + 2] = UInt8(Float(pixels[i + 2]) * t)
                pixels[i + 3] = UInt8(Float(pixels[i + 3]) * t)
            }
        }
    }

    /// Clears detached pieces smaller than 8% of the largest one, so a stray bit of
    /// background doesn't widen the crop and shrink the object in its tile.
    private static func removeSmallIslands(_ pixels: UnsafeMutableBufferPointer<UInt8>, stride: Int, width w: Int, height h: Int) {
        let n = w * h
        @inline(__always) func solid(_ i: Int) -> Bool { pixels[(i / w) * stride + (i % w) * 4 + 3] > 16 }
        var label = [Int32](repeating: 0, count: n) // 0 = unvisited/transparent, n = piece id
        var sizes: [Int] = [0]
        var stack = [Int]()
        stack.reserveCapacity(n)
        for start in 0..<n where label[start] == 0 && solid(start) {
            let id = Int32(sizes.count)
            var size = 0
            label[start] = id
            stack.append(start)
            while let i = stack.popLast() {
                size += 1
                let x = i % w, y = i / w
                if x > 0, label[i - 1] == 0, solid(i - 1) { label[i - 1] = id; stack.append(i - 1) }
                if x < w - 1, label[i + 1] == 0, solid(i + 1) { label[i + 1] = id; stack.append(i + 1) }
                if y > 0, label[i - w] == 0, solid(i - w) { label[i - w] = id; stack.append(i - w) }
                if y < h - 1, label[i + w] == 0, solid(i + w) { label[i + w] = id; stack.append(i + w) }
            }
            sizes.append(size)
        }
        guard sizes.count > 2 else { return } // zero or one piece: nothing to clean
        let minKeep = Int((Float(sizes.max() ?? 0) * 0.08).rounded())
        for i in 0..<n where label[i] != 0 && sizes[Int(label[i])] < minKeep {
            let p = (i / w) * stride + (i % w) * 4
            pixels[p] = 0; pixels[p + 1] = 0; pixels[p + 2] = 0; pixels[p + 3] = 0
        }
    }

    /// The object's bounds plus a 4% margin, or nil if nothing is left.
    private static func contentBox(_ pixels: UnsafeMutableBufferPointer<UInt8>, stride: Int, width w: Int, height h: Int) -> CGRect? {
        var minX = w, minY = h, maxX = -1, maxY = -1
        for y in 0..<h {
            for x in 0..<w where pixels[y * stride + x * 4 + 3] > 16 {
                minX = min(minX, x); maxX = max(maxX, x)
                minY = min(minY, y); maxY = max(maxY, y)
            }
        }
        guard maxX >= 0 else { return nil }
        let pad = Int((Float(max(maxX - minX, maxY - minY)) * 0.04).rounded())
        minX = max(0, minX - pad); minY = max(0, minY - pad)
        maxX = min(w - 1, maxX + pad); maxY = min(h - 1, maxY + pad)
        return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
    }
}
