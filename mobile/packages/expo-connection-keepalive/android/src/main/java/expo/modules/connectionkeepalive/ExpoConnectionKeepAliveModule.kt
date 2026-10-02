package expo.modules.connectionkeepalive

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoConnectionKeepAliveModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoConnectionKeepAlive")

    Function("start") {
      appContext.reactContext?.let(ConnectionKeepAliveService::start)
    }

    Function("stop") {
      appContext.reactContext?.let(ConnectionKeepAliveService::stop)
    }
  }
}
