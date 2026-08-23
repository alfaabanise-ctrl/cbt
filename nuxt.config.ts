import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: {
    enabled: false,
  },

  modules: [
    "@nuxt/icon",
  ],

  // Tauri application
  ssr: false,

  nitro: {
    preset: "static",
  },

  css: [
    "~/assets/css/main.css",
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  app: {
    baseURL: "./",
    pageTransition: {
      name: "page-sheet",
      mode: "out-in",
    },
  },

  runtimeConfig: {
    // Private variables - server only
    mapboxSecret: process.env.MAPBOX_SECRET || "",
    geminiApiKey: process.env.GEMINI_API_KEY || "",

    // Public variables - available to the client
    public: {
      projectName: "cbt lesson",
      apiUrl:
        process.env.NUXT_PUBLIC_API_URL ||
        "http://localhost:5000",
    },
  },
})