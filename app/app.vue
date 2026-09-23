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
const auth = useExamTipsAuth();
import { getCurrentWindow } from "@tauri-apps/api/window"
import { LogicalSize } from "@tauri-apps/api/dpi"

await auth.initialize()
const isTauri = computed(() => {
  return import.meta.client && !!window.__TAURI_INTERNALS__
})


onMounted(async () => {
   console.log (auth, "🔥🔥🔥 APP.VUE IS RUNNING 🔥🔥🔥")
  console.log(await auth.getDeviceId(), "🔥🔥🔥 APP.VUE IS RUNNING 🔥🔥🔥")



  console.log("🔥🔥🔥 ON MOUNTED IS RUNNING 🔥🔥🔥")
  console.log("isTauri:", isTauri.value)

  if (!isTauri.value) {
    return
  }

  try {
    // Only run inside the Tauri desktop application
  if (import.meta.client && "__TAURI_INTERNALS__" in window) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");

      await invoke("show_main_window");
    } catch (error) {
      console.error("Failed to show main window:", error);
    }
  }

  const appWindow = getCurrentWindow()

    // await appWindow.setSize(
    //   new LogicalSize(390, 844)
    // )

    await appWindow.center()
    await appWindow.setResizable(true)
    await platform.dicDatase.getDictDB()
    await platform.database.initializeDatabase()
    await platform.lesson.initializeLessonsDatabase()
    // await platform.lesson.getSidebar()
    console.log("Tauri databases initialized successfully")

      
    
  } catch (error) {
    console.error("Failed to initialize Tauri databases:", error)
  }
})
</script>