<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-bg text-ink font-['Inter',system-ui,sans-serif]">

    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->

    <header class="flex h-14 shrink-0 items-center justify-between bg-navy px-4 text-white shadow-md sm:px-6">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Icon name="lucide:menu" class="h-5 w-5" />
        </button>
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Icon name="lucide:graduation-cap" class="h-5 w-5" />
        </div>
        <h1 class="font-['Fraunces',Georgia,serif] text-sm font-semibold sm:text-base">Lessons</h1>
      </div>

      <!-- search -->
      <div class="relative hidden sm:block">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons…"
          class="w-64 rounded-lg border border-white/10 bg-white/10 py-1.5 pl-9 pr-3
                 text-sm text-white placeholder:text-white/50 outline-none
                 focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>

      <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10" @click="goHome">
        <Icon name="lucide:house" class="h-5 w-5" />
      </button>
    </header>

    <div class="flex flex-1 min-h-0">

      <!-- ================================================= -->
      <!-- SIDEBAR -->
      <!-- ================================================= -->

      <aside
        class="w-72 shrink-0 overflow-y-auto border-r border-line bg-surface
               lg:block"
        :class="sidebarOpen ? 'block absolute z-20 h-[calc(100%-3.5rem)]' : 'hidden'"
      >
        <div class="p-3">
          <div
            v-for="subject in sidebar"
            :key="subject.id"
            class="mb-1"
          >
            <!-- subject header -->
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left
                     text-sm font-semibold text-navy hover:bg-bg"
              @click="toggleSubject(subject.id)"
            >
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-4 w-4 text-gold" />
              <span class="flex-1">{{ subject.name }}</span>
              <Icon
                name="lucide:chevron-right"
                class="h-3.5 w-3.5 text-ink-soft transition-transform"
                :class="{ 'rotate-90': openSubjects.has(subject.id) }"
              />
            </button>

            <!-- topics + lessons -->
            <div v-if="openSubjects.has(subject.id)" class="ml-3 border-l border-line pl-3">
              <div v-for="topic in subject.topics" :key="topic.id" class="mb-2 mt-1">
                <p class="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  {{ topic.title }}
                </p>
                <button
                  v-for="lesson in topic.lessons"
                  :key="lesson.id"
                  type="button"
                  class="block w-full rounded-md px-2 py-1.5 text-left text-sm transition"
                  :class="currentLesson?.slug === lesson.slug
                    ? 'bg-navy text-white font-medium'
                    : 'text-ink-soft hover:bg-bg hover:text-ink'"
                  @click="openLesson(lesson.slug)"
                >
                  {{ lesson.title }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- backdrop for mobile sidebar -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-10 bg-black/30 lg:hidden"
        @click="sidebarOpen = false"
      ></div>

      <!-- ================================================= -->
      <!-- MAIN CONTENT -->
      <!-- ================================================= -->

      <main class="min-h-0 flex-1 overflow-y-auto">

        <!-- SEARCH RESULTS -->
        <div v-if="showSearchResults" class="mx-auto max-w-3xl px-4 py-6 sm:px-8">
          <h2 class="mb-4 font-['Fraunces',Georgia,serif] text-lg font-semibold text-navy">
            Search results for "{{ searchTerm }}"
          </h2>

          <ul v-if="results.length" class="space-y-3">
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-xl border border-line bg-surface p-4
                     transition hover:shadow-[0_8px_20px_-12px_rgba(36,48,74,0.25)]"
              @click="openLesson(row.slug)"
            >
              <span class="mb-1 inline-block rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                {{ row.subjectName }}
              </span>
              <h3 class="font-['Fraunces',Georgia,serif] text-base font-semibold text-navy">{{ row.title }}</h3>
              <p class="mt-1 text-sm text-ink-soft" v-html="renderSnippet(row.snippet)"></p>
            </li>
          </ul>

          <p v-else class="text-sm text-ink-soft">No lessons matched that search.</p>
        </div>

        <!-- LESSON CONTENT -->
        <article v-else-if="currentLesson" class="mx-auto max-w-3xl px-4 py-8 sm:px-8">

          <!-- breadcrumb -->
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {{ breadcrumbSubject }} / {{ breadcrumbTopic }}
          </p>

          <h1 class="font-['Fraunces',Georgia,serif] text-2xl font-semibold text-navy sm:text-3xl">
            {{ currentLesson.title }}
          </h1>
          <p v-if="currentLesson.summary" class="mt-2 text-base text-ink-soft">
            {{ currentLesson.summary }}
          </p>

          <div class="my-6 border-t border-dashed border-line"></div>

          <!-- lesson body -->
          <div
            class="prose-lesson text-[15px] leading-7 text-ink"
            v-html="currentLesson.content_html"
          ></div>

          <!-- worked examples -->
          <div v-for="example in examples" :key="example.id" class="mt-6 rounded-xl border border-line bg-surface">
            <div class="flex items-center gap-2 border-b border-dashed border-line bg-mid-bg px-4 py-2.5 rounded-t-xl">
              <Icon name="lucide:flask-round" class="h-4 w-4 text-gold" />
              <span class="text-xs font-semibold uppercase tracking-wide text-navy">
                {{ example.title || 'Try it yourself' }}
              </span>
            </div>
            <div class="px-4 py-3 text-[15px] leading-7 text-ink" v-html="example.content_html"></div>
          </div>

          <!-- prev / next footer -->
          <div class="mt-10 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button
              v-if="prevLesson"
              type="button"
              class="flex flex-1 items-center gap-2 rounded-xl border border-line bg-surface
                     px-4 py-3 text-left transition hover:border-navy-soft"
              @click="openLesson(prevLesson.slug)"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4 text-ink-soft" />
              <div>
                <p class="text-[11px] uppercase tracking-wide text-ink-soft">Previous</p>
                <p class="text-sm font-semibold text-navy">{{ prevLesson.title }}</p>
              </div>
            </button>
            <div v-else class="flex-1"></div>

            <button
              v-if="nextLesson"
              type="button"
              class="flex flex-1 items-center justify-end gap-2 rounded-xl border border-line
                     bg-surface px-4 py-3 text-right transition hover:border-navy-soft"
              @click="openLesson(nextLesson.slug)"
            >
              <div>
                <p class="text-[11px] uppercase tracking-wide text-ink-soft">Next</p>
                <p class="text-sm font-semibold text-navy">{{ nextLesson.title }}</p>
              </div>
              <Icon name="lucide:chevron-right" class="h-4 w-4 text-ink-soft" />
            </button>
            <div v-else class="flex-1"></div>
          </div>
        </article>

        <!-- EMPTY STATE -->
        <div v-else class="flex h-full flex-col items-center justify-center px-4 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface text-gold">
            <Icon name="lucide:book-open" class="h-7 w-7" />
          </div>
          <h2 class="font-['Fraunces',Georgia,serif] text-lg font-semibold text-navy">Pick a lesson to begin</h2>
          <p class="mt-1 text-sm text-ink-soft">Choose a subject from the sidebar, or search above.</p>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['gohome'])

