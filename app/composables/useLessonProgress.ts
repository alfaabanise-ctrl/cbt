import { ref, computed } from 'vue'

const STORAGE_KEY = 'lesson-progress'

export const useLessonProgress = () => {
  const lessonProgress = ref<Record<string, any>>({})

  const pendingSeconds = ref(0)
  const lastStorageSave = ref(0)

  const readingSeconds = ref(0)
  const estimatedReadingMinutes = ref(1)
  const readingTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const readingCompleted = ref(false)

  /*
  |--------------------------------------------------------------------------
  | READING CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const requiredReadingSeconds = computed(() => {
    return Math.max(
      60,
      Math.ceil(estimatedReadingMinutes.value * 60 * 0.8)
    )
  })

  const requiredReadingMinutes = computed(() => {
    return Math.ceil(requiredReadingSeconds.value / 60)
  })

  const readingProgressPercent = computed(() => {
    if (!requiredReadingSeconds.value) return 0

    return Math.min(
      100,
      Math.round(
        (readingSeconds.value / requiredReadingSeconds.value) * 100
      )
    )
  })

  const remainingReadingSeconds = computed(() => {
    return Math.max(
      0,
      requiredReadingSeconds.value - readingSeconds.value
    )
  })

  const remainingReadingMinutes = computed(() => {
    return Math.ceil(remainingReadingSeconds.value / 60)
  })

  /*
  |--------------------------------------------------------------------------
  | LESSON KEY
  |--------------------------------------------------------------------------
  */

  const lessonKey = (lesson: any) => {
    return String(
      lesson?.id ||
        lesson?._id ||
        lesson?.lessonId ||
        lesson?.slug ||
        ''
    )
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD PROGRESS
  |--------------------------------------------------------------------------
  */

  const loadLessonProgress = () => {
    if (!import.meta.client) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      lessonProgress.value = saved
        ? JSON.parse(saved)
        : {}
    } catch (error) {
      console.error('Failed to load lesson progress:', error)
      lessonProgress.value = {}
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE PROGRESS
  |--------------------------------------------------------------------------
  */

  const saveLessonProgress = () => {
    if (!import.meta.client) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lessonProgress.value)
      )

      lastStorageSave.value = Date.now()
    } catch (error) {
      console.error('Failed to save lesson progress:', error)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SUBJECT RECORD
  |--------------------------------------------------------------------------
  */

  const getSubjectRecord = (subjectSlug: string) => {
    if (!subjectSlug) return null

    if (!lessonProgress.value[subjectSlug]) {
      lessonProgress.value[subjectSlug] = {
        totalSubjectProgress: 0,
        lessons: {},
      }
    }

    if (!lessonProgress.value[subjectSlug].lessons) {
      lessonProgress.value[subjectSlug].lessons = {}
    }

    return lessonProgress.value[subjectSlug]
  }

  /*
  |--------------------------------------------------------------------------
  | LESSON RECORD
  |--------------------------------------------------------------------------
  */

  const getLessonRecord = (
    subjectSlug: string,
    lesson: any
  ) => {
    const key = lessonKey(lesson)

    if (!subjectSlug || !key) return null

    const subject = getSubjectRecord(subjectSlug)

    return (
      subject?.lessons?.[key] || {
        read: false,
        timeSpent: 0,
        lastRead: null,
      }
    )
  }

  const ensureLessonRecord = (
    subjectSlug: string,
    lesson: any
  ) => {
    const key = lessonKey(lesson)

    if (!subjectSlug || !key) return null

    const subject = getSubjectRecord(subjectSlug)

    if (!subject) return null

    if (!subject.lessons[key]) {
      subject.lessons[key] = {
        read: false,
        timeSpent: 0,
        lastRead: null,
      }
    }

    return subject.lessons[key]
  }

  /*
  |--------------------------------------------------------------------------
  | LESSON HELPERS
  |--------------------------------------------------------------------------
  */

  const getLessonTime = (
    subjectSlug: string,
    lesson: any
  ) => {
    return Number(
      getLessonRecord(subjectSlug, lesson)?.timeSpent || 0
    )
  }

  const isLessonRead = (
    subjectSlug: string,
    lesson: any
  ) => {
    return Boolean(
      getLessonRecord(subjectSlug, lesson)?.read
    )
  }

  /*
  |--------------------------------------------------------------------------
  | SUBJECT PROGRESS
  |--------------------------------------------------------------------------
  | Reads the already saved totalSubjectProgress.
  | It does not recalculate the percentage.
  |--------------------------------------------------------------------------
  */

  const getSubjectProgress = (subjectSlug: string) => {
    return Math.round(
      Number(
        lessonProgress.value[subjectSlug]?.totalSubjectProgress || 0
      )
    )
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE LESSON PROGRESS
  |--------------------------------------------------------------------------
  | When a lesson changes from unread to read:
  | totalSubjectProgress increases by 100 / totalLessons.
  |--------------------------------------------------------------------------
  */

  const saveLessonProgressRecord = (
    subjectSlug: string,
    lesson: any,
    progressData: {
      read?: boolean
      timeSpent?: number
      lastRead?: string | null
    },
    totalLessons: number
  ) => {
    const subject = getSubjectRecord(subjectSlug)

    if (!subject) return

    const id = lessonKey(lesson)

    if (!id) return

    const previousRecord = subject.lessons[id]

    const wasAlreadyRead = previousRecord?.read === true

    subject.lessons[id] = {
      ...previousRecord,
      ...progressData,
    }

    /*
     * Increase only once when lesson becomes read.
     */
    if (
      progressData.read === true &&
      !wasAlreadyRead &&
      totalLessons > 0
    ) {
      const increase = 100 / totalLessons

      subject.totalSubjectProgress = Math.min(
        100,
        Number(subject.totalSubjectProgress || 0) + increase
      )
    }

    saveLessonProgress()
  }

  /*
  |--------------------------------------------------------------------------
  | ADD READING TIME
  |--------------------------------------------------------------------------
  */

  const addReadingTime = (
    subjectSlug: string,
    lesson: any,
    seconds = 1
  ) => {
    if (!subjectSlug || !lesson || seconds <= 0) return

    const record = ensureLessonRecord(
      subjectSlug,
      lesson
    )

    if (!record) return

    record.timeSpent =
      Number(record.timeSpent || 0) + seconds

    record.lastRead = new Date().toISOString()

    pendingSeconds.value += seconds

    if (
      pendingSeconds.value >= 5 ||
      Date.now() - lastStorageSave.value >= 10000
    ) {
      saveLessonProgress()
      pendingSeconds.value = 0
    }
  }

  const flushReadingTime = () => {
    if (!pendingSeconds.value) return

    saveLessonProgress()
    pendingSeconds.value = 0
  }

  /*
  |--------------------------------------------------------------------------
  | MARK LESSON AS READ
  |--------------------------------------------------------------------------
  */

  const markLessonAsRead = (
    subjectSlug: string,
    lesson: any,
    totalLessons: number
  ) => {
    const record = ensureLessonRecord(
      subjectSlug,
      lesson
    )

    if (!record) return

    const wasAlreadyRead = record.read === true

    record.read = true
    record.lastRead = new Date().toISOString()

    /*
     * Update total subject percentage only once.
     */
    if (
      !wasAlreadyRead &&
      totalLessons > 0
    ) {
      const subject = getSubjectRecord(subjectSlug)

      if (subject) {
        const increase = 100 / totalLessons

        subject.totalSubjectProgress = Math.min(
          100,
          Number(subject.totalSubjectProgress || 0) + increase
        )
      }
    }

    readingCompleted.value = true

    saveLessonProgress()
    pendingSeconds.value = 0

    stopReadingTimer()
  }

  /*
  |--------------------------------------------------------------------------
  | READING TEXT
  |--------------------------------------------------------------------------
  */

  const getLessonText = (lesson: any) => {
    if (!lesson) return ''

    const blocks = Array.isArray(lesson.blocks)
      ? lesson.blocks
          .map((block: any) => {
            if (typeof block === 'string') {
              return block
            }

            return [
              block?.content,
              block?.text,
              block?.body,
              block?.description,
              block?.title,
            ]
              .filter(Boolean)
              .join(' ')
          })
          .join(' ')
      : ''

    return [
      lesson.title,
      lesson.content,
      lesson.body,
      lesson.description,
      blocks,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const calculateReadingTime = (lesson: any) => {
    const textContent = getLessonText(lesson)

    const wordCount = textContent
      ? textContent.split(/\s+/).filter(Boolean).length
      : 180

    estimatedReadingMinutes.value = Math.max(
      1,
      Math.ceil(wordCount / 150)
    )
  }

  /*
  |--------------------------------------------------------------------------
  | TIMER
  |--------------------------------------------------------------------------
  */

  const stopReadingTimer = () => {
    if (readingTimer.value) {
      clearInterval(readingTimer.value)
      readingTimer.value = null
    }

    flushReadingTime()
  }

  const startReadingTimer = (
    subjectSlug: string,
    lesson: any,
    totalLessons: number
  ) => {
    if (
      !import.meta.client ||
      !lesson ||
      readingTimer.value ||
      readingCompleted.value
    ) {
      return
    }

    if (isLessonRead(subjectSlug, lesson)) {
      readingCompleted.value = true
      return
    }

    readingTimer.value = setInterval(() => {
      if (
        document.hidden ||
        readingCompleted.value
      ) {
        return
      }

      readingSeconds.value += 1

      addReadingTime(
        subjectSlug,
        lesson,
        1
      )

      if (
        readingSeconds.value >=
        requiredReadingSeconds.value
      ) {
        markLessonAsRead(
          subjectSlug,
          lesson,
          totalLessons
        )
      }
    }, 1000)
  }

  const resetReadingTracker = (
    subjectSlug: string,
    lesson: any,
    totalLessons: number
  ) => {
    stopReadingTimer()

    pendingSeconds.value = 0
    readingCompleted.value = false

    calculateReadingTime(lesson)

    readingSeconds.value = getLessonTime(
      subjectSlug,
      lesson
    )

    if (isLessonRead(subjectSlug, lesson)) {
      readingCompleted.value = true

      readingSeconds.value = Math.max(
        readingSeconds.value,
        requiredReadingSeconds.value
      )

      return
    }

    startReadingTimer(
      subjectSlug,
      lesson,
      totalLessons
    )
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT TIME
  |--------------------------------------------------------------------------
  */

  const formatReadingTime = (seconds = 0) => {
    const totalSeconds = Math.max(
      0,
      Math.floor(seconds)
    )

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    )

    const remainingSeconds = totalSeconds % 60

    if (hours > 0) {
      return [
        hours,
        minutes,
        remainingSeconds,
      ]
        .map((value) =>
          String(value).padStart(2, '0')
        )
        .join(':')
    }

    return [
      minutes,
      remainingSeconds,
    ]
      .map((value) =>
        String(value).padStart(2, '0')
      )
      .join(':')
  }

  return {
    lessonProgress,

    readingSeconds,
    estimatedReadingMinutes,
    readingCompleted,

    requiredReadingSeconds,
    requiredReadingMinutes,
    readingProgressPercent,
    remainingReadingSeconds,
    remainingReadingMinutes,

    lessonKey,

    loadLessonProgress,
    saveLessonProgress,

    getSubjectRecord,
    getLessonRecord,
    ensureLessonRecord,

    getLessonTime,
    isLessonRead,
    getSubjectProgress,

    saveLessonProgressRecord,

    addReadingTime,
    flushReadingTime,
    markLessonAsRead,

    startReadingTimer,
    stopReadingTimer,
    resetReadingTracker,

    formatReadingTime,
  }
}