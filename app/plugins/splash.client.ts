import { defineNuxtPlugin } from "#app"
import { WebviewWindow } from "@tauri-apps/api/webviewWindow"

export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return

  try {
    const splash = await WebviewWindow.getByLabel("splashscreen")
    const main = await WebviewWindow.getByLabel("main")

    await main?.show()
    await main?.setFocus()

    await splash?.close()
  } catch (error) {
    console.error("Splash screen error:", error)
  }
})