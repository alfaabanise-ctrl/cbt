import {
  getDictDB as getSharedDictDB,
} from "../../utils/databases"

export async function getDictDB() {
  return getSharedDictDB()
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
