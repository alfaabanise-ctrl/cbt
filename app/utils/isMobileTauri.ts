export function isMobileTauri(): boolean {
  if (
    !import.meta.client ||
    !window.__TAURI_INTERNALS__
  ) {
    return false
  }

  return /android|iphone|ipad|ipod/i.test(
    navigator.userAgent
  )
}
