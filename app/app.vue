<template>
<div class=" h- h-dvh w-dvw  overflow-hidden  ">
  <NuxtLayout>

    <NuxtPage />
  </NuxtLayout>
  </div>
</template>
<script setup>
import platform from "~/platforms"

onMounted(async () => {
    await platform.dicDatase.getDictDB()
    await platform.database.initializeDatabase()

})
</script>
