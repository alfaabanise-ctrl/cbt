import Database from "@tauri-apps/plugin-sql"

let lessonsDb: Awaited<ReturnType<typeof Database.load>> | null = null

async function getLessonsDB() {
  if (!lessonsDb) {
    lessonsDb = await Database.load("sqlite:lessons.db")
  }

  return lessonsDb
}

export async function getSidebar() {
  const db = await getLessonsDB()

  const subjects = await db.select(
    `SELECT id, name, icon FROM subjects`
  )

  const topics = await db.select(
    `SELECT id, subject_id, title
     FROM topics
     ORDER BY order_index`
  )

  const lessons = await db.select(
    `SELECT id, topic_id, slug, title
     FROM lessons
     ORDER BY order_index`
  )

  return subjects.map((subject: any) => ({
    ...subject,

    topics: topics
      .filter((topic: any) => topic.subject_id === subject.id)
      .map((topic: any) => ({
        ...topic,

        lessons: lessons.filter(
          (lesson: any) => lesson.topic_id === topic.id
        )
      }))
  }))
}

export async function getLesson(slug: string) {
  const db = await getLessonsDB()

  const rows = await db.select(
    `SELECT *
     FROM lessons
     WHERE slug = ?
     LIMIT 1`,
    [slug]
  )

  if (!rows.length) {
    return null
  }

  const lesson: any = rows[0]

  return {
    ...lesson,
    blocks: lesson.blocks
      ? JSON.parse(lesson.blocks)
      : []
  }
}

export async function getAdjacentLesson(
  topicId: number,
  orderIndex: number,
  direction: "next" | "previous"
) {
  const db = await getLessonsDB()

  const comparator = direction === "next" ? ">" : "<"
  const order = direction === "next" ? "ASC" : "DESC"

  const rows = await db.select(
    `SELECT slug, title
     FROM lessons
     WHERE topic_id = ?
       AND order_index ${comparator} ?
     ORDER BY order_index ${order}
     LIMIT 1`,
    [topicId, orderIndex]
  )

  return rows[0] || null
}

export async function searchLessons(
  term: string,
  limit = 20
) {
  const db = await getLessonsDB()

  const query = term.trim()

  if (!query) {
    return []
  }

  const ftsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map(word => `${word}*`)
    .join(" ")

  return await db.select(
    `SELECT
       l.slug,
       l.title,
       l.summary,
       s.name AS subjectName,
       snippet(
         lessons_fts,
         2,
         '⟦',
         '⟧',
         '…',
         10
       ) AS snippet

     FROM lessons_fts

     JOIN lessons l
       ON l.rowid = lessons_fts.rowid

     JOIN subjects s
       ON s.id = l.subject_id

     WHERE lessons_fts MATCH ?

     ORDER BY rank

     LIMIT ?`,
    [ftsQuery, limit]
  )
}