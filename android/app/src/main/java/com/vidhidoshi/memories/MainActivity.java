package com.vidhidoshi.memories;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BackgroundRemoverPlugin.class);
        registerPlugin(NativeUiPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
