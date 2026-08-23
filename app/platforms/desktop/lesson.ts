import Database from "@tauri-apps/plugin-sql"

let lessonsDb: Awaited<ReturnType<typeof Database.load>> | null = null

async function getLessonsDB() {
  if (!lessonsDb) {
    lessonsDb = await Database.load("sqlite:lessons.db")
  }

  return lessonsDb
}

export async function beginTransaction() {
  const database = await getLessonsDB()
  await database.execute('BEGIN TRANSACTION')
}

export async function commitTransaction() {
  const database = await getLessonsDB()
  await database.execute('COMMIT')
}

export async function rollbackTransaction() {
  const database = await getLessonsDB()
  await database.execute('ROLLBACK')
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

  const lesson = (rows as Record<string, any>[])[0]

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



export async function subjectExists(subjectId: number){
  const database = await getLessonsDB()
  const rows = await database.select<{ id: number }[]>(
    'SELECT id FROM subjects WHERE id = ? LIMIT 1',
    [subjectId]
  )
  return rows.length > 0
}

export async function topicExists(topicId: string) {
  const database = await getLessonsDB()
  const rows = await database.select<{ id: number }[]>(
    'SELECT id FROM topics WHERE id = ? LIMIT 1',
    [topicId]
  )
  return rows.length > 0
}

export async function lessonExists(lessonId: String) {
  const database = await getLessonsDB()
  const rows = await database.select<{ id: number }[]>(
    'SELECT id FROM lessons WHERE id = ? LIMIT 1',
    [lessonId]
  )
  return rows.length > 0
}

export async function getMaxTopicNumber(subjectId: String) {
  const database = await getLessonsDB()
  const rows = await database.select<{ n: number }[]>(
    'SELECT COALESCE(MAX(CAST(topic_number AS INTEGER)), 0) AS n FROM topics WHERE subject_id = ?',
    [subjectId],
  )
  return Number(rows?.[0]?.n || 0)
}

export async function getMaxTopicOrder(subjectId: String) {
  const database = await getLessonsDB()
  const rows = await database.select<{ n: number }[]>(
    'SELECT COALESCE(MAX(order_index), -1) AS n FROM topics WHERE subject_id = ?',
    [subjectId],
  )
  return Number(rows?.[0]?.n ?? -1)
}

export async function getTopic(topicId: String) {
  const database = await getLessonsDB()
  const rows = await database.select<{
    id: number
    subject_id: number
    topic_number: number
    title: string
    order_index: number
  }[]>(
    'SELECT id, subject_id, topic_number, title, order_index FROM topics WHERE id = ? LIMIT 1',
    [topicId],
  )
  return (rows as Record<string, any>[])[0] || null
}

export async function ensureTopic({
  topicId,
  subjectId,
  topicNumber,
  title,
  orderIndex,
}: {
  topicId: string
  subjectId: number
  topicNumber: number
  title: string
  orderIndex: number
}) {
  const database = await getLessonsDB()
  const existing = await getTopic(topicId)

  if (existing) {
    await database.execute('UPDATE topics SET subject_id = ?, title = ? WHERE id = ?', [
      subjectId,
      title,
      topicId,
    ])
    return 'existing'
  }

  await database.execute(
    'INSERT INTO topics (id, subject_id, topic_number, title, order_index) VALUES (?, ?, ?, ?, ?)',
    [topicId, subjectId, String(topicNumber), title, orderIndex],
  )
  return 'inserted'
}


export async function getTopicByTitle(subjectId: any, title: any) {
  const database = await getLessonsDB()
  const rows = await database.select<{
    id: number
    subject_id: number
    topic_number: number
    title: string
    order_index: number
  }[]>(
    'SELECT id, subject_id, topic_number, title, order_index FROM topics WHERE subject_id = ? AND lower(trim(title)) = lower(trim(?)) LIMIT 1',
    [subjectId, title],
  )
  return rows?.[0] || null
}

export async function getMaxLessonOrder(topicId: any) {
  const database = await getLessonsDB()
  const rows = await database.select<{ n: number }[]>(
    'SELECT COALESCE(MAX(order_index), -1) AS n FROM lessons WHERE topic_id = ?',
    [topicId],
  )
  return Number(rows?.[0]?.n ?? -1)
}

export async function ensureSubject(subjectName: unknown, subjectId: unknown, icon: any) {
  const database = await getLessonsDB()
  const existing = await database.select<{ id: any; name: string; icon: string | null }[]>(
    'SELECT id, name, icon FROM subjects WHERE id = ? LIMIT 1',
    [subjectId],
  )

  if (existing.length) {
    await database.execute('UPDATE subjects SET name = ?, icon = ? WHERE id = ?', [
      subjectName,
      icon || null,
      subjectId,
    ])
    return 'existing'
  }

  await database.execute('INSERT INTO subjects (id, name, icon) VALUES (?, ?, ?)', [
    subjectId,
    subjectName,
    icon || null,
  ])
  return 'inserted'
}


export async function verifyImport(subjectId: any) {
  const database = await getLessonsDB()

  const subjects = await database.select(
    `SELECT id, name, icon FROM subjects WHERE id = ? LIMIT 1`,
    [subjectId],
  ) as any[]

  const topics = await database.select(
    `SELECT id, subject_id, topic_number, title, order_index FROM topics WHERE subject_id = ? ORDER BY order_index ASC`,
    [subjectId],
  ) as any[]

  const lessons = await database.select(
    `SELECT id, topic_id, subject_id, topic_number, slug, title, summary, blocks, search_text, order_index FROM lessons WHERE subject_id = ? ORDER BY topic_id ASC, order_index ASC`,
    [subjectId],
  ) as any[]

  const result = {
    subjectCount: subjects.length,
    topicCount: topics.length,
    lessonCount: lessons.length,
    subjects,
    topics,
    lessons,
  }

  console.log('========== SQLITE IMPORT VERIFICATION ==========')

  console.log('Subject:', subjects)
  console.log('Topics:', topics.length)
  console.log('Lessons:', lessons.length)
  console.log('Verification:', result)

  return result
}

export async function getDatabaseTables() {
  const database = await getLessonsDB()

  const tables = await database.select(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)

  return tables
}

export async function getLessonId(lessonId: any) {
  const database = await getLessonsDB()
  const rows = await database.select(
    'SELECT id, topic_id, subject_id, topic_number, slug, title, summary, blocks, search_text, order_index FROM lessons WHERE id = ? LIMIT 1',
    [lessonId],
  )
  return rows?.[0] || null
}

export async function rebuildFTS() {
  try {
     const database = await getLessonsDB()
    const fts = await database.select(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'lessons_fts' LIMIT 1",
    )
    if (!fts.length) {
      console.log('lessons_fts does not exist. FTS rebuild skipped.')
      return false
    }
    await database.execute("INSERT INTO lessons_fts(lessons_fts) VALUES ('rebuild')")
    console.log('lessons_fts rebuilt successfully.')
    return true
  } catch (error) {
    console.warn('FTS rebuild skipped:', error)
    return false
  }
}

interface LessonUpsertRow {
  id: number
  topic_id: number
  subject_id: number
  topic_number: number
  slug: string
  title: string
  summary: string
  blocks: string
  search_text: string
  order_index: number
}

export async function upsertLesson(row: LessonUpsertRow): Promise<'updated' | 'inserted'> {
  const database = await getLessonsDB()
  const existing = await getLessonId(row.id)

  if (existing) {
    await database.execute(
      `UPDATE lessons SET
        topic_id = ?, subject_id = ?, topic_number = ?, slug = ?, title = ?, summary = ?, blocks = ?, search_text = ?, order_index = ?
      WHERE id = ?`,
      [
        row.topic_id,
        row.subject_id,
        row.topic_number,
        row.slug,
        row.title,
        row.summary,
        row.blocks,
        row.search_text,
        row.order_index,
        row.id,
      ],
    )
    return 'updated'
  }

  await database.execute(
    `INSERT INTO lessons (id, topic_id, subject_id, topic_number, slug, title, summary, blocks, search_text, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.topic_id,
      row.subject_id,
      row.topic_number,
      row.slug,
      row.title,
      row.summary,
      row.blocks,
      row.search_text,
      row.order_index,
    ],
  )
  return 'inserted'
}