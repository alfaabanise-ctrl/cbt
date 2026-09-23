import { defineNuxtPlugin } from '#app'
import Toaster from '@meforma/vue-toaster'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toaster, {
    position: 'top',          // <-- this makes it appear at the top
    duration: 3000,           // toast auto-close after 3 seconds
    dismissible: true,        // allows user to close manually
    pauseOnHover: true
  })

  nuxtApp.provide('toast', nuxtApp.vueApp.config.globalProperties.$toast)
})