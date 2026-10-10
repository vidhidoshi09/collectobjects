package com.memories.app;

import android.content.DialogInterface;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

/**
 * Native Material 3 components themed by the app theme (brand colors + Nunito Sans).
 *
 * JS: NativeUi.confirm({ title, message, confirmLabel, cancelLabel, destructive })
 *     → { confirmed: boolean }
 */
@CapacitorPlugin(name = "NativeUi")
public class NativeUiPlugin extends Plugin {

    @PluginMethod
    public void confirm(PluginCall call) {
        String title = call.getString("title");
        String message = call.getString("message");
        String confirmLabel = call.getString("confirmLabel", "OK");
        String cancelLabel = call.getString("cancelLabel", "Cancel");
        boolean destructive = Boolean.TRUE.equals(call.getBoolean("destructive", false));

        getActivity().runOnUiThread(() -> {
            AlertDialog dialog = new MaterialAlertDialogBuilder(getActivity())
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton(confirmLabel, (d, which) -> resolve(call, true))
                .setNegativeButton(cancelLabel, (d, which) -> resolve(call, false))
                .setOnCancelListener(d -> resolve(call, false))
                .create();
            dialog.show();
            if (destructive) {
                dialog.getButton(DialogInterface.BUTTON_POSITIVE).setTextColor(ContextCompat.getColor(getContext(), R.color.md_error));
            }
        });
    }

    private static void resolve(PluginCall call, boolean confirmed) {
        JSObject ret = new JSObject();
        ret.put("confirmed", confirmed);
        call.resolve(ret);
    }
}
