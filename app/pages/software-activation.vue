<script setup lang="ts">
import {
  saveSubjects,
  saveTopics,
  saveQuestions,
  saveLearning,
} from "~/utils/contentSync"

const software = useSoftwareSecurity()

const token = ref("")

const loading = ref(false)

const error = ref("")

const success = ref("")

// ============================================================
// DOWNLOAD STATE
// ============================================================

const downloading = ref(false)

const downloadPhase = ref("")

const downloadError = ref("")

const downloadPercentage = ref(0)

const downloadedSubjects = ref(0)

const downloadedTopics = ref(0)

const downloadedQuestions = ref(0)

const downloadedLearning = ref(0)

const downloadTotal = ref(0)

// ============================================================
// MANIFEST TOTALS
// ============================================================

const manifestSubjects = ref(0)

const manifestTopics = ref(0)

const manifestQuestions = ref(0)

const manifestLearning = ref(0)

// ============================================================
// ACTIVATE SOFTWARE
// ============================================================

async function activate() {
  if (loading.value || downloading.value) {
    return
  }

  error.value = ""
  success.value = ""
  downloadError.value = ""

  const cleanToken = token.value.trim().toUpperCase()

  if (!cleanToken) {
    error.value = "Please enter your activation token."
    return
  }

  loading.value = true

  try {
    console.log("========================================")
    console.log("🔐 ABANISE ACTIVATION STARTED")
    console.log("========================================")

    console.log("🔑 Token:", cleanToken)

    // ========================================================
    // STEP 1
    // ACTIVATE SOFTWARE
    // ========================================================

    const result = await software.activate(cleanToken)

    console.log("✅ Software activation response:")
    console.log(result)

    success.value = "Software activated successfully."

    // ========================================================
    // STEP 2
    // DOWNLOAD CONTENT
    // ========================================================

    await downloadContent(cleanToken)

    // ========================================================
    // COMPLETE
    // ========================================================

    success.value =
      "Abanise CBT has been activated and all content has been downloaded."

    console.log("========================================")
    console.log("🎉 ABANISE CONTENT DOWNLOAD COMPLETE")
    console.log("========================================")

    console.log("Subjects:", downloadedSubjects.value)
    console.log("Topics:", downloadedTopics.value)
    console.log("Questions:", downloadedQuestions.value)
    console.log("Lessons:", downloadedLearning.value)
    console.log("Total:", downloadTotal.value)

    // Do not navigate yet while testing.
    // await navigateTo("/")
  } catch (err: any) {
    console.error("========================================")
    console.error("❌ ACTIVATION/DOWNLOAD ERROR")
    console.error("========================================")

    console.error(err)

    error.value =
      err?.data?.message ||
      err?.message ||
      "Activation failed."
  } finally {
    loading.value = false
  }
}

// ============================================================
// DOWNLOAD CONTENT
// ============================================================

