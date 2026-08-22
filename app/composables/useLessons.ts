// import Database from "@tauri-apps/plugin-sql"
// import { resolveResource } from "@tauri-apps/api/path"
// import { ref } from 'vue'

// let lessonsDb = null

// async function getLessonsDB() {
//   if (!lessonsDb) {
//      lessonsDb = await Database.load('sqlite:lessons.db')
//   }
//   return lessonsDb
// }

// export function useLessons() {

//   const sidebar        = ref([])   // [{ id, name, icon, topics: [{ id, title, lessons: [{id,slug,title}] }] }]
//   const currentLesson  = ref(null) // includes .blocks — an ordered array of typed content blocks
//   const results          = ref([]) // search results
//   const loading          = ref(false)
//   const error             = ref(null)

//   // ----- build the full sidebar tree (subjects -> topics -> lesson titles) --

//   const loadSidebar = async () => {
//     loading.value = true
//     try {
//       const db = await getLessonsDB()

//       const subjects = await db.select(`SELECT id, name, icon FROM subjects`)
//       console.log(subjects, 'subjects');
      
//       const topics    = await db.select(`SELECT id, subject_id, title FROM topics ORDER BY order_index`)
//       const lessons    = await db.select(`SELECT id, topic_id, slug, title FROM lessons ORDER BY order_index`)

//       sidebar.value = subjects.map((subject) => ({
//         ...subject,
//         topics: topics
//           .filter((t) => t.subject_id === subject.id)
//           .map((topic) => ({
//             ...topic,
//             lessons: lessons.filter((l) => l.topic_id === topic.id)
//           }))
//       }))
//     } catch (err) {
//       console.error('❌ load sidebar error:', err)
//       error.value = err
//     } finally {
//       loading.value = false
//     }
//   }

//   // ----- load one lesson (by slug) plus its worked examples ------------------

//   const loadLesson = async (slug) => {
//     loading.value = true
//     error.value = null

//     try {
//       const db = await getLessonsDB()

//       const rows = await db.select(
//         `SELECT * FROM lessons WHERE slug = ? LIMIT 1`,
//         [slug]
//       )

//       if (!rows.length) {
//         currentLesson.value = null
//         return null
//       }

//       currentLesson.value = {
//         ...rows[0],
//         blocks: rows[0].blocks ? JSON.parse(rows[0].blocks) : []
//       }

//       return currentLesson.value
//     } catch (err) {
//       console.error('❌ load lesson error:', err)
//       error.value = err
//       return null
//     } finally {
//       loading.value = false
//     }
//   }

//   // ----- previous / next lesson within the same topic -------------------------

//   const adjacentLesson = async (direction = 'next') => {
//     if (!currentLesson.value) return null
//     const db = await getLessonsDB()

//     const comparator = direction === 'next' ? '>' : '<'
//     const order = direction === 'next' ? 'ASC' : 'DESC'

//     const rows = await db.select(
//       `SELECT slug, title FROM lessons
//        WHERE topic_id = ? AND order_index ${comparator} ?
//        ORDER BY order_index ${order}
//        LIMIT 1`,
//       [currentLesson.value.topic_id, currentLesson.value.order_index]
//     )

//     return rows[0] || null
//   }

//   // ----- full-text search across all lessons ------------------------------------

//   const search = async (term, limit = 20) => {
//     const query = term?.trim()
//     if (!query) {
//       results.value = []
//       return
//     }

//     loading.value = true
//     try {
//       const db = await getLessonsDB()
//       const ftsQuery = query.split(/\s+/).filter(Boolean).map((w) => `${w}*`).join(' ')

//       results.value = await db.select(
//         `SELECT l.slug, l.title, l.summary, s.name AS subjectName,
//                 snippet(lessons_fts, 2, '⟦', '⟧', '…', 10) AS snippet
//          FROM lessons_fts
//          JOIN lessons l ON l.rowid = lessons_fts.rowid
//          JOIN subjects s ON s.id = l.subject_id
//          WHERE lessons_fts MATCH ?
//          ORDER BY rank
//          LIMIT ?`,
//         [ftsQuery, limit]
//       )
//     } catch (err) {
//       console.error('❌ lesson search error:', err)
//       error.value = err
//       results.value = []
//     } finally {
//       loading.value = false
//     }
//   }

//   return {
//     sidebar,
//     currentLesson,
//     results,
//     loading,
//     error,
//     loadSidebar,
//     loadLesson,
//     adjacentLesson,
//     search
//   }
// }
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

    loading.value = true
    error.value = null

    try {

      sidebar.value = await platform.lesson.getSidebar()

    } catch (err) {

      console.error(
        "❌ load sidebar error:",
        err
      )

      error.value = err

    } finally {

      loading.value = false
    }
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

  const adjacentLesson = async (
    direction: "next" | "previous" = "next"
  ) => {

    if (!currentLesson.value) {
      return null
    }

    return await platform.lesson.lesson.getAdjacentLesson(
      currentLesson.value.topic_id,
      currentLesson.value.order_index,
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