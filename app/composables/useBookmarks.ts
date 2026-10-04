import { getDB } from "~/platforms/desktop/database";

const getExplanationData = (question) => {
  const source =
    question?.explanation ??
    question?.explaination ??
    null;

  let explanation = source;
  if (typeof source === "string") {
    try {
      explanation = JSON.parse(source);
    } catch {
      explanation = source;
    }
  }

  const simple =
    typeof explanation === "object" && explanation
      ? explanation.simplifiedExplanation ??
        explanation.simpleExplanation ??
        explanation.simple_explanation
      : null;

  const detailed =
    typeof explanation === "object" && explanation
      ? explanation.explanation ??
        question?.solution_html ??
        question?.solution ??
        question?.explanation_html ??
        question?.explaination
      : explanation ??
        question?.solution_html ??
        question?.solution ??
        question?.explanation_html;

  const commonMistakes =
    typeof explanation === "object" && explanation
      ? explanation.commonMistakes ??
        explanation.common_mistakes ??
        question?.commonMistakes ??
        []
      : question?.commonMistakes ?? [];

  if (!simple && !detailed && !commonMistakes.length) {
    return null;
  }

  return JSON.stringify({
    simplifiedExplanation: simple || null,
    explanation: detailed || null,
    commonMistakes: Array.isArray(commonMistakes)
      ? commonMistakes
      : [],
  });
};

export const useBookmarks = () => {
  /**
   * Generate a unique ID for a question.
   */
  const getQuestionId = (question) => {
    return String(
      question.id ??
        question._id ??
        `${question.examType ?? "exam"}-${question.subject ?? "subject"}-${question.year ?? "year"}-${question.questionNumber ?? question.number ?? Date.now()}`,
    );
  };

  /**
   * Save a question as a bookmark.
   */
  const saveBookmark = async (question) => {
    if (!question || Object.keys(question).length === 0) {
      throw new Error("No question selected");
    }

    const db = await getDB();

    const questionId = getQuestionId(question);

    const questionText = String(
      question.question ??
        question.questionText ??
        question.text ??
        "",
    ).trim();

    if (!questionText) {
      throw new Error("Question text is missing");
    }

    const options = question.options
      ? JSON.stringify(question.options)
      : null;

    await db.execute(
      `
      INSERT OR REPLACE INTO bookmarks (
        question_id,
        exam_type,
        subject,
        year,
        question_number,
        question_text,
        options,
        correct_answer,
        explanation
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        questionId,
        question.examType ?? null,
        question.subject ?? null,
        question.year ?? null,
        question.questionNumber ?? question.number ?? null,
        questionText,
        options,
        question.correctAnswer ?? question.answer ?? null,
        getExplanationData(question),
      ],
    );

    console.log("✅ Question bookmarked:", questionId);

    return {
      success: true,
      questionId,
    };
  };

  /**
   * Get all saved bookmarks.
   */
  const getBookmarks = async () => {
    const db = await getDB();

    return await db.select(`
      SELECT *
      FROM bookmarks
      ORDER BY datetime(created_at) DESC
    `);
  };

  /**
   * Check whether a question is bookmarked.
   */
  const isBookmarked = async (question) => {
    const db = await getDB();

    const questionId =
      typeof question === "object"
        ? getQuestionId(question)
        : String(question);

    const result = await db.select(
      `
      SELECT id
      FROM bookmarks
      WHERE question_id = ?
      LIMIT 1
      `,
      [questionId],
    );

    return result.length > 0;
  };

  /**
   * Delete one bookmark.
   */
  const deleteBookmark = async (question) => {
    const db = await getDB();

    const questionId =
      typeof question === "object"
        ? getQuestionId(question)
        : String(question);

    await db.execute(
      `
      DELETE FROM bookmarks
      WHERE question_id = ?
      `,
      [questionId],
    );

    console.log("🗑️ Bookmark deleted:", questionId);
  };

  /**
   * Delete all bookmarks.
   */
  const clearBookmarks = async () => {
    const db = await getDB();

    await db.execute(`
      DELETE FROM bookmarks
    `);

    console.log("🗑️ All bookmarks deleted");
  };

  return {
    saveBookmark,
    getBookmarks,
    isBookmarked,
    deleteBookmark,
    clearBookmarks,
  };
};