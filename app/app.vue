<template>
  <div
    v-if="!startupReady"
    class="flex h-dvh w-dvw items-center justify-center bg-slate-950 p-6 text-white"
  >
    <div class="w-full max-w-md text-center">
      <div
        class="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400"
        :class="{ 'hidden': startupError }"
      />
      <h1 class="text-xl font-semibold">Starting CBT</h1>
      <p class="mt-2 text-sm text-white/70">
        {{ startupError ? "Startup could not finish." : startupStep }}
      </p>
      <pre
        v-if="startupError"
        class="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-left text-xs text-red-200"
      >{{ startupError }}</pre>
      <button
        v-if="startupError"
        type="button"
        class="mt-5 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold hover:bg-cyan-500"
        @click="initializeApp"
      >
        Retry startup
      </button>
    </div>
  </div>
  <div v-else class="h-dvh w-dvw sm:overflow-hidden">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { initializeDatabases } from "~/utils/databases"
import { initializeBundledDatabases } from "~/utils/database/databaseBootstrap"
import { isMobileTauri } from "~/utils/isMobileTauri"
import { isTauri } from "@tauri-apps/api/core"
import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"

const auth = useExamTipsAuth()
const software = useSoftwareSecurity()
const startupReady = ref(false)
const startupStep = ref("Preparing the application...")
const startupError = ref("")

const initializeApp = async (): Promise<void> => {
  startupError.value = ""
  startupReady.value = false

  try {
    startupStep.value = "Loading your saved session..."
    await auth.initialize()

    if (import.meta.client && isTauri()) {
      const appWindow = getCurrentWindow()

      if (appWindow.label === "main") {
        startupStep.value = "Checking software activation..."
        await software.initialize()

        if (software.activated.value) {
          startupStep.value = "Preparing your subscribed content databases..."
          await initializeBundledDatabases()
        }

        startupStep.value = "Initializing the application databases..."
        await initializeDatabases()

        console.info("Tauri databases initialized at startup")
      }

      if (appWindow.label === "splashscreen") {
        startupReady.value = true
        return
      }

      if (appWindow.label === "main" && !isMobileTauri()) {
        await appWindow.center()
        await appWindow.setResizable(true)
        await invoke("show_main_window")
      }
    }

    startupReady.value = true
  } catch (error) {
    console.error("Application startup failed:", error)
    startupError.value =
      error instanceof Error ? error.message : String(error)

    if (
      import.meta.client &&
      isTauri() &&
      getCurrentWindow().label === "main" &&
      !isMobileTauri()
    ) {
      await invoke("show_main_window").catch((showError) => {
        console.error("Failed to show startup error:", showError)
      })
    }
  }
}

onMounted(() => {
  void initializeApp()
})
</script>