<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-4"
        @click.self="close"
      >
        <!-- Modal -->
        <div
          class="my-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4"
          >
            <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-10 sm:w-10"
              >
                <Icon
                  name="lucide:circle-check-big"
                  class="h-5 w-5 text-green-600 sm:h-6 sm:w-6"
                />
              </div>

              <div class="min-w-0">
                <h2
                  class="truncate text-sm font-bold text-slate-800 sm:text-lg"
                >
                  Submit Exam
                </h2>

                <p class="text-[11px] text-slate-500 sm:text-sm">
                  Confirm your submission
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close modal"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              @click="close"
            >
              <Icon name="lucide:x" class="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            
            <p
              class="mt-4 text-sm font-medium leading-relaxed text-slate-700 sm:text-base"
            >
              Are you sure you want to submit your exam?
            </p>

            <p
              class="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm"
            >
              After submission, you will not be able to change your answers.
            </p>
          </div>

          <!-- Footer -->
          <div
            class="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4"
          >
            <button
              type="button"
              class="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:text-sm"
              @click="close"
            >
              Continue Exam
            </button>

            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 sm:w-auto sm:text-sm"
              @click="submitExam"
            >
              <Icon name="lucide:check" class="h-4 w-4" />
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "submit"): void;
}>();

function close() {
  emit("update:modelValue", false);
}

function submitExam() {
  emit("submit");
  emit("update:modelValue", false);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>