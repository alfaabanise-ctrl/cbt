
// composables/useCurriculumMigration.ts

import Database from "@tauri-apps/plugin-sql"

export function useCurriculumMigration() {
  const isMigrating = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const result = ref<any>(null)

  /**
   * Migrate SQLite curriculum to MongoDB through the API server
   */
  async function migrateCurriculumToServer(
    serverUrl: string
  ) {
    if (isMigrating.value) {
      throw new Error("Migration is already running")
    }

    isMigrating.value = true
    progress.value = 0
    error.value = null
    result.value = null

    let db: any = null

    try {
      console.log("Opening SQLite database...")

      db = await Database.load("sqlite:lessons.db")

      progress.value = 10

      // ------------------------------------------
      // GET SUBJECTS
      // ------------------------------------------

      console.log("Loading subjects...")

      const subjects = await db.select(`
        SELECT
          id,
          name,
          icon
        FROM subjects
        ORDER BY rowid ASC
      `)

      console.log(
        `Found ${subjects.length} subjects`
      )

      progress.value = 30

      // ------------------------------------------
      // GET TOPICS
      // ------------------------------------------

      console.log("Loading topics...")

      const topics = await db.select(`
        SELECT
          id,
          subject_id,
          topic_number,
          title,
          order_index
        FROM topics
        ORDER BY
          subject_id,
          order_index ASC
      `)

      console.log(
        `Found ${topics.length} topics`
      )

      progress.value = 50

      // ------------------------------------------
      // GET LESSONS
      // ------------------------------------------

      console.log("Loading lessons...")

      const lessons = await db.select(`
        SELECT
          id,
          topic_id,
          subject_id,
          topic_number,
          slug,
          title,
          summary,
          blocks,
          search_text,
          order_index
        FROM lessons
        ORDER BY
          subject_id,
          topic_id,
          order_index ASC
      `)

      console.log(
        `Found ${lessons.length} lessons`
      )

      progress.value = 70

      // ------------------------------------------
      // SEND TO SERVER
      // ------------------------------------------

      console.log(
        "Sending curriculum to server..."
      )

      const response = await fetch(
        `${serverUrl}/api/curriculum/migrate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            subjects,
            topics,
            lessons,
          }),
        }
      )

      const serverResult = await response.json()

      if (!response.ok) {
        throw new Error(
          serverResult.message ||
          "Server migration failed"
        )
      }

      progress.value = 100

      result.value = serverResult

      console.log(
        "Migration completed:",
        serverResult
      )

      return serverResult

    } catch (err: any) {
      console.error(
        "SQLite → MongoDB migration failed:",
        err
      )

      error.value =
        err?.message ||
        "Curriculum migration failed"

      throw err

    } finally {
      isMigrating.value = false

      // Clear DB reference
      db = null
    }
  }

  return {
    isMigrating,
    progress,
    error,
    result,
    migrateCurriculumToServer,
  }
}

