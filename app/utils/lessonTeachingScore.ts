export interface LessonTeachingScore {
  score: number
  level: string
  feedback: string[]
}

function getBlocks(value: unknown): any[] {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function getText(value: unknown): string {
  if (typeof value === "string") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
  }

  if (Array.isArray(value)) {
    return value.map(getText).join(" ")
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) =>
        !["type", "level", "ordered", "order", "id"].includes(key)
      )
      .map(([, item]) => getText(item))
      .join(" ")
  }

  return ""
}

export function scoreLessonForSelfStudy(
  title: unknown,
  summary: unknown,
  blocksValue: unknown
): LessonTeachingScore {
  const blocks = getBlocks(blocksValue)
  const bodyText = getText(blocks)
  const normalizedText = `${String(title ?? "")} ${String(summary ?? "")} ${bodyText}`
    .toLowerCase()
  const wordCount = (bodyText.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [])
    .length
  const blockTypes = blocks
    .map((block) => String(block?.type ?? "").toLowerCase())
  const headings = blocks.filter((block) =>
    String(block?.type ?? "").toLowerCase().includes("heading")
  ).length

  const hasObjectives =
    /learning objectives|objectives|by the end of this lesson|students? (?:will|should) be able to/.test(normalizedText)
  const hasExample =
    blockTypes.some((type) => /example|worked|demonstrat/.test(type)) ||
    /worked example|illustrative example|example:/.test(normalizedText)
  const hasPractice =
    blockTypes.some((type) => /question|quiz|practice|exercise|assessment/.test(type)) ||
    /practice questions|self-assessment|test yourself|check your understanding/.test(normalizedText)
  const hasRecap =
    /summary|conclusion|key points|key takeaways|recap|revision/.test(normalizedText)
  const hasVocabulary =
    /key terms|glossary|vocabulary|definitions|defined as|refers to/.test(normalizedText)

  const explanationPoints =
    wordCount >= 900 ? 30 :
    wordCount >= 500 ? 26 :
    wordCount >= 250 ? 20 :
    wordCount >= 100 ? 12 :
    wordCount > 0 ? 5 : 0
  const structurePoints =
    headings >= 5 ? 15 :
    headings >= 3 ? 11 :
    headings >= 1 ? 6 : 0

  const feedback: string[] = []
  if (wordCount < 250) {
    feedback.push("Add a fuller step-by-step explanation.")
  }
  if (headings < 3) {
    feedback.push("Organize the lesson with clear section headings.")
  }
  if (!hasObjectives) {
    feedback.push("Add learning objectives.")
  }
  if (!hasExample) {
    feedback.push("Add a worked example or demonstration.")
  }
  if (!hasPractice) {
    feedback.push("Add practice questions with answers or explanations.")
  }
  if (!hasRecap) {
    feedback.push("Add a short recap of the key ideas.")
  }
  if (!hasVocabulary) {
    feedback.push("Define important terms for independent learners.")
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      explanationPoints +
        structurePoints +
        (hasObjectives ? 10 : 0) +
        (hasExample ? 15 : 0) +
        (hasPractice ? 15 : 0) +
        (hasRecap ? 10 : 0) +
        (hasVocabulary ? 5 : 0)
    )
  )

  const level =
    score >= 85 ? "Ready for self-study" :
    score >= 70 ? "Mostly ready" :
    score >= 50 ? "Needs teacher support" :
    "Incomplete for self-study"

  return { score, level, feedback }
}
