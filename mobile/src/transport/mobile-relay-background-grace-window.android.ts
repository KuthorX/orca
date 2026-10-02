// Android is more likely to suspend the JS runtime during short app switches.
// Keep the healthy Relay longer so returning to Orca does not force a redial.
export const RELAY_BACKGROUND_GRACE_MS = 5 * 60_000
