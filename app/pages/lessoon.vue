<template>
  <div
     class="  h-full   justify-center  pt items-center bg-cover w-full overflow-hidden bg-center"
  style="background-image: url('/image/background.png')"
  >

   
     <div class="   h-full   flex flex-col justify-center items-center"  >
    <!-- Main Content -->
    <main class="h-fll book  max-w-6xl min-w-[900px]      relative  -translate-y-7  bg-ambe-500   h-[80%]   w-2xl  bg-   bger-300 w-fl    overflow-y-visible">
        
          <div   :class="{ open: appState.showSecond }" class="page home absolute  inset-0 z-10"
             >
            <!-- Top Activation Bar -->
            <section
              class="mx-4 mt-  flex   items-center justify-between
                    rounded-xl  
                      px-6 py-3
                    shadow-sm backdrop-blur"
            >
              <div class="flex  items-center gap-3">

                <div
                  class="flex h-7 w-7 items-center justify-center
                        rounded-full bg-yellow-400 text-white"
                >
                  <Icon
                    name="lucide:triangle-alert"
                    class="h-6 w-6"
                  />
                </div>

                <span class="font-semibold  text-xs text-green-700">
                  Welcome to your learning journey
                </span>

              </div>

              <div class="hidden items-center gap-4 md:flex">

                <span
                  class="rounded-md bg-yellow-400  text-xs px-5 py-1
                        font-bold text-gray-900"
                >
                  Unlock Premium Learning
                </span>

                <button
                  class="rounded-full text-xs bg-orange-500
                        px-4 py-1 font-bold text-white
                        transition hover:bg-orange-600"
                >
                  Activate
                </button>

              </div>
            </section>


            <!-- Dashboard -->
            <section
              class="mx-4 mt-2  grid w-fit   h-fit 
                    grid-cols-1 gap-3
                    lg:grid-cols-4"
            >

              <!-- LEFT: Six Feature Cards -->
              <div
                class="grid grid-cols-2 gap-2
                      sm:grid-cols-2
                      lg:col-span-2"
              >

                <button  @click="openBook(item)"
                  v-for="item in dashboardItems"
                  
                
                  class="group flex min-h-[50px]
                        flex-col items-center
                        justify-center rounded-sm
                        p-3 text-center
                        transition-all duration-200
                        hover:-translate-y-1
                        hover:shadow-xl"
                  :class="item.class"
                >

                  <Icon
                    :name="item.icon"
                    class="mb-1    text-4xl
                          transition-transform
                          duration-200 font-semibold
                          group-hover:scale-110"
                  />

                  <h2 class="text-sm font-bold">
                    {{ item.title }}
                  </h2>

                  <p class="mt- text-xs opacity-70">
                    {{ item.description }}
                  </p>

                </button>

              </div>


              <!-- RIGHT: Featured Area -->
              <div
                class="relative h-full
                      overflow-hidden rounded-xl
                      bg-slate-900
                      lg:col-span-2"
              >

                <!-- Background Image -->
                <img
                  :src="slides[currentSlide].image"
                  alt="Featured learning"
                  class="absolute inset-0
                        h-full w-full
                        object-cover opacity-60"
                />

                <!-- Dark Overlay -->
                <div
                  class="absolute inset-0
                        bg-gradient-to-t
                        from-black/90
                        via-black/30
                        to-transparent"
                />

                <!-- Content -->
                <div
                  class="absolute inset-x-0 bottom-0
                        p-7 text-white"
                >

                  <span
                    class="inline-flex items-center gap-2
                          rounded-full bg-blue-600
                          px-3 py-1 text-xs font-bold"
                  >
                    <Icon
                      name="lucide:sparkles"
                      class="h-4 w-4"
                    />

                    Featured
                  </span>

                  <h2
                    class="mt-4 text-xl
                          font-extrabold"
                  >
                    {{ slides[currentSlide].title }}
                  </h2>

                  <p
                    class="mt-1 max-w-md text-xs
                          text-sm text-white/80"
                  >
                    {{ slides[currentSlide].description }}
                  </p>

                  <button
                    class="mt-5 flex items-center
                          gap-2 rounded-lg
                          bg-blue-600 px-3 py-1 text-sm
                          font-bold
                          transition hover:bg-blue-700"
                  >
                    {{ slides[currentSlide].button }}

                    <Icon
                      name="lucide:arrow-right"
                      class="h-5 w-5"
                    />
                  </button>

                </div>


                <!-- Previous -->
                <button
                  @click="previousSlide"
                  class="absolute left-4 top-1/2
                        flex h-10 w-10
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full bg-black/40
                        text-white backdrop-blur
                        transition hover:bg-black/70"
                >
                  <Icon
                    name="lucide:chevron-left"
                    class="h-6 w-6"
                  />
                </button>


                <!-- Next -->
                <button
                  @click="nextSlide"
                  class="absolute right-4 top-1/2
                        flex h-10 w-10
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full bg-black/40
                        text-white backdrop-blur
                        transition hover:bg-black/70"
                >
                  <Icon
                    name="lucide:chevron-right"
                    class="h-6 w-6"
                  />
                </button>


                <!-- Dots -->
                <div
                  class="absolute bottom-5
                        right-6 flex gap-2"
                >

                  <button
                    v-for="(_, index) in slides"
                    :key="index"
                    @click="currentSlide = index"
                    class="h-3 w-3 rounded-full
                          transition-all"
                    :class="
                      currentSlide === index
                        ? 'w-8 bg-blue-500'
                        : 'bg-white/50'
                    "
                  />

                </div>

              </div>

            </section>


            <!-- Bottom Quick Access -->
             <!-- Bottom Quick Access -->
            <section
              class="mx-4 mt-4 grid grid-cols-2 gap-3 pb-6 md:grid-cols-4"
            >
              <NuxtLink
                v-for="item in quickAccess"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-4 rounded-xl p-4 shadow-sm backdrop-blur transition hover:shadow-lg"
              >
                <Icon
                  :name="item.icon"
                  :class="['h-8 w-8', item.iconClass]"
                />

                <div>
                  <h3 class="font-bold">
                    {{ item.title }}
                  </h3>

                  <p class="text-xs text-gray-500">
                    {{ item.description }}
                  </p>
                </div>
              </NuxtLink>
            </section>
         </div>
         <!-- appState.showSecond: {{ appState.showSecond}} appState.currentPage:{{}} -->

           <div      :class="{ active: appState.showSecond }" class=" page second w-full  bg-ambe  bg- -100 h-full"> 

             <div class=" h-full " v-if="appState.currentPage  === 'UTME'">
              <PracticeUTME @gohome="closeBook"/>
             
             </div>

             <div v-if="appState.currentPage === 'DICTIONARY'">
              
              <DictionarySearch   @gohome="closeBook"/>
             </div>

             <div class=" h-full " v-if="appState.currentPage === 'RESULTS'">
                <ResultHistory @gohome="closeBook"/>
              
             </div>

             <div  v-if="appState.currentPage === 'LESSON'">
              <lessonViewer @gohome="closeBook"/>
             
             </div>

             <div  v-if="appState.currentPage === 'QuestionSearch'">
              <QuestionSearch @gohome="closeBook"/>
             
             </div>
              <div  v-if="appState.currentPage === 'CLASS'">
              <Classroom @gohome="closeBook"/>
             
             </div>
           </div>
    </main>
  </div>
  </div>
