<template>
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden bg-bg font-['Inter',system-ui,sans-serif] text-ink"
  >
    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->
    <header
      class="z-30 flex h-12 shrink-0 items-center justify-between bg-navy px-3 text-white shadow-sm sm:h-14 sm:px-5"
    >
      <div class="flex min-w-0 items-center gap-2">
        <!-- Mobile Menu -->
        <button
          type="button"
          aria-label="Open subjects"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-white/10 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Icon name="lucide:menu" class="h-[18px] w-[18px]" />
        </button>

        <!-- Logo -->
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10"
        >
          <Icon name="lucide:graduation-cap" class="h-[17px] w-[17px]" />
        </div>

        <h1
          class="truncate font-['Fraunces',Georgia,serif] text-sm font-semibold sm:text-base"
        >
          Lessons
        </h1>
      </div>

      <!-- Desktop Search -->
      <div class="relative mx-4 hidden max-w-sm flex-1 sm:block">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50"
        />

        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search lessons..."
          class="h-8 w-full rounded-md border border-white/10 bg-white/10 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
          @input="onSearchInput"
        />
      </div>

      <!-- Home -->
      <button
        type="button"
        aria-label="Go home"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-white/10"
        @click="goHome"
      >
        <Icon name="lucide:house" class="h-[17px] w-[17px]" />
      </button>
    </header>

    <!-- ================================= -->
    <!-- MOBILE SEARCH -->
    <!-- ================================= -->
    <div class="shrink-0 border-b border-line bg-surface px-3 py-2 sm:hidden">
      <div class="relative">
        <Icon
          name="lucide:search"
          class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
        />

        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search lessons..."
          class="h-9 w-full rounded-md border border-line bg-bg pl-9 pr-3 text-xs text-ink outline-none focus:border-gold"
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- ================================= -->
    <!-- PAGE BODY -->
    <!-- ================================= -->
    <div class="relative flex min-h-0 flex-1">
      <!-- Mobile Backdrop -->
      <Transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-40 bg-black/40 lg:hidden"
          @click="sidebarOpen = false"
        ></div>
      </Transition>

      <!-- ================================= -->
      <!-- SIDEBAR -->
      <!-- ================================= -->
      <aside
        class="absolute inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] shrink-0 flex-col overflow-hidden border-r border-line bg-surface shadow-xl transition-transform duration-200 lg:relative lg:z-0 lg:w-64 lg:translate-x-0 lg:shadow-none"
        :class="
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        "
      >
        <!-- Sidebar Header -->
        <div
          class="flex h-11 shrink-0 items-center justify-between border-b border-line px-3 lg:hidden"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-navy"
          >
            Subjects
          </span>

          <button
            type="button"
            aria-label="Close subjects"
            class="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-bg"
            @click="sidebarOpen = false"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </button>
        </div>

        <!-- Sidebar Content -->
        <nav class="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div
            v-for="subject in sidebar"
            :key="subject.id"
            class="mb-1"
          >
            <!-- Subject Button -->
            <button
              type="button"
              class="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold text-navy transition hover:bg-bg sm:text-sm"
              @click="toggleSubject(subject.id)"
            >
              <Icon
                :name="subject.icon || 'lucide:book-open'"
                class="h-4 w-4 shrink-0 text-gold"
              />

              <span class="min-w-0 flex-1 truncate">
                {{ subject.name }}
              </span>

              <Icon
                name="lucide:chevron-right"
                class="h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform duration-200"
                :class="{
                  'rotate-90': openSubjects.has(subject.id),
                }"
              />
            </button>

            <!-- Topics and Lessons -->
            <div
              v-if="openSubjects.has(subject.id)"
              class="ml-2 border-l border-line pl-2"
            >
              <div
                v-for="topic in subject.topics"
                :key="topic.id"
                class="mb-2 mt-1"
              >
                <p
                  class="mb-1 px-2 text-[9px] font-bold uppercase tracking-wider text-ink-soft sm:text-[10px]"
                >
                  {{ topic.title }}
                </p>

                <button
                  v-for="lesson in topic.lessons"
                  :key="lesson.id"
                  type="button"
                  class="mb-0.5 block min-h-7 w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-4 transition sm:text-xs"
                  :class="
                    currentLesson?.slug === lesson.slug
                      ? 'bg-navy font-semibold text-white'
                      : 'text-ink-soft hover:bg-bg hover:text-ink'
                  "
                  @click="openLesson(lesson.slug)"
                >
                  {{ lesson.title }}
                </button>
              </div>
            </div>
          </div>

          <p
            v-if="!sidebar?.length"
            class="px-2 py-6 text-center text-xs text-ink-soft"
          >
            No subjects available.
          </p>
        </nav>
      </aside>

      <!-- ================================= -->
      <!-- MAIN CONTENT -->
      <!-- ================================= -->
      <main
        class="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <!-- ================================= -->
        <!-- SEARCH RESULTS -->
        <!-- ================================= -->
        <section
          v-if="showSearchResults"
          class="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-7"
        >
          <div class="mb-4">
            <p
              class="text-[9px] font-bold uppercase tracking-wider text-gold sm:text-[10px]"
            >
              Search
            </p>

            <h2
              class="mt-1 break-words font-['Fraunces',Georgia,serif] text-lg font-semibold leading-tight text-navy sm:text-xl"
            >
              Results for "{{ searchTerm }}"
            </h2>
          </div>

          <ul v-if="results.length" class="space-y-2">
            <li
              v-for="row in results"
              :key="row.slug"
              class="cursor-pointer rounded-lg border border-line bg-surface p-3 transition hover:border-gold hover:shadow-sm sm:p-4"
              @click="openLesson(row.slug)"
            >
              <span
                class="mb-1.5 inline-flex max-w-full rounded-full bg-bg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold"
              >
                {{ row.subjectName }}
              </span>

              <h3
                class="break-words font-['Fraunces',Georgia,serif] text-sm font-semibold leading-5 text-navy sm:text-base"
              >
                {{ row.title }}
              </h3>

              <p
                class="mt-1 break-words text-xs leading-5 text-ink-soft"
                v-html="renderSnippet(row.snippet)"
              ></p>
            </li>
          </ul>

          <div
            v-else
            class="rounded-lg border border-dashed border-line bg-surface px-4 py-8 text-center"
          >
            <Icon
              name="lucide:search-x"
              class="mx-auto h-7 w-7 text-ink-soft"
            />

            <p class="mt-2 text-xs text-ink-soft">
              No lessons matched your search.
            </p>
          </div>
        </section>

        <!-- ================================= -->
        <!-- CURRENT LESSON -->
        <!-- ================================= -->
        <article
          v-else-if="currentLesson"
          class="mx-auto w-full max-w-3xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8"
        >
          <!-- Breadcrumb -->
          <div
            class="mb-2 flex flex-wrap items-center gap-1 text-[9px] text-ink-soft sm:text-xs"
          >
            <span class="break-words">
              {{ breadcrumbSubject }}
            </span>

            <Icon name="lucide:chevron-right" class="h-3 w-3 shrink-0" />

            <span class="break-words">
              {{ breadcrumbTopic }}
            </span>
          </div>

          <!-- Lesson Title -->
          <h1
            class="break-words font-['Fraunces',Georgia,serif] text-xl font-semibold leading-tight text-navy sm:text-2xl lg:text-3xl"
          >
            {{ currentLesson.title }}
          </h1>

          <!-- Summary -->
          <p
            v-if="currentLesson.summary"
            class="mt-2 max-w-2xl break-words text-xs leading-5 text-ink-soft sm:text-sm sm:leading-6"
          >
            {{ currentLesson.summary }}
          </p>

          <div class="my-4 border-t border-dashed border-line sm:my-6"></div>

          <!-- Lesson Content -->
          <div
            class="prose-lesson min-w-0 max-w-none text-[12px] leading-[1.8] text-ink sm:text-[14px] sm:leading-7"
            v-html="currentLesson.content_html"
          ></div>

          <!-- Examples -->
          <div
            v-for="example in examples"
            :key="example.id"
            class="mt-5 min-w-0 overflow-hidden rounded-lg border border-line bg-surface sm:mt-6"
          >
            <div
              class="flex items-center gap-2 border-b border-dashed border-line bg-mid-bg px-3 py-2.5 sm:px-4"
            >
              <Icon
                name="lucide:flask-round"
                class="h-3.5 w-3.5 shrink-0 text-gold"
              />

              <span
                class="break-words text-[10px] font-bold uppercase tracking-wide text-navy sm:text-xs"
              >
                {{ example.title || "Try it yourself" }}
              </span>
            </div>

            <div
              class="prose-lesson min-w-0 px-3 py-3 text-[12px] leading-[1.8] text-ink sm:px-4 sm:text-[14px] sm:leading-7"
              v-html="example.content_html"
            ></div>
          </div>

          <!-- Previous / Next -->
          <div
            class="mt-7 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:mt-9 sm:gap-3 sm:pt-5"
          >
            <!-- Previous -->
            <button
              v-if="prevLesson"
              type="button"
              class="flex min-w-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2.5 text-left transition hover:border-gold sm:gap-2 sm:px-3 sm:py-3"
              @click="openLesson(prevLesson.slug)"
            >
              <Icon
                name="lucide:chevron-left"
                class="h-4 w-4 shrink-0 text-ink-soft"
              />

              <div class="min-w-0">
                <p
                  class="text-[9px] uppercase tracking-wide text-ink-soft"
                >
                  Previous
                </p>

                <p
                  class="truncate text-[11px] font-semibold text-navy sm:text-xs"
                >
                  {{ prevLesson.title }}
                </p>
              </div>
            </button>

            <div v-else></div>

            <!-- Next -->
            <button
              v-if="nextLesson"
              type="button"
              class="flex min-w-0 items-center justify-end gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2.5 text-right transition hover:border-gold sm:gap-2 sm:px-3 sm:py-3"
              @click="openLesson(nextLesson.slug)"
            >
              <div class="min-w-0">
                <p
                  class="text-[9px] uppercase tracking-wide text-ink-soft"
                >
                  Next
                </p>

                <p
                  class="truncate text-[11px] font-semibold text-navy sm:text-xs"
                >
                  {{ nextLesson.title }}
                </p>
              </div>

              <Icon
                name="lucide:chevron-right"
                class="h-4 w-4 shrink-0 text-ink-soft"
              />
            </button>

            <div v-else></div>
          </div>
        </article>

        <!-- ================================= -->
        <!-- EMPTY STATE -->
        <!-- ================================= -->
        <div
          v-else
          class="flex min-h-[300px] h-full flex-col items-center justify-center px-4 text-center"
        >
          <div
            class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-gold sm:h-14 sm:w-14"
          >
            <Icon name="lucide:book-open" class="h-6 w-6" />
          </div>

          <h2
            class="font-['Fraunces',Georgia,serif] text-base font-semibold text-navy sm:text-lg"
          >
            Pick a lesson to begin
          </h2>

          <p class="mt-1 text-xs text-ink-soft sm:text-sm">
            Choose a subject or search for a lesson.
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";

