<template>
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden bg-white font-['Inter',system-ui,sans-serif] text-slate-800"
  >
    <!-- TOP BAR -->
    <header
      class="z-40 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-navy px-3 text-white sm:gap-3 sm:px-6"
    >
      <!-- MOBILE MENU -->
      <button
        type="button"
        aria-label="Open menu"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10 lg:hidden"
        @click="sidebarOpen = !sidebarOpen"
      >
        <Icon name="lucide:menu" class="h-5 w-5" />
      </button>

      <!-- BACK BUTTON -->
      <button
        type="button"
        aria-label="Go home"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10"
        @click="goHome"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </button>

      <!-- PAGE TITLE -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-[10px] uppercase tracking-widest text-white/60">
          {{ breadcrumbSubject || "Learning" }}

          <span v-if="breadcrumbTopic"> / {{ breadcrumbTopic }} </span>
        </p>

        <h1 class="truncate text-sm font-semibold sm:text-base">
          {{ currentLesson?.title || selectedSubject?.name || "Learning" }}
        </h1>
      </div>

      <!-- SEARCH -->
      <div class="relative hidden sm:block">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-52 rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/50 transition focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>
    </header>

    <!-- MOBILE SEARCH -->
    <div class="shrink-0 border-b border-slate-200 bg-white p-3 sm:hidden">
      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />

        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search lessons..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-navy focus:bg-white"
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- SUBJECT PROGRESS BAR -->
    <div class="h-1 w-full shrink-0 bg-slate-100">
      <div
        class="h-full bg-gold transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <div class="relative flex min-h-0 flex-1">
      <!-- MOBILE OVERLAY -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/40 lg:hidden"
        @click="sidebarOpen = false"
      ></div>

      <!-- SIDEBAR -->
      <aside
        class="z-30 w-[min(84vw,288px)] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 lg:relative lg:block lg:w-72"
        :class="
          sidebarOpen
            ? 'absolute inset-y-0 left-0 block h-full shadow-xl'
            : 'hidden'
        "
      >
        <!-- SELECTED SUBJECT HEADER -->
        <div class="border-b border-slate-200 bg-white px-4 py-4">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >
            Current Subject
          </p>

          <div class="mt-2 flex items-center gap-2">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold"
            >
              <Icon name="lucide:book-open" class="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <h2 class="truncate text-sm font-bold text-navy">
                {{ selectedSubject?.name || breadcrumbSubject || "Subject" }}
              </h2>

              <p class="mt-0.5 text-xs text-slate-500">
                {{ totalLessons }} lessons
              </p>
            </div>
          </div>

          <!-- SUBJECT PROGRESS -->
          <div class="mt-4">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-[11px] text-slate-400"> Reading progress </span>

              <span class="text-[11px] font-bold text-navy">
                {{ progressPercent }}%
              </span>
            </div>

            <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-gold transition-all"
                :style="{ width: `${progressPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- SUBJECT TOPICS -->
        <div class="py-3">
          <div
            v-if="!selectedSubjectTopics.length"
            class="px-4 py-8 text-center"
          >
            <Icon
              name="lucide:book-open"
              class="mx-auto h-8 w-8 text-slate-300"
            />

            <p class="mt-3 text-xs text-slate-500">
              No topics available for this subject.
            </p>
          </div>

          <div
            v-for="topic in selectedSubjectTopics"
            :key="topic.id"
            class="mb-4"
          >
            <!-- TOPIC HEADER -->
            <div class="flex items-center gap-2 px-4 py-2">
              <Icon
                name="lucide:folder-open"
                class="h-4 w-4 shrink-0 text-gold"
              />

              <p
                class="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ topic.title }}
              </p>

              <span class="text-[10px] text-slate-400">
                {{ topic.lessons?.length || 0 }}
              </span>

              <!-- DELETE TOPIC -->
              <button
                type="button"
                title="Delete topic"
                aria-label="Delete topic"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-red-100 hover:text-red-600"
                @click.stop="openDelete('topic', topic)"
              >
                <Icon name="lucide:x" class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- LESSONS -->
            <div class="space-y-0.5">
              <NuxtLink
                v-for="lesson in topic.lessons || []"
                :key="lesson.id || lesson.slug"
                :to="lessonUrl(lesson)"
                class="group flex min-w-0 items-center gap-2 border-l-[3px] px-4 py-2.5 text-[13px] transition"
                :class="
                  isCurrentLesson(lesson)
                    ? 'border-navy bg-white font-semibold text-navy'
                    : 'border-transparent text-slate-600 hover:bg-white hover:text-navy'
                "
                @click="handleLessonNavigation"
              >
                <Icon
                  name="lucide:file-text"
                  class="h-4 w-4 shrink-0"
                  :class="
                    isCurrentLesson(lesson) ? 'text-gold' : 'text-slate-400'
                  "
                />

                <span class="min-w-0 flex-1 truncate">
                  {{ lesson.title }}
                </span>

                <!-- SAVED TIME -->
                <span
                  v-if="getCurrentLessonTime(lesson) > 0"
                  class="hidden text-[9px] text-slate-400 xl:inline"
                >
                  {{ formatReadingTime(getCurrentLessonTime(lesson)) }}
                </span>

                <!-- READ STATUS -->
                <Icon
                  v-if="isCurrentLessonRead(lesson)"
                  name="lucide:check-circle-2"
                  class="h-4 w-4 shrink-0 text-emerald-500"
                  title="Read"
                />

                <Icon
                  v-else
                  name="lucide:circle"
                  class="h-4 w-4 shrink-0 text-slate-300"
                  title="Unread"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main
        class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-white"
      >
        <!-- SEARCH RESULTS -->
        <div
          v-if="showSearchResults"
          class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-10 sm:py-8"
        >
          <div class="mb-6 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p
                class="text-xs font-semibold uppercase tracking-widest text-gold"
              >
                Search
              </p>

              <h2 class="mt-1 truncate text-xl font-bold text-slate-900">
                Results for "{{ searchTerm }}"
              </h2>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              @click="clearSearch"
            >
              Clear
            </button>
          </div>

          <ul v-if="results.length" class="space-y-3">
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:border-navy hover:shadow-sm"
              @click="navigateTo(lessonSearchUrl(row))"
            >
              <span
                class="mb-2 inline-block rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                {{ row.subjectName }}
              </span>

              <h3 class="text-base font-semibold text-navy">
                {{ row.title }}
              </h3>

              <p
                class="mt-1 text-sm text-slate-500"
                v-html="renderSnippet(row.snippet)"
              ></p>
            </li>
          </ul>

          <div v-else class="py-12 text-center">
            <Icon
              name="lucide:search-x"
              class="mx-auto h-10 w-10 text-slate-300"
            />

            <p class="mt-3 text-sm text-slate-500">
              No lessons matched your search.
            </p>
          </div>
        </div>

        <!-- SUBJECT LANDING PAGE -->
        <article
          v-else-if="!currentLesson"
          class="mx-auto w-full max-w-5xl px-4 py-7 sm:px-10 sm:py-10"
        >
          <!-- SUBJECT INTRO -->
          <div class="mb-8">
            <span
              class="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold"
            >
              <Icon name="lucide:book-open" class="h-4 w-4" />
              Subject Overview
            </span>

            <h1 class="mt-4 text-2xl font-bold text-slate-900 sm:text-4xl">
              {{ selectedSubject?.name || breadcrumbSubject || "Subject" }}
            </h1>

            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Read the subject material below or select a lesson from the
              sidebar to begin learning.
            </p>
          </div>

          <!-- PDF -->
          <div
            v-if="subjectPdfUrl"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
          >
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3"
            >
              <div class="flex items-center gap-2">
                <Icon name="lucide:file-pdf" class="h-5 w-5 text-red-500" />

                <span class="text-sm font-semibold text-slate-700">
                  Subject PDF
                </span>
              </div>

              <a
                :href="subjectPdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Open PDF
                <Icon name="lucide:external-link" class="h-3.5 w-3.5" />
              </a>
            </div>

            <iframe
              :src="subjectPdfUrl"
              title="Subject PDF"
              class="h-[70vh] w-full"
            ></iframe>
          </div>

          <!-- NO PDF -->
          <div
            v-else
            class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center sm:px-6 sm:py-16"
          >
            <Icon
              name="lucide:file-text"
              class="mx-auto h-12 w-12 text-slate-300 sm:h-14 sm:w-14"
            />

            <h2 class="mt-4 text-lg font-bold text-slate-700">
              Welcome to {{ selectedSubject?.name || "this subject" }}
            </h2>

            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Choose a topic and lesson from the sidebar to start studying.
            </p>

            <button
              v-if="firstLesson"
              type="button"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
              @click="navigateTo(lessonUrl(firstLesson))"
            >
              Start Learning
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </button>
          </div>

          <!-- TOPIC SUMMARY -->
          <div
            v-if="selectedSubjectTopics.length"
            class="mt-8 grid gap-3 sm:grid-cols-2"
          >
            <div
              v-for="topic in selectedSubjectTopics"
              :key="topic.id"
              class="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div class="flex items-center gap-2">
                <Icon name="lucide:folder" class="h-4 w-4 text-gold" />

                <h3 class="min-w-0 truncate text-sm font-bold text-navy">
                  {{ topic.title }}
                </h3>
              </div>

              <p class="mt-2 text-xs text-slate-500">
                {{ topic.lessons?.length || 0 }} lessons available
              </p>
            </div>
          </div>
        </article>

        <!-- LESSON CONTENT -->
        <article
          v-else
          class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-10 sm:py-10"
        >
          <!-- BREADCRUMB -->
          <div
            class="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400"
          >
            <span>{{ breadcrumbSubject }}</span>

            <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />

            <span>{{ breadcrumbTopic }}</span>

            <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />

            <span class="font-semibold text-slate-600"> Lesson </span>
          </div>

          <!-- LESSON TITLE -->
          <div class="flex min-w-0 items-start justify-between gap-3">
            <h1
              class="min-w-0 text-2xl font-bold leading-tight text-slate-900 sm:text-4xl"
            >
              {{ currentLesson.title }}
            </h1>

            <!-- READ STATUS -->
            <span
              v-if="isLessonRead(currentLesson)"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-600 sm:px-3 sm:text-xs"
            >
              <Icon name="lucide:check-circle-2" class="h-4 w-4" />
              <span class="hidden sm:inline">Read</span>
            </span>

            <span
              v-else
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-500 sm:px-3 sm:text-xs"
            >
              <Icon name="lucide:circle" class="h-4 w-4" />
              <span class="hidden sm:inline">Unread</span>
            </span>
          </div>

          <!-- TOPIC IMPORTER -->
          <div class="mt-5">
            <!-- <TopicImporter
              :lesson-id="currentLesson.id ?? currentLesson.lessonId"
              @updated="handleLessonUpdated"
            /> -->
          </div>

          <!-- LESSON BLOCKS -->
          <div class="mt-6">
            <LessonBlock
              v-for="(block, index) in currentLesson.blocks || []"
              :key="index"
              :block="block"
            />
          </div>

          <!-- AUTOMATIC READING PROGRESS -->
          <div
            class="mt-10 hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  :class="
                    isLessonRead(currentLesson)
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gold/10 text-gold'
                  "
                >
                  <Icon
                    :name="
                      isLessonRead(currentLesson)
                        ? 'lucide:check-circle-2'
                        : 'lucide:book-open'
                    "
                    class="h-5 w-5"
                  />
                </div>

                <div class="min-w-0 hidden">

                  <h3 class="text-sm  hidden font-bold text-slate-800 sm:text-base">
                    {{
                      isLessonRead(currentLesson)
                        ? "Reading completed"
                        : "Study this lesson"
                    }}
                  </h3>

                  <p class="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    {{
                      isLessonRead(currentLesson)
                        ? "Your active reading time has been saved for this lesson."
                        : "Read and understand the material. The lesson will be marked as read after 80% of the estimated reading time."
                    }}
                  </p>
                </div>
              </div>

              <span
                class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs"
                :class="
                  isLessonRead(currentLesson)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white text-slate-500'
                "
              >
                {{ isLessonRead(currentLesson) ? "Read" : "In progress" }}
              </span>
            </div>

            <!-- TIME CARDS -->
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-white p-3">
                <p class="text-[10px] uppercase tracking-wide text-slate-400">
                  Estimated time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ estimatedReadingMinutes }} min
                </p>
              </div>

              <div class="rounded-xl bg-white p-3">
                <p class="text-[10px] uppercase tracking-wide text-slate-400">
                  Required time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ requiredReadingMinutes }} min
                </p>
              </div>

              <div class="col-span-2 rounded-xl bg-white p-3 sm:col-span-1">
                <p class="text-[10px] uppercase tracking-wide text-slate-400">
                  Saved active time
                </p>

                <p class="mt-1 text-lg font-bold text-navy">
                  {{ formatReadingTime(readingSeconds) }}
                </p>
              </div>
            </div>

            <!-- READING PROGRESS -->
            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between gap-3">
                <span class="text-xs font-semibold text-slate-600">
                  Reading progress
                </span>

                <span class="text-xs font-bold text-gold">
                  {{ readingProgressPercent }}%
                </span>
              </div>

              <div class="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    isLessonRead(currentLesson) ? 'bg-emerald-500' : 'bg-gold'
                  "
                  :style="{ width: `${readingProgressPercent}%` }"
                ></div>
              </div>

              <p class="mt-2 text-[11px] leading-5 text-slate-500">
                <span v-if="!isLessonRead(currentLesson)">
                  {{ remainingReadingMinutes }} minute(s) remaining. Switching
                  tabs pauses the reading timer.
                </span>

                <span v-else class="font-semibold text-emerald-600">
                  Great work! This lesson has been automatically marked as read.
                </span>
              </p>
            </div>
          </div>

          <!-- PREVIOUS/NEXT -->
          <div
            class="mt-8 flex items-stretch justify-between gap-3 border-t border-slate-200 pt-6"
          >
            <NuxtLink
              v-if="prevLesson"
              :to="lessonUrl(prevLesson)"
              class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:border-navy sm:px-4"
            >
              <Icon
                name="lucide:chevron-left"
                class="h-4 w-4 shrink-0 text-slate-400"
              />

              <div class="min-w-0">
                <p class="text-[10px] uppercase tracking-wide text-slate-400">
                  Previous
                </p>

                <p class="truncate text-xs font-semibold text-navy sm:text-sm">
                  {{ prevLesson.title }}
                </p>
              </div>
            </NuxtLink>

            <div v-else class="flex-1"></div>

            <NuxtLink
              v-if="nextLesson"
              :to="lessonUrl(nextLesson)"
              class="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-xl border border-slate-200 px-3 py-3 text-right transition hover:border-navy sm:px-4"
            >
              <div class="min-w-0">
                <p class="text-[10px] uppercase tracking-wide text-slate-400">
                  Next
                </p>

                <p class="truncate text-xs font-semibold text-navy sm:text-sm">
                  {{ nextLesson.title }}
                </p>
              </div>

              <Icon
                name="lucide:chevron-right"
                class="h-4 w-4 shrink-0 text-slate-400"
              />
            </NuxtLink>

            <div v-else class="flex-1"></div>
          </div>
        </article>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="flex min-h-[300px] flex-col items-center justify-center"
        >
          <Icon
            name="lucide:loader-2"
            class="h-7 w-7 animate-spin text-slate-300"
          />

          <p class="mt-3 text-sm text-slate-400">
            Loading learning materials...
          </p>
        </div>
      </main>
    </div>

    <!-- DELETE MODAL -->
    <Teleport to="body">
      <div
        v-if="showDelete"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
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
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

