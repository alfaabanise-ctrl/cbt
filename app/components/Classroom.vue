<template>

    <div
  class="flex h-full min-h-screen bg-bg w-full min-h-0 flex-col overflow-hidden bg-cover bg-center bg-no-repeat text-ink font-['Inter',system-ui,sans-serif]"
 
>
    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->

    <header class="flex flex-col gap-3 bg-primary px-4 py-3 text-white shadow-md sm:px-6">

      <!-- title row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Icon name="lucide:school" class="h-5 w-5" />
          </div>
          <h1 class="font-['Fraunces',Georgia,serif] text-base font-semibold sm:text-lg">Classroom</h1>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
          @click="goHome"
        >
          <Icon name="lucide:house" class="h-5 w-5" />
        </button>
      </div>

      <!-- action row -->
      <div class="flex flex-wrap items-center gap-2">

        <!-- user select -->
        <div class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
          <Icon name="lucide:user-round" class="h-4 w-4 text-white/70" />
          <input
            v-model="appState.currentsuser"
            list="classroom-users"
            placeholder="Select user"
            class="w-32 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/50 sm:w-40"
          />
          <datalist id="classroom-users">
            <option v-for="u in appState.users || []" :key="u" :value="u" />
          </datalist>
        </div>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showAddUser = true"
        >
          <Icon name="lucide:user-plus" class="h-3.5 w-3.5" />
          Add User
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full bg-navy-soft px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showSubjectModal = true"
        >
          <Icon name="lucide:refresh-cw" class="h-3.5 w-3.5" />
          Set Subject
        </button>

        <button
          type="button"
          class="ml-auto flex items-center gap-1.5 rounded-full bg-good px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          @click="showStudyPlan = true"
        >
          <Icon name="lucide:layout-grid" class="h-3.5 w-3.5" />
          Study Plan
        </button>
      </div>
    </header>

    <!-- ================================================= -->
    <!-- MAIN -->
    <!-- ================================================= -->

    <main class="min-h-[] h-80 flex-1 overflow-y-auto px-4 py-6 sm:px-6">

      <!-- EMPTY STATE -->
      <div v-if="!studySubjects.length" class="flex h-full flex-col items-center justify-center text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface text-gold">
          <Icon name="lucide:book-open" class="h-7 w-7" />
        </div>
        <h2 class="font-['Fraunces',Georgia,serif] text-lg font-semibold text-navy">No subjects yet</h2>
        <p class="mt-1 max-w-xs text-sm text-ink-soft">Tap "Set Subject" above to build {{ currentUser }}'s classroom.</p>
      </div>

      <!-- SUBJECT GRID -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="(subject, index) in studySubjects"
          :key="subject.id"
          class="group relative cursor-pointer overflow-hidden rounded-xl border border-line
                 bg-mid-bg p-5 text-center shadow-[0_1px_2px_rgba(36,48,74,0.04)] transition
                 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(36,48,74,0.25)]"
          @click="openSubject(subject)"
        >
          <!-- order badge -->
          <span class="absolute left-3 top-3 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-soft shadow-sm">
            #{{ index + 1 }}
          </span>

          <!-- progress ring -->
          <div class="absolute right-3 top-3">
            <ProgressRing :percent="progressFor(subject.id)" />
          </div>

          <!-- icon -->
          <div class="mx-auto mb-3 mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-navy">
            <Icon :name="subject.icon || 'lucide:book-open'" class="h-7 w-7" />
          </div>

          <h3 class="font-['Fraunces',Georgia,serif] text-base font-semibold text-navy">
            {{ subject.name }}
          </h3>
        </article>
      </div>
    </main>

    <!-- ================================================= -->
    <!-- ADD USER MODAL -->
    <!-- ================================================= -->

    <Teleport to="body">
      <div v-if="showAddUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div class="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-['Fraunces',Georgia,serif] text-lg font-semibold text-navy">Add User</h2>
            <button class="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-line" @click="closeAddUser">
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <label class="mb-1.5 block text-xs font-semibold text-ink-soft">Name</label>
          <input
            v-model="newUserName"
            type="text"
            placeholder="e.g. Fatima"
            class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none
                   focus:border-navy-soft focus:ring-2 focus:ring-navy-soft/15"
            @keydown.enter="confirmAddUser"
          />

          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            @click="confirmAddUser"
          >
            Add & Switch
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ================================================= -->
    <!-- STUDY PLAN MODAL -->
    <!-- ================================================= -->

    <Teleport to="body">
      <div v-if="showStudyPlan" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="font-['Fraunces',Georgia,serif] text-lg font-semibold text-navy">Study Plan</h2>
              <p class="text-xs text-ink-soft">{{ currentUser }}'s subject order</p>
            </div>
            <button class="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-line" @click="showStudyPlan = false">
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <ul v-if="studySubjects.length" class="max-h-80 space-y-2 overflow-y-auto">
            <li
              v-for="(subject, index) in studySubjects"
              :key="subject.id"
              class="flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2"
            >
              <span class="w-5 shrink-0 text-center font-['IBM_Plex_Mono',monospace] text-xs font-semibold text-ink-soft">
                {{ index + 1 }}
              </span>
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-4 w-4 shrink-0 text-gold" />
              <span class="flex-1 truncate text-sm font-medium text-ink">{{ subject.name }}</span>

              <button class="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-line disabled:opacity-30"
                      :disabled="index === 0" @click="reorderSubject(subject.id, 'up')">
                <Icon name="lucide:chevron-up" class="h-3.5 w-3.5" />
              </button>
              <button class="flex h-6 w-6 items-center justify-center rounded text-ink-soft hover:bg-line disabled:opacity-30"
                      :disabled="index === studySubjects.length - 1" @click="reorderSubject(subject.id, 'down')">
                <Icon name="lucide:chevron-down" class="h-3.5 w-3.5" />
              </button>
              <button class="flex h-6 w-6 items-center justify-center rounded text-bad hover:bg-bad-bg" @click="removeSubject(subject.id)">
                <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
              </button>
            </li>
          </ul>
          <p v-else class="py-6 text-center text-sm text-ink-soft">No subjects added yet.</p>

          <button
            type="button"
            class="mt-4 w-full rounded-xl border border-line bg-bg py-2.5 text-sm font-semibold text-navy transition hover:bg-line"
            @click="showStudyPlan = false; showSubjectModal = true"
          >
            + Add More Subjects
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ================================================= -->
    <!-- SET SUBJECT (reuses your existing SelectSubject) -->
    <!-- ================================================= -->

    <SelectSubject
      v-model="showSubjectModal"
      v-model:modelSubjects="studySubjects"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const emit = defineEmits(['gohome', 'open-subject'])
const appState = useAppState()

const {
  currentUser,
  studySubjects,
  removeSubject,
  reorderSubject,
  addUser,
  loadAllProgress,
  progressFor
} = useClassroom()

const showAddUser      = ref(false)
const showSubjectModal = ref(false)
const showStudyPlan     = ref(false)
const newUserName        = ref('')

onMounted(() => {
  loadAllProgress()
})

// re-fetch progress whenever the subject list changes (added/removed)
watch(studySubjects, () => loadAllProgress(), { deep: true })

const confirmAddUser = () => {
  if (addUser(newUserName.value)) {
    newUserName.value = ''
    showAddUser.value = false
  }
}

const closeAddUser = () => {
  newUserName.value = ''
  showAddUser.value = false
}

const openSubject = async (subject) => {
  console.log('Selected subject:', subject)

  if (!subject?.slug && !subject?.id) {
    return
  }

  const subjectSlug =
    subject.slug || subject.id

  await navigateTo(`/learning/${subjectSlug}`)
}

const goHome = () => emit('gohome')
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
</style>
