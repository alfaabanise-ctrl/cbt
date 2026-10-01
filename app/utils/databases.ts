import Database from "@tauri-apps/plugin-sql"

type DatabaseName =
  | "cbt.db"
  | "questions.db"
  | "lessons.db"
  | "dictionary.db"

type SqlDatabase = Awaited<
  ReturnType<typeof Database.load>
>

const databaseConnections: Partial<
  Record<DatabaseName, SqlDatabase>
> = {}

const databasePromises: Partial<
  Record<DatabaseName, Promise<SqlDatabase>>
> = {}

let dictionaryDb: SqlDatabase | null = null
let applicationDatabasesPromise: Promise<void> | null = null


// ============================================================
// HELPER
// Check whether a table exists
// ============================================================

async function tableExists(
  db: any,
  tableName: string
): Promise<boolean> {

  const rows = await db.select(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = ?
    LIMIT 1
    `,
    [tableName]
  )

  return rows.length > 0
}


// ============================================================
// HELPER
// Check whether a column exists
// ============================================================

async function columnExists(
  db: any,
  tableName: string,
  columnName: string
): Promise<boolean> {

  const columns = await db.select(
    `
    PRAGMA table_info(${tableName})
    `
  )

  return columns.some(
    (column: any) =>
      column.name === columnName
  )
}


export async function migrateExamAnswers(
  db: SqlDatabase
): Promise<void> {
  const columns = await db.select<{ name: string }[]>(
    "PRAGMA table_info(exam_answers)"
  )
  const columnNames = new Set(
    columns.map((column) => column.name)
  )

  const migrations: Array<[string, string]> = [
    ["question", "TEXT"],
    ["answer", "TEXT"],
    ["userAnswer", "TEXT"],
    ["isCorrect", "INTEGER"],
    ["timeSpent", "INTEGER"],
    ["bookmarked", "INTEGER"]
  ]

  for (const [columnName, columnType] of migrations) {
    if (columnNames.has(columnName)) {
      continue
    }

    await db.execute(
      `ALTER TABLE exam_answers ADD COLUMN ${columnName} ${columnType}`
    )

    if (
      columnName === "answer" &&
      columnNames.has("correctAnswer")
    ) {
      await db.execute(`
        UPDATE exam_answers
        SET answer = correctAnswer
        WHERE answer IS NULL
      `)
    }
  }
}


// ============================================================
// CBT DATABASE
// cbt.db
// ============================================================

async function initializeCbtDatabase(db: any) {

  console.log("🔧 Checking cbt.db tables...")


  // ==========================================================
  // EXAM HISTORY
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_history (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      examType TEXT,
      mode TEXT,

      startTime TEXT,
      endTime TEXT,

      total INTEGER DEFAULT 0,
      answered INTEGER DEFAULT 0,
      unanswered INTEGER DEFAULT 0,

      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,

      percentage REAL DEFAULT 0,

      aggregate REAL DEFAULT 0,
      maxAggregate REAL DEFAULT 0,

      duration INTEGER DEFAULT 0,
      durationUsed INTEGER DEFAULT 0,

      timeSpent TEXT,

      speed REAL DEFAULT 0,

      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)


  // ==========================================================
  // EXAM SUBJECTS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_subjects (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      historyId INTEGER,

      subjectId TEXT,
      subjectName TEXT,

      total INTEGER DEFAULT 0,
      answered INTEGER DEFAULT 0,

      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,

      score REAL DEFAULT 0,
      maxScore REAL DEFAULT 0,

      FOREIGN KEY(historyId)
        REFERENCES exam_history(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // EXAM ANSWERS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_answers (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      historyId INTEGER,

      questionId TEXT,

      question TEXT,

      subject TEXT,

      year TEXT,

      text TEXT,

      options TEXT,

      answer TEXT,

      userAnswer TEXT,

      isCorrect INTEGER DEFAULT 0,

      timeSpent INTEGER DEFAULT 0,

      bookmarked INTEGER DEFAULT 0,

      FOREIGN KEY(historyId)
        REFERENCES exam_history(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // BOOKMARKS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      question_id TEXT NOT NULL UNIQUE,

      exam_type TEXT,

      subject TEXT,

      year TEXT,

      question_number INTEGER,

      question_text TEXT NOT NULL,

      options TEXT,

      correct_answer TEXT,

      explanation TEXT,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await migrateExamAnswers(db)


  // ==========================================================
  // INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_subjects_history
    ON exam_subjects(historyId)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_answers_history
    ON exam_answers(historyId)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_exam_answers_question
    ON exam_answers(questionId)
  `)

  console.log("✅ cbt.db ready")
}


// ============================================================
// QUESTIONS DATABASE
// questions.db
// ============================================================

