<template>
  <Teleport to="body">

    <!-- OVERLAY -->
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
    >

      <!-- MODAL -->
      <div
        class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-md bg-white shadow-2xl"
      >

        <!-- HEADER -->
        <div
          class="flex shrink-0 items-center justify-between bg-primary px-3 py-1.5 text-white sm:px-4"
        >
          <h2 class="text-xs font-semibold sm:text-sm">
            Select Subject
          </h2>

          <button
            type="button"
            @click="closeModal"
            aria-label="Close"
            class="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 sm:h-9 sm:w-9"
          >
            <Icon
              name="lucide:x"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </button>
        </div>


        <!-- CONTENT -->
        <div
          class="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 sm:px-4 sm:py-3"
        >

          <!-- SELECT ALL -->
          <label
            class="mb-2 flex cursor-pointer items-center gap-2 border-b border-slate-200 pb-2"
          >
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="h-3.5 w-3.5 cursor-pointer accent-blue-600 sm:h-4 sm:w-4"
            />

            <span
              class="text-xs font-semibold text-slate-700 sm:text-sm"
            >
              Select All
            </span>
          </label>


          <!-- SUBJECT LIST -->
          <div
            class="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1.5"
          >

            <label
              v-for="subject in SUBJECTS"
              :key="subject.id"
              class="group flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 transition hover:bg-slate-50 sm:px-2 sm:py-2"
            >

              <!-- CHECKBOX -->
              <input
                type="checkbox"
                :checked="isSelected(subject)"
                @change="toggleSubject(subject)"
                class="h-3.5 w-3.5 shrink-0 cursor-pointer accent-green-600 sm:h-4 sm:w-4"
              />


              <!-- ICON -->
              <div
                :class="[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8',
                  getSubjectColor(subject).bg
                ]"
              >
                <Icon
                  :name="getSubjectIcon(subject)"
                  :class="[
                    'h-3.5 w-3.5 sm:h-4 sm:w-4',
                    getSubjectColor(subject).text
                  ]"
                />
              </div>


              <!-- SUBJECT NAME -->
              <span
                class="min-w-0 truncate text-xs font-medium text-slate-700 sm:text-sm"
              >
                {{ formatSubjectName(subject) }}
              </span>

            </label>

          </div>
        </div>


        <!-- FOOTER -->
        <div
          class="flex shrink-0 items-center justify-between border-t border-slate-200 bg-primary px-3 py-2 sm:px-4 sm:py-2.5"
        >

          <!-- SELECTED COUNT -->
          <span
            class="text-[11px] font-medium text-white sm:text-xs"
          >
            {{ selectedSubjects.length }} selected
          </span>


          <!-- BUTTONS -->
          <div class="flex gap-1.5 sm:gap-2">

            <!-- CANCEL -->
            <button
              type="button"
              @click="closeModal"
              class="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:px-4 sm:py-1.5"
            >
              Cancel
            </button>


            <!-- OKAY -->
            <button
              type="button"
              @click="confirmSubjects"
              class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:px-4 sm:py-1.5"
            >
              Okay
            </button>

          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>


<script setup>

import {
  computed,
  ref,
  watch
} from 'vue'


/* =========================================================
   PROPS
========================================================= */

const props = defineProps({

  modelValue: {
    type: Boolean,
    default: false
  },

  modelSubjects: {
    type: Array,
    default: () => []
  }

})


/* =========================================================
   EMITS
========================================================= */

const emit = defineEmits([
  'update:modelValue',
  'update:modelSubjects',
  'confirm'
])


/* =========================================================
   SUBJECTS
========================================================= */

const SUBJECTS = [

  {
    id: 'accounting',
    name: 'Accounting',
    icon: 'lucide:calculator'
  },

  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: 'lucide:wheat'
  },

  {
    id: 'arabic',
    name: 'Arabic',
    icon: 'lucide:languages'
  },

  {
    id: 'biology',
    name: 'Biology',
    icon: 'lucide:dna'
  },

  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'lucide:flask-conical'
  },

  {
    id: 'christian-religious-studies',
    name: 'Christian Religious Studies',
    icon: 'lucide:church'
  },

  {
    id: 'civic-education',
    name: 'Civic Education',
    icon: 'lucide:landmark'
  },

  {
    id: 'commerce',
    name: 'Commerce',
    icon: 'lucide:shopping-cart'
  },

  {
    id: 'computer-studies',
    name: 'Computer Studies',
    icon: 'lucide:monitor'
  },

  {
    id: 'economics',
    name: 'Economics',
    icon: 'lucide:chart-no-axes-combined'
  },

  {
    id: 'english',
    name: 'English',
    icon: 'lucide:book-open'
  },

  {
    id: 'fine-art',
    name: 'Fine Art',
    icon: 'lucide:palette'
  },

  {
    id: 'french',
    name: 'French',
    icon: 'lucide:languages'
  },

  {
    id: 'geography',
    name: 'Geography',
    icon: 'lucide:globe-2'
  },

  {
    id: 'government',
    name: 'Government',
    icon: 'lucide:building-2'
  },

  {
    id: 'hausa',
    name: 'Hausa',
    icon: 'lucide:languages'
  },

  {
    id: 'history',
    name: 'History',
    icon: 'lucide:scroll-text'
  },

  {
    id: 'home-economics',
    name: 'Home Economics',
    icon: 'lucide:house'
  },

  {
    id: 'igbo',
    name: 'Igbo',
    icon: 'lucide:languages'
  },

  {
    id: 'insurance',
    name: 'Insurance',
    icon: 'lucide:shield-check'
  },

  {
    id: 'literature-in-english',
    name: 'Literature in English',
    icon: 'lucide:book-text'
  },

  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'lucide:sigma'
  },

  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'lucide:megaphone'
  },

  {
    id: 'physics',
    name: 'Physics',
    icon: 'lucide:atom'
  }

]


