import Database from "@tauri-apps/plugin-sql"
import { resolveResource } from "@tauri-apps/api/path"

/**
 * ============================================================
 * LESSONS DATABASE
 * ============================================================
 */

type LessonsDatabase = Awaited<
  ReturnType<typeof Database.load>
>

let lessonsDb: LessonsDatabase | null = null
let initializationPromise: Promise<void> | null = null

/**
 * ============================================================
 * DATABASE 1 — APPLICATION DATABASE
 * ============================================================
 */

async function getLessonsDB(): Promise<LessonsDatabase> {

  if (!lessonsDb) {

    console.log("📦 Opening application lessons.db...")

    lessonsDb = await Database.load(
      "sqlite:lessons.db"
    )

    console.log(
      "✅ Application lessons.db opened"
    )
  }

  return lessonsDb
}

/**
 * ============================================================
 * DATABASE 2 — BUNDLED DATABASE
 *
 * This is ONLY used during initialization/import.
 * getSidebar() will NEVER use this.
 * ============================================================
 */

async function getBundledLessonsDB(): Promise<LessonsDatabase> {

  console.log(
    "📦 Resolving bundled lessons.db..."
  )

  const dbPath =
    await resolveResource(
      "resources/lessons.db"
    )

  console.log(
    "📍 Bundled database:",
    dbPath
  )

  const db =
    await Database.load(
      `sqlite:${dbPath}`
    )

  console.log(
    "✅ Bundled lessons.db opened"
  )

  return db
}

/**
 * ============================================================
 * CREATE TABLES
 * ============================================================
 */

async function ensureTables(): Promise<void> {

  const db = await getLessonsDB()

  console.log(
    "🛠️ Creating lessons.db tables..."
  )

  /**
   * SUBJECTS
   */
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    )
  `)

  /**
   * TOPICS
   */
  await db.execute(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      topic_number TEXT,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL
    )
  `)

  /**
   * LESSONS
   */
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      topic_number TEXT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      blocks TEXT,
      search_text TEXT,
      order_index INTEGER NOT NULL
    )
  `)

  /**
   * INDEXES
   */

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_topics_subject_id
    ON topics(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_lessons_topic_id
    ON lessons(topic_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_lessons_subject_id
    ON lessons(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_lessons_order_index
    ON lessons(order_index)
  `)

  console.log(
    "✅ lessons.db tables ready"
  )
}

/**
 * ============================================================
 * CLEAR ALL DATA
 *
 * TESTING ONLY
 *
 * This does NOT delete the tables.
 * It only removes their rows.
 * ============================================================
 */

export async function clearLessonsDatabase(): Promise<void> {

  const db = await getLessonsDB()

  console.log(
    "🧹 Clearing lessons database..."
  )

  await db.execute("BEGIN TRANSACTION")

  try {

    /**
     * Delete children first.
     */
    await db.execute(
      "DELETE FROM lessons"
    )

    await db.execute(
      "DELETE FROM topics"
    )

    await db.execute(
      "DELETE FROM subjects"
    )

    await db.execute(
      "COMMIT"
    )

    console.log(
      "✅ subjects table empty"
    )

    console.log(
      "✅ topics table empty"
    )

    console.log(
      "✅ lessons table empty"
    )

    console.log(
      "🎉 Lessons database completely empty"
    )

  } catch (error) {

    await db.execute(
      "ROLLBACK"
    )

    console.error(
      "❌ Failed to clear lessons database:",
      error
    )

    throw error
  }
}

/**
 * ============================================================
 * LOAD BUNDLED DATA
 *
 * DATABASE 2 → DATABASE 1
 *
 * This happens ONLY during initialization.
 * ============================================================
 */

