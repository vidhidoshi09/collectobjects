package com.vidhidoshi.collectobjects;

import android.Manifest;
import android.content.Context;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import androidx.core.content.ContextCompat;
import androidx.core.location.LocationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * The city an object was found in. Approximate (coarse) location only, turned into a
 * city name by Android's Geocoder. Coordinates are never returned or stored.
 *
 * JS: Place.getCity() → { city: string }   (asks for permission the first time)
 *     Place.checkPermissions() → { location: 'granted' | 'denied' | 'prompt' | … }
 * Errors: DENIED, OFF (location services off), UNAVAILABLE (no geocoder), NOT_FOUND.
 */
@CapacitorPlugin(
    name = "Place",
    permissions = { @Permission(alias = "location", strings = { Manifest.permission.ACCESS_COARSE_LOCATION }) }
)
public class PlacePlugin extends Plugin {

    private static final long FRESH_MS = 30 * 60 * 1000;   // a last fix this recent is good enough for a city
    private static final long TIMEOUT_MS = 10 * 1000;

    @PluginMethod
    public void getCity(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermissionCallback");
            return;
        }
        findCity(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") == PermissionState.GRANTED) findCity(call);
        else call.reject("Location permission denied", "DENIED");
    }

    private void findCity(PluginCall call) {
        if (!Geocoder.isPresent()) {
            call.reject("No geocoder on this device", "UNAVAILABLE");
            return;
        }
        LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        try {
            Location last = lastKnown(lm);
            if (last != null && System.currentTimeMillis() - last.getTime() < FRESH_MS) {
                geocode(call, last);
                return;
            }
            String provider = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ? LocationManager.NETWORK_PROVIDER
                : lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ? LocationManager.GPS_PROVIDER : null;
            if (provider == null) {
                if (last != null) geocode(call, last);
                else call.reject("Location is off", "OFF");
                return;
            }

            AtomicBoolean done = new AtomicBoolean(false);
            CancellationSignal cancel = new CancellationSignal();
            Handler main = new Handler(Looper.getMainLooper());
            main.postDelayed(() -> {
                if (done.getAndSet(true)) return;
                cancel.cancel();
                if (last != null) geocode(call, last);
                else call.reject("Location timed out", "NOT_FOUND");
            }, TIMEOUT_MS);
            LocationManagerCompat.getCurrentLocation(lm, provider, cancel, ContextCompat.getMainExecutor(getContext()), location -> {
                if (done.getAndSet(true)) return;
                Location fix = location != null ? location : last;
                if (fix != null) geocode(call, fix);
                else call.reject("No location", "NOT_FOUND");
            });
        } catch (SecurityException e) {
            call.reject("Location permission denied", "DENIED");
        }
    }

    private Location lastKnown(LocationManager lm) throws SecurityException {
        Location best = null;
        for (String p : new String[] { LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER, LocationManager.GPS_PROVIDER }) {
            if (!lm.getAllProviders().contains(p)) continue;
            Location l = lm.getLastKnownLocation(p);
            if (l != null && (best == null || l.getTime() > best.getTime())) best = l;
        }
        return best;
    }

    private void geocode(PluginCall call, Location loc) {
        Geocoder geocoder = new Geocoder(getContext(), Locale.getDefault());
        if (Build.VERSION.SDK_INT >= 33) {
            geocoder.getFromLocation(loc.getLatitude(), loc.getLongitude(), 1, new Geocoder.GeocodeListener() {
                @Override public void onGeocode(List<Address> list) { resolveCity(call, list); }
                @Override public void onError(String message) { call.reject("Couldn't look up the city", "NOT_FOUND"); }
            });
        } else {
            Executors.newSingleThreadExecutor().execute(() -> {
                try {
                    @SuppressWarnings("deprecation")
                    List<Address> list = geocoder.getFromLocation(loc.getLatitude(), loc.getLongitude(), 1);
                    resolveCity(call, list);
                } catch (Exception e) {
                    call.reject("Couldn't look up the city", "NOT_FOUND");
                }
            });
        }
    }

    // City only: the locality, or the nearest wider area when there isn't one
    private static void resolveCity(PluginCall call, List<Address> list) {
        String city = null;
        if (list != null && !list.isEmpty()) {
            Address a = list.get(0);
            city = a.getLocality();
            if (city == null) city = a.getSubAdminArea();
            if (city == null) city = a.getAdminArea();
        }
        if (city == null) {
            call.reject("No city here", "NOT_FOUND");
            return;
        }
        JSObject ret = new JSObject();
        ret.put("city", city);
        call.resolve(ret);
    }
}
