<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import platform from '~/platforms'
import Database from '@tauri-apps/plugin-sql'
const isTauri = computed(() => {
  return import.meta.client && !!window.__TAURI_INTERNALS__
})

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
|
| Parent only needs to provide:
|
| <LessonJsonEditor
|   :lesson-id="currentLesson.id"
|   @updated="handleLessonUpdated"
| />
|
|--------------------------------------------------------------------------
*/

const props = defineProps({
  lessonId: {
    type: [String, Number],
    required: true,
  },
   



  /*
   * Change this if your database filename is different.
   *
   * Example:
   * sqlite:lessons.db
   * sqlite:cbt.db
   */
  database: {
    type: String,
    default: 'sqlite:lessons.db',
  },
})

/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

const emit = defineEmits([
  'updated',
  'error',
])

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

const db = ref(null)

async function getDB() {
  if (db.value) {
    return db.value
  }

  db.value = await Database.load(
    props.database,
  )

  return db.value
}

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const loading = ref(false)

const saving = ref(false)

const status = ref('idle')

const errorMessage = ref('')

const successMessage = ref('')

const jsonText = ref('')

const originalJsonText = ref('')

const editor = ref(null)
const  showedit = ref(false)
const showEditor = ref(true)

const lesson = ref(null)

/*
|--------------------------------------------------------------------------
| COMPUTED
|--------------------------------------------------------------------------
*/

const isDirty = computed(() => {
  return (
    jsonText.value !==
    originalJsonText.value
  )
})

const statusText = computed(() => {
  switch (status.value) {
    case 'loading':
      return 'Loading lesson...'

    case 'saving':
      return 'Saving...'

    case 'success':
      return 'Updated successfully'

    case 'error':
      return 'Error'

    default:
      return isDirty.value
        ? 'Unsaved changes'
        : 'Ready'
  }
})

