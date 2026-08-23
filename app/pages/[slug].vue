<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-800 font-['Inter',system-ui,sans-serif]">

    <!-- ================================================= -->
    <!-- TOP BAR -->
    <!-- ================================================= -->

    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-navy px-4 text-white sm:px-6">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon name="lucide:menu" class="h-5 w-5" />
      </button>

      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
        @click="goHome"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </button>

      <div class="min-w-0 flex-1">
        <p class="truncate text-[11px] uppercase tracking-wide text-white/60">
          {{ breadcrumbSubject }} {{ breadcrumbTopic ? '/ ' + breadcrumbTopic : '' }}
        </p>
        <h1 class="truncate font-['Fraunces',Georgia,serif] text-sm font-semibold sm:text-base">
          {{ currentLesson?.title || 'Loading…' }}
        </h1>
      </div>

      <div class="relative hidden sm:block">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons…"
          class="w-56 rounded-lg border border-white/10 bg-white/10 py-1.5 pl-9 pr-3
                 text-sm text-white placeholder:text-white/50 outline-none
                 focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>
    </header>

    <!-- ================================================= -->
    <!-- PROGRESS BAR -->
    <!-- ================================================= -->

    <div class="h-1 w-full shrink-0 bg-slate-100">
      <div
        class="h-full bg-gold transition-all duration-300"
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>

    <div class="flex flex-1 min-h-0">

      <!-- ================================================= -->
      <!-- SIDEBAR -->
      <!-- ================================================= -->

      <aside
        class="w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 lg:block"
        :class="sidebarOpen ? 'block absolute z-20 h-[calc(100%-3.75rem)]' : 'hidden'"
      >
        <div class="py-2">
          <div v-for="subject in sidebar" :key="subject.id">

            <!-- subject header -->
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold
                     uppercase tracking-wide text-slate-500 hover:bg-slate-100"
              @click="toggleSubject(subject.id)"
            >
              <Icon :name="subject.icon || 'lucide:book-open'" class="h-3.5 w-3.5 text-gold" />
              <span class="flex-1">{{ subject.name }}</span>
              <Icon
                name="lucide:chevron-down"
                class="h-3.5 w-3.5 transition-transform"
                :class="{ '-rotate-90': !openSubjects.has(subject.id) }"
              />
            </button>

            <!-- topics + lessons -->
            <div v-if="openSubjects.has(subject.id)">
              <div v-for="topic in subject.topics" :key="topic.id" class="mb-1">
               <button type="button"  title="Delete subject"   @click.stop="openDelete('subject', subject)"
                  class="flex h-6 w-6 shrink-0 items-center  justify-center rounded-md  text-slate-300 transition         hover:bg-red-100 hover:text-red-600" >
                 <Icon  name="lucide:x"     class="h-3.5 w-3.5"     />
                 </button>
                <p class="px-4 pb-1 pt-2 text-[11px] font-semibold text-slate-400">
                  {{ topic.title }}
                </p>

                <NuxtLink
                  v-for="lesson in topic.lessons"
                  :key="lesson.id"
                  :to="`/${lesson.slug}`"
                  class="block border-l-[3px] py-1.5 pl-4 pr-3 text-[13.5px] transition"
                  :class="route.params.slug === lesson.slug
                    ? 'border-navy bg-white font-semibold text-navy'
                    : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                <button type="button"  title="Delete subject"     @click.stop="openDelete('topic', topic)"
                  class="flex h-6 w-6 shrink-0 items-center  justify-center rounded-md  text-slate-300 transition         hover:bg-red-100 hover:text-red-600"   >
                 <Icon  name="lucide:x"     class="h-3.5 w-3.5"     />
                 </button>
                  {{ lesson.title }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-10 bg-black/30 lg:hidden"
        @click="sidebarOpen = false"
      ></div>

      <!-- ================================================= -->
      <!-- MAIN CONTENT — white, full screen -->
      <!-- ================================================= -->

      <main class="min-h-0 flex-1 overflow-y-auto bg-white">
        
        <!-- SEARCH RESULTS -->
        <div v-if="showSearchResults" class="mx-auto max-w-3xl px-4 py-8 sm:px-10">
          <h2 class="mb-4 text-lg font-semibold text-slate-800">
            Search results for "{{ searchTerm }}"
          </h2>

          <ul v-if="results.length" class="space-y-3">
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-lg border border-slate-200 p-4 transition hover:border-navy-soft hover:shadow-sm"
              @click="navigateTo(`/${row.slug}`)"
            >
              <span class="mb-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {{ row.subjectName }}
              </span>
              <h3 class="text-base font-semibold text-navy">{{ row.title }}</h3>
              <p class="mt-1 text-sm text-slate-500" v-html="renderSnippet(row.snippet)"></p>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-500">No lessons matched that search.</p>
        </div>

        <!-- LESSON CONTENT -->
        <article v-else-if="currentLesson" class="mx-auto max-w-3xl px-4 py-10 sm:px-10">

          <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            {{ currentLesson.title }}  <TopicImporter
                
                  :lesson-id="currentLesson.id" 
                   @updated="handleLessonUpdated"
               
              />
             
          </h1>
          

          <div class="mt-6">
            
            <LessonBlock
              v-for="(block, i) in currentLesson.blocks"
              :key="i"
              :block="block"
            />
           
          </div>

          <!-- prev / next footer -->
          <div class="mt-12 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
            <NuxtLink
              v-if="prevLesson"
              :to="`/${prevLesson.slug}`"
              class="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-navy-soft"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4 text-slate-400" />
              <div class="min-w-0">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">Previous</p>
                <p class="truncate text-sm font-semibold text-navy">{{ prevLesson.title }}</p>
              </div>
            </NuxtLink>
            <div v-else class="flex-1"></div>

            <NuxtLink
              v-if="nextLesson"
              :to="`/${nextLesson.slug}`"
              class="flex flex-1 items-center justify-end gap-2 rounded-lg border border-slate-200 px-4 py-3 text-right transition hover:border-navy-soft"
            >
              <div class="min-w-0">
                <p class="text-[11px] uppercase tracking-wide text-slate-400">Next</p>
                <p class="truncate text-sm font-semibold text-navy">{{ nextLesson.title }}</p>
              </div>
              <Icon name="lucide:chevron-right" class="h-4 w-4 text-slate-400" />
            </NuxtLink>
            <div v-else class="flex-1"></div>
          </div>
        </article>

        <div v-else class="flex h-full flex-col items-center justify-center px-4 text-center">
          <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin text-slate-300" />
        </div>

      </main>

      <Teleport to="body">
  <div
    v-if="showDelete"
    class="fixed inset-0 z-[100] flex items-center
           justify-center bg-black/40 p-4"
    @click.self="closeDelete"
  >
    <div class="w-full max-w-md">
      <Delete
        :type="deleteType"
        :id="deleteId"
        :name="deleteName"
        @deleted="handleDeleted"
        @cancel="closeDelete"
      />
    </div>
  </div>
</Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const route = useRoute()
const showDelete = ref(false)

const deleteType = ref('topic')
const deleteId = ref('')
const deleteName = ref('')


const {
  sidebar,
  currentLesson,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search
} = useLessons()

const sidebarOpen        = ref(false)
const openSubjects        = ref(new Set())
const searchTerm            = ref('')
const showSearchResults    = ref(false)
const prevLesson              = ref(null)
const nextLesson              = ref(null)

let debounceTimer = null

onMounted(async () => {
  await loadSidebar()
  await openLessonBySlug(route.params.slug)
})

// re-run whenever the URL's [slug] changes (clicking a different lesson link)
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) openLessonBySlug(newSlug)
})

