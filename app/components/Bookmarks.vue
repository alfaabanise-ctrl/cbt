<template>
  <div
    class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8f9fc] font-['Inter',system-ui,sans-serif] text-[#201f22]"
  >
    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->

    <header
      class="shrink-0 border-b border-white/10 bg-primary px-3 py-3 text-white shadow-sm sm:px-5"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"
          >
            <Icon
              name="lucide:bookmark"
              class="h-5 w-5 text-[#d9b36a]"
            />
          </div>

          <div class="min-w-0">
            <h1 class="truncate text-base font-semibold sm:text-lg">
              My Bookmarks
            </h1>

            <p class="text-[10px] text-indigo-200 sm:text-xs">
              Review your saved examination questions
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          title="Go home"
          aria-label="Go home"
          @click="goHome"
        >
          <Icon
            name="lucide:house"
            class="h-4 w-4"
          />
        </button>
      </div>
    </header>

    <!-- ========================================= -->
    <!-- MAIN CONTENT -->
    <!-- ========================================= -->

    <main class="min-h-0 flex-1 overflow-y-auto p-3 pb-8 sm:p-5">
      <!-- SUMMARY -->
      <section
        class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        <div
          class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div class="mb-2 flex items-center justify-between">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
            >
              <Icon
                name="lucide:bookmark"
                class="h-4 w-4"
              />
            </div>

            <span class="text-[10px] text-slate-400">
              Saved
            </span>
          </div>

          <p class="text-xl font-bold text-slate-900">
            {{ bookmarks.length }}
          </p>

          <p class="mt-1 text-[11px] text-slate-500">
            Total Bookmarks
          </p>
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div class="mb-2 flex items-center justify-between">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
            >
              <Icon
                name="lucide:layers-3"
                class="h-4 w-4"
              />
            </div>

            <span class="text-[10px] text-slate-400">
              Subjects
            </span>
          </div>

          <p class="text-xl font-bold text-slate-900">
            {{ uniqueSubjects.length }}
          </p>

          <p class="mt-1 text-[11px] text-slate-500">
            Subjects Covered
          </p>
        </div>

        <div
          class="col-span-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:col-span-1"
        >
          <div class="mb-2 flex items-center justify-between">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
            >
              <Icon
                name="lucide:calendar-days"
                class="h-4 w-4"
              />
            </div>

            <span class="text-[10px] text-slate-400">
              Latest
            </span>
          </div>

          <p class="truncate text-sm font-bold text-slate-900">
            {{ latestBookmarkDate }}
          </p>

          <p class="mt-1 text-[11px] text-slate-500">
            Most Recent Bookmark
          </p>
        </div>
      </section>

      <!-- SEARCH AND FILTER -->
      <section
        class="mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <div class="relative min-w-0 flex-1">
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />

          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search saved questions..."
            class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        <select
          v-model="selectedSubject"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
        >
          <option value="all">
            All Subjects
          </option>

          <option
            v-for="subject in uniqueSubjects"
            :key="subject"
            :value="subject"
          >
            {{ formatText(subject) }}
          </option>
        </select>

        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="bookmarks.length === 0"
          @click="confirmClearBookmarks"
        >
          <Icon
            name="lucide:trash-2"
            class="h-4 w-4"
          />

          <span class="hidden sm:inline">
            Clear All
          </span>
        </button>
      </section>

      <!-- LOADING STATE -->
      <section
        v-if="loading"
        class="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white"
      >
        <Icon
          name="lucide:loader-circle"
          class="h-8 w-8 animate-spin text-indigo-600"
        />

        <p class="mt-3 text-sm text-slate-500">
          Loading bookmarks...
        </p>
      </section>

      <!-- ERROR STATE -->
      <section
        v-else-if="errorMessage"
        class="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center"
      >
        <Icon
          name="lucide:alert-circle"
          class="mx-auto h-8 w-8 text-red-500"
        />

        <h2 class="mt-3 text-sm font-semibold text-red-700">
          Unable to load bookmarks
        </h2>

        <p class="mt-1 text-xs text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          @click="loadBookmarks"
        >
          Try Again
        </button>
      </section>

      <!-- EMPTY STATE -->
      <section
        v-else-if="filteredBookmarks.length === 0"
        class="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center"
      >
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500"
        >
          <Icon
            name="lucide:bookmark"
            class="h-8 w-8"
          />
        </div>

        <h2 class="mt-4 text-base font-semibold text-slate-900">
          {{
            bookmarks.length === 0
              ? "No bookmarks yet"
              : "No matching questions"
          }}
        </h2>

        <p class="mt-1 max-w-sm text-xs leading-5 text-slate-500">
          {{
            bookmarks.length === 0
              ? "Questions you bookmark during an examination will appear here."
              : "Try searching with another keyword or select a different subject."
          }}
        </p>

        <button
          v-if="bookmarks.length === 0"
          type="button"
          class="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
          @click="goHome"
        >
          <Icon
            name="lucide:arrow-left"
            class="h-4 w-4"
          />

          Back to Home
        </button>
      </section>

      <!-- BOOKMARK LIST -->
      <section
        v-else
        class="space-y-3"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">
              Saved Questions
            </h2>

            <p class="mt-0.5 text-[11px] text-slate-500">
              {{ filteredBookmarks.length }} question(s) found
            </p>
          </div>

          <button
            type="button"
            class="flex items-center gap-1 text-xs font-semibold text-indigo-600"
            @click="loadBookmarks"
          >
            <Icon
              name="lucide:refresh-cw"
              class="h-3.5 w-3.5"
            />

            Refresh
          </button>
        </div>

        <article
          v-for="(bookmark, index) in filteredBookmarks"
          :key="bookmark.id || bookmark.question_id"
          class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <!-- CARD HEADER -->
          <header
            class="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-3 sm:px-4"
          >
            <div class="flex min-w-0 items-start gap-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
              >
                <Icon
                  name="lucide:bookmark-check"
                  class="h-4 w-4"
                />
              </div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    class="rounded-md bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700"
                  >
                    {{ formatText(bookmark.subject || "General") }}
                  </span>

                  <span
                    v-if="bookmark.exam_type"
                    class="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700"
                  >
                    {{ formatText(bookmark.exam_type) }}
                  </span>

                  <span
                    v-if="bookmark.year"
                    class="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    {{ bookmark.year }}
                  </span>
                </div>

                <p class="mt-1 text-[10px] text-slate-400">
                  Question
                  {{ bookmark.question_number || index + 1 }}
                  <span v-if="bookmark.created_at">
                    · {{ formatDate(bookmark.created_at) }}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              title="Remove bookmark"
              aria-label="Remove bookmark"
              @click="removeBookmark(bookmark)"
            >
              <Icon
                name="lucide:trash-2"
                class="h-4 w-4"
              />
            </button>
          </header>

          <!-- QUESTION BODY -->
          <div class="px-3 py-4 sm:px-4">
            <p
              class="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-800"
            >
              {{ bookmark.question_text }}
            </p>

            <!-- OPTIONS -->
            <div
              v-if="parsedOptions(bookmark).length"
              class="mt-4 space-y-2"
            >
              <div
                v-for="option in parsedOptions(bookmark)"
                :key="option.key"
                class="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold uppercase text-slate-500 ring-1 ring-slate-200"
                >
                  {{ option.key }}
                </span>

                <span
                  class="text-xs leading-5 text-slate-600"
                >
                  {{ option.value }}
                </span>
              </div>
            </div>

            <!-- ANSWER -->
            <div
              v-if="bookmark.correct_answer"
              class="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3"
            >
              <div class="flex items-center gap-2">
                <Icon
                  name="lucide:check-circle"
                  class="h-4 w-4 text-emerald-600"
                />

                <span
                  class="text-xs font-semibold text-emerald-700"
                >
                  Correct Answer:
                </span>

                <span
                  class="text-xs font-bold uppercase text-emerald-800"
                >
                  {{ bookmark.correct_answer }}
                </span>
              </div>
            </div>

            <!-- EXPLANATION -->
            <div
              v-if="bookmark.explanation"
              class="mt-3 rounded-lg bg-amber-50 p-3"
            >
              <div class="flex items-start gap-2">
                <Icon
                  name="lucide:lightbulb"
                  class="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                />

                <div>
                  <p class="text-xs font-semibold text-amber-800">
                    Explanation
                  </p>

                  <p
                    class="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-700"
                  >
                    {{ bookmark.explanation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>

    <!-- DELETE CONFIRMATION -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          @click.self="showDeleteConfirm = false"
        >
          <section
            class="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
          >
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
            >
              <Icon
                name="lucide:trash-2"
                class="h-6 w-6"
              />
            </div>

            <h2
              class="mt-3 text-center text-base font-semibold text-slate-900"
            >
              Clear all bookmarks?
            </h2>

            <p
              class="mt-2 text-center text-xs leading-5 text-slate-500"
            >
              This action will permanently remove all your saved questions.
            </p>

            <div class="mt-5 flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600"
                @click="showDeleteConfirm = false"
              >
                Cancel
              </button>

              <button
                type="button"
                class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white"
                @click="clearAllBookmarks"
              >
                Yes, Clear All
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useBookmarks } from "~/composables/useBookmarks"

// ==========================================
// STATE
// ==========================================

const bookmarks = ref([])
const loading = ref(false)
const errorMessage = ref("")
const searchQuery = ref("")
const selectedSubject = ref("all")
const showDeleteConfirm = ref(false)

// ==========================================
// BOOKMARK METHODS
// ==========================================

const {
  getBookmarks,
  deleteBookmark,
  clearBookmarks,
} = useBookmarks()

// ==========================================
// LOAD BOOKMARKS
// ==========================================
const emit = defineEmits(["gohome", "open-subject"]);

const loadBookmarks = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    bookmarks.value = await getBookmarks()
  } catch (error) {
    console.error("Failed to load bookmarks:", error)

    errorMessage.value =
      error?.message || "Unable to load saved questions."
  } finally {
    loading.value = false
  }
}