async function initializeQuestionsDatabase(db: any) {

  console.log("🔧 Checking questions.db tables...")


  // ==========================================================
  // PAST QUESTIONS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (

      id TEXT PRIMARY KEY,

      examType TEXT,

      subject TEXT,

      year INTEGER,

      section TEXT,

      topic TEXT,

      category TEXT,

      difficulty TEXT,

      question TEXT,

      question_html TEXT,

      options TEXT,

      explanation TEXT,

      options_html TEXT,

      answer TEXT,

      solution TEXT,

      solution_html TEXT,

      imageUrl TEXT,

      hasPassage INTEGER DEFAULT 0,

      passage TEXT,

      passage_html TEXT,

      country TEXT,

      institution TEXT,

      state TEXT,

      source TEXT
    )
  `)


  // ==========================================================
  // QUESTIONS MIGRATIONS
  // ==========================================================

  // explanation column
  if (
    !(await columnExists(
      db,
      "questions",
      "explanation"
    ))
  ) {

    console.log(
      "➕ Adding explanation column to questions..."
    )

    await db.execute(`
      ALTER TABLE questions
      ADD COLUMN explanation TEXT
    `)

  }


  // ==========================================================
  // INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_subject
    ON questions(subject)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_topic
    ON questions(topic)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_year
    ON questions(year)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_questions_examType
    ON questions(examType)
  `)

  console.log("✅ questions.db ready")
}


// ============================================================
// LESSON DATABASE
// lessons.db
// ============================================================

async function initializeLessonsSchema(db: any) {

  console.log("🔧 Checking lessons.db tables...")


  // ==========================================================
  // SUBJECTS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subjects (

      id TEXT PRIMARY KEY,

      name TEXT NOT NULL,

      icon TEXT,

      description TEXT,

      order_index INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)


  // ==========================================================
  // SUBJECT MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasSubjectOrderIndex =
    await columnExists(
      db,
      "subjects",
      "order_index"
    )

  if (!hasSubjectOrderIndex) {

    console.log(
      "➕ Adding order_index to subjects..."
    )

    await db.execute(`
      ALTER TABLE subjects
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ subjects.order_index added"
    )
  }

  const hasSubjectDescription = await columnExists(
    db,
    "subjects",
    "description"
  )

  if (!hasSubjectDescription) {
    await db.execute(`
      ALTER TABLE subjects
      ADD COLUMN description TEXT
    `)
  }


  // ==========================================================
  // TOPICS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS topics (

      id TEXT PRIMARY KEY,

      subject_id TEXT NOT NULL,

      topic_number INTEGER,

      title TEXT NOT NULL,

      order_index INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // TOPIC MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasTopicOrderIndex =
    await columnExists(
      db,
      "topics",
      "order_index"
    )

  if (!hasTopicOrderIndex) {

    console.log(
      "➕ Adding order_index to topics..."
    )

    await db.execute(`
      ALTER TABLE topics
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ topics.order_index added"
    )
  }


  // ==========================================================
  // LESSONS
  // ==========================================================

  await db.execute(`
    CREATE TABLE IF NOT EXISTS lessons (

      id TEXT PRIMARY KEY,

      topic_id TEXT NOT NULL,

      subject_id TEXT,

      topic_number INTEGER,

      slug TEXT,

      title TEXT NOT NULL,

      summary TEXT,

      blocks TEXT,

      search_text TEXT,

      order_index INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE
    )
  `)


  // ==========================================================
  // LESSON MIGRATION
  // Add order_index to old databases
  // ==========================================================

  const hasLessonOrderIndex =
    await columnExists(
      db,
      "lessons",
      "order_index"
    )

  if (!hasLessonOrderIndex) {

    console.log(
      "➕ Adding order_index to lessons..."
    )

    await db.execute(`
      ALTER TABLE lessons
      ADD COLUMN order_index INTEGER DEFAULT 0
    `)

    console.log(
      "✅ lessons.order_index added"
    )
  }


  // ==========================================================
  // LESSON INDEXES
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_topics_subject
    ON topics(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_topics_order
    ON topics(subject_id, order_index)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_topic
    ON lessons(topic_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_subject
    ON lessons(subject_id)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_order
    ON lessons(topic_id, order_index)
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_lessons_slug
    ON lessons(slug)
  `)


  // ==========================================================
  // SUBJECT ORDER INDEX
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_subjects_order
    ON subjects(order_index)
  `)


  // ==========================================================
  // LESSON FULL TEXT SEARCH
  // ==========================================================

  const ftsExists = await tableExists(
    db,
    "lessons_fts"
  )

  if (!ftsExists) {

    console.log(
      "🔎 Creating lessons_fts..."
    )

    await db.execute(`
      CREATE VIRTUAL TABLE lessons_fts
      USING fts5(
        title,
        summary,
        search_text,
        content='lessons',
        content_rowid='rowid'
      )
    `)

    console.log(
      "✅ lessons_fts created"
    )

  } else {

    console.log(
      "✅ lessons_fts already exists"
    )
  }


  console.log("✅ lessons.db ready")
}


// ============================================================
// DICTIONARY DATABASE
// dictionary.db
// ============================================================

