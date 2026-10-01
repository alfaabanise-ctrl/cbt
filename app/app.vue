<template>
  <div class="h-dvh  sm:overflow-hidden w-dvw ">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import platform from "~/platforms"
import { initializeDatabases } from "~/utils/databases"
const auth = useExamTipsAuth();
import { getCurrentWindow } from "@tauri-apps/api/window"
import { LogicalSize } from "@tauri-apps/api/dpi"

await auth.initialize()
const isTauri = computed(() => {
  return import.meta.client && !!window.__TAURI_INTERNALS__
})

if (import.meta.client && isTauri.value) {
  const appWindow = getCurrentWindow()

  if (appWindow.label === "main") {
    await initializeDatabases()
    await platform.dicDatase.getDictDB()
    console.log("Tauri databases initialized at startup")
  }
}


onMounted(async () => {
   console.log (auth, "🔥🔥🔥 APP.VUE IS RUNNING 🔥🔥🔥")
  console.log(await auth.getDeviceId(), "🔥🔥🔥 APP.VUE IS RUNNING 🔥🔥🔥")



  console.log("🔥🔥🔥 ON MOUNTED IS RUNNING 🔥🔥🔥")
  console.log("isTauri:", isTauri.value)

  if (!isTauri.value) {
    return
  }

  try {
    const appWindow = getCurrentWindow()

    // Only run inside the Tauri desktop application
    if (appWindow.label === "splashscreen") {
      try {
        const { invoke } = await import("@tauri-apps/api/core")
        await invoke("show_main_window")
      } catch (error) {
        console.error("Failed to show main window:", error)
      }

      return
    }

    if (appWindow.label !== "main") {
      return
    }

    // await appWindow.setSize(
    //   new LogicalSize(390, 844)
    // )

    await appWindow.center()
    await appWindow.setResizable(true)
  } catch (error) {
    console.error("Failed to initialize Tauri databases:", error)
  }
})
</script>