</template>

<script setup>

definePageMeta({
  layout: 'main'
})  
const video = ref(null)
const stream = ref(null)
const error = ref('')
const page = ref('')
const appState = useAppState()

console.log(appState.value, 'ddddd')
const dashboardItems = [
  {
    title: 'Practice for UTME',
    description: 'Prepare for JAMB CBT',
    icon: 'lucide:rocket',
    class: 'bg-indigo-100 text-indigo-900',
    route: '/practice/utme',
    component:'UTME'
  },
  {
    title: 'Practice for WAEC',
    description: 'Master WAEC past questions',
    icon: 'lucide:book-open',
    class: 'bg-pink-100 text-pink-900',
    route: '/practice/waec',
     component:'DICTIONARY'
  },
  {
  title: 'Result History',
  description: 'View all your past practice and exam results',
  icon: 'lucide:clipboard-list',
  class: 'bg-indigo-100 text-indigo-900',
  route: 'results-history',
  component:'RESULTS'
},
  {
    title: 'Classroom',
    description: 'Learn from expert teachers',
    icon: 'lucide:school',
    class: 'bg-blue-100 text-blue-900',
    component:'CLASS',
    route: '/classroom'
  },
  {
    title: 'Marketplace',
    description: 'Discover courses and teachers',
    icon: 'lucide:store',
     component:'QuestionSearch',
    class: 'bg-purple-100 text-purple-900',
    route: '/marketplace'
  },
  {
    title: 'Past Questions',
    description: 'Practice previous exam questions',
    icon: 'lucide:file-question',
    component:'Clasroom',
    class: 'bg-orange-100 text-orange-900',
    route: '/past-questions'
  }
]

