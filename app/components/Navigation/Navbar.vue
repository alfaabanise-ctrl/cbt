<script setup>
const appState = useAppState()
const menuItems = [
  {
    label: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    active: true
  },
  {
    label: 'Dictionary',
    icon: 'lucide:book-open'
  },
  {
    label: 'Bookmarks',
    icon: 'lucide:bookmark'
  },
  {
    label: 'Leaderboard',
    icon: 'lucide:trophy'
  },

]
</script>

<template>
<div >
  <header class="w-full     bg-[#071936] text-white shadow-lg">

    <!-- Top Menu -->
    <div
      class="flex h-  p-0.5 items-center gap-6 border-b border-white/10 px-7 text-xs font-medium"
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


    <!-- Main Header -->
    <div
      class="flex  items-center gap-6 px-7"
    >

      

      <!-- Navigation -->
      <nav class="flex flex-1 items-center gap-2">

        <button
          v-for="item in menuItems"
          :key="item.label"
          class="group relative flex  f
                 items-center justify-center gap-2 rounded-lg
                 transition-all py-2 px-2 duration-200"
          :class="item.active
            ? 'bg-blue-600 shadow-lg shadow-blue-600/30'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'"
        >

          <Icon
            :name="item.icon"
            class="h-6 w-6 transition-transform
                   group-hover:scale-110"
          />

          <span class="text-xs font-semibold">
            {{ item.label }}
          </span>

          <!-- Active indicator -->
          <span
            v-if="item.active"
            class="absolute -bottom-3 h-1 w-10 rounded-full bg-blue-500"
          />

        </button>

      </nav>


      <!-- Right Section -->
      <div class="flex items-center gap-4">

       


        <!-- Science Note -->
        <!-- <button
          class="flex items-center gap-2 rounded-lg
                 border border-blue-500/50
                 px-4 py-2.5 text-sm font-semibold
                 text-blue-300 transition
                 hover:bg-blue-600/20"
        >
          <Icon
            name="lucide:notebook-pen"
            class="h-5 w-5"
          />

          <span class="hidden xl:block">
            Science Note
          </span>
        </button> -->


        <!-- Notification -->
        <button
          class="relative flex h-10 w-10
                 items-center justify-center
                 rounded-full transition
                 hover:bg-white/10"
        >
          <Icon
            name="lucide:bell"
            class="h-6 w-6"
          />

          <span
            class="absolute right-0 top-0
                   flex h-5 w-5 items-center
                   justify-center rounded-full
                   bg-red-500 text-[10px]
                   font-bold text-white"
          >
            2
          </span>
        </button>


        <!-- Divider -->
        <div class="h-10 w-px bg-white/10" />


        <!-- User -->
        <button
          class="flex items-center gap-3 rounded-lg
                 px-2 py-1.5 transition
                 hover:bg-white/10"
        >

          <!-- <div
            class="flex h-11 w-11 items-center
                   justify-center rounded-full
                   border-2 border-blue-500
                   bg-blue-600"
          >
            <Icon
              name="lucide:user"
              class="h-6 w-6 text-white"
            />
          </div> -->

          <div class="hidden text-left md:block">
            <p class="text-sm font-bold">
             {{appState.currentsuser}}
            </p>

            <p class="text-xs text-blue-400">
              Student
            </p>
          </div>

          <Icon
            name="lucide:chevron-down"
            class="h-4 w-4 text-slate-400"
          />

        </button>

      </div>

    </div>

  </header>
  
</div>
</template>