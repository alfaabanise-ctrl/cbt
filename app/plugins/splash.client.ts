import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  let started = false;

  const openMainWindow = async () => {
    if (started) return;
    started = true;

    try {
      const mainWindow = await WebviewWindow.getByLabel("main");

      if (!mainWindow) {
        console.error("Main window was not found.");
        return;
      }

      // Give Nuxt a short moment to finish mounting.
      await new Promise((resolve) => setTimeout(resolve, 700));

      await mainWindow.show();
      await mainWindow.setFocus();

      const splashWindow =
        await WebviewWindow.getByLabel("splashscreen");

      if (splashWindow) {
        await splashWindow.close();
      }
    } catch (error) {
      console.error("Failed to open main window:", error);
    }
  };

  window.addEventListener("load", openMainWindow, {
    once: true,
  });
});