const route = useRoute();

const {
  sidebar,
  currentLesson,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search,
  loading,
} = useLessons();

/*
|--------------------------------------------------------------------------
| LESSON PROGRESS COMPOSABLE
|--------------------------------------------------------------------------
*/

const {
  readingSeconds,
  estimatedReadingMinutes,
  readingCompleted,
  requiredReadingMinutes,
  readingProgressPercent,
  remainingReadingMinutes,

  loadLessonProgress,
  getLessonTime,
  isLessonRead,
  getSubjectProgress,

  flushReadingTime,
  resetReadingTracker,
  stopReadingTimer,
  formatReadingTime,
} = useLessonProgress();
/*
|--------------------------------------------------------------------------
| ROUTE PARAMETERS
|--------------------------------------------------------------------------
*/

const routeSegments = computed(() => {
  const value = route.params.slug;

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (value) {
    return [String(value)];
  }

  return [];
});

const routeSubjectSlug = computed(() => {
  return routeSegments.value[0] || "";
});

const routeLessonSlug = computed(() => {
  return routeSegments.value[1] || "";
});

/*
|--------------------------------------------------------------------------
| UI STATE
|--------------------------------------------------------------------------
*/

const sidebarOpen = ref(false);
const searchTerm = ref("");
const showSearchResults = ref(false);

