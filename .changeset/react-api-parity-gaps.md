---
"@tanstack/redact": patch
---

Fix three React API gaps: class `setState` and `forceUpdate` callbacks now run after the update commits instead of on unmount, `unstable_batchedUpdates(fn, a)` passes `a` to `fn`, and the default export includes `useSyncExternalStoreWithSelector` for default imports of `use-sync-external-store/shim/with-selector` (Zustand 4).
