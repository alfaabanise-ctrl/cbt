import {
  getQuestionsDB,
  getLessonsDB,
} from "./databases"


// ============================================================
// TYPES
// ============================================================

export interface DownloadManifest {
  subjects: number
  topics: number
  questions: number
  learning: number
  total: number

  batchSize?: number
  version?: string
}


export interface DownloadProgress {
  phase:
    | "starting"
    | "subjects"
    | "topics"
    | "questions"
    | "learning"
    | "completed"
    | "error"

  subjects: number
  topics: number
  questions: number
  learning: number

  total: number

  message?: string
}


// ============================================================
// API URL
// ============================================================

function getApiUrl() {
  const config = useRuntimeConfig()

  return String(
    config.public.apiUrl || ""
  ).replace(/\/$/, "")
}


// ============================================================
// GENERIC FETCH
// ============================================================

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const url =
    `${getApiUrl()}${path}`

  console.log(
    "🌐 Content request:",
    url
  )

  const response = await fetch(
    url,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(options.headers || {}),
      },
    }
  )


  // ==========================================================
  // HTTP ERROR
  // ==========================================================

  if (!response.ok) {

    const text =
      await response.text()

    throw new Error(
      `HTTP ${response.status}: ${text}`
    )
  }


  // ==========================================================
  // JSON
  // ==========================================================

  return await response.json()
}


// ============================================================
// START DOWNLOAD
// ============================================================

export async function startContentDownload(
  token: string
) {

  if (!token?.trim()) {
    throw new Error(
      "Activation token is required"
    )
  }


  return await apiFetch<{
    success: boolean
    data: DownloadManifest
    message?: string
  }>(
    "/api/content/download/start",
    {
      method: "POST",

      body: JSON.stringify({
        token: token.trim(),
      }),
    }
  )
}


// ============================================================
// GET SUBJECTS
// ============================================================

export async function fetchSubjects(
  token: string
) {

  return await apiFetch<any>(
    `/api/content/download/subjects?token=${encodeURIComponent(token)}`
  )
}


// ============================================================
// GET TOPICS
// ============================================================

export async function fetchTopics(
  token: string
) {

  return await apiFetch<any>(
    `/api/content/download/topics?token=${encodeURIComponent(token)}`
  )
}


// ============================================================
// GET QUESTIONS
// ============================================================

export async function fetchQuestions(
  token: string,
  limit = 500,
  cursor = ""
) {

  const params =
    new URLSearchParams()

  params.set(
    "token",
    token
  )

  params.set(
    "limit",
    String(limit)
  )


  if (cursor) {

    params.set(
      "cursor",
      cursor
    )
  }


  return await apiFetch<any>(
    `/api/content/download/questions?${params.toString()}`
  )
}


// ============================================================
// GET LEARNING
// ============================================================

export async function fetchLearning(
  token: string,
  limit = 500,
  cursor = ""
) {

  const params =
    new URLSearchParams()

  params.set(
    "token",
    token
  )

  params.set(
    "limit",
    String(limit)
  )


  if (cursor) {

    params.set(
      "cursor",
      cursor
    )
  }


  return await apiFetch<any>(
    `/api/content/download/learning?${params.toString()}`
  )
}