const prevLesson = ref<any>(null);
const nextLesson = ref<any>(null);

const openSubjects = ref(new Set());

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/*
|--------------------------------------------------------------------------
| DELETE STATE
|--------------------------------------------------------------------------
*/

const showDelete = ref(false);
const deleteType = ref("topic");
const deleteId = ref("");
const deleteName = ref("");

/*
|--------------------------------------------------------------------------
| LESSON IDENTIFICATION
|--------------------------------------------------------------------------
*/

const lessonKey = (lesson: any) => {
  return String(lesson?.id || lesson?.lessonId || lesson?.slug || "");
};

const createSlug = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/*
|--------------------------------------------------------------------------
| SUBJECT
|--------------------------------------------------------------------------
*/

const selectedSubject = computed(() => {
  const subjectSlug = routeSubjectSlug.value;

  if (!subjectSlug) return null;

  return (
    sidebar.value.find((subject: any) => {
      return (
        subject.slug === subjectSlug ||
        String(subject.id) === String(subjectSlug) ||
        createSlug(subject.name) === subjectSlug
      );
    }) || null
  );
});

const currentSubjectKey = computed(() => {
  return (
    selectedSubject.value?.slug || routeSubjectSlug.value || "default-subject"
  );
});

const selectedSubjectTopics = computed(() => {
  return selectedSubject.value?.topics || [];
});

