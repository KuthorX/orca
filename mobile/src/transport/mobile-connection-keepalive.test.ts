import { beforeEach, describe, expect, it, vi } from 'vitest'

const nativeModule = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn()
}))

vi.mock('expo-modules-core', () => ({
  requireNativeModule: () => nativeModule
}))

import {
  acquireConnectionKeepAlive,
  notifyConnectionKeepAliveForeground
} from '../../packages/expo-connection-keepalive/src/index.android'

describe('Android connection keep-alive leases', () => {
  beforeEach(() => {
    nativeModule.start.mockClear()
    nativeModule.stop.mockClear()
  })

  it('starts once for multiple clients and stops after the last release', () => {
    const releaseFirst = acquireConnectionKeepAlive()
    const releaseSecond = acquireConnectionKeepAlive()

    expect(nativeModule.start).toHaveBeenCalledOnce()

    releaseFirst()
    expect(nativeModule.stop).not.toHaveBeenCalled()
    releaseSecond()
    expect(nativeModule.stop).toHaveBeenCalledOnce()
  })

  it('retries service start when the app returns to the foreground', () => {
    const release = acquireConnectionKeepAlive()
    nativeModule.start.mockClear()

    notifyConnectionKeepAliveForeground()

    expect(nativeModule.start).toHaveBeenCalledOnce()
    release()
  })
})
