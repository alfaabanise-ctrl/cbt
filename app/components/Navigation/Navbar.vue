<script setup lang="ts">


const auth = useExamTipsAuth();
const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})
const menuItems = [
  {
    label: "Dashboard",
    icon: "lucide:layout-dashboard",
    active: true,
  },
  {
    label: "Dictionary",
    icon: "lucide:book-open",
    active: false,
  },
  {
    label: "Bookmarks",
    icon: "lucide:bookmark",
    active: false,
  },
  {
    label: "Leaderboard",
    icon: "lucide:trophy",
    active: false,
  },
];
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 w-full bg-[#071936] text-white shadow-lg"
  >
    <!-- TOP MENU - DESKTOP ONLY -->
    <div
      class="hidden h-8 items-center gap-6 border-b border-white/10 px-4 text-xs font-medium sm:flex sm:px-6 lg:px-8"
    >
      <button class="transition hover:text-blue-400">
        File
      </button>

      <button class="transition hover:text-blue-400">
        Product
      </button>

      <button class="transition hover:text-blue-400">
        Help
      </button>

      <button class="transition hover:text-blue-400">
        Web Resources
      </button>

      <button class="transition hover:text-blue-400">
        Guardian
      </button>
    </div>

    <!-- MAIN HEADER -->
    <div
      class="flex min-h-[64px] items-center gap-2 px-2 sm:gap-4 sm:px-6 lg:px-8"
    >
      <!-- NAVIGATION -->
      <nav
        class="flex min-w-0 flex-1 items-center justify-start gap-1 sm:gap-2"
      >
        <button
          v-for="item in menuItems"
          :key="item.label"
          type="button"
          :aria-label="item.label"
          class="group relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-center transition-all duration-200 sm:flex-none sm:gap-2 sm:px-3"
          :class="
            item.active
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          "
        >
          <!-- ICON -->
          <Icon
            :name="item.icon"
            class="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 sm:h-5 sm:w-5"
          />

          <!-- LABEL -->
          <span
            class="hidden text-[11px] font-semibold sm:inline-block lg:text-xs"
          >
            {{ item.label }}
          </span>

          <!-- ACTIVE INDICATOR -->
          <span
            v-if="item.active"
            class="absolute -bottom-1 left-1/2 hidden h-1 w-6 -translate-x-1/2 rounded-full bg-blue-400 sm:block"
          ></span>
        </button>
      </nav>

      <!-- RIGHT SECTION -->
      <div class="flex shrink-0 items-center gap-1 sm:gap-3">
        <!-- NOTIFICATION -->
        <button
          type="button"
          aria-label="Notifications"
          class="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 sm:h-10 sm:w-10"
        >
          <Icon
            name="lucide:bell"
            class="h-5 w-5 sm:h-6 sm:w-6"
          />

          <span
            class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white sm:h-5 sm:min-w-5 sm:text-[10px]"
          >
            2
          </span>
        </button>

        <!-- DIVIDER -->
        <div class="hidden h-8 w-px bg-white/10 sm:block"></div>

        <!-- USER -->
        <button
          type="button"
          aria-label="Open user menu"
          class="flex items-center gap-1 rounded-lg px-1.5 py-1.5 transition hover:bg-white/10 sm:gap-2 sm:px-2"
        >
          <!-- USER ICON -->
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 sm:h-9 sm:w-9"
          >
            <Icon
              name="lucide:user-round"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </div>
        
          <!-- USER DETAILS -->
          <div class="hidden  text-left md:block">
             <p class="capitalize"> {{ currentUser.firstName || "Student" }}
            </p>

            <p class="text-[10px]  capitalize text-blue-400 lg:text-xs">
             {{ currentUser.role || "Student" }}
            </p>
          </div>

          <Icon
            name="lucide:chevron-down"
            class="hidden h-4 w-4 text-slate-400 sm:block"
          />
        </button>
      </div>
    </div>
  </header>
</template>