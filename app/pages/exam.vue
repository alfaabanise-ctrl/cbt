<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import { getCurrentWindow } from "@tauri-apps/api/window"

const appWindow = getCurrentWindow()
const appState = useAppState()
const questionStartTime = ref(0)
const currentSubject = ref({})
const currentQuestion  = ref({})
const Submitted =  ref(false)
const showExamReport = ref(false)
const showSubmitModal = ref(false)
const { save, load,histories } = useExamHistory()
const activeSubject = ref(
  appState.selectedSubjects?.[0]?.id || null
)
const groupedSubjects = ref([])


function startQuestionTimer() {
  questionStartTime.value = Date.now()
}
function saveQuestionTime() {
  if (!currentQuestion.value || Submitted.value) return

  const seconds = Math.floor(
    (Date.now() - questionStartTime.value) / 1000
  )

  console.log(
    "Saving",
    currentQuestion.value.index,
    seconds
  )

  currentQuestion.value.timeSpent =
    (currentQuestion.value.timeSpent || 0) + seconds
}
const selectSubject = (subject) => {
  activeSubject.value = subject.id

  const selectedSubject =
    groupedSubjects.value.find(
      item => item.id === subject.id
    )
  
  currentSubject.value =  selectedSubject ?? null
    currentQuestion.value =  currentSubject.value.questions[ currentSubject.value.currentQuestion -1 ] 
    
}
const goToQuestion = (index) => {
  try {
    saveQuestionTime()
    currentQuestion.value = currentSubject.value.questions[index]
   
   currentSubject.value.currentQuestion= index + 1
    startQuestionTimer()
  } catch (error) {
    console.log(error)
  }
}

const previous = () => {
  if (currentSubject.value.currentQuestion <= 1) {
    return
  }
   saveQuestionTime()

  currentSubject.value.currentQuestion--

  currentQuestion.value =
    currentSubject.value.questions[
      currentSubject.value.currentQuestion - 1
    ]
     startQuestionTimer()
}

const next = () => {
  saveQuestionTime()

  // Still have questions in this subject
  if (
    currentSubject.value.currentQuestion <
    currentSubject.value.questions.length
  ) {
    currentSubject.value.currentQuestion++

    currentQuestion.value =
      currentSubject.value.questions[
        currentSubject.value.currentQuestion - 1
      ]

    startQuestionTimer()
    return
  }

  // ===========================
  // Last question reached
  // Move to next subject
  // ===========================

  const currentIndex = groupedSubjects.value.findIndex(
    subject => subject.id === currentSubject.value.id
  )

  const nextSubject =
    groupedSubjects.value[currentIndex + 1]

  if (!nextSubject) {
    // No more subjects
    return
    // or submitExam()
  }

  activeSubject.value = nextSubject.id
  currentSubject.value = nextSubject
  currentSubject.value.currentQuestion = 1
  currentQuestion.value = nextSubject.questions[0]

  startQuestionTimer()
}

const isLastQuestion = computed(() => {
  const subjectIndex = groupedSubjects.value.findIndex(
    s => s.id === currentSubject.value.id
  )

  return (
    subjectIndex === groupedSubjects.value.length - 1 &&
    currentSubject.value.currentQuestion >=
      currentSubject.value.questions.length
  )
})



  

 
  
//   await appWindow.setDecorations(false)
//   await appWindow.setResizable(false)
//   await appWindow.setFullscreen(true)
//   await appWindow.setAlwaysOnTop(true)

const leave = async ()=> {
     await navigateTo('/')
}


/////// For Time Calculation
const timer = ref(null)

const examDuration = ref(null)
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
function startExam() {
  if (!Submitted.value) {
     timer.value.start()
  }
 
}



