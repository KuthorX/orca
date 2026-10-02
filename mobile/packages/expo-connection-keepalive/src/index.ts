export function acquireConnectionKeepAlive(): () => void {
  return () => {}
}

export function notifyConnectionKeepAliveForeground(): void {}
