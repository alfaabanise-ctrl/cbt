<template>
  <div class="h-full w-full overflow-y-auto bg-slate-50">
    <!-- HEADER -->

    <header
      class="sticky top-0 z-20 flex items-center gap-4 border-b bg-white px-6 py-4 shadow-sm"
    >
      <button
        type="button"
        @click="$emit('back')"
        class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </button>

      <div>
        <h1 class="text-xl font-bold text-slate-900">Practice For UTME</h1>

        <p class="text-sm text-slate-500">
          Prepare for your JAMB CBT examination
        </p>
      </div>
    </header>

    <!-- CONTENT -->

    <main class="mx-auto max-w-5xl p-6">
      <h2 class="mb-6 text-2xl font-bold">Choose your subject</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="subject in subjects"
          :key="subject.name"
          type="button"
          class="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <Icon :name="subject.icon" class="mb-4 h-10 w-10" />

          <h3 class="font-bold">
            {{ subject.name }}
          </h3>

          <p class="mt-1 text-sm text-slate-500">
            {{ subject.description }}
          </p>
        </button>
      </div>
    </main>
  </div>
</template>


<script setup>
defineEmits(["back", "navigate"]);

const subjects = [
  {
    name: "English Language",

    description: "Practice UTME English questions",

    icon: "lucide:book-open",
  },

  {
    name: "Mathematics",

    description: "Practice UTME Mathematics questions",

    icon: "lucide:calculator",
  },

  {
    name: "Physics",

    description: "Practice UTME Physics questions",

    icon: "lucide:atom",
  },

  {
    name: "Chemistry",

    description: "Practice UTME Chemistry questions",

    icon: "lucide:flask-conical",
  },
];
</script>