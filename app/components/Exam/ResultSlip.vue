<template>
  <div
    class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
  >
    <!-- Header -->
    <button
      type="button"
      class="flex w-full items-center justify-between bg-stone-100 px-3 py-2.5 sm:px-6 sm:py-3"
      @click="open = !open"
    >
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <Icon
          :name="open ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          class="h-4 w-4 shrink-0 text-slate-700 sm:h-5 sm:w-5"
        />

        <h2 class="truncate text-sm font-bold text-slate-800 sm:text-lg">
          Exam Details
        </h2>
      </div>
    </button>

    <Transition name="fade">
      <div
        v-show="open"
        class="w-full min-w-0 space-y-6 p-3 sm:space-y-10 sm:p-5"
      >
        <!-- Controls -->
        <div
          class="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex w-full items-center gap-2 sm:w-auto">
            <label
              class="shrink-0 rounded bg-green-800 px-2 py-1.5 text-xs font-semibold text-white sm:px-4 sm:text-sm"
            >
              Format
            </label>

            <select
              class="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 sm:w-64 sm:flex-none sm:text-sm"
            >
              <option>Slip</option>
            </select>
          </div>

          <button
            type="button"
            class="w-full rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:w-auto sm:px-6 sm:text-sm"
          >
            <Icon name="lucide:printer" class="mr-1 inline h-3.5 w-3.5" />
            Print
          </button>
        </div>

        <!-- Slip Heading -->
        <div
          class="flex min-w-0 items-center gap-2 sm:gap-4"
          style="font-family: 'Times New Roman', serif"
        >
          <!-- Profile Icon -->
          <div class="flex w-1/5 shrink-0 justify-start">
            <Icon
              name="lucide:user-round"
              class="h-10 w-10 text-green-600 sm:h-16 sm:w-16"
            />
          </div>

          <!-- Title -->
          <div class="min-w-0 flex-1 text-center">
            <h1 class="text-sm font-bold sm:text-base">
              UTME
            </h1>

            <h2 class="text-sm font-bold sm:text-base">
              Result Slip
            </h2>
          </div>

          <!-- Date -->
          <div
            class="w-1/4 shrink-0 text-right text-[9px] font-bold leading-tight sm:text-sm"
          >
            <span class="block">Date Printed:</span>
            <span class="font-normal">
              {{ formatDate(new Date()) }}
            </span>
          </div>
        </div>

        <hr class="border-slate-200" />

        <!-- Examination Details -->
        <section
          class="min-w-0 text-xs sm:text-base"
          style="font-family: 'Times New Roman', serif"
        >
          <h2 class="mb-3 text-base font-bold sm:mb-4 sm:text-xl">
            Examination Details
          </h2>

          <div class="space-y-2 sm:space-y-3">
            <div class="flex min-w-0 gap-2">
              <div class="w-24 shrink-0 font-semibold sm:w-40">
                Username:
              </div>

              <div class="min-w-0 break-words">
                {{ appState.currentsuser || "N/A" }}
              </div>
            </div>

            <div class="flex min-w-0 gap-2">
              <div class="w-24 shrink-0 font-semibold sm:w-40">
                Subject(s):
              </div>

              <div class="min-w-0 break-words">
                {{
                  examDetails?.subjects
                    ?.map((subject) => subject.name)
                    .join(", ") || "N/A"
                }}
              </div>
            </div>

            <div class="flex min-w-0 gap-2">
              <div class="w-24 shrink-0 font-semibold sm:w-40">
                Exam Date:
              </div>

              <div class="min-w-0 break-words">
                {{ formatDate(startingDate) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Candidate Result -->
        <section
          class="min-w-0"
          style="font-family: 'Times New Roman', serif"
        >
          <h2 class="mb-3 text-base font-bold sm:mb-4 sm:text-xl">
            Candidate Result
          </h2>

          <!-- Table Wrapper -->
          <div class="w-full max-w-full overflow-x-auto">
            <table class="w-full min-w-[440px] border-collapse text-xs sm:text-base">
              <thead>
                <tr class="border-b border-slate-300">
                  <th class="whitespace-nowrap py-2 text-left text-sm sm:text-lg">
                    Subject
                  </th>

                  <th class="whitespace-nowrap px-2 py-2 text-left text-sm sm:text-lg">
                    Score
                  </th>

                  <th class="whitespace-nowrap py-2 text-left text-sm sm:text-lg">
                    Time Spent
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="subject in examDetails?.subjects || []"
                  :key="subject.name"
                  class="border-b border-slate-100"
                >
                  <td class="max-w-[160px] break-words py-2">
                    {{ subject.name }}
                  </td>

                  <td class="px-2 py-2">
                    {{ Math.round(subject.score || 0) }}
                  </td>

                  <td class="whitespace-nowrap py-2">
                    {{ formatTotalTime(subject.questions || []) }}
                  </td>
                </tr>
              </tbody>

              <tfoot>
                <tr class="border-t border-slate-300 font-semibold">
                  <td class="break-words pt-3">
                    Aggregate
                  </td>

                  <td class="px-2 pt-3">
                    <span class="block text-[10px] sm:inline sm:text-base">
                      Total:
                    </span>

                    {{ Math.round(examDetails?.aggregate || 0) }}
                    /
                    {{ Math.round(examDetails?.maxAggregate || 0) }}
                  </td>

                  <td class="whitespace-nowrap pt-3">
                    <span class="block text-[10px] sm:inline sm:text-base">
                      Total:
                    </span>

                    {{
                      formatTotalTime(
                        examDetails?.subjects?.flatMap(
                          (subject) => subject.questions || []
                        ) || []
                      )
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from "vue";

const appState = useAppState();

const open = ref(true);

const props = defineProps({
  title: {
    type: String,
    default: "Summary",
  },

  examDetails: {
    type: Object,
    default: () => ({
      subjects: [],
      aggregate: 0,
      maxAggregate: 0,
    }),
  },

  startingDate: {
    type: [String, Date],
    default: null,
  },
});

function formatTotalTime(questions = []) {
  const totalSeconds = questions.reduce(
    (total, question) => total + Number(question?.timeSpent || 0),
    0
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} hr ${minutes} min ${seconds} sec`;
  }

  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }

  return `${seconds} sec`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
</script>

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

/* Improve mobile table scrolling */
table {
  table-layout: auto;
}

/* Prevent long text from breaking the page */
td,
th {
  overflow-wrap: anywhere;
}
</style>