async function initializeDictionaryDatabase(
  db: any
) {

  console.log(
    "🔧 Checking dictionary.db tables..."
  )


  await db.execute(`
    CREATE TABLE IF NOT EXISTS dictionary (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      word TEXT NOT NULL,

      meaning TEXT,

      part_of_speech TEXT,

      example TEXT,

      has_definition INTEGER DEFAULT 1
    )
  `)


  // ==========================================================
  // DICTIONARY INDEX
  // ==========================================================

  await db.execute(`
    CREATE INDEX IF NOT EXISTS
    idx_dictionary_word
    ON dictionary(word)
  `)


  console.log(
    "✅ dictionary.db ready"
  )
}


// ============================================================
// GET CBT DATABASE
// ============================================================

async function openAndInitializeDatabase(
  name: DatabaseName,
  initialize: (db: SqlDatabase) => Promise<void>
): Promise<SqlDatabase> {
  if (databaseConnections[name]) {
    return databaseConnections[name]!
  }

  if (!databasePromises[name]) {
    databasePromises[name] = (async () => {
      const db = await Database.load(`sqlite:${name}`)

      if (name !== "dictionary.db") {
        await db.execute("PRAGMA busy_timeout = 10000")
        await db.execute("PRAGMA journal_mode = WAL")
        await db.execute("PRAGMA synchronous = NORMAL")
      }

      await initialize(db)
      databaseConnections[name] = db
      return db
    })().catch((error) => {
      delete databasePromises[name]
      throw error
    })
  }

  return databasePromises[name]!
}

function getInitializedDatabase(name: DatabaseName): Promise<SqlDatabase> {
  const db = databaseConnections[name]
  if (!db) {
    throw new Error(
      `${name} has not been initialized. Initialize application databases during desktop startup first.`
    )
  }

  return Promise.resolve(db)
}

export function getDB(): Promise<SqlDatabase> {
  return getInitializedDatabase("cbt.db")
}


// ============================================================
// GET QUESTIONS DATABASE
// ============================================================

export function getQuestionsDB(): Promise<SqlDatabase> {
  return getInitializedDatabase("questions.db")
}


// ============================================================
// GET LESSON DATABASE
// ============================================================

export function getLessonsDB(): Promise<SqlDatabase> {
  return getInitializedDatabase("lessons.db")
}


// ============================================================
// GET DICTIONARY DATABASE
// ============================================================

export async function getDictDB(): Promise<SqlDatabase> {
  if (!dictionaryDb) {
    dictionaryDb = await Database.load("sqlite:dictionary.db")
    await initializeDictionaryDatabase(dictionaryDb)
  }

  return dictionaryDb
}

export function getDatabase(
  connectionString: string
): Promise<SqlDatabase> {
  switch (connectionString) {
    case "sqlite:cbt.db":
    case "cbt.db":
      return getDB()
    case "sqlite:questions.db":
    case "questions.db":
      return getQuestionsDB()
    case "sqlite:lessons.db":
    case "lessons.db":
      return getLessonsDB()
    case "sqlite:dictionary.db":
    case "dictionary.db":
      return getDictDB()
    default:
      throw new Error(
        `Unsupported database connection: ${connectionString}`
      )
  }
}

export async function initializeDatabase(): Promise<void> {
  await openAndInitializeDatabase(
    "cbt.db",
    initializeCbtDatabase
  )
}

export async function initializeLessonsDatabase(): Promise<void> {
  await openAndInitializeDatabase(
    "lessons.db",
    initializeLessonsSchema
  )
}

export function initializeDatabases(): Promise<void> {
  if (!applicationDatabasesPromise) {
    applicationDatabasesPromise = Promise.all([
      openAndInitializeDatabase("cbt.db", initializeCbtDatabase),
      openAndInitializeDatabase(
        "questions.db",
        initializeQuestionsDatabase
      ),
      openAndInitializeDatabase(
        "lessons.db",
        initializeLessonsSchema
      )
    ]).then(() => undefined).catch((error) => {
      applicationDatabasesPromise = null
      throw error
    })
  }

  return applicationDatabasesPromise
}

export async function debugCBTDatabaseLocation() {
  const db = await getDB()
  const result = await db.select("PRAGMA database_list")

  console.log(
    "📍 CBT DATABASE LOCATION:",
    JSON.stringify(result, null, 2)
  )

  return result
}


// ============================================================
// DEBUG DATABASE LOCATION
// ============================================================

export async function debugDatabases() {

  const databases = [

    {
      name: "cbt.db",
      db: await getDB()
    },

    {
      name: "questions.db",
      db: await getQuestionsDB()
    },

    {
      name: "lessons.db",
      db: await getLessonsDB()
    },

    {
      name: "dictionary.db",
      db: await getDictDB()
    }

  ]


  for (
    const database of databases
  ) {

    const result =
      await database.db.select(`
        PRAGMA database_list
      `)

    console.log(
      `📍 ${database.name}:`,
      JSON.stringify(
        result,
        null,
        2
      )
    )
  }
}