async function loadBundledLessons(): Promise<void> {

  const db = await getLessonsDB()
  const bundledDb = await getBundledLessonsDB()

  console.log(
    "📥 Loading bundled curriculum..."
  )

  /**
   * ----------------------------------------------------------
   * LOAD SUBJECTS
   * ----------------------------------------------------------
   */

  const subjects =
    await bundledDb.select<{
      id: string
      name: string
      icon: string | null
    }[]>(`
      SELECT
        id,
        name,
        icon
      FROM subjects
      ORDER BY id
    `)

  /**
   * ----------------------------------------------------------
   * LOAD TOPICS
   * ----------------------------------------------------------
   */

  const topics =
    await bundledDb.select<{
      id: string
      subject_id: string
      topic_number: string | null
      title: string
      order_index: number
    }[]>(`
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index
      FROM topics
      ORDER BY subject_id, order_index
    `)

  /**
   * ----------------------------------------------------------
   * LOAD LESSONS
   * ----------------------------------------------------------
   */

  const lessons =
    await bundledDb.select<{
      id: string
      topic_id: string
      subject_id: string
      topic_number: string | null
      slug: string
      title: string
      summary: string | null
      blocks: string | null
      search_text: string | null
      order_index: number
    }[]>(`
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
      ORDER BY topic_id, order_index
    `)

  console.log(
    "📦 Bundled subjects:",
    subjects.length
  )

  console.log(
    "📦 Bundled topics:",
    topics.length
  )

  console.log(
    "📦 Bundled lessons:",
    lessons.length
  )

  /**
   * ==========================================================
   * INSERT EVERYTHING INTO APPLICATION DATABASE
   * ==========================================================
   */

  await db.execute(
    "BEGIN TRANSACTION"
  )

  try {

    /**
     * SUBJECTS
     */

    for (const subject of subjects) {

      await db.execute(
        `
        INSERT OR REPLACE INTO subjects (
          id,
          name,
          icon
        )
        VALUES (?, ?, ?)
        `,
        [
          subject.id,
          subject.name,
          subject.icon
        ]
      )
    }

    console.log(
      `✅ Imported ${subjects.length} subjects`
    )

    /**
     * TOPICS
     */

    for (const topic of topics) {

      await db.execute(
        `
        INSERT OR REPLACE INTO topics (
          id,
          subject_id,
          topic_number,
          title,
          order_index
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          topic.id,
          topic.subject_id,
          topic.topic_number,
          topic.title,
          topic.order_index
        ]
      )
    }

    console.log(
      `✅ Imported ${topics.length} topics`
    )

    /**
     * LESSONS
     */

    for (const lesson of lessons) {

      await db.execute(
        `
        INSERT OR REPLACE INTO lessons (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          lesson.id,
          lesson.topic_id,
          lesson.subject_id,
          lesson.topic_number,
          lesson.slug,
          lesson.title,
          lesson.summary,
          lesson.blocks,
          lesson.search_text,
          lesson.order_index
        ]
      )
    }

    console.log(
      `✅ Imported ${lessons.length} lessons`
    )

    await db.execute(
      "COMMIT"
    )

    console.log(
      "🎉 Bundled curriculum imported successfully"
    )

  } catch (error) {

    await db.execute(
      "ROLLBACK"
    )

    console.error(
      "❌ Curriculum import failed:",
      error
    )

    throw error
  }
}

/**
 * ============================================================
 * INITIALIZE DATABASE
 * ============================================================
 *
 * EVERYTHING THAT SHOULD HAPPEN ON STARTUP GOES HERE.
 *
 * IMPORTANT:
 *
 * Change TEST_MODE to false when you no longer want
 * the database cleared/imported every startup.
 * ============================================================
 */

const TEST_MODE = true

export function initializeLessonsDatabase(): Promise<void> {

  if (!initializationPromise) {

    initializationPromise = (async () => {

      console.log(
        "🚀 Initializing lessons database..."
      )

      /**
       * 1. Create tables
       */
      await ensureTables()

      /**
       * 2. TESTING
       *
       * Empty local database first.
       */
      if (TEST_MODE) {

        console.log(
          "🧪 TEST MODE ENABLED"
        )

        await clearLessonsDatabase()

        /**
         * Optional:
         * Load bundled data after clearing.
         *
         * If you want the database to remain EMPTY
         * for testing importer, comment this out.
         */
        // await loadBundledLessons()
      }

      /**
       * 3. Normal startup import
       *
       * Uncomment when you want bundled data
       * automatically loaded.
       */

      // await loadBundledLessons()

      console.log(
        "🎓 lessons.db initialization complete"
      )

    })().catch((error) => {

      console.error(
        "❌ lessons.db initialization failed:",
        error
      )

      initializationPromise = null

      throw error
    })
  }

  return initializationPromise
}

