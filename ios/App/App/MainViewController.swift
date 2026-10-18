import Capacitor
import UIKit

/// The app's web view, with the app's own plugins (the iOS twin of MainActivity.java).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(BackgroundRemoverPlugin())
        bridge?.registerPluginInstance(NativeUiPlugin())
        bridge?.registerPluginInstance(PlacePlugin())
    }
}
