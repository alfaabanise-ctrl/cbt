import { ref } from "vue"
import { toHtml, optionsToHtml } from "./formatHtml"
import { getQuestionsDB } from "../utils/databases"


// =====================================================================
// TYPES
// =====================================================================

interface SubjectItem {
  subject: string
  questionCount: number
}

interface TopicItem {
  topic: string
  questionCount: number
}


// =====================================================================
// HELPERS
// =====================================================================

/**
 * Parse explanation stored in SQLite TEXT.
 *
 * SQLite:
 * explanation = JSON string
 *
 * Vue:
 * explanation = JavaScript object
 */
const parseExplanation = (value: any) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null
  }


  // Already an object
  if (
    typeof value === "object"
  ) {
    return value
  }


  // Must be a string
  if (
    typeof value !== "string"
  ) {
    return null
  }


  let parsed: any = value


  // ---------------------------------------------------------------
  // FIRST JSON PARSE
  // ---------------------------------------------------------------

  try {

    parsed = JSON.parse(
      parsed
    )

  } catch {

    console.warn(
      "⚠️ Invalid explanation JSON:",
      value
    )

    return null
  }


  // ---------------------------------------------------------------
  // DOUBLE STRINGIFIED JSON
  // ---------------------------------------------------------------

  if (
    typeof parsed === "string"
  ) {

    try {

      parsed =
        JSON.parse(
          parsed
        )

    } catch {

      // Normal string
    }
  }


  return parsed
}


// =====================================================================
// PARSE OPTIONS
// =====================================================================

const parseOptions = (
  value: any
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return {}
  }


  if (
    typeof value === "object"
  ) {
    return value
  }


  if (
    typeof value !== "string"
  ) {
    return {}
  }


  try {

    return JSON.parse(
      value
    )

  } catch {

    return {}
  }
}


// =====================================================================
// NORMALIZE QUESTION
// =====================================================================

const normalizeQuestion = (
  row: any
) => {

  if (!row) {
    return null
  }


  return {

    ...row,


    // ---------------------------------------------------------------
    // EXPLANATION
    // ---------------------------------------------------------------

    explanation:
      parseExplanation(
        row.explanation
      ),


    // ---------------------------------------------------------------
    // OPTIONS
    // ---------------------------------------------------------------

    options:
      parseOptions(
        row.options
      ),


    // ---------------------------------------------------------------
    // OPTIONS HTML
    // ---------------------------------------------------------------

    optionsHtml:
      parseOptions(
        row.options_html
      ),


    // ---------------------------------------------------------------
    // PASSAGE
    // ---------------------------------------------------------------

    hasPassage:
      !!row.hasPassage
  }
}


// =====================================================================
// COMPOSABLE
// =====================================================================