// ==========================================
// FILTERED BOOKMARKS
// ==========================================

const filteredBookmarks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return bookmarks.value.filter((bookmark) => {
    const searchableText = [
      bookmark.question_text,
      bookmark.subject,
      bookmark.exam_type,
      bookmark.year,
      bookmark.explanation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    const matchesSearch =
      !query || searchableText.includes(query)

    const matchesSubject =
      selectedSubject.value === "all" ||
      bookmark.subject === selectedSubject.value

    return matchesSearch && matchesSubject
  })
})

// ==========================================
// SUMMARY
// ==========================================

const uniqueSubjects = computed(() => {
  return [
    ...new Set(
      bookmarks.value
        .map((bookmark) => bookmark.subject)
        .filter(Boolean),
    ),
  ].sort()
})

const latestBookmarkDate = computed(() => {
  if (!bookmarks.value.length) {
    return "None"
  }

  const latest = bookmarks.value[0]?.created_at

  return latest ? formatDate(latest) : "Recently"
})

// ==========================================
// FORMATTERS
// ==========================================

const formatText = (value) => {
  if (!value) return ""

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const formatDate = (value) => {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ==========================================
// PARSE OPTIONS
// ==========================================

const parsedOptions = (bookmark) => {
  if (!bookmark?.options) {
    return []
  }

  try {
    const options =
      typeof bookmark.options === "string"
        ? JSON.parse(bookmark.options)
        : bookmark.options

    if (Array.isArray(options)) {
      return options.map((value, index) => ({
        key: String.fromCharCode(65 + index),
        value,
      }))
    }

    if (options && typeof options === "object") {
      return Object.entries(options).map(([key, value]) => ({
        key,
        value,
      }))
    }

    return []
  } catch (error) {
    console.warn("Unable to parse bookmark options:", error)
    return []
  }
}

// ==========================================
// REMOVE SINGLE BOOKMARK
// ==========================================

const removeBookmark = async (bookmark) => {
  try {
    await deleteBookmark(bookmark)

    bookmarks.value = bookmarks.value.filter(
      (item) =>
        item.question_id !== bookmark.question_id,
    )
  } catch (error) {
    console.error("Failed to remove bookmark:", error)

    errorMessage.value =
      error?.message || "Unable to remove bookmark."
  }
}

// ==========================================
// CLEAR ALL BOOKMARKS
// ==========================================

const confirmClearBookmarks = () => {
  showDeleteConfirm.value = true
}

const clearAllBookmarks = async () => {
  try {
    await clearBookmarks()

    bookmarks.value = []
    showDeleteConfirm.value = false
  } catch (error) {
    console.error("Failed to clear bookmarks:", error)

    errorMessage.value =
      error?.message || "Unable to clear bookmarks."

    showDeleteConfirm.value = false
  }
}

// ==========================================
// NAVIGATION
// ==========================================

const goHome = () => {
  emit("gohome");
};


// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

* {
  min-width: 0;
}

input,
select,
button {
  max-width: 100%;
}
</style>