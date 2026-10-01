<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >

          <!-- Header -->
          <div class="bg-primary text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold">
             
              </h2>

              <p class="text-sm text-white/80">
                Choose the topics you want to practice.
              </p>
            </div>

            <button
              @click="closeModal"
              class="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
            >
              <Icon name="lucide:x" class="text-2xl"/>
            </button>
          </div>

          <!-- Search -->
        

          <!-- Select All -->
          <div class="p-4 border-b flex justify-between">

            <label class="flex gap-3 items-center">

              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
              >

              <span>Select All</span>

            </label>

            <span>
              {{ selectedTopics.length }}/{{ filteredTopics.length }}
            </span>

          </div>

          <!-- Topics -->
          <div class="flex-1 overflow-y-auto p-4">

            <label
              v-for="topic in filteredTopics"
              :key="topic"
              class="flex items-center gap-3 p-3 rounded hover:bg-slate-100 cursor-pointer"
            >

              <input
                type="checkbox"
                :value="topic"
                v-model="selectedTopics"
              >

              <span>{{ topic }}</span>

            </label>

          </div>

          <!-- Footer -->
          <div class="border-t p-4 flex justify-end gap-3">

            <button
              @click="closeModal"
              class="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              @click="save"
              class="px-5 py-2 rounded-lg bg-primary text-white"
            >
              Continue
            </button>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  modelValue: Boolean,

  topics: {
    type: Array,
    default: () => []
  },

  modelTopics: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  "update:modelValue",
  "update:modelTopics"
])

const search = ref("")

const selectedTopics = ref([])

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return

    // first open -> select all
    if (props.modelTopics.length) {
      selectedTopics.value = [...props.modelTopics]
    } else {
      selectedTopics.value = [...props.topics]
    }
  },
  { immediate: true }
)

const filteredTopics = computed(() => {
  if (!search.value) return props.topics

  return props.topics.filter(topic =>
    topic.toLowerCase().includes(search.value.toLowerCase())
  )
})

const allSelected = computed(() =>

  props.topics.length &&
  selectedTopics.value.length === props.topics.length

)

function toggleAll() {

  if (allSelected.value) {

    selectedTopics.value = []

  } else {

    selectedTopics.value = [...props.topics]

  }

}

function closeModal() {

  emit("update:modelValue", false)

}

function save() {

  emit("update:modelTopics", [...selectedTopics.value])

  emit("update:modelValue", false)

}
</script>