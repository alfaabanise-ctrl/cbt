<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Question {
  topic?: string;
  difficulty?: "Basic" | "Intermediate" | "Advanced";
  answer: string;
  userAnswer?: string | null;
}

interface Subject {
  id: string;
  name: string;
  questions: Question[];
}

interface TopicStat {
  topic: string;
  total: number;
  correct: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
  correct: number;
}

const props = defineProps<{
  questions: Subject[];
}>();

const open = ref(true);
const selectedSubject = ref("");

// Selected questions
const selectedQuestions = computed<Question[]>(() => {
  if (!selectedSubject.value) {
    return props.questions.flatMap((subject) => subject.questions || []);
  }

  const subject = props.questions.find(
    (subject) => subject.id === selectedSubject.value
  );

  return subject?.questions || [];
});

// Topic statistics
const topics = computed<TopicStat[]>(() => {
  const map = new Map<string, TopicStat>();

  selectedQuestions.value.forEach((question) => {
    const topic = question.topic || "Unknown";

    if (!map.has(topic)) {
      map.set(topic, {
        topic,
        total: 0,
        correct: 0,
      });
    }

    const current = map.get(topic)!;

    current.total++;

    if (
      question.userAnswer !== null &&
      question.userAnswer !== undefined &&
      question.userAnswer === question.answer
    ) {
      current.correct++;
    }
  });

  return [...map.values()].sort((a, b) => {
    if (b.correct !== a.correct) {
      return b.correct - a.correct;
    }

    return b.total - a.total;
  });
});

// Difficulty statistics
const difficulties = computed<DifficultyStat[]>(() => {
  const map = new Map<string, DifficultyStat>();

  selectedQuestions.value.forEach((question) => {
    const difficulty = question.difficulty || "Unknown";

    if (!map.has(difficulty)) {
      map.set(difficulty, {
        difficulty,
        total: 0,
        correct: 0,
      });
    }

    const current = map.get(difficulty)!;

    current.total++;

    if (
      question.userAnswer !== null &&
      question.userAnswer !== undefined &&
      question.userAnswer === question.answer
    ) {
      current.correct++;
    }
  });

  const order: Record<string, number> = {
    Advanced: 1,
    Intermediate: 2,
    Basic: 3,
    Unknown: 4,
  };

  return [...map.values()].sort(
    (a, b) =>
      (order[a.difficulty] ?? 99) - (order[b.difficulty] ?? 99)
  );
});

// Summary statistics
const totalQuestions = computed(() => selectedQuestions.value.length);

const totalCorrect = computed(() =>
  selectedQuestions.value.filter(
    (question) =>
      question.userAnswer !== null &&
      question.userAnswer !== undefined &&
      question.userAnswer === question.answer
  ).length
);

const totalWrong = computed(() =>
  selectedQuestions.value.filter(
    (question) =>
      question.userAnswer !== null &&
      question.userAnswer !== undefined &&
      question.userAnswer !== question.answer
  ).length
);

const unanswered = computed(
  () => totalQuestions.value - totalCorrect.value - totalWrong.value
);

const accuracy = computed(() => {
  if (!totalQuestions.value) return 0;

  return Math.round(
    (totalCorrect.value / totalQuestions.value) * 100
  );
});

// Select first subject by default
watch(
  () => props.questions,
  (subjects) => {
    if (!subjects.length) {
      selectedSubject.value = "";
      return;
    }

    const stillExists = subjects.some(
      (subject) => subject.id === selectedSubject.value
    );

    if (!stillExists) {
      selectedSubject.value = subjects[0].id;
    }
  },
  {
    immediate: true,
  }
);

function getDifficultyClass(difficulty: string) {
  return {
    "bg-green-100 text-green-700": difficulty === "Basic",
    "bg-yellow-100 text-yellow-700":
      difficulty === "Intermediate",
    "bg-red-100 text-red-700": difficulty === "Advanced",
    "bg-slate-100 text-slate-600": difficulty === "Unknown",
  };
}

function getProgressClass(difficulty: string) {
  return {
    "bg-green-500": difficulty === "Basic",
    "bg-yellow-500": difficulty === "Intermediate",
    "bg-red-500": difficulty === "Advanced",
    "bg-slate-400": difficulty === "Unknown",
  };
}
</script>