async function downloadContent(
  activationToken: string
) {
  downloading.value = true

  downloadError.value = ""

  downloadPhase.value =
    "Connecting to Abanise server..."

  downloadPercentage.value = 0

  downloadedSubjects.value = 0
  downloadedTopics.value = 0
  downloadedQuestions.value = 0
  downloadedLearning.value = 0

  manifestSubjects.value = 0
  manifestTopics.value = 0
  manifestQuestions.value = 0
  manifestLearning.value = 0

  try {
    // ========================================================
    // API URL
    // ========================================================

    const config = useRuntimeConfig()

    const apiUrl = String(
      config.public.apiUrl || ""
    ).replace(/\/$/, "")

    console.log("🌐 API URL:", apiUrl)

    // ========================================================
    // STEP 1
    // START DOWNLOAD
    // ========================================================

    downloadPhase.value =
      "Verifying activation token..."

    console.log("")
    console.log("========================================")
    console.log("📦 STEP 1: START DOWNLOAD")
    console.log("========================================")

    const startUrl =
      `${apiUrl}/api/content/download/start`

    console.log("POST:", startUrl)

    const startResponse = await fetch(
      startUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          token: activationToken,
        }),
      }
    )

    console.log(
      "📡 Start HTTP status:",
      startResponse.status
    )

    const startText =
      await startResponse.text()

    console.log(
      "📡 Start raw response:",
      startText
    )

    if (!startResponse.ok) {
      throw new Error(
        startText ||
        "Unable to start content download."
      )
    }

    let startData: any

    try {
      startData = JSON.parse(startText)
    } catch {
      throw new Error(
        "Server returned invalid JSON."
      )
    }

    console.log(
      "📦 START RESPONSE:",
      startData
    )

    // ========================================================
    // IMPORTANT
    //
    // Backend response:
    //
    // data: {
    //   token: {...},
    //   content: {
    //     subjects,
    //     topics,
    //     questions,
    //     learning,
    //     total
    //   },
    //   batchSize
    // }
    // ========================================================

    const content =
      startData?.data?.content

    if (!content) {
      throw new Error(
        "Server did not return content manifest."
      )
    }

    // ========================================================
    // READ MANIFEST
    // ========================================================

    manifestSubjects.value =
      Number(content.subjects || 0)

    manifestTopics.value =
      Number(content.topics || 0)

    manifestQuestions.value =
      Number(content.questions || 0)

    manifestLearning.value =
      Number(content.learning || 0)

    downloadTotal.value =
      Number(content.total || 0)

    console.log("")
    console.log("========================================")
    console.log("📊 CONTENT MANIFEST")
    console.log("========================================")

    console.log(
      "📚 Subjects:",
      manifestSubjects.value
    )

    console.log(
      "📖 Topics:",
      manifestTopics.value
    )

    console.log(
      "❓ Questions:",
      manifestQuestions.value
    )

    console.log(
      "📘 Lessons:",
      manifestLearning.value
    )

    console.log(
      "📦 TOTAL:",
      downloadTotal.value
    )

    console.log(
      "📦 Batch size:",
      content.batchSize ||
      startData?.data?.batchSize ||
      500
    )

    // ========================================================
    // STEP 2
    // SUBJECTS
    // ========================================================

    downloadPhase.value =
      "Downloading subjects..."

    console.log("")
    console.log("========================================")
    console.log("📚 STEP 2: SUBJECTS")
    console.log("========================================")

    const subjectsUrl =
      `${apiUrl}/api/content/download/subjects?token=${encodeURIComponent(
        activationToken
      )}`

    console.log(
      "GET:",
      subjectsUrl
    )

    const subjectsResponse =
      await fetch(subjectsUrl)

    console.log(
      "HTTP:",
      subjectsResponse.status
    )

    const subjectsText =
      await subjectsResponse.text()

    console.log(
      "RAW:",
      subjectsText
    )

    if (!subjectsResponse.ok) {
      throw new Error(
        "Failed to download subjects."
      )
    }

    const subjectsData =
      JSON.parse(subjectsText)

    console.log(
      "SUBJECT RESPONSE:",
      subjectsData
    )

    const subjects =
      subjectsData?.data?.items || []

    console.log(
      "📚 Subjects received:",
      subjects.length
    )

    if (!Array.isArray(subjects)) {
      throw new Error(
        "Subjects response is not an array."
      )
    }

    // ========================================================
    // SAVE SUBJECTS
    // ========================================================

    if (subjects.length > 0) {
      console.log(
        "💾 Saving subjects to lessons.db..."
      )

      const savedSubjects = await saveSubjects(subjects)

      console.log(
        "✅ Subjects saved:",
        savedSubjects
      )
      downloadedSubjects.value = savedSubjects
    } else {
      downloadedSubjects.value = 0
    }

    updateDownloadPercentage()

    // ========================================================
    // STEP 3
    // TOPICS
    // ========================================================

    downloadPhase.value =
      "Downloading topics..."

    console.log("")
    console.log("========================================")
    console.log("📖 STEP 3: TOPICS")
    console.log("========================================")

    const topicsUrl =
      `${apiUrl}/api/content/download/topics?token=${encodeURIComponent(
        activationToken
      )}`

    console.log(
      "GET:",
      topicsUrl
    )

    const topicsResponse =
      await fetch(topicsUrl)

    console.log(
      "HTTP:",
      topicsResponse.status
    )

    const topicsText =
      await topicsResponse.text()

    console.log(
      "RAW TOPICS:",
      topicsText
    )

    if (!topicsResponse.ok) {
      throw new Error(
        "Failed to download topics."
      )
    }

    const topicsData =
      JSON.parse(topicsText)

    console.log(
      "TOPIC RESPONSE:",
      topicsData
    )

    const topics =
      topicsData?.data?.items || []

    console.log(
      "📖 Topics received:",
      topics.length
    )

    if (!Array.isArray(topics)) {
      throw new Error(
        "Topics response is not an array."
      )
    }

    // ========================================================
    // SAVE TOPICS
    // ========================================================

    if (topics.length > 0) {
      console.log(
        "💾 Saving topics to lessons.db..."
      )

      const savedTopics = await saveTopics(topics)

      console.log(
        "✅ Topics saved:",
        savedTopics
      )
      downloadedTopics.value = savedTopics
    } else {
      downloadedTopics.value = 0
    }

    updateDownloadPercentage()

    // ========================================================
    // STEP 4
    // QUESTIONS
    // ========================================================

    downloadPhase.value =
      "Downloading past questions..."

    console.log("")
    console.log("========================================")
    console.log("❓ STEP 4: QUESTIONS")
    console.log("========================================")

    let cursor = ""

    let totalQuestionsDownloaded = 0

    const batchSize =
      Number(
        startData?.data?.batchSize ||
        500
      )

    let questionBatch = 0

    while (true) {
      questionBatch++

      const params =
        new URLSearchParams()

      params.set(
        "token",
        activationToken
      )

      params.set(
        "limit",
        String(batchSize)
      )

      if (cursor) {
        params.set(
          "cursor",
          cursor
        )
      }

      const questionsUrl =
        `${apiUrl}/api/content/download/questions?${params.toString()}`

      console.log("")
      console.log(
        `📥 QUESTION BATCH ${questionBatch}`
      )

      console.log(
        "GET:",
        questionsUrl
      )

      const questionsResponse =
        await fetch(questionsUrl)

      console.log(
        "HTTP:",
        questionsResponse.status
      )

      const questionsText =
        await questionsResponse.text()

      if (!questionsResponse.ok) {
        console.error(
          "Question error:",
          questionsText
        )

        throw new Error(
          "Failed to download past questions."
        )
      }

      const questionsData =
        JSON.parse(questionsText)

      const questionData =
        questionsData?.data || {}

      const questions =
        questionData.items || []

      console.log(
        `📥 Received ${questions.length} questions`
      )

      console.log(
        "Question total from server:",
        questionData.total
      )

      console.log(
        "Next cursor:",
        questionData.nextCursor
      )

      console.log(
        "Has more:",
        questionData.hasMore
      )

      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        console.log(
          "✅ No more questions."
        )

        break
      }

      // ======================================================
      // SAVE QUESTIONS
      // ======================================================

      console.log(
        `💾 Saving ${questions.length} questions to questions.db...`
      )

      await saveQuestions(
        questions
      )

      console.log(
        `✅ Saved ${questions.length} questions`
      )

      totalQuestionsDownloaded +=
        questions.length

      downloadedQuestions.value =
        totalQuestionsDownloaded

      updateDownloadPercentage()

      // ======================================================
      // NEXT CURSOR
      // ======================================================

      const nextCursor =
        questionData.nextCursor ||
        null

      if (!nextCursor) {
        console.log(
          "🎉 Last question batch reached."
        )

        break
      }

      cursor =
        String(nextCursor)
    }

    // ========================================================
    // STEP 5
    // LEARNING
    // ========================================================

    downloadPhase.value =
      "Downloading lessons..."

    console.log("")
    console.log("========================================")
    console.log("📘 STEP 5: LESSONS")
    console.log("========================================")

    let learningCursor = ""

    let totalLearningDownloaded = 0

    let learningBatch = 0

    while (true) {
      learningBatch++

      const params =
        new URLSearchParams()

      params.set(
        "token",
        activationToken
      )

      params.set(
        "limit",
        String(batchSize)
      )

      if (learningCursor) {
        params.set(
          "cursor",
          learningCursor
        )
      }

      const learningUrl =
        `${apiUrl}/api/content/download/learning?${params.toString()}`

      console.log("")
      console.log(
        `📥 LESSON BATCH ${learningBatch}`
      )

      console.log(
        "GET:",
        learningUrl
      )

      const learningResponse =
        await fetch(learningUrl)

      console.log(
        "HTTP:",
        learningResponse.status
      )

      const learningText =
        await learningResponse.text()

      if (!learningResponse.ok) {
        console.error(
          "Learning error:",
          learningText
        )

        throw new Error(
          "Failed to download lessons."
        )
      }

      const learningData =
        JSON.parse(learningText)

      const learningDataObject =
        learningData?.data || {}

      const lessons =
        learningDataObject.items || []

      console.log(
        `📥 Received ${lessons.length} lessons`
      )

      console.log(
        "Lesson total from server:",
        learningDataObject.total
      )

      console.log(
        "Next cursor:",
        learningDataObject.nextCursor
      )

      if (
        !Array.isArray(lessons) ||
        lessons.length === 0
      ) {
        console.log(
          "✅ No more lessons."
        )

        break
      }

      // ======================================================
      // SAVE LESSONS
      // ======================================================

      console.log(
        `💾 Saving ${lessons.length} lessons to lessons.db...`
      )

      const savedLessons = await saveLearning(
        lessons
      )

      console.log(
        `✅ Saved ${savedLessons} lessons`
      )

      totalLearningDownloaded +=
        savedLessons

      downloadedLearning.value =
        totalLearningDownloaded

      updateDownloadPercentage()

      // ======================================================
      // NEXT CURSOR
      // ======================================================

      const nextCursor =
        learningDataObject.nextCursor ||
        null

      if (!nextCursor) {
        console.log(
          "🎉 Last lesson batch reached."
        )

        break
      }

      learningCursor =
        String(nextCursor)
    }

    // ========================================================
    // COMPLETE
    // ========================================================

    downloadPhase.value =
      "Download complete"

    downloadPercentage.value = 100

    console.log("")
    console.log("========================================")
    console.log("🎉 DOWNLOAD COMPLETE")
    console.log("========================================")

    console.log(
      "Subjects:",
      downloadedSubjects.value
    )

    console.log(
      "Topics:",
      downloadedTopics.value
    )

    console.log(
      "Questions:",
      downloadedQuestions.value
    )

    console.log(
      "Lessons:",
      downloadedLearning.value
    )

    console.log(
      "TOTAL DOWNLOADED:",
      downloadedSubjects.value +
      downloadedTopics.value +
      downloadedQuestions.value +
      downloadedLearning.value
    )

    console.log(
      "SERVER TOTAL:",
      downloadTotal.value
    )
  } catch (err: any) {
    console.error(
      "❌ CONTENT DOWNLOAD ERROR:",
      err
    )

    downloadError.value =
      err?.message ||
      "Content download failed."

    throw err
  } finally {
    downloading.value = false
  }
}