const emit = defineEmits(["gohome"]);

const {
  sidebar,
  currentLesson,
  examples,
  results,
  loadSidebar,
  loadLesson,
  adjacentLesson,
  search,
} = useLessons();

const sidebarOpen = ref(false);
const openSubjects = ref(new Set());
const searchTerm = ref("");
const showSearchResults = ref(false);
const prevLesson = ref(null);
const nextLesson = ref(null);

let debounceTimer = null;

onMounted(async () => {
  await loadSidebar();

  if (sidebar.value?.length) {
    openSubjects.value.add(sidebar.value[0].id);

    const firstLesson =
      sidebar.value[0].topics?.[0]?.lessons?.[0];

    if (firstLesson) {
      await openLesson(firstLesson.slug);
    }
  }
});

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
});

const toggleSubject = (id) => {
  const next = new Set(openSubjects.value);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  openSubjects.value = next;
};

const openLesson = async (slug) => {
  showSearchResults.value = false;
  searchTerm.value = "";
  sidebarOpen.value = false;

  await loadLesson(slug);

  prevLesson.value = await adjacentLesson("prev");
  nextLesson.value = await adjacentLesson("next");

  const owner = sidebar.value.find((subject) =>
    subject.topics?.some((topic) =>
      topic.lessons?.some((lesson) => lesson.slug === slug)
    )
  );

  if (owner) {
    const next = new Set(openSubjects.value);
    next.add(owner.id);
    openSubjects.value = next;
  }
};

