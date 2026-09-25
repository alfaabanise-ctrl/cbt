export default defineNuxtPlugin(async () => {
  const auth = useExamTipsAuth()
  const router = useRouter()

  const publicPages = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/activate",
  ]

  try {
    console.log("🔐 Auth plugin starting...")

    // Initialize authentication
    await auth.initialize()

    console.log("✅ Auth initialized:", {
      isLoggedIn: auth.isLoggedIn.value,
      isActivated: auth.isActivated.value,
    })

    const currentPath = router.currentRoute.value.path

    // Allow public pages
    if (publicPages.includes(currentPath)) {
      console.log("🌐 Public page:", currentPath)
      return
    }

    // User is not logged in
    if (!auth.isLoggedIn.value) {
      console.log("🔒 User is not logged in")

      await navigateTo("/activate", {
        replace: true,
      })

      return
    }

    // User is logged in but license is not activated
   
await navigateTo("/software-activation", {
        replace: true,
      })
    console.log("✅ Authentication access granted")
  } catch (error) {
    console.error("❌ Auth plugin failed:", error)
  }
})