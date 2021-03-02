// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { debug } from "console";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const dartExt = vscode.extensions.getExtension("Dart-Code.dart-code");
  if (dartExt == null) {
    vscode.window.showErrorMessage(
      "Cannot initialize fluttercodeutil, make sure you has already installed dart extension"
    );
    return;
  }

  const { exports } = dartExt;
  if (exports == null) {
    vscode.window.showErrorMessage(
      "Cannot initialize fluttercodeutil, make sure you has already installed dart extension"
    );
    return;
  }

  const { debugCommands, debugProvider } = exports._privateApi;

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fluttercodeutil.printCurrentDevice",
      () => {
        if (debugProvider?.deviceManager?.currentDevice != null) {
          return JSON.stringify(debugProvider?.deviceManager?.currentDevice);
        }
        vscode.commands.executeCommand("flutter.selectDevice");
        vscode.window.showErrorMessage("Please select device first.");
        return null;
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fluttercodeutil.getCurrentAppBinary",
      async () => {
        var device = debugProvider?.deviceManager?.currentDevice;
        if (device == null) {
          device = await vscode.commands.executeCommand("flutter.selectDevice");
        }
        if (device == null) {
          vscode.window.showErrorMessage("Please select device first.");
          return null;
        }
        if (debugProvider?.deviceManager?.currentDevice != null) {
          const config = vscode.workspace.getConfiguration("fluttercodeutil");
          const { currentDevice } = debugProvider?.deviceManager;
          if (currentDevice.platformType == "ios") {
            if (currentDevice.emulator) {
              return config.get<string>("iphonesimulatorAppPath");
            } else {
              return config.get<string>("iphoneosAppPath");
            }
          }
          return config.get<string>("androidAppPath");
        }
      }
    )
  );

  const onDebugSessionVmServiceAvailable: vscode.Event<any> =
    debugCommands.onDebugSessionVmServiceAvailable;
  context.subscriptions.push(
    onDebugSessionVmServiceAvailable((event) => {
      console.log({ event });
      const config = vscode.workspace.getConfiguration("fluttercodeutil");
      const hotRestartAfterLaunch = config.get<boolean>(
        "hotRestartAfterLaunch"
      );
      if (hotRestartAfterLaunch == true) {
        setTimeout(() => {
          vscode.commands.executeCommand("flutter.hotRestart");
        }, 2000);
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