const onSearchInput = () => {
  clearTimeout(debounceTimer);

  if (!searchTerm.value.trim()) {
    showSearchResults.value = false;
    return;
  }

  debounceTimer = setTimeout(async () => {
    showSearchResults.value = true;
    await search(searchTerm.value.trim());
  }, 250);
};

const breadcrumbSubject = computed(() => {
  const owner = sidebar.value.find(
    (subject) =>
      subject.id === currentLesson.value?.subject_id
  );

  return owner?.name || "";
});

const breadcrumbTopic = computed(() => {
  const owner = sidebar.value.find(
    (subject) =>
      subject.id === currentLesson.value?.subject_id
  );

  const topic = owner?.topics?.find(
    (item) =>
      item.id === currentLesson.value?.topic_id
  );

  return topic?.title || "";
});

const renderSnippet = (snippet) => {
  if (!snippet) return "";

  return snippet
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /⟦/g,
      '<mark class="bg-transparent font-semibold text-navy border-b-2 border-gold">'
    )
    .replace(/⟧/g, "</mark>");
};

const goHome = () => emit("gohome");
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap");

/* Sidebar backdrop animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Lesson content */
.prose-lesson {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: normal;
}

.prose-lesson :deep(*) {
  max-width: 100%;
}

.prose-lesson :deep(p) {
  margin: 0.55rem 0;
}