const totalLessons = computed(() => {
  return selectedSubjectTopics.value.reduce((total: number, topic: any) => {
    return total + (topic.lessons?.length || 0);
  }, 0);
});

const allSubjectLessons = computed(() => {
  return selectedSubjectTopics.value.flatMap(
    (topic: any) => topic.lessons || []
  );
});

const firstLesson = computed(() => {
  return allSubjectLessons.value[0] || null;
});

const subjectPdfUrl = computed(() => {
  const subject = selectedSubject.value;

  return (
    subject?.pdfUrl ||
    subject?.pdf_url ||
    subject?.pdf ||
    subject?.documentUrl ||
    subject?.document_url ||
    ""
  );
});

/*
|--------------------------------------------------------------------------
| LESSON PROGRESS HELPERS
|--------------------------------------------------------------------------
*/

const getCurrentLessonTime = (lesson: any) => {
  return getLessonTime(currentSubjectKey.value, lesson);
};

const isCurrentLessonRead = (lesson: any) => {
  return isLessonRead(currentSubjectKey.value, lesson);
};

/*
|--------------------------------------------------------------------------
| SUBJECT PROGRESS
|--------------------------------------------------------------------------
*/
const progressPercent = computed(() => {
  return getSubjectProgress(currentSubjectKey.value);
});
/*
|--------------------------------------------------------------------------
| ROUTE HELPERS
|--------------------------------------------------------------------------
*/