/* =========================================================
   LOCAL STATE
========================================================= */

const selectedSubjects = ref([])


/* =========================================================
   SYNC PARENT DATA
========================================================= */

watch(
  () => props.modelSubjects,

  (value) => {

    if (!Array.isArray(value)) {
      selectedSubjects.value = []
      return
    }

    selectedSubjects.value = value
      .map((subject) => {

        if (typeof subject === 'string') {
          return SUBJECTS.find(
            item => item.id === subject
          )
        }

        if (
          subject &&
          typeof subject === 'object'
        ) {
          return subject
        }

        return null
      })
      .filter(Boolean)

  },

  {
    immediate: true,
    deep: true
  }
)


/* =========================================================
   ALL SELECTED
========================================================= */

const allSelected = computed(() => {

  return (
    SUBJECTS.length > 0 &&
    selectedSubjects.value.length === SUBJECTS.length
  )

})


/* =========================================================
   CHECK SELECTED
========================================================= */

const isSelected = (subject) => {

  return selectedSubjects.value.some(
    item => item.id === subject.id
  )

}


/* =========================================================
   TOGGLE SUBJECT
========================================================= */

const toggleSubject = (subject) => {

  const index =
    selectedSubjects.value.findIndex(
      item => item.id === subject.id
    )

  if (index !== -1) {

    selectedSubjects.value.splice(index, 1)

    return
  }

  selectedSubjects.value.push({
    id: subject.id,
    name: subject.name,
    icon: subject.icon
  })

}


/* =========================================================
   SELECT ALL
========================================================= */

const toggleSelectAll = () => {

  if (allSelected.value) {

    selectedSubjects.value = []

    return
  }

  selectedSubjects.value = [
    ...SUBJECTS
  ]

}


/* =========================================================
   CLOSE
========================================================= */

const closeModal = () => {

  emit(
    'update:modelValue',
    false
  )

}


/* =========================================================
   CONFIRM
========================================================= */

const confirmSubjects = () => {

  const subjectsToSend =
    selectedSubjects.value.map(
      subject => ({
        id: subject.id,
        name: subject.name,
        icon: subject.icon
      })
    )

  emit(
    'update:modelSubjects',
    subjectsToSend
  )

  emit(
    'confirm',
    subjectsToSend
  )

  emit(
    'update:modelValue',
    false
  )

}


/* =========================================================
   FORMAT NAME
========================================================= */

const formatSubjectName = (subject) => {

  if (
    subject &&
    typeof subject === 'object'
  ) {
    return subject.name || ''
  }

  if (
    typeof subject !== 'string'
  ) {
    return ''
  }

  return subject
    .replace(/-/g, ' ')
    .replace(
      /\b\w/g,
      char => char.toUpperCase()
    )

}


/* =========================================================
   COLORS
========================================================= */

const subjectColors = {

  accounting: ['bg-blue-100', 'text-blue-600'],
  agriculture: ['bg-green-100', 'text-green-600'],
  arabic: ['bg-orange-100', 'text-orange-600'],
  biology: ['bg-emerald-100', 'text-emerald-600'],
  chemistry: ['bg-purple-100', 'text-purple-600'],

  'christian-religious-studies':
    ['bg-red-100', 'text-red-600'],

  'civic-education':
    ['bg-indigo-100', 'text-indigo-600'],

  commerce:
    ['bg-yellow-100', 'text-yellow-600'],

  'computer-studies':
    ['bg-cyan-100', 'text-cyan-600'],

  economics:
    ['bg-teal-100', 'text-teal-600'],

  english:
    ['bg-blue-100', 'text-blue-600'],

  'fine-art':
    ['bg-pink-100', 'text-pink-600'],

  french:
    ['bg-violet-100', 'text-violet-600'],

  geography:
    ['bg-lime-100', 'text-lime-600'],

  government:
    ['bg-slate-100', 'text-slate-600'],

  hausa:
    ['bg-amber-100', 'text-amber-600'],

  history:
    ['bg-stone-100', 'text-stone-600'],

  'home-economics':
    ['bg-rose-100', 'text-rose-600'],

  igbo:
    ['bg-green-100', 'text-green-600'],

  insurance:
    ['bg-sky-100', 'text-sky-600'],

  'literature-in-english':
    ['bg-fuchsia-100', 'text-fuchsia-600'],

  mathematics:
    ['bg-indigo-100', 'text-indigo-600'],

  marketing:
    ['bg-pink-100', 'text-pink-600'],

  physics:
    ['bg-cyan-100', 'text-cyan-600']

}


/* =========================================================
   COLOR
========================================================= */

const getSubjectColor = (subject) => {

  const subjectId =
    typeof subject === 'object'
      ? subject?.id
      : subject

  const colors =
    subjectColors[subjectId] || [
      'bg-slate-100',
      'text-slate-600'
    ]

  return {
    bg: colors[0],
    text: colors[1]
  }

}


/* =========================================================
   ICON
========================================================= */

const getSubjectIcon = (subject) => {

  if (
    subject &&
    typeof subject === 'object'
  ) {

    return (
      subject.icon ||
      'lucide:book-open'
    )

  }

  const foundSubject =
    SUBJECTS.find(
      item => item.id === subject
    )

  return (
    foundSubject?.icon ||
    'lucide:book-open'
  )

}


/* =========================================================
   EXPOSE
========================================================= */

defineExpose({

  SUBJECTS,

  selectedSubjects,

  toggleSubject,

  isSelected

})

</script>