const submitExam = async () => {
  // Save latest question time
  saveQuestionTime()

  // Flatten all questions
  appState.value.examQuestions = groupedSubjects.value.flatMap(
    subject => subject.questions
  )

  Submitted.value = true

  const questions = appState.value.examQuestions

  let total = questions.length
  let answered = 0
  let correct = 0
  let wrong = 0

  // Reset subject statistics
  groupedSubjects.value.forEach(subject => {
    subject.total = subject.questions.length
    subject.answered = 0
    subject.correct = 0
    subject.wrong = 0
    subject.score = 0
    subject.maxScore = 0
  })

  // Calculate statistics
  questions.forEach(question => {
    const subject = groupedSubjects.value.find(
      s => s.id === question.subject
    )

    if (!subject) return

    if (question.userAnswer) {
      answered++
      subject.answered++

      if (question.userAnswer === question.answer) {
        correct++
        subject.correct++
      } else {
        wrong++
        subject.wrong++
      }
    }
  })

  const unanswered = total - answered

  // ==================================
  // JAMB MARK CALCULATION (2.5 marks/question)
  // ==================================

  let aggregate = 0
  let maxAggregate = 0

  groupedSubjects.value.forEach(subject => {
     // JAMB total questions for this subject
  const jambQuestions =
      subject.id === "english" ? 60 : 40
      
        
    // Score out of 100
    subject.score = Number(
      ((subject.correct / jambQuestions) * 100).toFixed(2)
    )

    
    subject.maxScore = Number(
      ((subject.questions.length / jambQuestions) * 100).toFixed(2)
    )

    aggregate += subject.score
    maxAggregate += subject.maxScore
  })


aggregate = Number(aggregate.toFixed(2))
maxAggregate = Number(maxAggregate.toFixed(2))

  // Overall percentage (optional)
  const percentage = Number(
    ((correct / Math.max(total, 1)) * 100).toFixed(2)
  )

  // ==================================
  // TIME CALCULATIONS
  // ==================================

  timer.value.stop()

  const totalDuration = timeToSeconds(
    appState.value.examSettings.duration
  )

  const timeLeft = timer.value.timeLeft || 0

  const durationUsed = totalDuration - timeLeft

  const hours = Math.floor(durationUsed / 3600)
  const minutes = Math.floor((durationUsed % 3600) / 60)
  const seconds = durationUsed % 60

  const timeSpent =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`

  const speed = Number(
    (
      correct /
      Math.max(durationUsed / 60, 1)
    ).toFixed(2)
  )

  const timePercent = Math.min(
    Math.round((durationUsed / totalDuration) * 100),
    100
  )
  
  const result = {
    total,
    answered,
    unanswered,
    correct,
    wrong,

    // Overall percentage
    percentage,
    timestart: groupedSubjects.value.startingDate,
    // Total score and maximum possible score
    aggregate,
    maxAggregate,

    // Subjects with individual scores
    subjects: groupedSubjects.value,

    totalDuration,
    durationUsed,
    timeSpent,
    timePercent,
    speed
  }



await save({

    result,

    questions: appState.value.examQuestions,

    settings: appState.value.examSettings

})
  appState.value.examResult = result

  showExamReport.value = true
}

// function pauseExam() {
//   timer.value.pause()
// }

// function resumeExam() {
//   timer.value.resume()
// }

// function stopExam() {
//   timer.value.stop()
// }

// function resetExam() {
//   timer.value.reset()
// }

// // Reset to 30 minutes
// function reset30Minutes() {
//   timer.value.reset(1800)
// }

// Reset to 5 minutes
// function reset5Minutes() {
//   timer.value.reset(300)
// }

// function addOneMinute() {
//   timer.value.timeLeft += 60
// }

// function removeOneMinute() {
//   timer.value.timeLeft -= 60
// }
// const currentTime = ref(0)

// function ticking(seconds) {
//   currentTime.value = seconds
// }

function timeFinished() {
  submitExam()
  // alert("Exam Finished!")
  
}

// import { onMounted, onBeforeUnmount } from "vue"
function selectAnswer(letter) {
  if (!currentQuestion.value) return

  const options = currentQuestion.value.options || {}

  const key = Object.keys(options).find(
    k => k.toLowerCase() === letter.toLowerCase()
  )

  if (key) {
    currentQuestion.value.userAnswer = key
  }
}
///KEY HANDLING
function preventRefresh(e) {
  if (
    e.key === "F5" ||
    (e.ctrlKey && e.key.toLowerCase() === "r")
  ) {
    e.preventDefault()
  }
}


function handleKeyboard(event) {
  // Don't trigger shortcuts while typing
  const tag = document.activeElement?.tagName

  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    document.activeElement?.isContentEditable
  ) {
    return
  }

  const key = event.key.toLowerCase()

  
  switch (key) {
    case "n":
      next()
      break

    case "p":
      previous()
      break
    case "arrowright":
      next()
      break
    case "arrowleft":
      previous()
      break

    case "a":
      selectAnswer("A")
      break

    case "b":
      selectAnswer("B")
      break

    case "c":
      selectAnswer("C")
      break

    case "d":
      selectAnswer("D")
      break

    case "e":
      selectAnswer("E")
      break
  }
}



///KEY HANDLING
onMounted(async () => {
  //   await appWindow.setDecorations(false)
  // await appWindow.setResizable(false)
  // await appWindow.setFullscreen(true)
  // await appWindow.setAlwaysOnTop(true)
  window.addEventListener("keydown", handleKeyboard)
   window.addEventListener("keydown", preventRefresh)
    document.addEventListener("contextmenu", e => {
    e.preventDefault()
  })

  document.addEventListener("dragstart", e => {
  e.preventDefault()
})

function preventShortcuts(e) {
  const key = e.key.toLowerCase()

  if (
    e.key === "F5" ||
    (e.ctrlKey && ["r", "u", "s", "p"].includes(key)) ||
    e.key === "F12"
  ) {
    e.preventDefault()
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
   
  }
})


})

const startingDate = ref(null)

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyboard)
   window.removeEventListener("keydown", preventRefresh)
})
const currentTime = ref(0)

function ticking(seconds) {
  currentTime.value = seconds
}
function timeToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number)

  return (hours * 3600) + (minutes * 60) + seconds
}

onMounted( async () => {
  
  // await load()
  // console.log(histories.value);
  
  const  examDuration= timeToSeconds(appState.value.examSettings.duration);
    
      
    // if (!appState.value.selectedSubjects?.length) return
  
     
  
   


    let globalIndex = 1
      if (appState.value.selectedSubjects?.length> 0 &&  !appState.value.reviewQuestions) {
         activeSubject.value =  appState.value.selectedSubjects[0].id
         groupedSubjects.value = appState.value.selectedSubjects.map(subject => {

        const subjectQuestions =   appState.value.examQuestions.filter(q => q.subject === subject.id).map(question => ({
              ...question,
              index: globalIndex++,
              answered: false,
              
            }))

        return {
          ...subject,
          currentQuestion: 1,
          answered: 0,
         
          questions: subjectQuestions
        }
      })
      }

       if (appState.value.selectedSubjectsView?.length >0 &&  appState.value.reviewQuestions) {
         activeSubject.value =  appState.value.selectedSubjectsView[0].id
         groupedSubjects.value = appState.value.selectedSubjectsView.map(subject => {

        const subjectQuestions =   appState.value.examQuestionsView.filter(q => q.subject === subject.id).map(question => ({
              ...question,
              index: globalIndex++,
              answered: false,
              
            }))
             Submitted.value = true

        return {
          ...subject,
          currentQuestion: 1,
          answered: 0,
         
          questions: subjectQuestions
        }
      })
      }
     
     startingDate.value =   new Date().toISOString(),
      currentSubject.value = groupedSubjects.value[0] 
      currentQuestion.value = currentSubject.value.questions[0]
    startQuestionTimer()
      timer.value.start()
      
})
onBeforeUnmount(async () => {
 
   
  await appWindow.setFullscreen(false)
  await appWindow.setDecorations(true)
  await appWindow.setResizable(true)
  await appWindow.setAlwaysOnTop(false)
})


const getQuestionClass = (question, index) => {
  if (Submitted) {
    if (question.answer === question.userAnswer) {
      return " bg-green-600 text-primary text-white"
    }

    if (question.status !== question.userAnswer) {
      return "bg-red-500 text-white"
    }

    return "bg-orange-500 text-white"
  }

  
 
}


///FOr Exam Summary 


</script>

<template>
  <div class="min-h-screen w-screen bg-white">

 <div class="   px sm:px-6 lg:px-8 w-fit right-0 mt-2 fixed h-12  flex justify-end item-center  px-0 z-100"> 
    <ExamSubmitModal
    v-model="showSubmitModal"
    @submit="submitExam"
  />

 <ExamTimer
    ref="timer"
    :duration="timeToSeconds(appState.examSettings.duration)"
    :auto-start="false"
    @finished="timeFinished"
    @tick="ticking"
  />

  </div>
    <NavigationExamNavBar />
     <!-- ================================= -->
    <!-- RESULT TEMPLATE -->
    <!-- ================================= -->

    <div v-if="showExamReport" class=" fixed w-full bg-black/40 z-50 flex h-dvh justify-center items-center ">
        <div class="  min-w-[80%] flex flex-col rounded-sm  overflow-auto max-w-3xl  h-[80%] bg-white ">

   
        <!-- ================================= -->
        <!-- HEADER -->
        <!-- ================================= -->

          <div
            class="flex  h-12  items-center justify-between bg-primary px-6 py-1 text-white"
          >

            <h2 class="text-lg font-semibold">
              Examination Report
            </h2>


            <!-- CLOSE -->

            <button
              type="button"
              @click="showExamReport = false"
              class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/20"
            >
            
              <Icon
                name="lucide:x"
                class="  text-2xl text-white font-semibold "
              />

            </button>

          </div>
         <div  class="flex-1 overflow-scroll">
              <ExamSummarySection
              :score="Math.round(appState.examResult.aggregate)"
                :total="Math.round(appState.examResult.maxAggregate)"
                :time="appState.examResult.timeSpent"
                :time-percent="appState.examResult.timePercent"
                :speed="appState.examResult.speed"
              /> 
               <ExamResultSlip
              username="WAHEED"
              :examDetails="appState.examResult || {}"
              :startingDate="startingDate"
              :subjects=" appState.examResult.subjects || []"
              
            />
             <ExamTopicRort
             :questions="appState.examResult.subjects" 
             
              
            />
            </div>
           
        </div>
    
    </div>
   
    <!-- ================================= -->
        <!-- HEAD FOR SUBJECT SELECTION TEMPLATE -->
        <!-- ================================= -->

    <!-- Subject Tabs -->
    <div
      class="flex items-end h-10  px-14 border-b-2 border-b-primary overflow-x-auto"
    >
      <button
   v-for="subject in appState.reviewQuestions
  ? appState.selectedSubjectsView
  : appState.selectedSubjects || []"
        :key="subject.id"
        @click="selectSubject(subject)"
        :class="[
          'pt-1 pb-1 px-7 flex items-end text-sm font-bold whitespace-nowrap',
          activeSubject === subject.id
            ? 'exam-tab text-white'
            : 'text-primary'
        ]"
      >
        {{ subject?.name || 'no define' }}
      </button>
    </div>
      <!-- ================================= -->
        <!-- MAIN TEMPLATE -->
        <!-- ================================= -->

    <main class="flex w-full h-[calc(100vh-104px)] overflow-hidden">

      <!-- Left -->
           <section
              class="w-1/4  border-r border-slate-200 p-4 overflow-y-auto"
            >
              <div class="flex justify-between text-gray-500 font-semibold mb-6">
                <h3 class="font- text-sm">
                  Attempt: {{currentSubject?.questions?.filter( question => question.userAnswer  ).length }}/{{ currentSubject?.questions?.length }}
                 </h3>

               
              </div>
              

               
              
              
                <div class="grid grid-cols-5 gap-3">
                

                      <button
                        v-for="(question, index) in currentSubject?.questions"
                        :key="question.id"
                        @click="goToQuestion(index)"
                        :class="[
                          'h-12 rounded-lg hidden text-sm transition-all',

                          currentSubject.currentQuestion === index + 1 && question.userAnswer
                            ? 'border-2 border-blue-500 bg-blue-200 text-primary'

                            : currentSubject.currentQuestion === index + 1
                              ? 'border-2 border-blue-500 text-blue-700'

                              : question.userAnswer
                                ? 'bg-blue-200 text-primary'

                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        ]"
                        
                      >
                        {{ index + 1 }} 
                      </button>
                </div>

                 <div  class="grid grid-cols-5 gap-3">
                

                     <button
                        v-for="(question, index) in currentSubject.questions"
                        :key="question.sourceId"
                        @click="goToQuestion(index)"
                        :class="[
                          'h-12 cursor-pointer w-full rounded-sm flex flex-col overflow-hidden text-sm transition-all',
                          currentSubject.currentQuestion === index + 1 && question.userAnswer
                            ? 'border-2 border-blue-500 bg-blue-200 text-primary'
                            : currentSubject.currentQuestion === index + 1
                              ? 'border-2 border-blue-500 text-blue-700'
                              : question.userAnswer
                                ? 'bg-blue-200 text-primary'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        ]"
                      >
                        <!-- Question Number -->
                        <div class="flex-1 flex items-center justify-center font-bold">
                          {{ index + 1 }}
                        </div>

                        <!-- Time -->
                        <div v-if="Submitted"
                          :class="[
                            'mt-auto h-4 w-full flex items-center justify-center text-[10px] text-white',
                            getQuestionClass(question, index)
                          ]"
                        >
                          {{ question.timeSpent || 0 }}s
                        </div>
                      </button>
                </div>
                
            </section>

      <!-- Right -->
     
      
        <!-- Content -->
        <!-- {{currentQuestion}} -->

         <section class="flex-1 p-5 flex    w-full ">
              <div class="flex-1 flex  flex-col justify-between     items-baseline">
              <div class=" flex-1  overflow-y-auto w-full">
                <h3 class=" font-semibold text-gr mb-4 text-[clamp(14px,1vw,18px)] t">
               
                      Question: {{ currentSubject?.currentQuestion }}/{{  currentSubject?.questions?.length }}  
                    </h3>
                <div class=" mx-auto">
                    <img :src="currentQuestion?.imageUrl" class=" mb-3" v-if="currentQuestion?.imageUrl"/>
                  <h2 class=" text-[17px] font-medium fontum mb-5">
                    {{ currentQuestion?.question ||  currentQuestion?.text }}   
                  </h2>
                  

                
                  

                  <div class="space-y-1">
                  

                      <label  :key="key"  class="flex items-center gap-2 cursor-pointer rounded-xl p-2 transition-all"
                        v-for="([key, value]) in Object.entries(currentQuestion?.options || {})"
                      >
                        <input  type="radio"  :value="key"  class="hidden" :disabled="Submitted"
                        v-model="currentQuestion.userAnswer"  />

                        <!-- Icons -->
                        <Icon  name="lucide:check"  class="h-5 w-5 text-green-600"
                          v-if="Submitted && key === currentQuestion.answer"    />

                        <Icon  v-else-if=" Submitted && key === currentQuestion.userAnswer &&    currentQuestion.userAnswer !== currentQuestion.answer   "
                          name="lucide:x" class="h-5 w-5 text-red-600"/> 

                        <!-- Option Letter -->
                        <div   class="flex h-7 w-7 items-center justify-center rounded-full border-2 font-bold uppercase transition-all"
                          :class="[
                            Submitted && key === currentQuestion.answer
                              ? 'border-green-600 bg-green-600 text-white'

                            : Submitted &&
                              key === currentQuestion.userAnswer &&
                              currentQuestion.userAnswer !== currentQuestion.answer
                              ? 'border-red-600 bg-red-600 text-white'

                            : currentQuestion.userAnswer === key
                              ? 'border-primary bg-primary text-white'

                            : 'border-slate-300 text-slate-600'
                          ]"
                        >
                          {{ key }}
                        </div>

                        <!-- Text -->
                        <span
                          class="flex-1 text-[17px] font-medium text-slate-800"
                          :class="[
                            Submitted && key === currentQuestion.answer
                              ? 'text-green-700 font-bold'

                            : Submitted &&
                              key === currentQuestion.userAnswer &&
                              currentQuestion.userAnswer !== currentQuestion.answer
                              ? 'text-red-700 font-bold'
                              : ''
                          ]"
                        >
                          {{ value }}
                        </span>

                        
                      </label>

                      
                  </div>

                  <!-- <p class="mt-6 font-bold">
                    Selected Answer: {{ currentQuestion.userAnswer }}
                  </p> -->
                    <div v-if="Submitted" class="  mt-3">
                      <h3 class=" font-semibold text-xl  mt-3 mb-2 text-[clamp(14px,1vw,18px)] t">
                        Explanation
                        </h3>
                        <h3 class=" font-semibold ">Topic: <span class="  font-medium ">{{currentQuestion?.topic}}</span></h3>
                      <p class=" mt-5">{{currentQuestion?.solution}}</p>
                    </div>
              </div>
              </div>
                <!-- Below Buttons -->
              <div class="mt- flex h-8 bg-amber-00 w-full justify-between gap-4">
                  <div class="flex gap-2">
                    <button
                        @click="previous"
                        :disabled="currentSubject?.currentQuestion <= 1"
                        class="flex items-center gap-2 px-6 py-1 rounded-sm bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="lucide:chevron-left" class="w-5 text-lg font-bold h-5" />
                        Previous
                      </button>

                      <button
                        @click="next"
                        :disabled="currentSubject?.currentQuestion >= currentSubject?.questions?.length"
                        class="flex items-center gap-2 px-4 hover:bg-amber-500 py-1 rounded-sm  bg-green-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <Icon name="lucide:chevron-right" class="w-5 h-5" />
                      </button>

                        <button  v-if="Submitted"
                            @click="showExamReport = true"
                          
                            class="flex items-center gap-2 px-4 hover:bg-amber-500 py-1 rounded-sm bg-orange-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Result
                          
                          </button>
                    </div>

                     <button
                    @click="showSubmitModal = true"
                   v-if="!Submitted"
                    class="flex items-center gap-2 px-4 hover:bg-amber-500 py-1 rounded-sm bg-orange-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  
                  </button>
                <!-- <button
                  @click="leave"
                  class="px-8 py-3 rounded-lg bg-red-500 text-white font-bold"
                >
                  End Exam
                </button> -->
              </div>
              
            </div>

          </section>
      

    </main>
    <ExamSubmitmodel/>
  </div>
</template>

<style>
.exam-tab{
    

    background-image:url("~/assets/images/icons/tab1.svg"); 
    background-repeat:no-repeat;
    background-size:100% 100%;
    background-position:center;

    border:none;
    
   
}


</style>

