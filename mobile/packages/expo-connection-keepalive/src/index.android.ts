import { requireNativeModule } from 'expo-modules-core'

type ConnectionKeepAliveModule = {
  start(): void
  stop(): void
}

const nativeModule = requireNativeModule<ConnectionKeepAliveModule>('ExpoConnectionKeepAlive')
let leases = 0

function startIfNeeded(): void {
  if (leases > 0) {
    nativeModule.start()
  }
}

export function acquireConnectionKeepAlive(): () => void {
  leases += 1
  if (leases === 1) {
    startIfNeeded()
  }
  let released = false
  return () => {
    if (released) {
      return
    }
    released = true
    leases -= 1
    if (leases === 0) {
      nativeModule.stop()
    }
  }
}

export function notifyConnectionKeepAliveForeground(): void {
  startIfNeeded()
}
