import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MobileRelayBackgroundGraceTimer,
  RELAY_BACKGROUND_GRACE_MS
} from './mobile-relay-background-grace'
import { RELAY_BACKGROUND_GRACE_MS as ANDROID_RELAY_BACKGROUND_GRACE_MS } from './mobile-relay-background-grace-window.android'

describe('MobileRelayBackgroundGraceTimer', () => {
  afterEach(() => vi.useRealTimers())

  it('expires once after the 30 second grace', async () => {
    vi.useFakeTimers()
    const onExpired = vi.fn()
    const timer = new MobileRelayBackgroundGraceTimer(
      {
        now: Date.now,
        setTimer: (handler, ms) => setTimeout(handler, ms),
        clearTimer: (handle) => clearTimeout(handle)
      },
      onExpired
    )

    timer.arm()
    await vi.advanceTimersByTimeAsync(RELAY_BACKGROUND_GRACE_MS - 1)
    expect(onExpired).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onExpired).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(RELAY_BACKGROUND_GRACE_MS)
    expect(onExpired).toHaveBeenCalledOnce()
  })

  it('uses the longer Android grace window', () => {
    expect(ANDROID_RELAY_BACKGROUND_GRACE_MS).toBe(5 * 60_000)
    expect(RELAY_BACKGROUND_GRACE_MS).toBe(30_000)
  })

  it('detects expiry on resume when the background timer was suspended', () => {
    let now = 1_000
    const timer = new MobileRelayBackgroundGraceTimer(
      {
        now: () => now,
        setTimer: vi.fn(() => 1 as unknown as ReturnType<typeof setTimeout>),
        clearTimer: vi.fn()
      },
      vi.fn()
    )

    timer.arm()
    now += RELAY_BACKGROUND_GRACE_MS

    expect(timer.consumeExpired()).toBe(true)
    expect(timer.consumeExpired()).toBe(false)
  })

  it('rejects a stale expiry callback after foreground cancellation', () => {
    let callback: (() => void) | null = null
    const onExpired = vi.fn()
    const timer = new MobileRelayBackgroundGraceTimer(
      {
        now: () => 1_000,
        setTimer: vi.fn((next) => {
          callback = next
          return 1 as unknown as ReturnType<typeof setTimeout>
        }),
        clearTimer: vi.fn()
      },
      onExpired
    )

    timer.arm()
    expect(timer.consumeExpired()).toBe(false)
    const staleCallback = callback as (() => void) | null
    staleCallback?.()

    expect(onExpired).not.toHaveBeenCalled()
  })
})
