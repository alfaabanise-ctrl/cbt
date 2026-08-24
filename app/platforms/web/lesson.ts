import { useApiFetch } from "~/composables/useApiFetch"

export interface Subject {
  id: string
  name: string
  icon?: string
  topics: Topic[]
}

export interface Topic {
  id: string
  subjectId: string
  title: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  subjectId: string
  topicId: string
  slug: string
  title: string
  summary?: string
  orderIndex?: number
  blocks?: any[]
}

export interface LessonSearchResult {
  slug: string
  title: string
  summary?: string
  subjectName?: string
  snippet?: string
}

export interface AdjacentLesson {
  slug: string
  title: string
  orderIndex?: number
}


export interface ImportCurriculumPayload {
  subjectName?: string
  subjectId?: string
  curriculum: any
}


export interface ImportCurriculumResult {
  subject: string
  subjectId: string
  subjectAction: "inserted" | "updated" | "existing"

  topics: number
  topicsInserted: number
  topicsUpdated: number

  total: number
  inserted: number
  updated: number

  totalBlocks: number
}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export async function getSidebar(): Promise<Subject[]> {

  const response =
    await useApiFetch<Subject[]>(
      "/api/lessons/sidebar"
    )

  if (!response.success) {
    throw new Error(
      response.message ||
      "Failed to load sidebar"
    )
  }

  return response.data ?? []
}


/*
|--------------------------------------------------------------------------
| GET LESSON
|--------------------------------------------------------------------------
*/

export async function getLesson(
  slug: string
): Promise<Lesson | null> {

  const response =
    await useApiFetch<Lesson>(
      `/api/lessons/${encodeURIComponent(slug)}`
    )


  if (!response.success) {

    if (response.status === 404) {
      return null
    }

    throw new Error(
      response.message ||
      "Failed to load lesson"
    )
  }


  return response.data.data ?? null
}



export async function getLessonId(
  id: string
): Promise<Lesson | null> {

  const response =
    await useApiFetch<Lesson>(
      `/api/lessons/id/${encodeURIComponent(id)}`
    )

    console.log(  id, 'responseresponseresponseresponse');
    
  if (!response.success) {

    if (response.status === 404) {
      return null
    }

    throw new Error(
      response.message ||
      "Failed to load lesson"
    )
  }


  return response.data.data ?? null
}

/*
|--------------------------------------------------------------------------
| ADJACENT LESSON
|--------------------------------------------------------------------------
*/

export async function getAdjacentLesson(
  topicId: string,
  orderIndex: number,
  direction: "next" | "previous"
): Promise<AdjacentLesson | null> {
  // --------------------------------------------------
  // Validate topicId
  // --------------------------------------------------
  const cleanTopicId = String(topicId || "").trim()

  if (!cleanTopicId) {
    throw new Error("topicId is required")
  }

  // --------------------------------------------------
  // Validate orderIndex
  // --------------------------------------------------
  const numericOrderIndex = Number(orderIndex)

  if (!Number.isFinite(numericOrderIndex)) {
    throw new Error("orderIndex must be a valid number")
  }

  // --------------------------------------------------
  // Validate direction
  // --------------------------------------------------
  if (
    direction !== "next" &&
    direction !== "previous"
  ) {
    throw new Error(
      'direction must be either "next" or "previous"'
    )
  }

  // --------------------------------------------------
  // API request
  // --------------------------------------------------
  const response = await useApiFetch<AdjacentLesson>(
    "/api/lessons/adjacent",
    {
      method: "GET",

      query: {
        topicId: cleanTopicId,
        orderIndex: numericOrderIndex,
        direction,
      },
    }
  )

  // --------------------------------------------------
  // No response
  // --------------------------------------------------
  if (!response) {
    throw new Error(
      "No response received from adjacent lesson API"
    )
  }

  // --------------------------------------------------
  // No adjacent lesson
  // --------------------------------------------------
  if (response.status === 404) {
    return null
  }

  // --------------------------------------------------
  // API error
  // --------------------------------------------------
  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to load adjacent lesson"
    )
  }

  // --------------------------------------------------
  // Return lesson
  // --------------------------------------------------
  return response.data?.data ?? null
}


/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

export async function searchLessons(
  term: string,
  limit = 20
): Promise<LessonSearchResult[]> {

  const query =
    term.trim()


  if (!query) {
    return []
  }


  const response =
    await useApiFetch<LessonSearchResult[]>(
      "/api/lessons/search",
      {
        method: "GET",

        query: {
          q: query,
          limit,
        },
      }
    )


  if (!response.success) {
    throw new Error(
      response.message ||
      "Failed to search lessons"
    )
  }


  return response.data?.data ?? []
}


/*
|--------------------------------------------------------------------------
| IMPORT CURRICULUM
|--------------------------------------------------------------------------
*/

export async function importCurriculum(
  payload: ImportCurriculumPayload
): Promise<ImportCurriculumResult> {

  const response =
    await useApiFetch<ImportCurriculumResult>(
      "/api/lessons/import",
      {
        method: "POST",

        body: payload,
      }
    )


  if (!response.success) {
    throw new Error(
      response.message ||
      "Failed to import curriculum"
    )
  }


  if (!response.data) {
    throw new Error(
      "Backend returned no import result"
    )
  }


  return response.data
}



