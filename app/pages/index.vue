<template>
  <!-- PAGE BACKGROUND -->

  <div
    class="page-background"
    style="background-image: url('/image/background.png')"
  >
  <NavigationNavbar 
   @dictionary="openBook({ component: 'DICTIONARY' })" 
     @bookmarks="openBook({ component: 'BOOKMARKS' })"
      @leaderboard="openBook({ component: 'LEADERBOARD' })" 
   />
    <!-- BACKGROUND OVERLAY -->
    <div class="page-overlay  mt-20 sm:mt-10 pt-28">
      
      <!-- MAIN BOOK CONTAINER -->
      <main class="book">
        <!-- ================= HOME PAGE ================= -->
        <section
          :class="{ open: appState.showSecond }"
          class="page home"
        >
          <!-- TOP ACTIVATION BAR -->
          <section class="activation-bar">
            <!-- Welcome -->
            <div class="welcome-section">
              <div class="welcome-icon">
                <Icon
                  name="lucide:triangle-alert"
                  class="h-4 w-4 sm:h-5 sm:w-5"
                />
              </div>

              <span class="welcome-text">
                Welcome to your learning journey  
              </span>
            </div>

            <!-- Activation Buttons -->
            <div class="activation-actions">
              <span class="premium-label">
                Unlock Premium Learning
              </span>

              <button
                type="button"
                class="activate-button"
                @click="openBook({ component: 'ACTIVATEPRODUCT' })"
              >
                Activate
              </button>
            </div>
          </section>

          <!-- ================= MAIN DASHBOARD ================= -->
          <section class="dashboard">
            <!-- FEATURE CARDS -->
            <div class="feature-cards">
              <button
                v-for="item in dashboardItems"
                :key="item.title"
                type="button"
                class="feature-card group"
                :class="item.class"
                @click="openBook(item)"
              >
                <Icon
                  :name="item.icon"
                  class="feature-icon transition-transform duration-200 group-hover:scale-110"
                />

                <h2 class="feature-title">
                  {{ item.title }}
                </h2>

                <p class="feature-description">
                  {{ item.description }}
                </p>
              </button>
            </div>

            <!-- CAROUSEL -->
            <div class="carousel-wrapper">
              <!-- Desktop and Tablet Carousel -->
              <div class="desktop-carousel">
                <UiCarousel />
              </div>

              <!-- Mobile Carousel -->
              <div class="mobile-carousel">
                <UiCarousel2 />
              </div>
            </div>
          </section>

          <!-- ================= QUICK ACCESS ================= -->
          <section class="quick-access">
            <div
              v-for="item in quickAccess"
              :key="item.to"
              class="quick-access-item"
            >
              <Icon
                :name="item.icon"
                :class="['h-6 w-6 shrink-0', item.iconClass]"
              />

              <div class="min-w-0">
                <h3 class="truncate text-xs font-bold">
                  {{ item.title }}
                </h3>

                <p class="truncate text-[10px] text-gray-500">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </section>
        </section>

        <!-- ================= SECOND PAGE ================= -->
        <section
          :class="{ active: appState.showSecond }"
          class="page  second"
        >
          <!-- UTME -->
          <div
            v-if="appState.currentPage === 'UTME'"
            class="page-content"
          >
            <PracticeUTME @gohome="closeBook" />
          </div>

          <!-- DICTIONARY / WAEC -->
          <div
            v-else-if="appState.currentPage === 'DICTIONARY'"
            class="page-content"
          >
            <DictionarySearch @gohome="closeBook" />
          </div>

          <!-- RESULTS -->
          <div
            v-else-if="appState.currentPage === 'RESULTS'"
            class="page-content"
          >
            <ResultHistory @gohome="closeBook" />
          </div>

          <!-- ACTIVATION -->
          <div
            v-else-if="appState.currentPage === 'ACTIVATEPRODUCT'"
            class="page-content"
          >
            <ActivateProduct @gohome="closeBook" />
          </div>

          <!-- LESSON -->
          <div
            v-else-if="appState.currentPage === 'LESSON'"
            class="page-content"
          >
            <!-- <lessonViewer @gohome="closeBook" /> -->
          </div>

          <!-- QUESTION SEARCH -->
          <div
            v-else-if="appState.currentPage === 'QuestionSearch'"
            class="page-content"
          >
            <QuestionSearch @gohome="closeBook" />
          </div>

          <!-- CLASSROOM -->
          <div
            v-else-if="appState.currentPage === 'CLASS'"
            class="page-content"
          >
            <Classroom @gohome="closeBook" />
          </div>
           <div
            v-else-if="appState.currentPage === 'LEADERBOARD'"
            class="page-content"
          >
            <Leaderboard @gohome="closeBook" />
          </div>
           <div
            v-else-if="appState.currentPage === 'BOOKMARKS'"
            class="page-content"
          >
            <Bookmarks @gohome="closeBook" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// definePageMeta({
//   layout: "main",
// });

const appState = useAppState();
const auth = useExamTipsAuth();

const currentUser = computed(() => {
  return auth.user?.value || auth.user || {}
})
/*
|--------------------------------------------------------------------------
| Dashboard Items
|--------------------------------------------------------------------------
*/

