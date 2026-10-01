import { getQuestionsDB } from "../utils/databases"

export async function useDatabase() {
  return getQuestionsDB()
}