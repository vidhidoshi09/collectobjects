package com.vidhidoshi.collectobjects;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;
import androidx.annotation.NonNull;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.common.moduleinstall.InstallStatusListener;
import com.google.android.gms.common.moduleinstall.ModuleInstall;
import com.google.android.gms.common.moduleinstall.ModuleInstallClient;
import com.google.android.gms.common.moduleinstall.ModuleInstallRequest;
import com.google.android.gms.common.moduleinstall.ModuleInstallStatusUpdate;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.label.ImageLabel;
import com.google.mlkit.vision.label.ImageLabeler;
import com.google.mlkit.vision.label.ImageLabeling;
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions;
import android.graphics.Canvas;
import android.graphics.Color;
import com.getcapacitor.JSArray;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenter;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions;
import java.io.ByteArrayOutputStream;
import java.nio.FloatBuffer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Cuts the main object out of a photo on the device with ML Kit Subject Segmentation.
 * No network API is involved; the model is a Google Play services module that is
 * downloaded once (at install from the Play Store, or on first use otherwise).
 *
 * JS: BackgroundRemover.removeBackground({ image: <base64 JPEG/PNG> }) → { image: <base64 PNG> }
 *     BackgroundRemover.suggestNames({ image }) → { names: [string] }  (ML Kit image labeling, on the device)
 * While the model downloads, emits "modelDownload" events: { percent: 0–100 }.
 * Logcat tag: BackgroundRemover
 */
@CapacitorPlugin(name = "BackgroundRemover")
public class BackgroundRemoverPlugin extends Plugin {

    private static final String TAG = "BackgroundRemover";
    private static final String MODEL_ERROR = "Could not download the background removal model";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private SubjectSegmenter segmenter;
    private ImageLabeler labeler;

    @Override
    public void load() {
        segmenter = SubjectSegmentation.getClient(new SubjectSegmenterOptions.Builder().enableForegroundConfidenceMask().build());
        labeler = ImageLabeling.getClient(new ImageLabelerOptions.Builder().setConfidenceThreshold(0.5f).build());
    }

    @Override
    protected void handleOnDestroy() {
        segmenter.close();
        labeler.close();
        executor.shutdown();
    }

    @PluginMethod
    public void removeBackground(PluginCall call) {
        String image = call.getString("image");
        if (image == null) {
            call.reject("image is required");
            return;
        }
        byte[] bytes = Base64.decode(image, Base64.DEFAULT);
        Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (bitmap == null) {
            call.reject("Could not read the photo");
            return;
        }
        whenModelReady(call, () -> segment(call, bitmap));
    }

