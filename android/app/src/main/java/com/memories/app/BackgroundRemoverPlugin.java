package com.memories.app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
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
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenter;
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Cuts the main object out of a photo on the device with ML Kit Subject Segmentation.
 * No network API is involved; the model is a Google Play services module that is
 * downloaded once (at install from the Play Store, or on first use otherwise).
 *
 * JS: BackgroundRemover.removeBackground({ image: <base64 JPEG/PNG> }) → { image: <base64 PNG> }
 */
@CapacitorPlugin(name = "BackgroundRemover")
public class BackgroundRemoverPlugin extends Plugin {

    private static final String MODEL_ERROR = "Could not download the background removal model";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private SubjectSegmenter segmenter;

    @Override
    public void load() {
        segmenter = SubjectSegmentation.getClient(new SubjectSegmenterOptions.Builder().enableForegroundBitmap().build());
    }

    @Override
    protected void handleOnDestroy() {
        segmenter.close();
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

    /** Runs onReady once the segmentation module is installed, installing it first if needed. */
    private void whenModelReady(PluginCall call, Runnable onReady) {
        ModuleInstallClient client = ModuleInstall.getClient(getContext());
        AtomicBoolean done = new AtomicBoolean(false);

        client
            .areModulesAvailable(segmenter)
            .addOnSuccessListener(availability -> {
                if (availability.areModulesAvailable()) {
                    onReady.run();
                    return;
                }

                InstallStatusListener listener = new InstallStatusListener() {
                    @Override
                    public void onInstallStatusUpdated(@NonNull ModuleInstallStatusUpdate update) {
                        int state = update.getInstallState();
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
                        if (response.areModulesAlreadyInstalled()) {
                            client.unregisterListener(listener);
                            if (done.compareAndSet(false, true)) onReady.run();
                        }
                    })
                    .addOnFailureListener(e -> {
                        client.unregisterListener(listener);
                        if (done.compareAndSet(false, true)) call.reject(MODEL_ERROR, e);
                    });
            })
            .addOnFailureListener(e -> call.reject("Google Play services is not available", e));
    }

    private void segment(PluginCall call, Bitmap bitmap) {
        segmenter
            .process(InputImage.fromBitmap(bitmap, 0))
            .addOnSuccessListener(result ->
                executor.execute(() -> {
                    Bitmap foreground = result.getForegroundBitmap();
                    Bitmap cropped = foreground == null ? null : cropToContent(foreground);
                    if (cropped == null) {
                        call.reject("No object found in the photo");
                        return;
                    }
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    cropped.compress(Bitmap.CompressFormat.PNG, 100, out);
                    JSObject ret = new JSObject();
                    ret.put("image", Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
                    call.resolve(ret);
                })
            )
            .addOnFailureListener(e -> call.reject("Background removal failed", e));
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
