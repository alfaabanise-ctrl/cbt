import Database from "@tauri-apps/plugin-sql";
import platfrom from "../platforms/index";
let db = null;

export async function useDatabase() {
  if (!db) {
    db = platfrom.database();
  }

  return db;
}