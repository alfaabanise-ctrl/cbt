
import { ref } from "vue"
import  platform from "~/platforms"

export function useLessons() {

  const sidebar = ref<any[]>([])

  const currentLesson = ref<any>(null)

  const results = ref<any[]>([])

  const loading = ref(false)

  const error = ref<any>(null)

 

  // --------------------------------------------------
  // SIDEBAR
  // --------------------------------------------------

  const loadSidebar = async () => {

    loading.value = false
    error.value = null

    try {
        // const tables = await platform.lesson.getDatabaseTables()
        // await platform.lesson.debugLessonsDatabaseLocation()
        // await platform.lesson.inspectLessonsDatabase()
      // console.log('📋 tables in db:', tables)
      // await platform.lesson.debugLessonsDB()
      // const rawSubjects = await platform.lesson.getRawSubjectsCount?.()
      // console.log('📊 subjects count (raw):', rawSubjects)

      sidebar.value = await platform.lesson.getSidebar()
      console.log(sidebar.value, 'sidebar.value');
      
    } catch (err) {

      console.error(
        "❌ load sidebar error:",
        err
      )

      error.value = err

    } finally {

      loading.value = false
    }
    console.log(loading.value,'loading.value');
    
  }

  // --------------------------------------------------
  // LESSON
  // --------------------------------------------------

  const loadLesson = async (slug: string) => {

    loading.value = true
    error.value = null

    try {

      currentLesson.value =
        await platform.lesson.getLesson(slug)

      return currentLesson.value

    } catch (err) {

      console.error(
        "❌ load lesson error:",
        err
      )

      error.value = err

      currentLesson.value = null

      return null

    } finally {

      loading.value = false
    }
  }

  // --------------------------------------------------
  // NEXT / PREVIOUS
  // --------------------------------------------------

  const adjacentLesson = async (direction: "next" | "prev" = "next" ) => {

    if (!currentLesson.value) {
      return null
    }
console.log(currentLesson.value, direction);

    return await (platform.lesson.getAdjacentLesson as any)(
      currentLesson.value.topic_id ?? currentLesson.value.topicId ,
      currentLesson.value.order_index?? currentLesson.value.orderIndex,
      direction
    )
  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const search = async (
    term: string,
    limit = 20
  ) => {

    if (!term?.trim()) {

      results.value = []

      return
    }

    loading.value = true
    error.value = null

    try {

      results.value =
        await platform.lesson.searchLessons(
          term,
          limit
        )

    } catch (err) {

      console.error(
        "❌ lesson search error:",
        err
      )

      error.value = err

      results.value = []

    } finally {

      loading.value = false
    }
  }

  return {

    sidebar,
    currentLesson,
    results,
    loading,
    error,

    loadSidebar,
    loadLesson,
    adjacentLesson,
    search
  }
}