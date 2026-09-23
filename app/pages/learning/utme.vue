<template>
  <div class="min-h-screen bg-slate-50">

    <!-- Header -->

    <header
      class="sticky top-0 z-50 flex items-center gap-4 border-b bg-white px-5 py-4 shadow-sm"
    >

      <button
        @click="goBack"
        class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
      >

        <Icon
          name="lucide:arrow-left"
          class="h-5 w-5"
        />

      </button>

      <div>
        <h1 class="font-bold text-slate-900">
          UTME Practice
        </h1>

        <p class="text-xs text-slate-500">
          Prepare for your JAMB CBT examination
        </p>
      </div>

    </header>


    <!-- Content -->

    <main class="p-6">

      <div class="mx-auto max-w-5xl">

        <h2 class="text-2xl font-bold">
          Choose your subject
        </h2>

        <p class="mt-2 text-sm text-slate-500">
          Select a subject to begin your practice exam.
        </p>


        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <button
            v-for="subject in subjects"
            :key="subject"
            class="rounded-xl bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >

            <Icon
              name="lucide:book-open"
              class="h-8 w-8 text-indigo-600"
            />

            <h3 class="mt-4 font-bold">
              {{ subject }}
            </h3>

            <p class="mt-1 text-xs text-slate-500">
              Start practicing {{ subject }}
            </p>

          </button>

        </div>

      </div>

    </main>

  </div>
</template>


<script setup>

const router = useRouter()

const subjects = [
  'English Language',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics'
]


const goBack = () => {

  router.back()

}

</script>