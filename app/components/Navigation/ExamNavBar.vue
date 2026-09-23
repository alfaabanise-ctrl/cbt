<template>
  <div class="bg-primary">
    <div
      v-if="showCalculator"
      class="fixed top-0 left-0 inset-0 z-100 pointer-events-none"
    >
      <Calculator @close="openCalculator" class="pointer-events-auto" />
    </div>
    <header
      class="fixed inset-x-0 top-0 z-50 h-12 border-b border-white/10 bg-primary text-white shadow-lg"
    >
      <div
        class="mx-auto flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <!-- ================================= -->
        <!-- LEFT: EXAM TOOLS -->
        <!-- ================================= -->

        <nav class="flex h-full items-center gap-1 sm:gap-2">
          <button
            v-for="tool in examTools"
            :key="tool.label"
            type="button"
            class="exam-tool-button"
            @click="tool.onClick"
          >
            <Icon :name="tool.icon" class="  text-lg shrink-0
         transition-transform duration-200
         group-hover:scale-110 "/>

            <span class=" hidden  text-medium font-medium md:flex">{{ tool.label }}</span>
          </button>
        </nav>

        <!-- ================================= -->
        <!-- RIGHT: USER + TIMER -->
        <!-- ================================= -->

        <div class="flex items-center gap-3 sm:gap-5">
          <!-- User -->
          <div class="hidden items-center gap-2 sm:flex">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"
            >
              <Icon name="lucide:user-round" class="h-5 w-5" />
            </div>

            <span class="max-w-[100px]  capitalize truncate text-sm font- sm:text-base">
              {{ currentUser.firstName }}
            </span>
          </div>

          <!-- Timer -->
          <!-- TIMER -->
            <ExamTimer
  ref="timer"
  :duration="examDuration"
  :auto-start="false"
  @finished="timeFinished"
  @tick="ticking"
/>
            
        </div>
      </div>
    </header>

    <!-- ========================================= -->
    <!-- LEAVE EXAM CONFIRMATION -->
    <!-- ========================================= -->
    <div class="w-full h-12 bg-primary"></div>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="logoutNotice"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4"
          @click.self="logoutNotice = false"
        >
          <!-- MODAL -->
          <div
            class="w-full max-w-md overflow-hidden rounded-sm bg-white shadow-2xl"
          >
            <!-- HEADER -->
            <div
              class="flex items-center justify-between border-b border-slate-100 px-6 py-4"
            >
              <div class="flex items-center gap-3">
                <!-- Exit Icon -->
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600"
                >
                  <Icon name="lucide:log-out" class="h-5 w-5" />
                </div>

                <div>
                  <h2 class="text-lg font-bold text-slate-900">Leave Exam</h2>

                  <p class="text-xs text-slate-500">
                    Exit your current examination
                  </p>
                </div>
              </div>

              <!-- CLOSE -->
              <button
                type="button"
                @click="logoutNotice = false"
                class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>

            <!-- BODY -->
            <div class="px-6 py-6">
              <div class="flex items-start gap-4 rounded-xl bg-amb0 p-4">
                <div>
                  <p class="text-sm font-bold text-slate-800">
                    Do you want to leave the exam?
                  </p>

                  <p class="mt-1 text-sm leading-6 text-slate-600">
                    Your current exam progress may be lost. You can return to
                    the practice page.
                  </p>
                </div>
              </div>

              <!-- BUTTONS -->
              <div
                class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
              >
                <!-- Continue Exam -->
                <button
                  type="button"
                  @click="logoutNotice = false"
                  class="flex flex-1 items-center justify-center gap-2 rounded-sm border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 sm:flex-none"
                >
                  <Icon name="lucide:arrow-left" class="h-4 w-4" />

                  Continue Exam
                </button>

                <!-- Leave Exam -->
                <button
                  type="button"
                  @click="logout"
                  class="flex flex-1 items-center justify-center gap-2 rounded-sm bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 sm:flex-none"
                >
                  <Icon name="lucide:log-out" class="h-4 w-4" />

                  Leave Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const appState = useAppState()

const emit = defineEmits(["timeFinished"])
const formattedTime = ref("01:59:37")
const logoutNotice = ref(false)
const showCalculator = ref(false)
const auth = useExamTipsAuth();
const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})
const timer = ref(null)

const examDuration = computed(() => {
  const duration = appState.value?.examSettings?.duration

  if (!duration) return 3600

  if (typeof duration === "number") {
    return duration
  }

  const [hours, minutes, seconds] = duration
    .split(":")
    .map(Number)

  return (
    (hours || 0) * 3600 +
    (minutes || 0) * 60 +
    (seconds || 0)
  )
})

// ==========================================
// ACTIONS
// ==========================================

const logout = async () => {
  console.log(
    appState.value.selectedSubjects,
    "before click"
  )

  await navigateTo("/")
  logoutNotice.value = false
}

const openCalculator = () => {
  showCalculator.value = !showCalculator.value
}

const toggleBookmark = () => {
  console.log("Bookmark question")
}

const reportError = () => {
  console.log("Report error")
}

const openDictionary = () => {
  console.log("Open dictionary")
}

const openAiTutor = () => {
  console.log("Open AI Tutor")
}

const timeFinished = () => {
  // The parent exam.vue will handle submission
  console.log("Exam time finished")
}

const ticking = (seconds) => {
  console.log("Time remaining:", seconds)
}

// ==========================================
// TOOLBAR
// ==========================================

const examTools = [
  {
    label: "Log Out",
    icon: "lucide:log-out",
    onClick: () => {
      logoutNotice.value = true
    },
  },
  {
    label: "Calculator",
    icon: "lucide:calculator",
    onClick: openCalculator,
  },
  {
    label: "Bookmark",
    icon: "lucide:bookmark",
    onClick: toggleBookmark,
  },
  // {
  //   label: "Report Error",
  //   icon: "lucide:triangle-alert",
  //   onClick: reportError,
  // },
  {
    label: "Dictionary",
    icon: "lucide:book-open",
    onClick: openDictionary,
  },
  // {
  //   label: "AI Tutor",
  //   icon: "lucide:bot",
  //   onClick: openAiTutor,
  // },
]

// Expose timer methods to exam.vue
defineExpose({
  timer,
  start: () => timer.value?.start(),
  stop: () => timer.value?.stop(),
  pause: () => timer.value?.pause(),
  resume: () => timer.value?.resume(),
  reset: (seconds) => timer.value?.reset(seconds),
  getTimeLeft: () => timer.value?.timeLeft || 0,
})
</script>

<style scoped>
@reference "tailwindcss";

.exam-tool-button {
  @apply  flex h-11 items-center gap-2 rounded-lg px-3
         text-sm font-semibold text-white/90
         transition-all duration-200
         hover:bg-white/10 hover:text-white
         active:scale-95;
}


</style>