const {
  sidebar,
  currentLesson,
  examples,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search
} = useLessons()

const sidebarOpen   = ref(false)
const openSubjects  = ref(new Set())
const searchTerm     = ref('')
const showSearchResults = ref(false)
const prevLesson       = ref(null)
const nextLesson       = ref(null)

let debounceTimer = null

onMounted(async () => {
  await loadSidebar()
  if (sidebar.value.length) {
    openSubjects.value.add(sidebar.value[0].id)
    const firstLesson = sidebar.value[0].topics?.[0]?.lessons?.[0]
    if (firstLesson) await openLesson(firstLesson.slug)
  }
})

const toggleSubject = (id) => {
  if (openSubjects.value.has(id)) {
    openSubjects.value.delete(id)
  } else {
    openSubjects.value.add(id)
  }
}

const openLesson = async (slug) => {
  showSearchResults.value = false
  searchTerm.value = ''
  sidebarOpen.value = false

  await loadLesson(slug)
  prevLesson.value = await adjacentLesson('prev')
  nextLesson.value = await adjacentLesson('next')

  // make sure the lesson's subject is expanded in the sidebar
  const owner = sidebar.value.find((s) =>
    s.topics.some((t) => t.lessons.some((l) => l.slug === slug))
  )
  if (owner) openSubjects.value.add(owner.id)
}

const onSearchInput = () => {
  clearTimeout(debounceTimer)
  if (!searchTerm.value.trim()) {
    showSearchResults.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    showSearchResults.value = true
    await search(searchTerm.value)
  }, 250)
}

const breadcrumbSubject = computed(() => {
  const owner = sidebar.value.find((s) => s.id === currentLesson.value?.subject_id)
  return owner?.name || ''
})

const breadcrumbTopic = computed(() => {
  const owner = sidebar.value.find((s) => s.id === currentLesson.value?.subject_id)
  const topic = owner?.topics.find((t) => t.id === currentLesson.value?.topic_id)
  return topic?.title || ''
})

const renderSnippet = (snippet) => {
  if (!snippet) return ''
  return snippet
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/⟦/g, '<mark class="bg-transparent text-navy font-semibold border-b-2 border-gold">')
    .replace(/⟧/g, '</mark>')
}

const goHome = () => emit('gohome')
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

/* v-html content needs its own spacing rules — Tailwind can't reach into
   dynamically injected markup via utility classes on the parent alone */
.prose-lesson :deep(br) { display: block; content: ''; margin-top: 0.6em; }
</style>