const dashboardItems = [
  {
    title: "Practice for UTME",
    description: "Prepare for JAMB CBT",
    icon: "lucide:rocket",
    class: "bg-indigo-100 text-indigo-900",
    route: "/practice/utme",
    component: "UTME",
  },
   {
    title: "Classroom",
    description: "Learn from expert teachers",
    icon: "lucide:school",
    class: "bg-blue-100 text-blue-900",
    route: "/classroom",
    component: "CLASS",
  },
{
  title: "Dictionary",
  description: "Discover meanings, synonyms and new words",
  icon: "lucide:book-open",
  class: "bg-pink-100 text-pink-900",
  route: "/dictionary",
  component: "DICTIONARY",
},

  {
    title: "Result History",
    description: "View your past practice and exam results",
    icon: "lucide:clipboard-list",
    class: "bg-indigo-100 text-indigo-900",
    route: "/results-history",
    component: "RESULTS",
  },
 
  {
    title: "Question Bank",
    description: "Discover courses and teachers",
    icon: "lucide:store",
    class: "bg-purple-100 text-purple-900",
    route: "/marketplace",
    component: "QuestionSearch",
  },
  {
  title: "Leaderboard",
  description: "Discover meanings, synonyms and new words",
  icon: "lucide:book-open",
  class: "bg-pink-100 text-pink-900",
  route: "/dictionary",
  component: "LEADERBOARD",
},
  // {
  //   title: "Past Questions",
  //   description: "Practice previous exam questions",
  //   icon: "lucide:file-question",
  //   class: "bg-orange-100 text-orange-900",
  //   route: "/past-questions",
  //   component: "QuestionSearch",
  // },
];

/*
|--------------------------------------------------------------------------
| Carousel Slides
|--------------------------------------------------------------------------
*/

const slides = [
  {
    title: "Prepare. Practice. Succeed.",
    description:
      "Build your confidence with thousands of practice questions and expert lessons.",
    button: "Start Practicing",
    image: "/image/student.jpg",
  },
  {
    title: "Learn from Expert Teachers",
    description:
      "Join teachers, explore courses and learn at your own pace.",
    button: "Explore Marketplace",
    image: "/image/teacher.jpg",
  },
  {
    title: "Your Exam Success Starts Here",
    description:
      "Prepare for UTME, WAEC, NECO and other examinations.",
    button: "Explore Exams",
    image: "/image/exam.jpg",
  },
];

const currentSlide = ref(0);

/*
|--------------------------------------------------------------------------
| Quick Access
|--------------------------------------------------------------------------
*/

const quickAccess = [
  {
    to: "/performance",
    icon: "lucide:chart-no-axes-combined",
    iconClass: "text-blue-600",
    title: "Performance",
    description: "Track your progress",
  },
  {
    to: "/leaderboard",
    icon: "lucide:trophy",
    iconClass: "text-yellow-600",
    title: "Leaderboard",
    description: "See top students",
  },
  {
    to: "/quizzes",
    icon: "lucide:brain",
    iconClass: "text-purple-600",
    title: "Quizzes",
    description: "Test your knowledge",
  },
  {
    to: "/teachers",
    icon: "lucide:users",
    iconClass: "text-green-600",
    title: "Teachers",
    description: "Find expert teachers",
  },
];

/*
|--------------------------------------------------------------------------
| Carousel Controls
|--------------------------------------------------------------------------
*/

const nextSlide = () => {
  currentSlide.value =
    (currentSlide.value + 1) % slides.length;
};

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length;
};

/*
|--------------------------------------------------------------------------
| Open Page
|--------------------------------------------------------------------------
*/

const openBook = (item) => {
  if (!item?.component) return;

  appState.value.currentPage = item.component;
  appState.value.showSecond = true;
};

/*
|--------------------------------------------------------------------------
| Close Page
|--------------------------------------------------------------------------
*/

const closeBook = () => {
  appState.value.showSecond = false;
};
</script>

<style scoped>
/*
|--------------------------------------------------------------------------
| PAGE BACKGROUND
|--------------------------------------------------------------------------
*/

.page-background {
  display: flex;
  min-height: 100dvh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
}

.page-overlay {
  display: flex;
  min-height: 100dvh;
  width: 100%;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  background: rgb(0 0 0 / 10%);
  padding: 0.5rem;
}

/*
|--------------------------------------------------------------------------
| BOOK CONTAINER
|--------------------------------------------------------------------------
*/

.book {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: calc(100dvh - 1rem);
  overflow: hidden;
  border-radius: 0.75rem;
  perspective: 1800px;
  box-shadow:
    0 20px 45px rgb(0 0 0 / 18%);
}

/*
|--------------------------------------------------------------------------
| PAGE STRUCTURE
|--------------------------------------------------------------------------
*/

.page {
  position: absolute;
  inset: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  transition:
    transform 900ms ease,
    opacity 900ms ease;
  transform-style: preserve-3d;
}

/*
|--------------------------------------------------------------------------
| HOME PAGE
|--------------------------------------------------------------------------
*/

