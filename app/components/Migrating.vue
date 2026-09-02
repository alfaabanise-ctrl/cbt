<script setup lang="ts">

import Database from "@tauri-apps/plugin-sql"

// ------------------------------------------
// STATE
// ------------------------------------------

const isMigrating = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const result = ref<any>(null)


// ------------------------------------------
// MIGRATE CURRICULUM
// ------------------------------------------

async function migrateCurriculum() {

  if (isMigrating.value) {
    return
  }

  isMigrating.value = true
  progress.value = 0
  error.value = null
  result.value = null

  try {

    // ==========================================
    // OPEN SQLITE
    // ==========================================

    console.log("Opening SQLite database...")

    const db = await Database.load(
      "sqlite:lessons.db"
    )

    progress.value = 10


    // ==========================================
    // GET SUBJECTS
    // ==========================================

    console.log("Loading subjects...")

    const subjects = await db.select(`
      SELECT
        id,
        name,
        icon
      FROM subjects
      ORDER BY rowid ASC
    `)

    console.log(
      `Found ${subjects.length} subjects`
    )

    progress.value = 30


    // ==========================================
    // GET TOPICS
    // ==========================================

    console.log("Loading topics...")

    const topics = await db.select(`
      SELECT
        id,
        subject_id,
        topic_number,
        title,
        order_index
      FROM topics
      ORDER BY
        subject_id,
        order_index ASC
    `)

    console.log(
      `Found ${topics.length} topics`
    )

    progress.value = 50


    // ==========================================
    // GET LESSONS
    // ==========================================

    console.log("Loading lessons...")

    const lessons = await db.select(`
      SELECT
        id,
        topic_id,
        subject_id,
        topic_number,
        slug,
        title,
        summary,
        blocks,
        search_text,
        order_index
      FROM lessons
      ORDER BY
        subject_id,
        topic_id,
        order_index ASC
    `)

    console.log(
      `Found ${lessons.length} lessons`
    )

    progress.value = 70


    // ==========================================
    // BUILD PAYLOAD
    // ==========================================

    const payload = {
      subjects,
      topics,
      lessons,
    }


    // ==========================================
    // CALL YOUR DIFFERENT ENDPOINT
    // USING YOUR EXISTING API HELPER
    // ==========================================

    console.log(
      "Sending curriculum to migration endpoint..."
    )

    const response =
      await useApiFetch<any>(
        "/api/imigration/migrate",
        {
          method: "POST",

          body: payload,
        }
      )


    // ==========================================
    // CHECK RESPONSE
    // ==========================================

    if (!response.success) {

      throw new Error(
        response.message ||
        "Curriculum migration failed"
      )

    }


    // ==========================================
    // COMPLETE
    // ==========================================

    progress.value = 100

    result.value = response.data

    console.log(
      "Migration completed:",
      response.data
    )

  } catch (err: any) {

    console.error(
      "SQLite → MongoDB migration failed:",
      err
    )

    error.value =
      err?.message ||
      "Curriculum migration failed"

  } finally {

    isMigrating.value = false

  }

}


migrateCurriculum()
</script>


<template>

  <div>

    <button
      :disabled="isMigrating"
      @click="migrateCurriculum"
    >
      {{
        isMigrating
          ? `Migrating... ${progress}%`
          : "Migrate Curriculum"
      }}
    </button>


    <div v-if="isMigrating">
      Migration progress:
      {{ progress }}%
    </div>


    <div v-if="error">
      {{ error }}
    </div>


    <pre v-if="result">
      {{ result }}
    </pre>
    ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
  </div>

</template>