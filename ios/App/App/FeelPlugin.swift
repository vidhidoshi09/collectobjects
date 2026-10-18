import Capacitor
import CoreHaptics
import CoreMotion
import UIKit

/**
 * Feel: rich haptics (Core Haptics) and the phone's motion (Core Motion).
 * The iOS twin of FeelPlugin.java.
 *
 * JS: Feel.impact({ intensity: 0–1, sharpness: 0–1 })   one tap; sharp = clicky, low = soft and dull
 *     Feel.rumble({ intensity: 0–1, duration: seconds })  a short continuous rumble (the shake)
 *     Feel.startMotion() / Feel.stopMotion()              "motion" events, ~30 a second:
 *       { beta, gamma } degrees (like deviceorientation) and { ax, ay, az } m/s² without gravity
 * Core Motion needs no permission prompt, unlike motion events in the web view.
 * Phones without Core Haptics fall back to UIImpactFeedbackGenerator.
 */
@objc(FeelPlugin)
public class FeelPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FeelPlugin"
    public let jsName = "Feel"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "impact", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "rumble", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startMotion", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopMotion", returnType: CAPPluginReturnPromise)
    ]

    private var engine: CHHapticEngine?
    private let motion = CMMotionManager()
    private let supportsHaptics = CHHapticEngine.capabilitiesForHardware().supportsHaptics

    private func readyEngine() -> CHHapticEngine? {
        guard supportsHaptics else { return nil }
        if engine == nil {
            engine = try? CHHapticEngine()
            engine?.isAutoShutdownEnabled = true // sleeps when idle, wakes on the next play
            engine?.resetHandler = { [weak self] in try? self?.engine?.start() }
        }
        try? engine?.start()
        return engine
    }

    private func play(_ events: [CHHapticEvent]) -> Bool {
        guard let engine = readyEngine(),
              let pattern = try? CHHapticPattern(events: events, parameters: []),
              let player = try? engine.makePlayer(with: pattern) else { return false }
        return (try? player.start(atTime: CHHapticTimeImmediate)) != nil
    }

    private static func clamp(_ v: Double?, _ fallback: Double) -> Float {
        Float(max(0, min(1, v ?? fallback)))
    }

    @objc func impact(_ call: CAPPluginCall) {
        let intensity = FeelPlugin.clamp(call.getDouble("intensity"), 0.5)
        let sharpness = FeelPlugin.clamp(call.getDouble("sharpness"), 0.5)
        DispatchQueue.main.async {
            let tap = CHHapticEvent(eventType: .hapticTransient, parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
            ], relativeTime: 0)
            if !self.play([tap]) {
                let style: UIImpactFeedbackGenerator.FeedbackStyle = intensity > 0.66 ? .heavy : intensity > 0.33 ? .medium : .light
                UIImpactFeedbackGenerator(style: style).impactOccurred(intensity: CGFloat(max(intensity, 0.2)))
            }
            call.resolve()
        }
    }

    @objc func rumble(_ call: CAPPluginCall) {
        let intensity = FeelPlugin.clamp(call.getDouble("intensity"), 0.7)
        let duration = max(0.05, min(1.5, call.getDouble("duration") ?? 0.4))
        DispatchQueue.main.async {
            let hum = CHHapticEvent(eventType: .hapticContinuous, parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.2)
            ], relativeTime: 0, duration: duration)
            if !self.play([hum]) {
                UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
            }
            call.resolve()
        }
    }

    @objc func startMotion(_ call: CAPPluginCall) {
        guard motion.isDeviceMotionAvailable else {
            call.reject("Motion isn't available on this device", "UNAVAILABLE")
            return
        }
        if !motion.isDeviceMotionActive {
            motion.deviceMotionUpdateInterval = 1.0 / 30.0
            motion.startDeviceMotionUpdates(to: .main) { [weak self] data, _ in
                guard let self = self, let d = data else { return }
                let deg = 180.0 / Double.pi
                let g = 9.81
                self.notifyListeners("motion", data: [
                    "beta": d.attitude.pitch * deg,
                    "gamma": d.attitude.roll * deg,
                    "ax": d.userAcceleration.x * g,
                    "ay": d.userAcceleration.y * g,
                    "az": d.userAcceleration.z * g
                ])
            }
        }
        call.resolve()
    }

    @objc func stopMotion(_ call: CAPPluginCall) {
        motion.stopDeviceMotionUpdates()
        call.resolve()
    }
}