const slides = [
  {
    title: 'Prepare. Practice. Succeed.',
    description:
      'Build your confidence with thousands of practice questions and expert lessons.',
    button: 'Start Practicing',
    image: '/image/student.jpg'
  },
  {
    title: 'Learn from Expert Teachers',
    description:
      'Join teachers, explore courses and learn at your own pace.',
    button: 'Explore Marketplace',
    image: '/image/teacher.jpg'
  },
  {
    title: 'Your Exam Success Starts Here',
    description:
      'Prepare for UTME, WAEC, NECO and other examinations.',
    button: 'Explore Exams',
    image: '/image/exam.jpg'
  }
]


const quickAccess = [
  {
    to: '/performance',
    icon: 'lucide:chart-no-axes-combined',
    iconClass: 'text-blue-600',
    title: 'Performance',
    description: 'Track your progress'
  },
  {
    to: '/leaderboard',
    icon: 'lucide:trophy',
    iconClass: 'text-yellow-600',
    title: 'Leaderboard',
    description: 'See top students'
  },
  {
    to: '/quizzes',
    icon: 'lucide:brain',
    iconClass: 'text-purple-600',
    title: 'Quizzes',
    description: 'Test your knowledge'
  },
  {
    to: '/teachers',
    icon: 'lucide:users',
    iconClass: 'text-green-600',
    title: 'Teachers',
    description: 'Find expert teachers'
  }
]
const currentSlide = ref(0)

const nextSlide = () => {
  currentSlide.value =
    (currentSlide.value + 1) % slides.length
}

import { ref } from "vue"

// const showSecond = ref(false)

const openBook = (item) => {
  console.log();
  
  appState.value.currentPage = item.component
  console.log(item.component, appState.value.currentPage, ' page.value');
  
  appState.value.showSecond = true
}

const closeBook = () => {
  console.log('close');
  appState.value.showSecond = false
  text.value =" it working in live "
}

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
}
</script>
<style scoped>
.book {
  position: relative;
 

  perspective: 1800px;
  
}

.page {
  position: absolute;
  inset: 0;



  transition: transform 900ms ease,
              opacity 900ms ease;

  transform-style: preserve-3d;
}

/* Home page */

.home {
  z-index: 2;
  transform-origin: left center;
}

/* Flip like a book */

.home.open {
  transform: rotateY(-110deg);
  opacity: 0;
}

/* Second page */

.second {
  z-index: 1;

  opacity: 0;

  transform: translateX(80px);
  transition: all .9s ease;
}

.second.active {
  opacity: 1;
  transform: translateX(0);
}
</style >