const subjectSlug = computed(() => {
  return (
    selectedSubject.value?.slug ||
    routeSubjectSlug.value ||
    createSlug(breadcrumbSubject.value)
  );
});

const lessonUrl = (lesson: any) => {
  if (!lesson?.slug) {
    return `/learning/${subjectSlug.value}`;
  }

  return `/learning/${subjectSlug.value}/${lesson.slug}`;
};

const lessonSearchUrl = (row: any) => {
  const subject = row?.subjectSlug || subjectSlug.value;

  const lesson = row?.slug;

  if (subject && lesson) {
    return `/learning/${subject}/${lesson}`;
  }

  if (subject) {
    return `/learning/${subject}`;
  }

  return "/learning";
};

const isCurrentLesson = (lesson: any) => {
  return routeLessonSlug.value === String(lesson?.slug || "");
};

const handleLessonNavigation = () => {
  flushReadingTime();
  stopReadingTimer();
  sidebarOpen.value = false;
};

/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbSubject = computed(() => {
  return selectedSubject.value?.name || currentLesson.value?.subjectName || "";
});

const breadcrumbTopic = computed(() => {
  if (!currentLesson.value) return "";

  const topicId = currentLesson.value.topic_id || currentLesson.value.topicId;

  const topic = selectedSubjectTopics.value.find((item: any) => {
    return String(item.id) === String(topicId);
  });

  return topic?.title || currentLesson.value?.topicTitle || "";
});