    /**
     * Names for the object in the photo, best first. The cut-out is laid on white first,
     * since transparency reads as black. Never fails: no names is a fine answer.
     */
    @PluginMethod
    public void suggestNames(PluginCall call) {
        String image = call.getString("image");
        byte[] bytes = image == null ? new byte[0] : Base64.decode(image, Base64.DEFAULT);
        Bitmap src = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (src == null) {
            resolveNames(call, new JSArray());
            return;
        }
        Bitmap onWhite = Bitmap.createBitmap(src.getWidth(), src.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(onWhite);
        canvas.drawColor(Color.WHITE);
        canvas.drawBitmap(src, 0, 0, null);
        labeler
            .process(InputImage.fromBitmap(onWhite, 0))
            .addOnSuccessListener(labels -> {
                JSArray names = new JSArray();
                for (ImageLabel label : labels) names.put(label.getText());
                resolveNames(call, names);
            })
            .addOnFailureListener(e -> {
                Log.w(TAG, "Labeling failed", e);
                resolveNames(call, new JSArray());
            });
    }

    private static void resolveNames(PluginCall call, JSArray names) {
        JSObject ret = new JSObject();
        ret.put("names", names);
        call.resolve(ret);
    }

    /** Runs onReady once the segmentation module is installed, installing it first if needed. */
    private void whenModelReady(PluginCall call, Runnable onReady) {
        ModuleInstallClient client = ModuleInstall.getClient(getContext());
        AtomicBoolean done = new AtomicBoolean(false);

        client
            .areModulesAvailable(segmenter)
            .addOnSuccessListener(availability -> {
                Log.d(TAG, "Model available: " + availability.areModulesAvailable());
                if (availability.areModulesAvailable()) {
                    onReady.run();
                    return;
                }

                InstallStatusListener listener = new InstallStatusListener() {
                    @Override
                    public void onInstallStatusUpdated(@NonNull ModuleInstallStatusUpdate update) {
                        int state = update.getInstallState();
                        ModuleInstallStatusUpdate.ProgressInfo info = update.getProgressInfo();
                        Log.d(TAG, "Model install state " + state + (info == null ? "" : ", " + info.getBytesDownloaded() + "/" + info.getTotalBytesToDownload() + " bytes"));
                        if (info != null && info.getTotalBytesToDownload() > 0) {
                            JSObject progress = new JSObject();
                            progress.put("percent", (int) (100 * info.getBytesDownloaded() / info.getTotalBytesToDownload()));
                            notifyListeners("modelDownload", progress);
                        }
                        if (state == ModuleInstallStatusUpdate.InstallState.STATE_COMPLETED) {
                            client.unregisterListener(this);
                            if (done.compareAndSet(false, true)) onReady.run();
                        } else if (
                            state == ModuleInstallStatusUpdate.InstallState.STATE_FAILED ||
                            state == ModuleInstallStatusUpdate.InstallState.STATE_CANCELED
                        ) {
                            client.unregisterListener(this);
                            if (done.compareAndSet(false, true)) call.reject(MODEL_ERROR);
                        }
                    }
                };

                ModuleInstallRequest request = ModuleInstallRequest.newBuilder().addApi(segmenter).setListener(listener).build();
                client
                    .installModules(request)
                    .addOnSuccessListener(response -> {
                        Log.d(TAG, "Model install requested, already installed: " + response.areModulesAlreadyInstalled());
                        if (response.areModulesAlreadyInstalled()) {
                            client.unregisterListener(listener);
                            if (done.compareAndSet(false, true)) onReady.run();
                        }
                    })
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "Model install failed", e);
                        client.unregisterListener(listener);
                        if (done.compareAndSet(false, true)) call.reject(MODEL_ERROR, e);
                    });
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "Model availability check failed", e);
                call.reject("Google Play services is not available", e);
            });
    }

    private void segment(PluginCall call, Bitmap bitmap) {
        Log.d(TAG, "Segmenting " + bitmap.getWidth() + "x" + bitmap.getHeight());
        segmenter
            .process(InputImage.fromBitmap(bitmap, 0))
            .addOnSuccessListener(result ->
                executor.execute(() -> {
                    FloatBuffer mask = result.getForegroundConfidenceMask();
                    Bitmap foreground = mask == null ? null : softCutout(bitmap, mask);
                    Bitmap cropped = foreground == null ? null : cropToContent(removeSmallIslands(foreground));
                    if (cropped == null) {
                        call.reject("No object found in the photo");
                        return;
                    }
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    cropped.compress(Bitmap.CompressFormat.PNG, 100, out);
                    JSObject ret = new JSObject();
                    ret.put("image", Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
                    Log.d(TAG, "Done: " + cropped.getWidth() + "x" + cropped.getHeight());
                    call.resolve(ret);
                })
            )
            .addOnFailureListener(e -> {
                Log.e(TAG, "Segmentation failed", e);
                call.reject("Background removal failed", e);
            });
    }

    /**
     * Builds the cut-out from ML Kit's per-pixel confidence instead of its
     * thresholded foreground bitmap, so edges are soft (partly transparent)
     * rather than jagged. Confidence below LOW is background, above HIGH is
     * fully object, and in between fades smoothly.
     */
    private static Bitmap softCutout(Bitmap src, FloatBuffer mask) {
        final float LOW = 0.3f, HIGH = 0.7f;
        int w = src.getWidth();
        int h = src.getHeight();
        int[] pixels = new int[w * h];
        src.getPixels(pixels, 0, w, 0, 0, w, h);
        mask.rewind();
        for (int i = 0; i < pixels.length; i++) {
            float t = (mask.get() - LOW) / (HIGH - LOW);
            t = t < 0 ? 0 : (t > 1 ? 1 : t);
            t = t * t * (3 - 2 * t); // smoothstep
            pixels[i] = ((int) (t * 255) << 24) | (pixels[i] & 0x00FFFFFF);
        }
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        out.setPixels(pixels, 0, w, 0, 0, w, h);
        return out;
    }

    /**
     * Keeps the main object: clears detached pieces smaller than 8% of the largest
     * one (e.g. a stray bit of background the model kept), which would otherwise
     * widen the crop and shrink the object in its tile.
     */
    private static Bitmap removeSmallIslands(Bitmap src) {
        int w = src.getWidth();
        int h = src.getHeight();
        int[] pixels = new int[w * h];
        src.getPixels(pixels, 0, w, 0, 0, w, h);

        int[] label = new int[w * h]; // 0 = unvisited/transparent, n = component id
        java.util.ArrayList<Integer> sizes = new java.util.ArrayList<>();
        sizes.add(0);
        int[] stack = new int[w * h];
        for (int start = 0; start < pixels.length; start++) {
            if (label[start] != 0 || (pixels[start] >>> 24) <= 16) continue;
            int id = sizes.size();
            int size = 0, top = 0;
            stack[top++] = start;
            label[start] = id;
            while (top > 0) {
                int i = stack[--top];
                size++;
                int x = i % w, y = i / w;
                if (x > 0) top = visit(i - 1, id, pixels, label, stack, top);
                if (x < w - 1) top = visit(i + 1, id, pixels, label, stack, top);
                if (y > 0) top = visit(i - w, id, pixels, label, stack, top);
                if (y < h - 1) top = visit(i + w, id, pixels, label, stack, top);
            }
            sizes.add(size);
        }
        if (sizes.size() <= 2) return src; // zero or one piece: nothing to clean

        int largest = 0;
        for (int size : sizes) largest = Math.max(largest, size);
        int minKeep = Math.round(largest * 0.08f);
        for (int i = 0; i < pixels.length; i++) {
            if (label[i] != 0 && sizes.get(label[i]) < minKeep) pixels[i] = 0;
        }
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        out.setPixels(pixels, 0, w, 0, 0, w, h);
        return out;
    }

    private static int visit(int i, int id, int[] pixels, int[] label, int[] stack, int top) {
        if (label[i] == 0 && (pixels[i] >>> 24) > 16) {
            label[i] = id;
            stack[top++] = i;
        }
        return top;
    }

    /** Trims the transparent area around the object, keeping a small margin. Returns null if nothing is left. */
    private static Bitmap cropToContent(Bitmap src) {
        int w = src.getWidth();
        int h = src.getHeight();
        int[] pixels = new int[w * h];
        src.getPixels(pixels, 0, w, 0, 0, w, h);

        int minX = w, minY = h, maxX = -1, maxY = -1;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                if ((pixels[y * w + x] >>> 24) > 16) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;

        int pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04f);
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad);
        maxY = Math.min(h - 1, maxY + pad);
        return Bitmap.createBitmap(src, minX, minY, maxX - minX + 1, maxY - minY + 1);
    }
}