const statusClass = computed(() => {
  switch (status.value) {
    case 'loading':
    case 'saving':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'

    case 'success':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

    case 'error':
      return 'bg-red-500/10 text-red-400 border-red-500/20'

    default:
      return isDirty.value
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
})

/*
|--------------------------------------------------------------------------
| GET LESSON
|--------------------------------------------------------------------------
|
| The lesson is automatically loaded using the ID supplied by parent.
|
*/

// async function getLesson(
//   lessonId,
// ) {
//   const database =
//     await getDB()

//   const rows =
//     await database.select(
//       `
//       SELECT
//         id,
//         topic_id,
//         subject_id,
//         topic_number,
//         slug,
//         title,
//         summary,
//         blocks,
//         search_text,
//         order_index
//       FROM lessons
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [lessonId],
//     )

//   return rows?.[0] || null
// }

/*
|--------------------------------------------------------------------------
| SAFE JSON PARSER
|--------------------------------------------------------------------------
*/

function parseBlocks(
  blocks,
) {
  /*
   * Database normally stores blocks as:
   *
   * JSON.stringify(blocks)
   *
   * Therefore blocks may be:
   *
   * string
   * array
   * object
   */

  if (
    blocks === null ||
    blocks === undefined ||
    blocks === ''
  ) {
    return []
  }

  if (
    typeof blocks === 'string'
  ) {
    try {
      return JSON.parse(blocks)
    } catch {
      /*
       * If the database contains malformed
       * JSON, return it as raw content so
       * the developer can repair it.
       */

      return blocks
    }
  }

  return blocks
}

/*
|--------------------------------------------------------------------------
| BUILD EDITOR JSON
|--------------------------------------------------------------------------
*/

function buildLessonJson(
  row,
) {
  return {
    id: row.id,
    lessonId: row.lessonId ,
    topic_id: row.topic_id   ,
    topicId:  row.topicId ,
    subject_id: row.subject_id ,
    subjectId: row.subjectId,
    topic_number: row.topic_number,
    topicNumber: row.topicNumber,
    slug: row.slug,

    title:  row.title,

    summary:  row.summary,

    blocks:
      parseBlocks(
        row.blocks,
      ),

    search_text:  row.search_text,
    searchText: row.searchText,
    order_index: row.order_index  ,
    orderIndex: row.orderIndex
  }
}

/*
|--------------------------------------------------------------------------
| LOAD LESSON
|--------------------------------------------------------------------------
*/

async function loadLesson() {
  console.log(props.lessonId , 'FFFFFFFFFFFFFFF');
  
  if (
    props.lessonId === null ||
    props.lessonId === undefined ||
    props.lessonId === ''
  ) {
    status.value = 'error'

    errorMessage.value =
      'No lesson ID was provided.'

    return
  }

  loading.value = true

  status.value = 'loading'

  errorMessage.value = ''

  successMessage.value = ''

  try {
    console.log('LOODING');
    
    const row =
      await platform.lesson.getLessonId(
        props.lessonId,
      )
      console.log(row,' FDFGDSFSDGSDFGDSDFGSDFGSDFG');
      

    // if (!row) {
    //   throw new Error(
    //     `Lesson with ID "${props.lessonId}" was not found in the database.`,
    //   )
    // }

    lesson.value = row

    const data =
      buildLessonJson(
        row,
      )

    /*
     * Pretty JSON exactly like
     * a VS Code JSON file.
     */

    const formatted =
      JSON.stringify(
        data,
        null,
        2,
      )

    jsonText.value =
      formatted

    originalJsonText.value =
      formatted

    status.value = 'idle'

    await nextTick()

    if (editor.value) {
      editor.value.focus()
    }
  } catch (error) {
    console.error(
      'Failed to load lesson:',
      error,
    )

    status.value = 'error'

    errorMessage.value =
      error?.message ||
      String(error)
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| VALIDATE JSON
|--------------------------------------------------------------------------
*/

function validateJson() {
  errorMessage.value = ''

  try {
    const parsed =  JSON.parse(jsonText.value,)
      console.log(parsed, 'parsedparsed');
      
    if (  parsed === null ||  typeof parsed !== 'object'  ) {
        console.log(parsed === null ||  typeof parsed !== 'object');
        
      throw new Error(
        'The JSON root must be an object.',
      )
    }
  console.log('hhhhhhxxxxxxxxx');
  
    /*
     * The editor represents one lesson.
     */
    console.log(Object.prototype.hasOwnProperty.call( parsed,'lessonId',));
    
    if ( !Object.prototype.hasOwnProperty.call(parsed, 'id') &&  !Object.prototype.hasOwnProperty.call(parsed, 'lessonId') ) {
      console.log('Neither id nor lessonId exists');

      throw new Error(
        'JSON must contain either an "id" or "lessonId" field.'
      );
    }
    console.log('passs heard');
    

    if (
      String(parsed.id) !==
      String(props.lessonId) &&   String(parsed.lessonId) !==  String(props.lessonId)
    ) {
      throw new Error(
        `You cannot change the lesson ID. Expected "${props.lessonId}" but received "${parsed.id}".`,
      )
    }

    /*
     * Blocks should normally be an array.
     */

    if (
      parsed.blocks !== undefined &&
      !Array.isArray(
        parsed.blocks,
      )
    ) {
      throw new Error(
        '"blocks" must be an array.',
      )
    }

    return parsed
  } catch (error) {
    status.value = 'error'

    errorMessage.value =
      error?.message ||
      'Invalid JSON.'

    return null
  }
}

/*
|--------------------------------------------------------------------------
| GENERATE SEARCH TEXT
|--------------------------------------------------------------------------
|
| Keeps lessons searchable after editing.
|
*/

function generateSearchText(
  data,
) {
  const parts = []

  if (data.title) {
    parts.push(
      String(data.title),
    )
  }

  if (data.summary) {
    parts.push(
      String(data.summary),
    )
  }

  function collect(
    value,
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      parts.push(
        String(value),
      )

      return
    }

    if (
      Array.isArray(value)
    ) {
      value.forEach(
        collect,
      )

      return
    }

    if (
      typeof value === 'object'
    ) {
      Object.values(value)
        .forEach(
          collect,
        )
    }
  }

  collect(data.blocks)

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/*
|--------------------------------------------------------------------------
| SAVE DIRECTLY TO DATABASE
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This does NOT send JSON to parent.
|
| It directly updates SQLite.
|
*/


async function websaveLesson() {
  if (saving.value) {
    return
  }
  console.log('SDFSDlessonIdlessonId');
  
  errorMessage.value = ''
  successMessage.value = ''

  /*
   * Validate JSON first.
   */
  const parsed = validateJson()

  if (!parsed) {
    console.log('gggg');
    
    return
  }

  saving.value = true
  status.value = 'saving'

  try {
    /*
     * The ID comes from the existing lesson.
     * The editor JSON cannot change it.
     */
    const lessonId =
      props.lessonId


    console.log(lessonId, 'jksdhaskjdhaskd askjdhaskdjhasdkjash asjkdhasjkdhas');
    
    if (!lessonId) {
      throw new Error('Lesson ID is required.')
    }

    /*
     * Send the lesson to the BACKEND.
     *
     * Do NOT send database-specific fields
     * such as the primary ID inside the JSON.
     */
    console.log(lessonId,'lessonIdlessonIdlessonIdlessonIdlessonIdlessonId');
    
    const response = await useApiFetch(
      `/api/lessons/${lessonId}`,
      {
        method: 'PUT',

        body: {
          title:
            parsed.title ??
            lesson.value?.title ??
            'Untitled Lesson',

          summary:
            parsed.summary ??
            lesson.value?.summary ??
            '',

          blocks:
            parsed.blocks ??
            [],

          slug:
            parsed.slug ??
            lesson.value?.slug ??
            '',

          topicId:
            parsed.topicId ??
            lesson.value?.topicId ??
            null,

          subjectId:
            parsed.subjectId ??
            lesson.value?.subjectId ??
            null,

          topicNumber:
            parsed.topicNumber ??
            lesson.value?.topicNumber ??
            null,

          orderIndex:
            parsed.orderIndex ??
            lesson.value?.orderIndex ??
            0,

          searchText:
            parsed.search_text !== undefined
              ? String(parsed.searchText || '')
              : generateSearchText(parsed),
        },
      },
    )

    console.log(
      'Lesson backend update result:',
      response.data,
    )

    /*
     * Backend should return the updated lesson.
     */
    const updatedLesson =
      response.lesson ?? response.data.lesson ?? response

    if (!updatedLesson) {
      throw new Error(
        'Lesson was updated but the backend returned no lesson.',
      )
    }

    /*
     * Update local editor state.
     */
    lesson.value =
      updatedLesson

    const updatedJson =
      JSON.stringify(
        buildLessonJson(
          updatedLesson,
        ),
        null,
        2,
      )

    jsonText.value =
      updatedJson

    originalJsonText.value =
      updatedJson

    status.value =
      'success'

    successMessage.value =
      'Lesson updated successfully.'
    saving.value = false
    /*
     * Tell the parent that the lesson changed.
     *
     * Only send the ID.
     */
    emit(
      'updated',
      lessonId,
    )

    window.setTimeout(() => {
      if (
        status.value ===
        'success'
      ) {
        status.value =
          'idle'
      }

      successMessage.value =
        ''
    }, 3000)

  } catch (error) {
    console.error(
      'Failed to update lesson:',
      error,
    )

    status.value =
      'error'

    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      String(error)

  } finally {
    saving.value = false
  }
}
async function saveLesson() {
  console.log('offff');
  
  if (!isTauri.value) {
   await websaveLesson()
    return
  }
console.log('offfssssssf');
  errorMessage.value = ''

  successMessage.value = ''

  /*
   * Validate JSON first.
   */

  const parsed =
    validateJson()

  if (!parsed) {
    return
  }

  saving.value = true

  status.value = 'saving'

  try {
    if (!isTauri) {

      return
    }
    const database =
      await getDB()

    /*
     * Never allow the editor to change
     * the database primary ID.
     */

    const lessonId =
      props.lessonId

    /*
     * Preserve existing database metadata
     * when fields are not present in JSON.
     */

    const current =
      lesson.value || {}

    const title =
      parsed.title ??
      current.title ??
      'Untitled Lesson'

    const summary =
      parsed.summary ??
      current.summary ??
      ''

    const blocks =
      parsed.blocks ??
      []

    const slug =
      parsed.slug ??
      current.slug ??
      ''

    const topicId =
      parsed.topic_id ??
      current.topic_id ??
      null

    const subjectId =
      parsed.subject_id ??
      current.subject_id ??
      null

    const topicNumber =
      parsed.topic_number ??
      current.topic_number ??
      null

    const orderIndex =
      parsed.order_index ??
      current.order_index ??
      0

    /*
     * Generate fresh search text.
     *
     * If you explicitly provide search_text
     * in JSON, we use yours instead.
     */

    const searchText =
      parsed.search_text !==
      undefined
        ? String(
            parsed.search_text || '',
          )
        : generateSearchText(
            parsed,
          )

    /*
     * Convert blocks back to the same
     * database format used by your importer:
     *
     * JSON.stringify(blocks)
     */

    const blocksJson =
      JSON.stringify(
        blocks,
      )

    /*
     * DIRECT DATABASE UPDATE
     */

    const result =
      await database.execute(
        `
        UPDATE lessons
        SET
          topic_id = ?,
          subject_id = ?,
          topic_number = ?,
          slug = ?,
          title = ?,
          summary = ?,
          blocks = ?,
          search_text = ?,
          order_index = ?
        WHERE id = ?
        `,
        [
          topicId,
          subjectId,
          topicNumber,
          slug,
          title,
          summary,
          blocksJson,
          searchText,
          orderIndex,
          lessonId,
        ],
      )

    console.log(
      'Lesson JSON update result:',
      result,
    )

    /*
     * Check whether SQLite actually
     * updated a row.
     */

    if (
      result &&
      typeof result.rowsAffected === 'number' &&
      result.rowsAffected === 0
    ) {
      throw new Error(
        `No lesson was updated. Lesson "${lessonId}" may no longer exist.`,
      )
    }

    /*
     * Rebuild FTS if your database
     * has lessons_fts.
     *
     * If it doesn't exist, simply skip it.
     */

    await rebuildFTS(
      database,
    )

    /*
     * Re-read the lesson directly
     * from SQLite.
     */

    const updatedLesson =
      await getLesson(
        lessonId,
      )

    if (!updatedLesson) {
      throw new Error(
        'Lesson was updated but could not be read back from the database.',
      )
    }

    lesson.value =
      updatedLesson

    /*
     * Build fresh editor JSON from
     * the actual database record.
     */

    const updatedJson =
      JSON.stringify(
        buildLessonJson(
          updatedLesson,
        ),
        null,
        2,
      )

    jsonText.value =
      updatedJson

    originalJsonText.value =
      updatedJson

    status.value =
      'success'

    successMessage.value =
      'Lesson updated directly in the database.'

    /*
     * IMPORTANT:
     *
     * Parent receives ONLY the notification.
     *
     * The JSON itself is NOT sent.
     */

    emit(
      'updated',
      lessonId,
    )

    /*
     * Remove success message after
     * a few seconds.
     */

    window.setTimeout(() => {
      if (
        status.value ===
        'success'
      ) {
        status.value =
          'idle'
      }

      successMessage.value =
        ''
    }, 3000)
  } catch (error) {
    console.error(
      'Failed to update lesson:',
      error,
    )

    status.value =
      'error'

    errorMessage.value =
      error?.message ||
      String(error)
  } finally {
    saving.value = false
  }
}

/*
|--------------------------------------------------------------------------
| REBUILD FTS
|--------------------------------------------------------------------------
*/

async function rebuildFTS(
  database,
) {
  try {
    const fts =
      await database.select(
        `
        SELECT
          name
        FROM sqlite_master
        WHERE type = 'table'
        AND name = 'lessons_fts'
        LIMIT 1
        `,
      )

    if (!fts?.length) {
      console.log(
        'lessons_fts does not exist. FTS rebuild skipped.',
      )

      return false
    }

    await database.execute(
      `
      INSERT INTO lessons_fts(
        lessons_fts
      )
      VALUES ('rebuild')
      `,
    )

    console.log(
      'lessons_fts rebuilt successfully.',
    )

    return true
  } catch (error) {
    /*
     * FTS should never prevent
     * the actual lesson update.
     */

    console.warn(
      'FTS rebuild skipped:',
      error,
    )

    return false
  }
}

/*
|--------------------------------------------------------------------------
| FORMAT JSON
|--------------------------------------------------------------------------
*/

function formatJson() {
  errorMessage.value = ''

  try {
    const parsed =
      JSON.parse(
        jsonText.value,
      )

    jsonText.value =
      JSON.stringify(
        parsed,
        null,
        2,
      )

    status.value = 'idle'
  } catch (error) {
    status.value = 'error'

    errorMessage.value =
      `Cannot format JSON: ${
        error?.message ||
        error
      }`
  }
}

/*
|--------------------------------------------------------------------------
| RESET CHANGES
|--------------------------------------------------------------------------
*/

function resetChanges() {
  if (!isDirty.value) {
    return
  }

  const confirmed =
    window.confirm(
      'Discard all changes and restore the last database version?',
    )

  if (!confirmed) {
    return
  }

  jsonText.value =
    originalJsonText.value

  errorMessage.value = ''

  successMessage.value = ''

  status.value = 'idle'
}

/*
|--------------------------------------------------------------------------
| RELOAD FROM DATABASE
|--------------------------------------------------------------------------
*/

async function reloadLesson() {
  if (
    isDirty.value
  ) {
    const confirmed =
      window.confirm(
        'You have unsaved changes. Reload from database and lose them?',
      )

    if (!confirmed) {
      return
    }
  }

  await loadLesson()
}

/*
|--------------------------------------------------------------------------
| KEYBOARD SHORTCUTS
|--------------------------------------------------------------------------
*/

function handleKeydown(
  event,
) {
  /*
   * Ctrl + S
   *
   * Save directly to SQLite.
   */

  if (
    (event.ctrlKey ||
      event.metaKey) &&
    event.key.toLowerCase() === 's'
  ) {
    event.preventDefault()

    saveLesson()

    return
  }

  /*
   * Ctrl + Shift + F
   *
   * Format JSON.
   */

  if (
    (event.ctrlKey ||
      event.metaKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === 'f'
  ) {
    event.preventDefault()

    formatJson()
  }
}

/*
|--------------------------------------------------------------------------
| WATCH LESSON ID
|--------------------------------------------------------------------------
|
| If parent changes currentLesson.id,
| automatically load the new lesson.
|
*/

watch(
  () => props.lessonId,
  async (
    newId,
    oldId,
  ) => {
    if (
      newId === oldId
    ) {
      return
    }

    await loadLesson()
  },
)

/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  window.addEventListener(
    'keydown',
    handleKeydown,
  )

  await loadLesson()
})

/*
|--------------------------------------------------------------------------
| UNMOUNT
|--------------------------------------------------------------------------
*/

onUnmounted(() => {
  window.removeEventListener(
    'keydown',
    handleKeydown,
  )
})
</script>

<template>
<div>
  <button @click="showedit = true" class="p-2 fixed  right-0 top-40  hover:bg-gray-100 rounded">
  <Icon name="lucide:pencil" class="w-5 h-5" /> 
</button>
    <div   v-if="showedit" class=" fixed   top-0 left-0  w-full ">
  
    <div
        class="w-full flex flex-col  o rounded-2xl border border-slate-700 bg-[#0d1117] text-slate-200 shadow-2xl"
    >
        <!-- ============================================================
            HEADER
        ============================================================= -->
        <div  class=" h-28  bg-amber-200">
        <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-[#161b22] px-4 py-3"
        >
        <div class="flex min-w-0 items-center gap-3">
            <!-- Icon -->

            <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
            >
            <Icon
                name="lucide:braces"
                class="h-5 w-5 text-blue-400"
            />
            </div>

            <div class="min-w-0">
            <div
                class="flex items-center gap-2"
            >
                <h2
                class="truncate text-sm font-bold text-white"
                >
                Lesson JSON Editor
                </h2>

                <span
                class="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400"
                >
                DEV
                </span>
            </div>

            <p
                class="truncate text-xs text-slate-500"
            >
                Direct SQLite lesson editor
            </p>
            </div>
        </div>

        <!-- Status -->

        <div
            class="flex items-center gap-2"
        >
            <span
            class="rounded-md border px-2.5 py-1 text-xs font-medium"
            :class="statusClass"
            >
            {{ statusText }}
            </span>

            <span
            class="hidden rounded-md bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-400 sm:block"
            >
            ID: {{ lessonId }}
            </span>
        </div>
        </div>

        <!-- ============================================================
            TOOLBAR
        ============================================================= -->

        <div
        class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-[#11161d] px-3 py-2"
        >
        <div
            class="flex flex-wrap items-center gap-1.5"
        >
            <!-- Reload -->

            <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || saving"
            @click="reloadLesson"
            >
            <Icon
                name="lucide:refresh-cw"
                class="h-3.5 w-3.5"
                :class="{
                'animate-spin': loading,
                }"
            />

            Reload
            </button>

            <!-- Format -->

            <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            :disabled="loading || saving"
            @click="formatJson"
            >
            <Icon
                name="lucide:wand-2"
                class="h-3.5 w-3.5"
            />

            Format
            </button>

            <!-- Reset -->
            <button
          
            type="button"
            @click="showedit = false"
            class=" rounded bg-red-500  w-fitt h-4 hover:bg-gray-100"
            >
            <Icon
                name="lucide:x"
                class="h text-sm   text-white"
            />
            </button>

            <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            :disabled="
                loading ||
                saving ||
                !isDirty
            "
            @click="resetChanges"
            >
            <Icon
                name="lucide:undo-2"
                class="h-3.5 w-3.5"
            />

            Reset
            </button>
        </div>

        <!-- Save -->
              
        <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="
            loading ||
            saving ||
            !isDirty
            "
            @click="saveLesson"
        >
            <Icon
            v-if="saving"
            name="lucide:loader-2"
            class="h-4 w-4 animate-spin"
            />

            <Icon
            v-else
            name="lucide:database"
            class="h-4 w-4"
            />

            {{ saving
            ? 'Updating Database...'
            : 'Update Database'
            }}
        </button>
        
        </div>
        

        <!-- ============================================================
            ERROR
        ============================================================= -->

        <div
        v-if="errorMessage"
        class="border-b border-red-500/20 bg-red-500/5 px-4 py-3"
        >
        <div
            class="flex items-start gap-2"
        >
            <Icon
            name="lucide:circle-alert"
            class="mt-0.5 h-4 w-4 shrink-0 text-red-400"
            />

            <div class="min-w-0">
            <p
                class="text-xs font-bold text-red-400"
            >
                JSON / Database Error
            </p>

            <pre
                class="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-red-300"
            >{{ errorMessage }}</pre>
            </div>
        </div>
        </div>

        <!-- ============================================================
            SUCCESS
        ============================================================= -->

        <div
        v-if="successMessage"
        class="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
        >
        <div
            class="flex items-center gap-2"
        >
            <Icon
            name="lucide:circle-check"
            class="h-4 w-4 text-emerald-400"
            />

            <span
            class="text-xs font-medium text-emerald-300"
            >
            {{ successMessage }}
            </span>
        </div>
        </div>
        </div>
        <!-- ============================================================
            EDITOR
        ============================================================= -->

        <div
        v-if="showEditor"
        class="relative flex-1 h-full   w-full "
        >
        <!-- Loading -->

        <div
            v-if="loading"
            class="absolute inset-0 z-20 flex items-center justify-center bg-[#0d1117]/90 backdrop-blur-sm"
        >
            <div
            class="flex items-center gap-3 rounded-lg border border-slate-700 bg-[#161b22] px-4 py-3 shadow-xl"
            >
            <Icon
                name="lucide:loader-2"
                class="h-5 w-5 animate-spin text-blue-400"
            />

            <span
                class="text-sm text-slate-300"
            >
                Loading lesson from SQLite...
            </span>
            </div>
        </div>

        <!-- VS CODE STYLE EDITOR -->

        <div
            class="relative flex h-[70vh] max-h-[70vh] min-h-0 bg-[#0d1117]"
        >
            <!-- Line numbers -->

            <div
            class="pointer-events-none select-none border-r border-slate-800 bg-[#0d1117] px-3 py-4 text-right font-mono text-[13px] leading-6 text-slate-600"
            >
            <div
                v-for="n in Math.max(
                jsonText.split('\n').length,
                1,
                )"
                :key="n"
            >
                {{ n }}
            </div>
            </div>

            <!-- Text editor -->

            <textarea
            ref="editor"
            v-model="jsonText"
            spellcheck="false"
            wrap="off"
            class="min-h-[550px] flex-1 resize-none border-0 bg-[#0d1117] px-4 py-4 font-mono text-[13px] leading-6 text-slate-300 outline-none focus:ring-0"
            placeholder="Loading lesson JSON..."
            :disabled="loading || saving"
            />
        </div>
        </div>

        <!-- ============================================================
            FOOTER
        ============================================================= -->

        <div
        class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#11161d] px-4 py-2.5"
        >
        <div
            class="flex flex-wrap items-center gap-3 text-[11px] text-slate-500"
        >
            <span>
            Ctrl + S
            <span class="text-slate-600">
                save
            </span>
            </span>

            <span>
            Ctrl + Shift + F
            <span class="text-slate-600">
                format
            </span>
            </span>

            <span
            v-if="lesson"
            class="text-slate-600"
            >
            {{ jsonText.split('\n').length }}
            lines
            </span>
        </div>

        <div
            class="flex items-center gap-2"
        >
            <span
            v-if="isDirty"
            class="flex items-center gap-1.5 text-[11px] text-amber-400"
            >
            <span
                class="h-1.5 w-1.5 rounded-full bg-amber-400"
            />

            Unsaved changes
            </span>

            <span
            v-else
            class="text-[11px] text-slate-600"
            >
            Database synchronized
            </span>
        </div>
        </div>
    </div>
    </div>
</div>
</template>