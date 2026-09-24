
import Database from "@tauri-apps/plugin-sql"

let db = null

// ============================================================
// MIGRATE exam_answers TABLE
// ============================================================

export async function migrateExamAnswers(db) {
  try {
    console.log("🔄 Checking exam_answers database structure...")

    const columns = await db.select(`
      PRAGMA table_info(exam_answers)
    `)

    console.log("📋 Current exam_answers columns:", columns)

    const columnNames = columns.map(column => column.name)

    // ========================================================
    // QUESTION
    // ========================================================

    if (!columnNames.includes("question")) {
      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN question TEXT
      `)

      console.log("✅ Added missing column: question")
    }

    // ========================================================
    // ANSWER
    // ========================================================

    if (!columnNames.includes("answer")) {

      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN answer TEXT
      `)

      console.log("✅ Added missing column: answer")

      // ------------------------------------------------------
      // If old database has correctAnswer, copy it to answer
      // ------------------------------------------------------

      if (columnNames.includes("correctAnswer")) {

        await db.execute(`
          UPDATE exam_answers
          SET answer = correctAnswer
          WHERE answer IS NULL
        `)

        console.log(
          "✅ Copied correctAnswer → answer"
        )
      }
    }

    // ========================================================
    // USER ANSWER
    // ========================================================

    if (!columnNames.includes("userAnswer")) {

      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN userAnswer TEXT
      `)

      console.log("✅ Added missing column: userAnswer")
    }

    // ========================================================
    // IS CORRECT
    // ========================================================

    if (!columnNames.includes("isCorrect")) {

      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN isCorrect INTEGER
      `)

      console.log("✅ Added missing column: isCorrect")
    }

    // ========================================================
    // TIME SPENT
    // ========================================================

    if (!columnNames.includes("timeSpent")) {

      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN timeSpent INTEGER
      `)

      console.log("✅ Added missing column: timeSpent")
    }

    // ========================================================
    // BOOKMARKED
    // ========================================================

    if (!columnNames.includes("bookmarked")) {

      await db.execute(`
        ALTER TABLE exam_answers
        ADD COLUMN bookmarked INTEGER
      `)

      console.log("✅ Added missing column: bookmarked")
    }

    console.log(
      "✅ exam_answers migration completed successfully"
    )

  } catch (error) {

    console.error(
      "❌ migrateExamAnswers error:",
      error
    )

    throw error
  }
}


// ============================================================
// GET CBT DATABASE
// ============================================================

export async function getDB() {

  if (!db) {

    db = await Database.load(
      "sqlite:cbt.db"
    )

  }

  return db
}


// ============================================================
// INITIALIZE DATABASE
// ============================================================

export async function initializeDatabase() {

  try {

    console.log(
      "🚀 Initializing CBT database..."
    )

    const db = await getDB()

    // ========================================================
    // EXAM HISTORY
    // ========================================================

    await db.execute(`
      CREATE TABLE IF NOT EXISTS exam_history (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        examType TEXT,
        mode TEXT,

        startTime TEXT,
        endTime TEXT,

        total INTEGER,
        answered INTEGER,
        unanswered INTEGER,

        correct INTEGER,
        wrong INTEGER,

        percentage REAL,

        aggregate REAL,
        maxAggregate REAL,

        duration INTEGER,
        durationUsed INTEGER,

        timeSpent TEXT,
        speed REAL,

        createdAt TEXT
          DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ========================================================
    // EXAM SUBJECTS
    // ========================================================

    await db.execute(`
      CREATE TABLE IF NOT EXISTS exam_subjects (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        historyId INTEGER,

        subjectId TEXT,
        subjectName TEXT,

        total INTEGER,
        answered INTEGER,

        correct INTEGER,
        wrong INTEGER,

        score REAL,
        maxScore REAL,

        FOREIGN KEY(historyId)
          REFERENCES exam_history(id)
          ON DELETE CASCADE
      )
    `)

    // ========================================================
    // EXAM ANSWERS
    // ========================================================

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

        isCorrect INTEGER,

        timeSpent INTEGER,

        bookmarked INTEGER,

        FOREIGN KEY(historyId)
          REFERENCES exam_history(id)
          ON DELETE CASCADE
      )
    `)

    // ========================================================
    // IMPORTANT:
    // Upgrade old exam_answers tables
    // ========================================================

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
  `);
    await migrateExamAnswers(db)

    console.log(
      "🎉 CBT database initialized successfully"
    )

      const result = await db.select(`
    PRAGMA database_list
  `)

  console.log(result, 'result') 

    return db

  } catch (error) {

    console.error(
      "❌ Database initialization failed:",
      error
    )

    throw error
  }
}

export async function debugCBTDatabaseLocation() {

  const db = await getDatabase()

  const result = await db.select(`
    PRAGMA database_list
  `)

  console.log(
    "📍 CBT DATABASE LOCATION:",
    JSON.stringify(result, null, 2)
  )

  return result
}