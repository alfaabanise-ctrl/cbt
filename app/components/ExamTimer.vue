<template>
  <div
    class="relative   w-32  h-8  rounded-full overflow-hidden  bg-blue-900 backdrop-blur-3xl  shadow-md"
  >
    <!-- Progress -->
    <div
      class="absolute left-0 top-0 h-full transition-all duration-1000 ease-linear"
      :class="progressColor"
      :style="{ width: `${progress}%` }"
    ></div>

    <!-- Time -->
    <div
      class="absolute inset-0 flex items-center justify-center gap-2 text-white font-bold"
    >
      <Icon
        name="lucide:clock-3"
        class="w-5 text-lg sm:text-2xl h-5"
      />

      <span class="font-mono font- text-sm sm:text-lg">
        {{ formattedTime }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"

const props = defineProps({
  duration: {
    type: Number,
    default: 3600,
  },

  autoStart: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  "tick",
  "finished",
])

const timeLeft = ref(props.duration)

let interval = null

const progress = computed(() => {
  return (timeLeft.value / props.duration) * 100
})

const progressColor = computed(() => {
  if (progress.value <= 20) return "bg-red-600"
  if (progress.value <= 50) return "bg-orange-500"
  return "bg-[#ff5a1f]"
})

const formattedTime = computed(() => {
  const hours = Math.floor(timeLeft.value / 3600)
  const minutes = Math.floor((timeLeft.value % 3600) / 60)
  const seconds = timeLeft.value % 60

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":")
})

function start() {
  if (interval) return

  interval = setInterval(() => {
    if (timeLeft.value <= 0) {
      stop()
      emit("finished")
      return
    }

    timeLeft.value--

    emit("tick", timeLeft.value)
  }, 1000)
}

function stop() {
  clearInterval(interval)
  interval = null
}

function pause() {
  stop()
}

function resume() {
  start()
}

function reset(seconds = props.duration) {
  stop()
  timeLeft.value = seconds
}

watch(
  () => props.duration,
  (value) => {
    reset(value)
  }
)

onMounted(() => {
  if (props.autoStart) {
    start()
  }
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({
  start,
  stop,
  pause,
  resume,
  reset,
  timeLeft,
})
</script>