.prose-lesson :deep(h1),
.prose-lesson :deep(h2),
.prose-lesson :deep(h3),
.prose-lesson :deep(h4) {
  margin-top: 1.1rem;
  margin-bottom: 0.45rem;
  color: var(--color-navy, #24304a);
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.prose-lesson :deep(h1) {
  font-size: 1.2rem;
}

.prose-lesson :deep(h2) {
  font-size: 1.05rem;
}

.prose-lesson :deep(h3) {
  font-size: 0.95rem;
}

.prose-lesson :deep(ul) {
  margin: 0.6rem 0;
  padding-left: 1.2rem;
  list-style: disc;
}

.prose-lesson :deep(ol) {
  margin: 0.6rem 0;
  padding-left: 1.2rem;
  list-style: decimal;
}

.prose-lesson :deep(li) {
  margin: 0.2rem 0;
}

.prose-lesson :deep(strong),
.prose-lesson :deep(b) {
  color: #24304a;
  font-weight: 700;
}

.prose-lesson :deep(a) {
  color: #b9873b;
  overflow-wrap: anywhere;
  text-decoration: underline;
}

.prose-lesson :deep(blockquote) {
  margin: 0.8rem 0;
  border-left: 3px solid #b9873b;
  border-radius: 0 0.4rem 0.4rem 0;
  background: rgb(185 135 59 / 8%);
  padding: 0.55rem 0.8rem;
}

.prose-lesson :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  border-radius: 0.5rem;
  background: #24304a;
  color: white;
  padding: 0.75rem;
  font-size: 0.7rem;
  white-space: pre;
}

.prose-lesson :deep(code) {
  overflow-wrap: anywhere;
  border-radius: 0.25rem;
  background: rgb(36 48 74 / 8%);
  padding: 0.1rem 0.25rem;
  font-size: 0.9em;
}

.prose-lesson :deep(pre code) {
  background: transparent;
  padding: 0;
  overflow-wrap: normal;
}

.prose-lesson :deep(img) {
  display: block;
  height: auto;
  max-width: 100%;
  margin: 0.8rem auto;
  border-radius: 0.6rem;
}

.prose-lesson :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0.8rem 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.85em;
}

.prose-lesson :deep(th),
.prose-lesson :deep(td) {
  border: 1px solid #d9dce3;
  padding: 0.4rem 0.55rem;
  text-align: left;
  overflow-wrap: anywhere;
}

.prose-lesson :deep(th) {
  background: #24304a;
  color: white;
}

.prose-lesson :deep(br) {
  content: "";
  display: block;
  margin-top: 0.35em;
}

/* Small-screen typography */
@media (max-width: 380px) {
  .prose-lesson {
    font-size: 11.5px;
    line-height: 1.75;
  }

  .prose-lesson :deep(h1) {
    font-size: 1.05rem;
  }

  .prose-lesson :deep(h2) {
    font-size: 0.98rem;
  }
}
</style>