<template>
  <div class="h-dvh  overflow-hidden w-dvw ">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import platform from "~/platforms"

const isTauri = computed(() => {
  return import.meta.client && !!window.__TAURI_INTERNALS__
})

onMounted(async () => {
  console.log("🔥🔥🔥 APP.VUE IS RUNNING 🔥🔥🔥")



  console.log("🔥🔥🔥 ON MOUNTED IS RUNNING 🔥🔥🔥")
  console.log("isTauri:", isTauri.value)

  if (!isTauri.value) {
    return
  }

  try {
    await platform.dicDatase.getDictDB()
    await platform.database.initializeDatabase()
    await platform.lesson.initializeLessonsDatabase()
    await platform.lesson.getSidebar()
    console.log("Tauri databases initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Tauri databases:", error)
  }
})
</script>