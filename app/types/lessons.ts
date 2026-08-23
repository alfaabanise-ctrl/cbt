export interface Subject {
  id: string
  name: string
  icon?: string
  orderIndex?: number
  topics: Topic[]
}

export interface Topic {
  id: string
  subjectId: string
  topicNumber?: string
  title: string
  orderIndex?: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  subjectId: string
  topicId: string
  topicNumber?: string
  slug: string
  title: string
  summary?: string
  searchText?: string
  orderIndex?: number
  blocks?: any[]
}

export interface AdjacentLesson {
  slug: string
  title: string
  orderIndex?: number
}

export interface LessonSearchResult {
  slug: string
  title: string
  summary?: string
  subjectName?: string
  snippet?: string
}