package com.vidhidoshi.collectobjects;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Feel: haptics with a strength, the Android twin of FeelPlugin.swift (Core Haptics).
 *
 * JS: Feel.impact({ intensity: 0–1, sharpness: 0–1 })   one tap; sharper = shorter and crisper
 *     Feel.rumble({ intensity: 0–1, duration: seconds })  a short continuous rumble
 *     Feel.startMotion() / Feel.stopMotion()              no-ops: the web view's motion events work on Android
 * Phones without amplitude control get a plain short buzz.
 */
@CapacitorPlugin(name = "Feel")
public class FeelPlugin extends Plugin {

    private Vibrator vibrator() {
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager vm = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm == null ? null : vm.getDefaultVibrator();
        }
        return (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
    }

    private static double clamp(Double v, double fallback) {
        double x = v == null ? fallback : v;
        return Math.max(0, Math.min(1, x));
    }

    private void buzz(long ms, double intensity) {
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) return;
        int amplitude = Math.max(1, (int) Math.round(intensity * 255));
        v.vibrate(VibrationEffect.createOneShot(ms, v.hasAmplitudeControl() ? amplitude : VibrationEffect.DEFAULT_AMPLITUDE));
    }

    @PluginMethod
    public void impact(PluginCall call) {
        double intensity = clamp(call.getDouble("intensity"), 0.5);
        double sharpness = clamp(call.getDouble("sharpness"), 0.5);
        // sharp taps are short and crisp, soft ones a little longer and rounder
        buzz(Math.round(28 - 18 * sharpness), intensity);
        call.resolve();
    }

    @PluginMethod
    public void rumble(PluginCall call) {
        double intensity = clamp(call.getDouble("intensity"), 0.7);
        double duration = Math.max(0.05, Math.min(1.5, call.getDouble("duration", 0.4)));
        buzz(Math.round(duration * 1000), intensity);
        call.resolve();
    }

    @PluginMethod
    public void startMotion(PluginCall call) { call.resolve(); }

    @PluginMethod
    public void stopMotion(PluginCall call) { call.resolve(); }
}