.home {
  z-index: 2;
  display: flex;
  flex-direction: column;
  transform-origin: left center;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0.5rem;
}

.home.open {
  transform: rotateY(-110deg);
  opacity: 0;
}

/*
|--------------------------------------------------------------------------
| ACTIVATION BAR
|--------------------------------------------------------------------------
*/

.activation-bar {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 35%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
  backdrop-filter: blur(8px);
}

.welcome-section {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.welcome-icon {
  display: flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #facc15;
  color: white;
}

.welcome-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #15803d;
  font-size: 9px;
  font-weight: 600;
}

.activation-actions {
  display: flex;
  min-width: 0;
  flex-shrink: 0;
  align-items: center;
  gap: 0.35rem;
}

.premium-label {
  display: none;
  border-radius: 0.5rem;
  background: #facc15;
  padding: 0.5rem 0.75rem;
  color: #111827;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.activate-button {
  border-radius: 9999px;
  background: #f97316;
  padding: 0.35rem 0.65rem;
  color: white;
  font-size: 10px;
  font-weight: 700;
  transition: background 200ms ease;
}

.activate-button:hover {
  background: #ea580c;
}

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

.dashboard {
  display: flex;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  margin-top: 0.5rem;
}

/*
|--------------------------------------------------------------------------
| FEATURE CARDS
|--------------------------------------------------------------------------
*/

.feature-cards {
  order: 2;
  display: grid;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.feature-card {
  display: flex;
  min-height: 0;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.65rem;
  padding: 0.4rem;
  text-align: center;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgb(0 0 0 / 10%);
}

.feature-icon {
  height: 1.65rem;
  width: 1.65rem;
  flex-shrink: 0;
  margin-bottom: 0.25rem;
}

.feature-title {
  font-size: 9px;
  font-weight: 800;
  line-height: 1.2;
}

.feature-description {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.25rem;
  font-size: 8px;
  line-height: 1.25;
  opacity: 0.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/*
|--------------------------------------------------------------------------
| CAROUSEL
|--------------------------------------------------------------------------
*/

.carousel-wrapper {
  order: 1;
  min-height: 120px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 0.75rem;
  background: #020617;
}

.desktop-carousel {
  display: none;
  height: 100%;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.mobile-carousel {
  display: block;
  height: 160px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

/*
|--------------------------------------------------------------------------
| QUICK ACCESS
|--------------------------------------------------------------------------
*/

.quick-access {
  display: none;
  width: 100%;
  max-width: 100%;
  flex-shrink: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  margin-top: 0.5rem;
}

.quick-access-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background: #fffbeb;
  padding: 0.5rem;
  box-shadow: 0 2px 6px rgb(0 0 0 / 5%);
}

/*
|--------------------------------------------------------------------------
| SECOND PAGE
|--------------------------------------------------------------------------
*/

.second {
  z-index: 1;
  opacity: 0;
  transform: translateX(80px);
  overflow-x: hidden;
  overflow-y: auto;
  background: transparent;
}

.second.active {
  opacity: 1;
  transform: translateX(0);
}

.page-content {
  min-height: 100%;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

/*
|--------------------------------------------------------------------------
| TABLET AND DESKTOP
|--------------------------------------------------------------------------
*/

@media (min-width: 640px) {
  .page-overlay {
    padding: 1rem;
  }

  .book {
    height: 85vh;
    max-width: 70%;
    margin-top: 1.5rem;
  }

  .home {
    padding: 0.75rem 1rem;
  }

  .activation-bar {
    margin-top: 0.5rem;
    padding: 0.75rem 1.25rem;
  }

  .welcome-icon {
    height: 2.5rem;
    width: 2.5rem;
  }

  .welcome-text {
    font-size: 13px;
  }

  .activate-button {
    padding: 0.5rem 0.75rem;
    font-size: 12px;
  }

  .dashboard {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .feature-cards {
    gap: 0.75rem;
  }

  .feature-card {
    border-radius: 0.75rem;
    padding: 0.75rem;
  }

  .feature-icon {
    height: 2.25rem;
    width: 2.25rem;
    margin-bottom: 0.5rem;
  }

  .feature-title {
    font-size: 14px;
  }

  .feature-description {
    font-size: 11px;
  }

  .carousel-wrapper {
    min-height: 160px;
  }

  .mobile-carousel {
    height: 160px;
  }
}

@media (min-width: 768px) {
  .premium-label {
    display: block;
  }

  .book {
    height: 80vh;
  }

  .dashboard {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-cards {
    order: 1;
  }

  .carousel-wrapper {
    order: 2;
    height: 100%;
    min-height: 0;
  }

  .desktop-carousel {
    display: block;
  }

  .mobile-carousel {
    display: none;
  }

  .quick-access {
    display: grid;
  }
}

@media (min-width: 1024px) {
  .book {
    height: 75vh;
    max-width: 70%;
  }
}

/*
|--------------------------------------------------------------------------
| Extra Overflow Protection
|--------------------------------------------------------------------------
*/

:deep(*) {
  box-sizing: border-box;
  max-width: 100%;
}

:deep(img),
:deep(video),
:deep(canvas),
:deep(iframe) {
  max-width: 100%;
}
</style>