/**
 * ============================================================
 * DATABASE READY
 * ============================================================
 */

async function readyLessonsDB(): Promise<LessonsDatabase> {

  await initializeLessonsDatabase()

  return getLessonsDB()
}

/**
 * ============================================================
 * GET RAW SUBJECT COUNT
 * ============================================================
 */

export async function getRawSubjectsCount(): Promise<number> {

  const db =
    await readyLessonsDB()

  const rows =
    await db.select<{ n: number }[]>(
      `
      SELECT COUNT(*) AS n
      FROM subjects
      `
    )

  return Number(
    rows?.[0]?.n ?? 0
  )
}

/**
 * ============================================================
 * GET SIDEBAR
 *
 * IMPORTANT:
 * ONLY READ DATA.
 *
 * NO DATABASE 2.
 * NO IMPORT.
 * NO COPY.
 * NO INITIALIZATION LOGIC.
 * ============================================================
 */

export async function getSidebar() {

  try {

    const db =
      await readyLessonsDB()

    console.log(
      "📦 Loading sidebar..."
    )

    /**
     * ========================================================
     * GET SUBJECTS
     * ========================================================
     */

    const subjects =
      await db.select<{
        id: string | number
        name: string
        icon: string | null
      }[]>(`
        SELECT
          id,
          name,
          icon
        FROM subjects
        ORDER BY id
      `)

    /**
     * ========================================================
     * GET TOPICS
     * ========================================================
     */

    const topics =
      await db.select<{
        id: string
        subject_id: string
        topic_number: string | null
        title: string
        order_index: number
      }[]>(`
        SELECT
          id,
          subject_id,
          topic_number,
          title,
          order_index
        FROM topics
        ORDER BY subject_id, order_index
      `)

    /**
     * ========================================================
     * GET LESSONS
     * ========================================================
     */

    const lessons =
      await db.select<{
        id: string
        topic_id: string
        subject_id: string
        topic_number: string | null
        slug: string
        title: string
        summary: string | null
        blocks: string | null
        search_text: string | null
        order_index: number
      }[]>(`
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
        ORDER BY topic_id, order_index
      `)

    console.log(
      "📊 Sidebar data:",
      {
        subjects: subjects.length,
        topics: topics.length,
        lessons: lessons.length
      }
    )

    /**
     * ========================================================
     * BUILD TREE
     * ========================================================
     */

    const result =
      subjects.map((subject) => {

        const subjectId =
          String(subject.id).trim()

        const subjectTopics =
          topics
            .filter((topic) =>
              subjectId ===
              String(topic.subject_id).trim()
            )
            .map((topic) => {

              const topicId =
                String(topic.id).trim()

              const topicLessons =
                lessons
                  .filter((lesson) =>
                    topicId ===
                    String(lesson.topic_id).trim()
                  )
                  .map((lesson) => ({
                    id: lesson.id,
                    topic_id: lesson.topic_id,
                    subject_id: lesson.subject_id,
                    topic_number: lesson.topic_number,
                    slug: lesson.slug,
                    title: lesson.title,
                    summary: lesson.summary,
                    blocks: lesson.blocks,
                    search_text: lesson.search_text,
                    order_index: lesson.order_index
                  }))

              return {
                id: topic.id,
                subject_id: topic.subject_id,
                topic_number: topic.topic_number,
                title: topic.title,
                order_index: topic.order_index,
                lessons: topicLessons
              }
            })

        return {
          id: subject.id,
          name: subject.name,
          icon: subject.icon,
          topics: subjectTopics
        }
      })

    console.log(
      "🌳 Sidebar ready:",
      result.length,
      "subjects"
    )

    return result

  } catch (error) {

    console.error(
      "❌ getSidebar failed:",
      error
    )

    throw error
  }
}