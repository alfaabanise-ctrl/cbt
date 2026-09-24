<template>
  <div
    class="flex h-full  sm:pt-0 min-h-0 w-full flex-col overflow-hidden bg-[#f8f9fc] text-[#201f22] font-['Inter',system-ui,sans-serif]"
  >
    <!-- MAIN CONTENT -->
    <main class="min-h-0 flex-1 overflow-y-hidden  p-2 pb-24 pt-2 sm:px-3">
      <!-- HERO BANNER -->
      <section
        class="relative mb-3 overflow-hidden flex justify-between rounded-sm bg-primary p-3 text-white shadow-sm"
      >
        <div class="relative z-10 max-w-[85%]">
          <div class="mb-2 flex items-center gap-1.5">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-white/10"
            >
              <Icon name="lucide:graduation-cap" class="h-3.5 w-3.5" />
            </div>

            <span
              class="text-[9px] font-semibold uppercase tracking-wide text-indigo-300"
            >
              Exam Preparation
            </span>
          </div>

          <h1
            class="font-['Fraunces',Georgia,serif] text-xl font-semibold leading-tight sm:text-2xl"
          >
            Ready to Excel?
          </h1>

          <p class="mt-1 text-[11px] leading-relaxed text-indigo-200">
            Choose your subjects, customize your practice, and prepare for
            success.
          </p>

          <button
            type="button"
            @click="openSubjectModal"
            class="mt-3 flex items-center gap-1.5 rounded-sm bg-white px-3 py-2 text-[11px] font-semibold text-[#1e1b4b] shadow-sm transition active:scale-95"
          >
            <Icon name="lucide:plus" class="h-3.5 w-3.5" />
            Select Subjects
          </button>
        </div>
        <div>
           <button type="button" class="ds-header__home" @click="goHome" aria-label="Go home">
        <Icon name="lucide:house" class=" text-xl" />
      </button>
        </div>

        <!-- Decorative Illustration -->
        <div
          class="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-indigo-300 opacity-20"
        >
          <Icon name="lucide:graduation-cap" class="h-full w-full" />
        </div>

        <div
          class="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"
        ></div>

        <div
          class="pointer-events-none absolute bottom-0 right-4 h-14 w-14 rounded-sm border border-white/5"
        ></div>
      </section>

      <!-- QUICK SUMMARY -->
      <section class="mb-3 grid grid-cols-2 gap-2">
        <div class="rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm">
          <div class="mb-1.5 flex items-center justify-between">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
            >
              <Icon name="lucide:layers-3" class="h-3.5 w-3.5" />
            </div>

            <span class="text-[9px] font-medium text-gray-400"> Selected </span>
          </div>

          <p class="text-xl font-semibold leading-none text-gray-900">
            {{ selectedSubjects.length }}
          </p>

          <p class="mt-1 text-[11px] text-gray-500">Subjects</p>
        </div>

        <div class="rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm">
          <div class="mb-1.5 flex items-center justify-between">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600"
            >
              <Icon name="lucide:file-text" class="h-3.5 w-3.5" />
            </div>

            <span class="text-[9px] font-medium text-gray-400"> Total </span>
          </div>

          <p class="text-xl font-semibold leading-none text-gray-900">
            {{ totalQuestions }}
          </p>

          <p class="mt-1 text-[11px] text-gray-500">Questions</p>
        </div>
      </section>

      <!-- SEARCH AND FILTER -->
      <section class="mb-3 hidden  items-center gap-1.5">
        <div class="relative min-w-0 flex-1">
          <Icon
            name="lucide:search"
            class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          />

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search selected subjects..."
            class="w-full rounded-sm border border-gray-200 bg-white py-2 pl-8 pr-2 text-[11px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/10"
          />
        </div>

        <button
          type="button"
          @click="openSubjectModal"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-600 shadow-sm transition active:scale-95"
          title="Manage subjects"
        >
          <Icon name="lucide:sliders-horizontal" class="h-3.5 w-3.5" />
        </button>
      </section>

      <!-- CATEGORY TABS -->
      <section
        class="-mx-2 hidden mb-3 overflow-x-auto px-2 scrollbar-hide sm:-mx-3 sm:px-3"
      >
        <div class="flex w-max gap-1.5">
          <button
            v-for="category in examCategories"
            :key="category"
            type="button"
            @click="activeCategory = category"
            class="whitespace-nowrap rounded-sm px-2.5 py-1.5 text-[10px] font-medium transition"
            :class="
              activeCategory === category
                ? 'bg-[#4f46e5] text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-500'
            "
          >
            {{ category }}
          </button>
        </div>
      </section>

      <!-- SECTION TITLE -->
      <section class="mb-2 flex items-center justify-between">
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900">Your Subjects</h2>

          <p class="mt-0.5 text-[10px] text-gray-500">
            Customize each subject before starting.
          </p>
        </div>

        <button
          type="button"
          @click="openSubjectModal"
          class="text-[11px] font-semibold text-indigo-600"
        >
          + Add
        </button>
      </section>

      <!-- EMPTY STATE -->
      <section
        v-if="filteredSubjects.length === 0"
        class="rounded-sm border border-dashed border-gray-200 bg-white px-3 py-7 text-center"
      >
        <div
          class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
        >
          <Icon name="lucide:book-open" class="h-5 w-5" />
        </div>

        <h3 class="text-xs font-semibold text-gray-900">No subjects found</h3>

        <p class="mt-1 text-[11px] text-gray-500">
          Select a subject or change your search.
        </p>

        <button
          type="button"
          @click="openSubjectModal"
          class="mt-3 rounded-sm bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white active:scale-95"
        >
          Select Subject
        </button>
      </section>

      <!-- SUBJECT CARDS -->
      <section v-else class="space-y-2 gap-3 grid grid-cols-1 sm:grid-cols-2">
        <article
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition"
        >
          <!-- CARD TOP -->
          <div class="flex items-start gap-2.5 p-2.5">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm"
              :class="getSubjectColor(subject.id).bg"
            >
              <Icon
                :name="getSubjectIcon(subject.id)"
                class="h-5 w-5"
                :class="getSubjectColor(subject.id).text"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-1.5">
                <div class="min-w-0">
                  <h3 class="truncate text-xs font-semibold text-gray-900">
                    {{ subject.name }}
                  </h3>

                  <p
                    class="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-gray-500"
                  >
                    {{
                      subject.description ||
                      "Practice important topics and improve your examination performance."
                    }}
                  </p>
                </div>

                <button
                  type="button"
                  @click="removeSubject(subject)"
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-gray-50 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Remove subject"
                >
                  <Icon name="lucide:x" class="h-3 w-3" />
                </button>
              </div>

              <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  class="flex items-center gap-1 rounded-sm bg-emerald-50 px-1.5 py-1 text-[9px] font-medium text-emerald-700"
                >
                  <Icon name="lucide:check-circle" class="h-2.5 w-2.5" />
                  Selected
                </span>

                <span
                  class="flex items-center gap-1 rounded-sm bg-gray-50 px-1.5 py-1 text-[9px] font-medium text-gray-500"
                >
                  <Icon name="lucide:file-text" class="h-2.5 w-2.5" />
                  {{ subject.questions }} Questions
                </span>
              </div>
            </div>
          </div>

          <!-- CARD SETTINGS -->
          <div class="border-t border-gray-200 bg-[#fcfcfe] p-2.5">
            <div class="grid grid-cols-2 gap-2">
              <!-- YEAR -->
              <div class="min-w-0">
                <label
                  class="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400"
                >
                  <Icon name="lucide:calendar-days" class="h-3 w-3" />
                  Year
                </label>

                <div class="relative">
                  <select
                    v-model="subject.year"
                    class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-2 pr-6 text-[10px] font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/10"
                  >
                    <option value="all">All Years</option>

                    <option
                      v-for="year in getSubjectDetails(subject)?.years || []"
                      :key="year"
                      :value="year"
                    >
                      {{ year }}
                    </option>
                  </select>

                  <Icon
                    name="lucide:chevron-down"
                    class="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <!-- QUESTION COUNT -->
              <div class="min-w-0">
                <label
                  class="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400"
                >
                  <Icon name="lucide:list-ordered" class="h-3 w-3" />
                  Questions
                </label>

                <div class="relative">
                  <select
                    v-model="subject.questions"
                    class="w-full appearance-none rounded-sm border border-gray-200 bg-white px-2 py-2 pr-6 text-[10px] font-medium text-gray-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/10"
                  >
                    <option
                      v-for="number in subject.questionOptions"
                      :key="number"
                      :value="number"
                    >
                      {{ number }} Questions
                    </option>
                  </select>

                  <Icon
                    name="lucide:chevron-down"
                    class="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <!-- TOPIC SELECTOR -->
            <button
              type="button"
              @click="openTopicModal(subject)"
              class="mt-2 flex w-full items-center justify-between rounded-sm border border-gray-200 bg-white px-2 py-2 text-left transition active:bg-gray-50"
            >
              <div class="flex min-w-0 items-center gap-2">
                <div
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
                >
                  <Icon name="lucide:folder-open" class="h-3.5 w-3.5" />
                </div>

                <div class="min-w-0">
                  <p
                    class="text-[9px] font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Topics
                  </p>

                  <p
                    class="mt-0.5 truncate text-[10px] font-medium text-gray-700"
                  >
                    {{ getTopicLabel(subject) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 text-indigo-500">
                <span class="text-[9px] font-semibold"> Edit </span>

                <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
        </article>
      </section>

      <!-- USER PROFILE -->
      <section
        class="mt-3 rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
      >
        <div class="mb-2 flex items-center gap-1.5">
          <div
            class="flex h-6 w-6 items-center justify-center rounded-sm bg-indigo-50 text-indigo-500"
          >
            <Icon name="lucide:user-round" class="h-3.5 w-3.5" />
          </div>

          <div class="min-w-0">
            <h3 class="text-[11px] font-semibold text-gray-900">
              Student Profile
            </h3>

            <p class="text-[9px] text-gray-400">
              Save your name for your practice session.
            </p>
          </div>
        </div>

        <input
          v-model="appState.currentsuser"
          type="text"
          list="students"
          placeholder="Enter your name"
          class="w-full rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-2 text-[11px] font-medium text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-500/10"
        />

        <datalist id="students">
          <option
            v-for="user in appState.users || []"
            :key="user"
            :value="user"
          />
        </datalist>
      </section>

      <!-- EXAM SETTINGS -->
      <section class="mt-3">
        <button
          type="button"
          @click="showSettings = !showSettings"
          class="flex w-full items-center justify-between rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
        >
          <div class="flex min-w-0 items-center gap-2">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
            >
              <Icon name="lucide:settings-2" class="h-4 w-4" />
            </div>

            <div class="min-w-0 text-left">
              <h3 class="text-xs font-semibold text-gray-900">Exam Settings</h3>

              <p class="mt-0.5 text-[10px] text-gray-500">
                {{ examModeLabel }} · {{ examDuration }}
              </p>
            </div>
          </div>

          <Icon
            :name="showSettings ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="h-4 w-4 shrink-0 text-gray-400"
          />
        </button>

        <div
          v-if="showSettings"
          class="mt-1.5 space-y-2.5 rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm"
        >
          <!-- MODE -->
          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-gray-700">
              Examination Mode
            </label>

            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="mode in examModes"
                :key="mode.value"
                type="button"
                @click="examMode = mode.value"
                class="rounded-sm border px-1.5 py-2 text-[10px] font-semibold transition"
                :class="
                  examMode === mode.value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                "
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- DURATION -->
          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-gray-700">
              Exam Duration
            </label>

            <div class="relative">
              <Icon
                name="lucide:timer"
                class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              />

              <input
                v-model="examDuration"
                type="time"
                step="60"
                class="w-full rounded-sm border border-gray-200 bg-gray-50 py-2 pl-8 pr-2 text-[11px] font-medium text-gray-700 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>
          </div>

          <!-- SHUFFLE QUESTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between rounded-sm bg-gray-50 p-2"
          >
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:shuffle" class="h-3.5 w-3.5" />
              </div>

              <div class="min-w-0">
                <p class="text-[11px] font-semibold text-gray-700">
                  Shuffle Questions
                </p>

                <p class="text-[9px] text-gray-400">Randomize question order</p>
              </div>
            </div>

            <input
              v-model="shuffleQuestions"
              type="checkbox"
              class="h-3.5 w-3.5 rounded-sm border-gray-300 accent-indigo-600"
            />
          </label>

          <!-- SHUFFLE OPTIONS -->
          <label
            class="flex cursor-pointer items-center justify-between rounded-sm bg-gray-50 p-2"
          >
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600"
              >
                <Icon name="lucide:list-restart" class="h-3.5 w-3.5" />
              </div>

              <div class="min-w-0">
                <p class="text-[11px] font-semibold text-gray-700">
                  Shuffle Options
                </p>

                <p class="text-[9px] text-gray-400">Randomize answer choices</p>
              </div>
            </div>

            <input
              v-model="shuffleOptions"
              type="checkbox"
              class="h-3.5 w-3.5 rounded-sm border-gray-300 accent-indigo-600"
            />
          </label>
        </div>
      </section>
    </main>

    <!-- FIXED BOTTOM ACTION BAR -->
    <div
      class="shrink-0 border-t border-gray-200 bg-white px-2.5 pb-2.5 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] sm:px-3"
    >
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="openInstructions"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500 transition active:scale-95"
          title="Exam instructions"
        >
          <Icon name="lucide:info" class="h-4 w-4" />
        </button>

        <button
          type="button"
          @click="startExam"
          :disabled="isStarting"
          class="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            :name="isStarting ? 'lucide:loader-circle' : 'lucide:play'"
            class="h-3.5 w-3.5 shrink-0"
            :class="{ 'animate-spin': isStarting }"
          />

          <span class="truncate">
            {{ isStarting ? "Preparing Exam..." : "Start Exam" }}
          </span>

          <Icon
            v-if="!isStarting"
            name="lucide:arrow-right"
            class="h-3.5 w-3.5 shrink-0"
          />
        </button>
      </div>
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <!-- INSTRUCTIONS MODAL -->
      <div
        v-if="showInstructions"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center"
        @click.self="showInstructions = false"
      >
        <div
          class="w-full max-w-md rounded-sm border border-gray-200 bg-white p-3 shadow-2xl"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="flex h-7 w-7 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600"
              >
                <Icon name="lucide:info" class="h-4 w-4" />
              </div>

              <h2 class="text-sm font-semibold text-gray-900">
                Exam Instructions
              </h2>
            </div>

            <button
              type="button"
              @click="showInstructions = false"
              class="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-100 text-gray-500"
            >
              <Icon name="lucide:x" class="h-3.5 w-3.5" />
            </button>
          </div>

          <div class="space-y-2.5">
            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:check-circle"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
              />
              Select the subjects you want to practice.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:calendar-days"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500"
              />
              Choose your preferred year, topics, and question count.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:clock"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500"
              />
              Complete the examination before the timer ends.
            </p>

            <p
              class="flex items-start gap-2 text-[11px] leading-relaxed text-gray-600"
            >
              <Icon
                name="lucide:shuffle"
                class="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500"
              />
              You can shuffle questions and answer options.
            </p>
          </div>

          <button
            type="button"
            @click="showInstructions = false"
            class="mt-4 w-full rounded-sm bg-[#4f46e5] py-2.5 text-xs font-semibold text-white transition active:scale-[0.98]"
          >
            Got It
          </button>
        </div>
      </div>
    </Teleport>

    <!-- SUBJECT SELECTOR -->
    <SelectSubject
      v-model="showSubjectModal"
      v-model:modelSubjects="selectedSubjects"
    />

    <!-- TOPIC SELECTOR -->
    <TopicSelector
      v-if="activeSubject"
      v-model="showTopicModal"
      v-model:modelTopics="activeSubject.topics"
      :topics="getSubjectDetails(activeSubject)?.topics || []"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import subjectsdetails from "~/data/subjectdetail.js";

const { getQuestions } = useQuestionSearch();

/*
|--------------------------------------------------------------------------
| Emits & App State
|--------------------------------------------------------------------------
*/

const emit = defineEmits(["gohome"]);
const appState = useAppState();

/*
|--------------------------------------------------------------------------
| UI State
|--------------------------------------------------------------------------
*/

const searchQuery = ref("");
const activeCategory = ref("All");
const showSubjectModal = ref(false);
const showTopicModal = ref(false);
const showInstructions = ref(false);
const showSettings = ref(false);
const activeSubject = ref(null);
const isStarting = ref(false);

/*
|--------------------------------------------------------------------------
| Exam Categories
|--------------------------------------------------------------------------
*/

const examCategories = [
  "All",
  "Languages",
  "Science",
  "Commercial",
  "Arts",
  "Social Science",
];

/*
|--------------------------------------------------------------------------
| Exam Modes
|--------------------------------------------------------------------------
*/

const examModes = [
  {
    label: "Practice",
    value: "practice",
  },
  {
    label: "Exam",
    value: "exam",
  },
  {
    label: "Timed",
    value: "timed",
  },
];

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

const saveUser = () => {
  const name = (appState.value.currentsuser || "").trim();

  if (!name || name.toLowerCase() === "unknown") {
    return;
  }

  if (!appState.value.users) {
    appState.value.users = [];
  }

  const exists = appState.value.users.some(
    (user) => user.toLowerCase() === name.toLowerCase()
  );

  if (!exists) {
    appState.value.users.push(name);
  }

  appState.value.currentsuser = name;
};

/*
|--------------------------------------------------------------------------
| Selected Subjects
|--------------------------------------------------------------------------
*/

const selectedSubjects = ref([
  {
    id: "english",
    name: "English",
    icon: "lucide:book-open",
    description: "Test your knowledge of English language and comprehension.",
  },
]);

/*
|--------------------------------------------------------------------------
| Exam Settings
|--------------------------------------------------------------------------
*/

const examMode = ref("practice");
const examDuration = ref("02:00");
const shuffleQuestions = ref(true);
const shuffleOptions = ref(true);

/*
|--------------------------------------------------------------------------
| All Available Subjects
|--------------------------------------------------------------------------
*/

const SUBJECTS = [
  "accounting",
  "agriculture",
  "arabic",
  "biology",
  "chemistry",
  "christian-religious-studies",
  "civic-education",
  "commerce",
  "computer-studies",
  "economics",
  "english",
  "fine-art",
  "french",
  "geography",
  "government",
  "hausa",
  "history",
  "home-economics",
  "igbo",
  "insurance",
  "literature-in-english",
  "mathematics",
  "marketing",
  "physics",
];

/*
|--------------------------------------------------------------------------
| Subject Icons
|--------------------------------------------------------------------------
*/

const subjectIcons = {
  accounting: "lucide:calculator",
  agriculture: "lucide:wheat",
  arabic: "lucide:languages",
  biology: "lucide:dna",
  chemistry: "lucide:flask-conical",
  "christian-religious-studies": "lucide:church",
  "civic-education": "lucide:landmark",
  commerce: "lucide:shopping-cart",
  "computer-studies": "lucide:monitor",
  economics: "lucide:chart-no-axes-combined",
  english: "lucide:book-open",
  "fine-art": "lucide:palette",
  french: "lucide:languages",
  geography: "lucide:globe-2",
  government: "lucide:building-2",
  hausa: "lucide:languages",
  history: "lucide:scroll-text",
  "home-economics": "lucide:house",
  igbo: "lucide:languages",
  insurance: "lucide:shield-check",
  "literature-in-english": "lucide:book-text",
  mathematics: "lucide:sigma",
  marketing: "lucide:megaphone",
  physics: "lucide:atom",
};

/*
|--------------------------------------------------------------------------
| Subject Colors
|--------------------------------------------------------------------------
*/

const subjectColors = {
  accounting: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  agriculture: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  arabic: {
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  biology: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  chemistry: {
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  "christian-religious-studies": {
    bg: "bg-red-100",
    text: "text-red-600",
  },
  "civic-education": {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  commerce: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
  },
  "computer-studies": {
    bg: "bg-cyan-100",
    text: "text-cyan-600",
  },
  economics: {
    bg: "bg-teal-100",
    text: "text-teal-600",
  },
  english: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  "fine-art": {
    bg: "bg-pink-100",
    text: "text-pink-600",
  },
  french: {
    bg: "bg-violet-100",
    text: "text-violet-600",
  },
  geography: {
    bg: "bg-lime-100",
    text: "text-lime-600",
  },
  government: {
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
  hausa: {
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
  history: {
    bg: "bg-stone-100",
    text: "text-stone-600",
  },
  "home-economics": {
    bg: "bg-rose-100",
    text: "text-rose-600",
  },
  igbo: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  insurance: {
    bg: "bg-sky-100",
    text: "text-sky-600",
  },
  "literature-in-english": {
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-600",
  },
  mathematics: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  marketing: {
    bg: "bg-pink-100",
    text: "text-pink-600",
  },
  physics: {
    bg: "bg-cyan-100",
    text: "text-cyan-600",
  },
};

/*
|--------------------------------------------------------------------------
| Subject Helpers
|--------------------------------------------------------------------------
*/

const getSubjectDetails = (subject) => {
  return subjectsdetails.find((item) => item.id === subject.id);
};

const getSubjectIcon = (subject) => {
  return subjectIcons[subject] || "lucide:book-open";
};

const getSubjectColor = (subject) => {
  return (
    subjectColors[subject] || {
      bg: "bg-slate-100",
      text: "text-slate-600",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Subject Category Detection
|--------------------------------------------------------------------------
*/

const categoryMap = {
  Languages: ["english", "arabic", "french", "hausa", "igbo"],

  Science: [
    "biology",
    "chemistry",
    "physics",
    "mathematics",
    "agriculture",
    "computer-studies",
  ],

  Commercial: ["accounting", "commerce", "economics", "insurance", "marketing"],

  Arts: [
    "fine-art",
    "literature-in-english",
    "history",
    "christian-religious-studies",
  ],

  "Social Science": [
    "government",
    "civic-education",
    "geography",
    "home-economics",
  ],
};

const getSubjectCategory = (subjectId) => {
  for (const [category, subjects] of Object.entries(categoryMap)) {
    if (subjects.includes(subjectId)) {
      return category;
    }
  }

  return "All";
};

/*
|--------------------------------------------------------------------------
| Filtered Subjects
|--------------------------------------------------------------------------
*/

const filteredSubjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  return selectedSubjects.value.filter((subject) => {
    const matchesSearch =
      !query ||
      subject.name.toLowerCase().includes(query) ||
      subject.id.toLowerCase().includes(query);

    const matchesCategory =
      activeCategory.value === "All" ||
      getSubjectCategory(subject.id) === activeCategory.value;

    return matchesSearch && matchesCategory;
  });
});

/*
|--------------------------------------------------------------------------
| Total Questions
|--------------------------------------------------------------------------
*/

const totalQuestions = computed(() => {
  return selectedSubjects.value.reduce(
    (total, subject) => total + Number(subject.questions || 0),
    0
  );
});

/*
|--------------------------------------------------------------------------
| Exam Mode Label
|--------------------------------------------------------------------------
*/

const examModeLabel = computed(() => {
  const mode = examModes.find((item) => item.value === examMode.value);

  return mode?.label || "Practice";
});

/*
|--------------------------------------------------------------------------
| Topic Helpers
|--------------------------------------------------------------------------
*/

const getTopicLabel = (subject) => {
  const availableTopics = getSubjectDetails(subject)?.topics || [];

  if (
    !subject.topics ||
    subject.topics.length === 0 ||
    subject.topics.length === availableTopics.length
  ) {
    return "All Topics";
  }

  return `${subject.topics.length} Topics Selected`;
};

/*
|--------------------------------------------------------------------------
| Subject Creation
|--------------------------------------------------------------------------
*/

const createSubject = (subject) => {
  const details = getSubjectDetails(subject);

  return {
    ...subject,
    year: details?.years?.at(-1) ?? "all",
    topics: [],
    questions: subject.id === "english" ? 60 : 40,
    questionOptions: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  };
};

/*
|--------------------------------------------------------------------------
| Subject Selection
|--------------------------------------------------------------------------
*/

const isSelected = (subject) => {
  return selectedSubjects.value.some((item) => item.id === subject.id);
};

const toggleSubject = (subject) => {
  if (isSelected(subject)) {
    selectedSubjects.value = selectedSubjects.value.filter(
      (item) => item.id !== subject.id
    );
  } else {
    selectedSubjects.value.push(createSubject(subject));
  }
};

const removeSubject = (subject) => {
  selectedSubjects.value = selectedSubjects.value.filter(
    (item) => item.id !== subject.id
  );
};

const openSubjectModal = () => {
  showSubjectModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Topic Modal
|--------------------------------------------------------------------------
*/

const openTopicModal = (subject) => {
  activeSubject.value = subject;
  showTopicModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Instructions
|--------------------------------------------------------------------------
*/

const openInstructions = () => {
  showInstructions.value = true;
};

/*
|--------------------------------------------------------------------------
| Shuffle Helpers
|--------------------------------------------------------------------------
*/

function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function shuffleQuestionOptions(question) {
  const entries = Object.entries(question.options || {}).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  const correctText = question.options?.[question.answer];

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const newOptions = {};
  let newAnswer = "";

  entries.forEach(([, value], index) => {
    const key = String.fromCharCode(97 + index);

    newOptions[key] = value;

    if (value === correctText) {
      newAnswer = key;
    }
  });

  return {
    ...question,
    options: newOptions,
    answer: newAnswer,
    userAnswer: null,
  };
}

/*
|--------------------------------------------------------------------------
| Start Exam
|--------------------------------------------------------------------------
*/

const startExam = async () => {
  if (isStarting.value) return;

  appState.value.reviewQuestions = false;

  if (selectedSubjects.value.length === 0) {
    alert("Please select at least one subject.");
    return;
  }

  isStarting.value = true;

  try {
    appState.value.selectedSubjects = selectedSubjects.value;

    appState.value.examSettings = {
      mode: examMode.value,
      duration: examDuration.value,
      shuffleQuestions: shuffleQuestions.value,
      shuffleOptions: shuffleOptions.value,
    };

    let examQuestions = [];

    for (const subject of selectedSubjects.value) {
      let subjectQuestions = await getQuestions({
        subject: subject.id,
        year: subject.year,
        limit: subject.questions,
      });

      if (!subjectQuestions?.length) {
        subjectQuestions = await getQuestions({
          subject: subject.id,
          limit: subject.questions,
        });
      }

      if (shuffleQuestions.value) {
        subjectQuestions = shuffleArray(subjectQuestions);
      }

      if (shuffleOptions.value) {
        subjectQuestions = subjectQuestions.map((question) =>
          shuffleQuestionOptions(question)
        );
      }

      examQuestions.push(...subjectQuestions);
    }

    if (examQuestions.length === 0) {
      alert("No questions found for the selected subjects.");
      return;
    }

    appState.value.examQuestions = examQuestions;

    saveUser();

    await navigateTo("/exam");
  } catch (error) {
    console.error("Failed to start exam:", error);
    alert("Unable to prepare the exam. Please try again.");
  } finally {
    isStarting.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  const savedSubjects = appState.value.selectedSubjects;

  if (savedSubjects?.length > 0) {
    selectedSubjects.value = savedSubjects;

    const settings = appState.value.examSettings;

    if (settings) {
      examMode.value = settings.mode || "practice";
      examDuration.value = settings.duration || "02:00";
      shuffleQuestions.value = settings.shuffleQuestions ?? true;
      shuffleOptions.value = settings.shuffleOptions ?? true;
    }
  }
});

/*
|--------------------------------------------------------------------------
| Watch Selected Subjects
|--------------------------------------------------------------------------
*/

watch(
  selectedSubjects,
  (subjects) => {
    subjects.forEach((subject) => {
      const details = getSubjectDetails(subject);

      if (!subject.year) {
        subject.year = details?.years?.at(-1) || "all";
      }

      if (!subject.topics) {
        subject.topics = [];
      }

      if (!subject.questions) {
        subject.questions = subject.id === "english" ? 60 : 40;
      }

      if (!subject.questionOptions) {
        subject.questionOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      }
    });
  },
  {
    immediate: true,
    deep: true,
  }
);

/*
|--------------------------------------------------------------------------
| Go Home
|--------------------------------------------------------------------------
*/

const goHome = () => {
  emit("gohome");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap");

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Keep every element inside its available width */
* {
  min-width: 0;
}

/* Compact form controls */
input,
select,
button {
  max-width: 100%;
}

/* Prevent long text from breaking the layout */
p,
h1,
h2,
h3,
span {
  overflow-wrap: anywhere;
}
</style>