export function useQuestionSearch() {

  // ===================================================================
  // STATE
  // ===================================================================

  const results =
    ref<any[]>([])


  const currentQuestion =
    ref<any>(null)


  const loading =
    ref(false)


  const error =
    ref<any>(null)


  // All subjects
  const subjects =
    ref<SubjectItem[]>([])


  // Topics for currently selected subject
  const topics =
    ref<TopicItem[]>([])


  // ===================================================================
  // FTS QUERY
  // ===================================================================

  const toFtsQuery = (
    term: string
  ) => {

    return term
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (word) =>
          `${word.replace(
            /["*]/g,
            ""
          )}*`
      )
      .join(" ")
  }


  // ===================================================================
  // SEARCH QUESTIONS
  // ===================================================================

  const search = async (
    term: string,
    {
      subject = null,
      year = null,
      limit = 30
    }: {
      subject?: string | null
      year?: number | null
      limit?: number
    } = {}
  ) => {

    const query =
      term?.trim()


    if (!query) {

      results.value =
        []

      return
    }


    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      const ftsQuery =
        toFtsQuery(
          query
        )


      const conditions:
        string[] = []


      const params:
        any[] = [
          ftsQuery
        ]


      // ---------------------------------------------------------------
      // SUBJECT
      // ---------------------------------------------------------------

      if (subject) {

        conditions.push(
          "q.subject = ?"
        )

        params.push(
          subject
        )
      }


      // ---------------------------------------------------------------
      // YEAR
      // ---------------------------------------------------------------

      if (year) {

        conditions.push(
          "q.year = ?"
        )

        params.push(
          year
        )
      }


      const extraWhere =
        conditions.length
          ? `AND ${conditions.join(
              " AND "
            )}`
          : ""


      params.push(
        limit
      )


      const rows =
        await db.select<any[]>(
          `
          SELECT

            q.id,
            q.question,
            q.subject,
            q.year,
            q.topic,
            q.category,

            snippet(
              questions_fts,
              0,
              '⟦',
              '⟧',
              '…',
              12
            ) AS snippet

          FROM questions_fts

          JOIN questions q
            ON q.rowid =
              questions_fts.rowid

          WHERE questions_fts MATCH ?

          ${extraWhere}

          ORDER BY rank

          LIMIT ?
          `,
          params
        )


      results.value =
        rows


    } catch (err) {

      console.error(
        "❌ question search error:",
        err
      )


      error.value =
        err


      results.value =
        []


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // LOAD ONE QUESTION
  // ===================================================================

  const loadQuestion = async (
    id: string
  ) => {

    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      const rows =
        await db.select<any[]>(
          `
          SELECT *
          FROM questions
          WHERE id = ?
          LIMIT 1
          `,
          [id]
        )


      if (!rows.length) {

        currentQuestion.value =
          null

        return null
      }


      const row =
        rows[0]


      currentQuestion.value =
        normalizeQuestion(
          row
        )


      console.log(
        "✅ Loaded question:",
        currentQuestion.value
      )


      console.log(
        "📚 Explanation:",
        currentQuestion.value
          ?.explanation
      )


      return currentQuestion.value


    } catch (err) {

      console.error(
        "❌ load question error:",
        err
      )


      error.value =
        err


      return null


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // ADD QUESTION
  // ===================================================================

  const addQuestion = async (
    q: any
  ) => {

    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      const id =
        q.id ||
        crypto.randomUUID()


      const options =
        q.options || {}


      // ---------------------------------------------------------------
      // EXPLANATION
      // ---------------------------------------------------------------

      const explanationJson =
        q.explanation != null
          ? JSON.stringify(
              q.explanation
            )
          : null


      await db.execute(
        `
        INSERT INTO questions
        (
          id,
          question,
          question_html,
          options,
          options_html,
          answer,
          explanation,
          examType,
          subject,
          year,
          section,
          topic,
          category,
          difficulty,
          source,
          solution,
          solution_html,
          imageUrl,
          hasPassage,
          country,
          institution,
          state
        )

        VALUES
        (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
        `,
        [

          // -----------------------------------------------------------
          // ID
          // -----------------------------------------------------------

          id,


          // -----------------------------------------------------------
          // QUESTION
          // -----------------------------------------------------------

          q.question ??
            null,


          toHtml(
            q.question
          ),


          // -----------------------------------------------------------
          // OPTIONS
          // -----------------------------------------------------------

          JSON.stringify(
            options
          ),


          JSON.stringify(
            optionsToHtml(
              options
            )
          ),


          // -----------------------------------------------------------
          // ANSWER
          // -----------------------------------------------------------

          q.answer ??
            null,


          // -----------------------------------------------------------
          // EXPLANATION
          // -----------------------------------------------------------

          explanationJson,


          // -----------------------------------------------------------
          // EXAM TYPE
          // -----------------------------------------------------------

          q.examType ??
            null,


          // -----------------------------------------------------------
          // SUBJECT
          // -----------------------------------------------------------

          q.subject ??
            null,


          // -----------------------------------------------------------
          // YEAR
          // -----------------------------------------------------------

          q.year ??
            null,


          // -----------------------------------------------------------
          // SECTION
          // -----------------------------------------------------------

          q.section ??
            null,


          // -----------------------------------------------------------
          // TOPIC
          // -----------------------------------------------------------

          q.topic ??
            null,


          // -----------------------------------------------------------
          // CATEGORY
          // -----------------------------------------------------------

          q.category ??
            null,


          // -----------------------------------------------------------
          // DIFFICULTY
          // -----------------------------------------------------------

          q.difficulty ??
            null,


          // -----------------------------------------------------------
          // SOURCE
          // -----------------------------------------------------------

          q.source ??
            null,


          // -----------------------------------------------------------
          // SOLUTION
          // -----------------------------------------------------------

          q.solution ??
            null,


          toHtml(
            q.solution
          ),


          // -----------------------------------------------------------
          // IMAGE
          // -----------------------------------------------------------

          q.imageUrl ??
            null,


          // -----------------------------------------------------------
          // PASSAGE
          // -----------------------------------------------------------

          q.hasPassage
            ? 1
            : 0,


          // -----------------------------------------------------------
          // COUNTRY
          // -----------------------------------------------------------

          q.country ??
            null,


          // -----------------------------------------------------------
          // INSTITUTION
          // -----------------------------------------------------------

          q.institution ??
            null,


          // -----------------------------------------------------------
          // STATE
          // -----------------------------------------------------------

          q.state ??
            null
        ]
      )


      return id


    } catch (err) {

      console.error(
        "❌ add question error:",
        err
      )


      error.value =
        err


      throw err


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // UPDATE QUESTION
  // ===================================================================

  const updateQuestion = async (
    id: string,
    patch: any
  ) => {

    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      const fields = {
        ...patch
      }


      // ---------------------------------------------------------------
      // EXPLANATION
      // ---------------------------------------------------------------

      if (
        "explanation" in fields
      ) {

        fields.explanation =
          fields.explanation != null
            ? JSON.stringify(
                fields.explanation
              )
            : null
      }


      // ---------------------------------------------------------------
      // QUESTION HTML
      // ---------------------------------------------------------------

      if (
        "question" in fields
      ) {

        fields.question_html =
          toHtml(
            fields.question
          )
      }


      // ---------------------------------------------------------------
      // SOLUTION HTML
      // ---------------------------------------------------------------

      if (
        "solution" in fields
      ) {

        fields.solution_html =
          toHtml(
            fields.solution
          )
      }


      // ---------------------------------------------------------------
      // OPTIONS
      // ---------------------------------------------------------------

      if (
        "options" in fields
      ) {

        fields.options_html =
          JSON.stringify(
            optionsToHtml(
              fields.options
            )
          )


        fields.options =
          JSON.stringify(
            fields.options
          )
      }


      // ---------------------------------------------------------------
      // PASSAGE
      // ---------------------------------------------------------------

      if (
        "hasPassage" in fields
      ) {

        fields.hasPassage =
          fields.hasPassage
            ? 1
            : 0
      }


      // ---------------------------------------------------------------
      // NOTHING TO UPDATE
      // ---------------------------------------------------------------

      const keys =
        Object.keys(
          fields
        )


      if (!keys.length) {
        return
      }


      // ---------------------------------------------------------------
      // BUILD UPDATE
      // ---------------------------------------------------------------

      const setClause =
        keys
          .map(
            (key) =>
              `${key} = ?`
          )
          .join(", ")


      const values =
        keys.map(
          (key) =>
            fields[key]
        )


      await db.execute(
        `
        UPDATE questions

        SET ${setClause}

        WHERE id = ?
        `,
        [
          ...values,
          id
        ]
      )


    } catch (err) {

      console.error(
        "❌ update question error:",
        err
      )


      error.value =
        err


      throw err


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // DELETE QUESTION
  // ===================================================================

  const deleteQuestion = async (
    id: string
  ) => {

    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      await db.execute(
        `
        DELETE FROM questions
        WHERE id = ?
        `,
        [id]
      )


      if (
        currentQuestion.value?.id === id
      ) {

        currentQuestion.value =
          null
      }


      results.value =
        results.value.filter(
          (question) =>
            question.id !== id
        )


    } catch (err) {

      console.error(
        "❌ delete question error:",
        err
      )


      error.value =
        err


      throw err


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // GET ALL AVAILABLE SUBJECTS
  // ===================================================================

  const getAllSubjects = async () => {

    try {

      const db =
        await getQuestionsDB()


      const rows =
        await db.select<any[]>(
          `
          SELECT
            subject,
            COUNT(*) AS questionCount

          FROM questions

          WHERE subject IS NOT NULL

            AND TRIM(subject) != ''

          GROUP BY subject

          ORDER BY subject COLLATE NOCASE
          `
        )


      const list: SubjectItem[] =
        rows.map(
          (row) => ({
            subject:
              String(
                row.subject
              ),

            questionCount:
              Number(
                row.questionCount || 0
              )
          })
        )


      subjects.value =
        list


      return list


    } catch (err) {

      console.error(
        "❌ get all subjects error:",
        err
      )


      error.value =
        err


      subjects.value =
        []


      return []
    }
  }


  // ===================================================================
  // GET ALL TOPICS BY SUBJECT
  // ===================================================================

  const getTopicsBySubject = async (
    subject: string
  ) => {

    if (
      !subject ||
      !subject.trim()
    ) {

      topics.value =
        []

      return []
    }


    try {

      const db =
        await getQuestionsDB()


      const rows =
        await db.select<any[]>(
          `
          SELECT
            topic,
            COUNT(*) AS questionCount

          FROM questions

          WHERE subject = ?

            AND topic IS NOT NULL

            AND TRIM(topic) != ''

          GROUP BY topic

          ORDER BY topic COLLATE NOCASE
          `,
          [
            subject.trim()
          ]
        )


      const list: TopicItem[] =
        rows.map(
          (row) => ({

            topic:
              String(
                row.topic
              ),

            questionCount:
              Number(
                row.questionCount || 0
              )
          })
        )


      topics.value =
        list


      return list


    } catch (err) {

      console.error(
        "❌ get topics by subject error:",
        err
      )


      error.value =
        err


      topics.value =
        []


      return []
    }
  }


  // ===================================================================
  // LOAD SUBJECTS
  // ===================================================================

  const loadSubjects = async () => {

    return await getAllSubjects()
  }


  // ===================================================================
  // LOAD TOPICS
  // ===================================================================

  const loadTopics = async (
    subject: string
  ) => {

    return await getTopicsBySubject(
      subject
    )
  }


  // ===================================================================
  // CLEAR
  // ===================================================================

  const clear = () => {

    results.value =
      []

    currentQuestion.value =
      null

    error.value =
      null

    topics.value =
      []
  }


  // ===================================================================
  // GET RANDOM QUESTIONS
  // ===================================================================

  const getQuestions = async ({
    subject = null,
    year = null,
    examType = null,
    topic = null,
    limit = 40
  }: {
    subject?: string | null
    year?: number | null
    examType?: string | null
    topic?: string | null
    limit?: number
  } = {}) => {

    loading.value =
      true

    error.value =
      null


    try {

      const db =
        await getQuestionsDB()


      const conditions:
        string[] = []


      const params:
        any[] = []


      // ---------------------------------------------------------------
      // SUBJECT
      // ---------------------------------------------------------------

      if (subject) {

        conditions.push(
          "subject = ?"
        )

        params.push(
          subject
        )
      }


      // ---------------------------------------------------------------
      // YEAR
      // ---------------------------------------------------------------

      if (year) {

        conditions.push(
          "year = ?"
        )

        params.push(
          year
        )
      }


      // ---------------------------------------------------------------
      // EXAM TYPE
      // ---------------------------------------------------------------

      if (examType) {

        conditions.push(
          "examType = ?"
        )

        params.push(
          examType
        )
      }


      // ---------------------------------------------------------------
      // TOPIC
      // ---------------------------------------------------------------

      if (topic) {

        conditions.push(
          "topic = ?"
        )

        params.push(
          topic
        )
      }


      // ---------------------------------------------------------------
      // WHERE
      // ---------------------------------------------------------------

      const where =
        conditions.length
          ? `WHERE ${conditions.join(
              " AND "
            )}`
          : ""


      params.push(
        Number(limit)
      )


      // ---------------------------------------------------------------
      // QUERY
      // ---------------------------------------------------------------

      const rows =
        await db.select<any[]>(
          `
          SELECT *

          FROM questions

          ${where}

          ORDER BY RANDOM()

          LIMIT ?
          `,
          params
        )


      // ---------------------------------------------------------------
      // NORMALIZE
      // ---------------------------------------------------------------

      return rows.map(
        (row) =>
          normalizeQuestion(
            row
          )
      )


    } catch (err) {

      console.error(
        "❌ get questions error:",
        err
      )


      error.value =
        err


      return []


    } finally {

      loading.value =
        false
    }
  }


  // ===================================================================
  // RETURN
  // ===================================================================

  return {

    // ---------------------------------------------------------------
    // STATE
    // ---------------------------------------------------------------

    results,
    currentQuestion,
    subjects,
    topics,
    loading,
    error,


    // ---------------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------------

    search,


    // ---------------------------------------------------------------
    // QUESTIONS
    // ---------------------------------------------------------------

    getQuestions,
    loadQuestion,
    addQuestion,
    updateQuestion,
    deleteQuestion,


    // ---------------------------------------------------------------
    // SUBJECTS
    // ---------------------------------------------------------------

    getAllSubjects,
    loadSubjects,


    // ---------------------------------------------------------------
    // TOPICS
    // ---------------------------------------------------------------

    getTopicsBySubject,
    loadTopics,


    // ---------------------------------------------------------------
    // UTILITY
    // ---------------------------------------------------------------

    clear
  }
}