import { ref } from 'vue'
import { getDictDB } from '~/utils/databases'

// ---------------------------------------------------------------------
// composable
// ---------------------------------------------------------------------

export function useDictionary() {

  const results       = ref([])   // live suggestion list (word + meaning)
  const currentWord    = ref(null) // full detail of the selected/looked-up word
  const loading        = ref(false)
  const error           = ref(null)
  const notFound        = ref(false)

  // ----- live "starts with" search, used while typing ------------------

  const search = async (prefix, limit = 20) => {
    const term = prefix?.trim()

    if (!term) {
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const db = await getDictDB()

      const rows = await db.select(
        `SELECT word, meaning, part_of_speech
         FROM dictionary
         WHERE word LIKE ? COLLATE NOCASE
           AND has_definition = 1
         ORDER BY LENGTH(word), word
         LIMIT ?`,
        [`${term}%`, limit]
      )

      results.value = rows
    } catch (err) {
      console.error('❌ dictionary search error:', err)
      error.value = err
      results.value = []
    } finally {
      loading.value = false
    }
  }

  // ----- exact lookup, used on submit / clicking a suggestion -----------

  const lookup = async (word) => {
    const term = word?.trim()
    if (!term) return null

    loading.value = true
    error.value = null
    notFound.value = false

    try {
      const db = await getDictDB()

      const rows = await db.select(
        `SELECT word, meaning, part_of_speech, example, has_definition
         FROM dictionary
         WHERE word = ? COLLATE NOCASE
         LIMIT 1`,
        [term]
      )

      if (rows.length === 0) {
        currentWord.value = null
        notFound.value = true
        return null
      }

      const row = rows[0]

      currentWord.value = {
        word: row.word,
        meaning: row.has_definition ? row.meaning : null,
        partOfSpeech: row.part_of_speech,
        example: row.example,
        hasDefinition: !!row.has_definition
      }

      return currentWord.value
    } catch (err) {
      console.error('❌ dictionary lookup error:', err)
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    results.value = []
    currentWord.value = null
    notFound.value = false
    error.value = null
  }

  return {
    results,
    currentWord,
    loading,
    error,
    notFound,
    search,
    lookup,
    clear
  }
}