// ============================================================
// UPDATE PROGRESS
// ============================================================

function updateDownloadPercentage() {
  const total =
    Number(downloadTotal.value || 0)

  if (!total) {
    console.warn(
      "⚠️ Cannot calculate progress. Total is 0."
    )

    return
  }

  const downloaded =
    downloadedSubjects.value +
    downloadedTopics.value +
    downloadedQuestions.value +
    downloadedLearning.value

  const percentage =
    (downloaded / total) * 100

  downloadPercentage.value =
    Math.min(
      99,
      Math.round(percentage)
    )

  console.log(
    `📊 Progress: ${downloaded}/${total} = ${downloadPercentage.value}%`
  )
}
</script>

<template>
  <div
    class="min-h-screen bg-[#f6f3ec] flex items-center justify-center p-6"
  >
    <div
      class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
    >
      <!-- HEADER -->

      <div
        class="mb-8 text-center"
      >
        <h1
          class="text-3xl font-bold text-[#24304a]"
        >
          Activate Abanise CBT
        </h1>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Enter your activation token
          to prepare Abanise CBT for
          offline use.
        </p>
      </div>

      <!-- ================================================= -->
      <!-- ACTIVATION FORM -->
      <!-- ================================================= -->

      <form
        v-if="!downloading"
        class="space-y-5"
        @submit.prevent="activate"
      >
        <div>
          <label
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Activation Token
          </label>

          <input
            v-model="token"
            type="text"
            autocomplete="off"
            placeholder="ABANISE-XXXX-XXXX-XXXX"
            :disabled="loading"
            class="w-full rounded-2xl border border-slate-200 px-4 py-4 font-mono text-sm uppercase outline-none transition focus:border-[#b9873b] focus:ring-2 focus:ring-[#b9873b]/20 disabled:bg-slate-50"
          />
        </div>

        <div
          v-if="error"
          class="rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <div
          v-if="success"
          class="rounded-xl bg-green-50 p-3 text-sm text-green-600"
        >
          {{ success }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-2xl bg-[#24304a] px-5 py-4 font-semibold text-white transition hover:bg-[#1c263c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{
            loading
              ? "Preparing..."
              : "Activate Software"
          }}
        </button>
      </form>

      <!-- ================================================= -->
      <!-- DOWNLOAD SCREEN -->
      <!-- ================================================= -->

      <div
        v-if="downloading"
        class="space-y-6"
      >
        <!-- HEADER -->

        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#24304a]/10"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#b9873b]"
            />
          </div>

          <h2
            class="text-xl font-bold text-[#24304a]"
          >
            Preparing Abanise CBT
          </h2>

          <p
            class="mt-2 text-sm text-slate-500"
          >
            {{ downloadPhase }}
          </p>
        </div>

        <!-- PROGRESS -->

        <div>
          <div
            class="mb-2 flex items-center justify-between text-sm"
          >
            <span
              class="font-medium text-slate-600"
            >
              Download progress
            </span>

            <span
              class="font-bold text-[#24304a]"
            >
              {{ downloadPercentage }}%
            </span>
          </div>

          <div
            class="h-3 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              class="h-full rounded-full bg-[#b9873b] transition-all duration-300"
              :style="{
                width: `${downloadPercentage}%`,
              }"
            />
          </div>

          <p
            class="mt-2 text-center text-xs text-slate-400"
          >
            {{
              downloadedSubjects +
              downloadedTopics +
              downloadedQuestions +
              downloadedLearning
            }}
            /
            {{ downloadTotal }}
            items
          </p>
        </div>

        <!-- COUNTS -->

        <div
          class="grid grid-cols-2 gap-3"
        >
          <div
            class="rounded-2xl bg-slate-50 p-4"
          >
            <p
              class="text-xs text-slate-500"
            >
              Subjects
            </p>

            <p
              class="mt-1 text-xl font-bold text-[#24304a]"
            >
              {{ downloadedSubjects }}

              <span
                class="text-xs font-normal text-slate-400"
              >
                / {{ manifestSubjects }}
              </span>
            </p>
          </div>

          <div
            class="rounded-2xl bg-slate-50 p-4"
          >
            <p
              class="text-xs text-slate-500"
            >
              Topics
            </p>

            <p
              class="mt-1 text-xl font-bold text-[#24304a]"
            >
              {{ downloadedTopics }}

              <span
                class="text-xs font-normal text-slate-400"
              >
                / {{ manifestTopics }}
              </span>
            </p>
          </div>

          <div
            class="rounded-2xl bg-slate-50 p-4"
          >
            <p
              class="text-xs text-slate-500"
            >
              Questions
            </p>

            <p
              class="mt-1 text-xl font-bold text-[#24304a]"
            >
              {{ downloadedQuestions }}

              <span
                class="text-xs font-normal text-slate-400"
              >
                / {{ manifestQuestions }}
              </span>
            </p>
          </div>

          <div
            class="rounded-2xl bg-slate-50 p-4"
          >
            <p
              class="text-xs text-slate-500"
            >
              Lessons
            </p>

            <p
              class="mt-1 text-xl font-bold text-[#24304a]"
            >
              {{ downloadedLearning }}

              <span
                class="text-xs font-normal text-slate-400"
              >
                / {{ manifestLearning }}
              </span>
            </p>
          </div>
        </div>

        <!-- ERROR -->

        <div
          v-if="downloadError"
          class="rounded-xl bg-red-50 p-4 text-sm text-red-600"
        >
          {{ downloadError }}
        </div>

        <p
          class="text-center text-xs text-slate-400"
        >
          Please keep Abanise CBT open while
          your content is being prepared.
        </p>
      </div>
    </div>
  </div>
</template>