<template>
  <div class="w-full min-w-0 space-y-4 sm:space-y-6">
    <!-- Topic Performance -->
    <section
      class="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- Main Header -->
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 text-left sm:px-5 sm:py-4"
        @click="open = !open"
      >
        <div class="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10"
          >
            <Icon
              name="lucide:book-open"
              class="h-4 w-4 text-green-700 sm:h-5 sm:w-5"
            />
          </div>

          <div class="min-w-0">
            <h2
              class="truncate text-sm font-bold text-slate-800 sm:text-lg"
            >
              Topic Performance
            </h2>

            <p class="text-[10px] text-slate-500 sm:text-sm">
              Performance by topic
            </p>
          </div>
        </div>

        <Icon
          :name="
            open
              ? 'lucide:chevron-up'
              : 'lucide:chevron-down'
          "
          class="h-4 w-4 shrink-0 text-slate-500 sm:h-5 sm:w-5"
        />
      </button>

      <Transition name="fade">
        <div
          v-show="open"
          class="w-full min-w-0 space-y-5 p-3 sm:space-y-7 sm:p-5"
        >
          <!-- Subject Filter -->
          <div
            class="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
          >
            <label
              for="subject"
              class="shrink-0 text-xs font-semibold text-slate-700 sm:text-sm"
            >
              Subject
            </label>

            <select
              id="subject"
              v-model="selectedSubject"
              class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-200 sm:w-72 sm:text-sm"
            >
              <option
                v-for="subject in questions"
                :key="subject.id"
                :value="subject.id"
              >
                {{ subject.name }}
              </option>
            </select>
          </div>

          <!-- Topic Table -->
          <div class="w-full max-w-full overflow-x-auto">
            <table
              class="w-full min-w-[390px] border-collapse text-xs sm:text-sm"
            >
              <thead>
                <tr class="border-b border-slate-200 bg-slate-100">
                  <th
                    class="w-10 px-2 py-2 text-left font-semibold sm:px-3"
                  >
                    #
                  </th>

                  <th
                    class="px-2 py-2 text-left font-semibold sm:px-3"
                  >
                    Topic
                  </th>

                  <th
                    class="px-2 py-2 text-center font-semibold sm:px-3"
                  >
                    Score
                  </th>

                  <th
                    class="px-2 py-2 text-center font-semibold sm:px-3"
                  >
                    Questions
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in topics"
                  :key="item.topic"
                  class="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td class="px-2 py-2 sm:px-3">
                    <div
                      class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 sm:h-7 sm:w-7 sm:text-xs"
                    >
                      {{ index + 1 }}
                    </div>
                  </td>

                  <td
                    class="max-w-[180px] break-words px-2 py-2 font-medium text-slate-700 sm:px-3"
                  >
                    {{ item.topic }}
                  </td>

                  <td class="px-2 py-2 text-center sm:px-3">
                    <span
                      class="inline-flex whitespace-nowrap rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 sm:px-3 sm:text-xs"
                    >
                      {{ item.correct }}/{{ item.total }}
                    </span>
                  </td>

                  <td
                    class="px-2 py-2 text-center text-slate-600 sm:px-3"
                  >
                    {{ item.total }}
                  </td>
                </tr>

                <tr v-if="!topics.length">
                  <td
                    colspan="4"
                    class="px-3 py-6 text-center text-xs text-slate-500"
                  >
                    No topic statistics available.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Difficulty Performance -->
          <section
            class="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <!-- Difficulty Header -->
            <div
              class="border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4"
            >
              <div class="flex items-center gap-2 sm:gap-3">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 sm:h-10 sm:w-10"
                >
                  <Icon
                    name="lucide:chart-column"
                    class="h-4 w-4 text-indigo-700 sm:h-5 sm:w-5"
                  />
                </div>

                <div class="min-w-0">
                  <h2
                    class="text-sm font-bold text-slate-800 sm:text-lg"
                  >
                    Difficulty Performance
                  </h2>

                  <p class="text-[10px] text-slate-500 sm:text-sm">
                    Performance by question difficulty
                  </p>
                </div>
              </div>
            </div>

            <!-- Difficulty Items -->
            <div class="space-y-3 p-3 sm:space-y-4 sm:p-4">
              <div
                v-for="(item, index) in difficulties"
                :key="item.difficulty"
                class="rounded-lg border border-slate-200 p-2.5 sm:p-3"
              >
                <div
                  class="mb-2 flex items-center justify-between gap-2"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 sm:h-7 sm:w-7 sm:text-xs"
                    >
                      {{ index + 1 }}
                    </div>

                    <span
                      class="rounded-full px-2 py-1 text-[10px] font-bold sm:px-3 sm:text-xs"
                      :class="getDifficultyClass(item.difficulty)"
                    >
                      {{ item.difficulty }}
                    </span>
                  </div>

                  <div class="shrink-0 text-right">
                    <p
                      class="text-sm font-bold text-slate-800 sm:text-lg"
                    >
                      {{ item.correct }}/{{ item.total }}
                    </p>

                    <p class="text-[9px] text-slate-500 sm:text-xs">
                      {{ item.total }} Questions
                    </p>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div
                  class="h-2 overflow-hidden rounded-full bg-slate-200 sm:h-2.5"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="getProgressClass(item.difficulty)"
                    :style="{
                      width: `${
                        item.total
                          ? (item.correct / item.total) * 100
                          : 0
                      }%`,
                    }"
                  ></div>
                </div>
              </div>

              <p
                v-if="!difficulties.length"
                class="py-4 text-center text-xs text-slate-500"
              >
                No difficulty statistics available.
              </p>
            </div>
          </section>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>