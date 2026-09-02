import Database from "@tauri-apps/plugin-sql"
import { resolveResource } from "@tauri-apps/api/path"

let dictDb = null

export async function getDictDB() {
  if (!dictDb) {
    const dbPath = await resolveResource("resources/dictionary.db")
    dictDb = await Database.load(`sqlite:${dbPath}`)
  }
        const result = await dictDb.select(`
    PRAGMA database_list
  `)
  console.log(result, 'the result is clean pls');
  
  return dictDb
}

export async function lookupWord(word) {
  const db = await getDictDB()

  const rows = await db.select(
    `SELECT word, meaning, part_of_speech, example, has_definition
     FROM dictionary
     WHERE word = ? COLLATE NOCASE
     LIMIT 1`,
    [word.trim()]
  )

  if (rows.length === 0) return null
  if (!rows[0].has_definition) return { word: rows[0].word, meaning: null }
  return rows[0]
}

export async function searchWords(prefix, limit = 20) {
  const db = await getDictDB()
  return db.select(
    `SELECT word, meaning FROM dictionary
     WHERE word LIKE ? COLLATE NOCASE AND has_definition = 1
     ORDER BY word
     LIMIT ?`,
    [`${prefix}%`, limit]
  )
}