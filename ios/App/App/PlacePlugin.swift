import Capacitor
import CoreLocation

/**
 * The city an object was found in. Approximate location only (Info.plist asks for
 * reduced accuracy), turned into a city name by Apple's geocoder. Coordinates are
 * never returned or stored. The iOS twin of PlacePlugin.java.
 *
 * JS: Place.getCity() → { city: string }   (asks for permission the first time)
 *     Place.checkPermissions() → { location: 'granted' | 'denied' | 'prompt' }
 * Errors: DENIED, OFF (location services off), NOT_FOUND.
 */
@objc(PlacePlugin)
public class PlacePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "PlacePlugin"
    public let jsName = "Place"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getCity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise)
    ]

    private static let freshSeconds: TimeInterval = 30 * 60 // a fix this recent is good enough for a city
    private static let timeoutSeconds: TimeInterval = 10

    private var manager: CLLocationManager?
    private var pending: [CAPPluginCall] = []
    private var attempt = 0
    private let geocoder = CLGeocoder()

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(["location": PlacePlugin.state(CLLocationManager().authorizationStatus)])
        }
    }

    @objc func getCity(_ call: CAPPluginCall) {
        // plugin calls arrive off the main thread, where this check belongs
        guard CLLocationManager.locationServicesEnabled() else {
            call.reject("Location is off", "OFF")
            return
        }
        DispatchQueue.main.async {
            let manager = self.manager ?? CLLocationManager()
            manager.delegate = self
            manager.desiredAccuracy = kCLLocationAccuracyReduced
            self.manager = manager

            if let last = manager.location, -last.timestamp.timeIntervalSinceNow < PlacePlugin.freshSeconds,
               manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways {
                self.geocode(last, call)
                return
            }
            self.pending.append(call)
            switch manager.authorizationStatus {
            case .notDetermined: manager.requestWhenInUseAuthorization() // continues in the delegate
            case .denied, .restricted: self.finish { $0.reject("Location permission denied", "DENIED") }
            default: self.locate()
            }
        }
    }

    private func locate() {
        attempt += 1
        let this = attempt
        manager?.requestLocation()
        DispatchQueue.main.asyncAfter(deadline: .now() + PlacePlugin.timeoutSeconds) { [weak self] in
            guard let self = self, self.attempt == this else { return }
            self.finish { $0.reject("Location timed out", "NOT_FOUND") }
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard !pending.isEmpty else { return }
        switch manager.authorizationStatus {
        case .notDetermined: return
        case .denied, .restricted: finish { $0.reject("Location permission denied", "DENIED") }
        default: locate()
        }
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        attempt += 1 // settled: the timeout no longer applies
        let calls = pending
        pending = []
        calls.forEach { geocode(location, $0) }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if let last = manager.location {
            let calls = pending
            pending = []
            calls.forEach { geocode(last, $0) }
        } else {
            finish { $0.reject("No location", "NOT_FOUND") }
        }
    }

    // City only: the locality, or the nearest wider area when there isn't one
    private func geocode(_ location: CLLocation, _ call: CAPPluginCall) {
        geocoder.reverseGeocodeLocation(location) { placemarks, _ in
            let place = placemarks?.first
            if let city = place?.locality ?? place?.subAdministrativeArea ?? place?.administrativeArea {
                call.resolve(["city": city])
            } else {
                call.reject("No city here", "NOT_FOUND")
            }
        }
    }

    private func finish(_ settle: (CAPPluginCall) -> Void) {
        attempt += 1
        let calls = pending
        pending = []
        calls.forEach(settle)
    }

    private static func state(_ status: CLAuthorizationStatus) -> String {
        switch status {
        case .authorizedWhenInUse, .authorizedAlways: return "granted"
        case .denied, .restricted: return "denied"
        default: return "prompt"
        }
    }
}