/*
|--------------------------------------------------------------------------
| LOAD LESSON
|--------------------------------------------------------------------------
*/

const openLessonBySlug = async (slug: string) => {
  flushReadingTime();
  stopReadingTimer();

  sidebarOpen.value = false;
  showSearchResults.value = false;

  if (!slug) {
    prevLesson.value = null;
    nextLesson.value = null;
    return;
  }

  await loadLesson(slug);
  if (currentLesson.value) {
    resetReadingTracker(
      currentSubjectKey.value,
      currentLesson.value,
      totalLessons.value
    );
  }

  prevLesson.value = await adjacentLesson("previous");
  nextLesson.value = await adjacentLesson("next");

  const owner = sidebar.value.find((subject: any) => {
    return subject.topics?.some((topic: any) => {
      return topic.lessons?.some((lesson: any) => {
        return lesson.slug === slug;
      });
    });
  });

  if (owner) {
    openSubjects.value = new Set([...openSubjects.value, owner.id]);
  }
};

/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

const onSearchInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const term = searchTerm.value.trim();

  if (!term) {
    showSearchResults.value = false;
    return;
  }

  debounceTimer = setTimeout(async () => {
    showSearchResults.value = true;
    await search(term);
  }, 250);
};

const clearSearch = () => {
  searchTerm.value = "";
  showSearchResults.value = false;
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

const openDelete = (type: string, item: any) => {
  deleteType.value = type;
  deleteId.value = item?.id || "";

  deleteName.value = type === "subject" ? item?.name || "" : item?.title || "";

  showDelete.value = true;
};

const closeDelete = () => {
  showDelete.value = false;
};

const handleDeleted = async () => {
  showDelete.value = false;

  await loadSidebar();

  if (currentLesson.value?.slug) {
    await openLessonBySlug(currentLesson.value.slug);
  }
};

/*
|--------------------------------------------------------------------------
| LESSON UPDATED
|--------------------------------------------------------------------------
*/

const handleLessonUpdated = async () => {
  flushReadingTime();

  if (routeLessonSlug.value) {
    await openLessonBySlug(routeLessonSlug.value);
  }
};

/*
|--------------------------------------------------------------------------
| SEARCH SNIPPET
|--------------------------------------------------------------------------
*/

const renderSnippet = (snippet: any) => {
  if (!snippet) return "";

  return String(snippet)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /⟦/g,
      '<mark class="bg-transparent font-semibold text-navy border-b-2 border-gold">'
    )
    .replace(/⟧/g, "</mark>");
};

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

const goHome = () => {
  flushReadingTime();
  stopReadingTimer();
  navigateTo("/");
};

/*
|--------------------------------------------------------------------------
| VISIBILITY
|--------------------------------------------------------------------------
*/

const handleReadingVisibility = () => {
  if (document.hidden) {
    stopReadingTimer();
  } else if (currentLesson.value) {
    resetReadingTracker(
      currentSubjectKey.value,
      currentLesson.value,
      totalLessons.value
    );
  }
};

/*
|--------------------------------------------------------------------------
| LIFECYCLE
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  loadLessonProgress();

  if (import.meta.client) {
    document.addEventListener("visibilitychange", handleReadingVisibility);
  }

  await loadSidebar();

  const lessonSlug = routeLessonSlug.value;

  if (lessonSlug) {
    await openLessonBySlug(lessonSlug);
  }
});

watch(
  () => routeSubjectSlug.value,
  () => {
    loadLessonProgress();
  }
);

watch(
  () => routeLessonSlug.value,
  (lessonSlug, oldLessonSlug) => {
    if (lessonSlug !== oldLessonSlug) {
      openLessonBySlug(lessonSlug);
    }
  }
);

onBeforeUnmount(() => {
  flushReadingTime();
  stopReadingTimer();

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (import.meta.client) {
    document.removeEventListener("visibilitychange", handleReadingVisibility);
  }
});
</script><style scoped>
.prose-lesson :deep(br) {
  display: block;
  content: "";
  margin-top: 0.7em;
}
</style>