const openLessonBySlug = async (slug) => {
  showSearchResults.value = false
  searchTerm.value = ''
  sidebarOpen.value = false

  await loadLesson(slug)
  prevLesson.value = await adjacentLesson('previous')
  nextLesson.value = await adjacentLesson('next')

  const owner = sidebar.value.find((s) =>
    s.topics.some((t) => t.lessons.some((l) => l.slug === slug))
  )
  if (owner) openSubjects.value.add(owner.id)
}

const toggleSubject = (id) => {
  if (openSubjects.value.has(id)) {
    openSubjects.value.delete(id)
  } else {
    openSubjects.value.add(id)
  }
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

// ---- reading progress: how far through this subject's lesson list ----------

const progressPercent = computed(() => {
  if (!currentLesson.value) return 0

  const owner = sidebar.value.find((s) => s.id === currentLesson.value.subject_id)
  if (!owner) return 0

  const allLessons = owner.topics.flatMap((t) => t.lessons)
  const index = allLessons.findIndex((l) => l.slug === route.params.slug)
  if (index === -1 || !allLessons.length) return 0

  return Math.round(((index + 1) / allLessons.length) * 100)
})

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

const goHome = () => navigateTo('/')

const openDelete = (type, item) => {
  deleteType.value = type

  if (type === 'subject') {
    deleteId.value = item.id
    deleteName.value = item.name
  } else {
    deleteId.value = item.id
    deleteName.value = item.title
  }

  showDelete.value = true
}

const closeDelete = () => {
  showDelete.value = false
}

const handleDeleted = async () => {
  showDelete.value = false

  await loadSidebar()

  /*
   * Refresh current lesson/sidebar state.
   */
  if (currentLesson.value?.slug) {
    await openLessonBySlug(
      currentLesson.value.slug
    )
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

.prose-lesson :deep(br) { display: block; content: ''; margin-top: 0.7em; }
</style>