import Capacitor
import UIKit

/**
 * Native iOS alert for confirmations. The iOS twin of NativeUiPlugin.java.
 *
 * JS: NativeUi.confirm({ title, message, confirmLabel, cancelLabel, destructive })
 *     → { confirmed: boolean }
 */
@objc(NativeUiPlugin)
public class NativeUiPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeUiPlugin"
    public let jsName = "NativeUi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "confirm", returnType: CAPPluginReturnPromise)
    ]

    @objc func confirm(_ call: CAPPluginCall) {
        let title = call.getString("title")
        let message = call.getString("message")
        let confirmLabel = call.getString("confirmLabel") ?? "OK"
        let cancelLabel = call.getString("cancelLabel") ?? "Cancel"
        let destructive = call.getBool("destructive") ?? false

        DispatchQueue.main.async {
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: cancelLabel, style: .cancel) { _ in call.resolve(["confirmed": false]) })
            alert.addAction(UIAlertAction(title: confirmLabel, style: destructive ? .destructive : .default) { _ in call.resolve(["confirmed": true]) })
            guard let presenter = self.bridge?.viewController else {
                call.resolve(["confirmed": false])
                return
            }
            presenter.present(alert, animated: true)
        }
    }
}
