<script setup lang="ts">
import { computed, ref } from 'vue'
import Database from '@tauri-apps/plugin-sql'

const props = defineProps<{
  type: 'subject' | 'topic'
  id: string | number
  name?: string
}>()

const emit = defineEmits<{
  deleted: [id: string | number]
  cancel: []
}>()

const deleting = ref(false)
const error = ref('')

const label = computed(() => {
  return props.type === 'subject'
    ? 'Subject'
    : 'Topic'
})

let db: any = null

async function getDB() {
  if (db) return db

  db = await Database.load('sqlite:lessons.db')

  return db
}
 
async function deleteSubject(database: any) {
  const subjects = await database.select(
    `
    SELECT id
    FROM subjects
    WHERE id = ?
    LIMIT 1
    `,
    [props.id],
  )

  if (!subjects.length) {
    throw new Error('Subject not found.')
  }

  /*
   * Delete lessons first.
   */
  await database.execute(
    `
    DELETE FROM lessons
    WHERE subject_id = ?
    `,
    [props.id],
  )

  /*
   * Delete topics.
   */
  await database.execute(
    `
    DELETE FROM topics
    WHERE subject_id = ?
    `,
    [props.id],
  )

  /*
   * Delete subject.
   */
  await database.execute(
    `
    DELETE FROM subjects
    WHERE id = ?
    `,
    [props.id],
  )
}

async function deleteTopic(database: any) {

  const topics = await database.select(
    `
    SELECT id
    FROM topics
    WHERE id = ?
    LIMIT 1
    `,
    [props.id],
  )

  if (!topics.length) {
    throw new Error('Topic not found.')
  }

  /*
   * Delete lessons belonging to topic.
   */
  await database.execute(
    `
    DELETE FROM lessons
    WHERE topic_id = ?
    `,
    [props.id],
  )

  /*
   * Delete topic.
   */
  await database.execute(
    `
    DELETE FROM topics
    WHERE id = ?
    `,
    [props.id],
  )
}

const deleteItem = async () => {
  if (deleting.value) return

  deleting.value = true
  error.value = ''

  try {
    const database = await getDB()

    if (props.type === 'subject') {
      await deleteSubject(database)
    } else {
      await deleteTopic(database)
    }

    emit('deleted', props.id)
  } catch (err: any) {
    console.error(
      `Failed to delete ${label.value}:`,
      err,
    )

    error.value =
      err?.message ||
      `Failed to delete ${label.value}.`
  } finally {
    deleting.value = false
  }
}

const cancel = () => {
  if (deleting.value) return

  emit('cancel')
}
</script>

<template>
  <div
    class="w-full rounded-xl border border-red-200 bg-white p-5 shadow-xl"
  >
    <div class="mb-5">

      <div
        class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100"
      >
        <Icon
          name="lucide:trash-2"
          class="h-5 w-5 text-red-600"
        />
      </div>

      <h3 class="text-base font-bold text-slate-900">
        Delete {{ label }}
      </h3>

      <p class="mt-1 text-sm text-slate-500">
        Are you sure you want to delete
        <strong class="text-slate-700">
          {{ name || label }}
        </strong>
       ?
      </p>

      <p
        v-if="type === 'subject'"
        class="mt-2 text-xs leading-5 text-red-500"
      >
        This will also delete all topics and lessons
        belonging to this subject.
      </p>

      <p
        v-else
        class="mt-2 text-xs leading-5 text-red-500"
      >
        This will also delete all lessons belonging
        to this topic.
      </p>
    </div>

    <p
      v-if="error"
      class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <div class="flex justify-end gap-2">

      <button
        type="button"
        :disabled="deleting"
        class="rounded-lg border border-slate-200 px-4 py-2
               text-sm font-medium text-slate-600
               hover:bg-slate-50
               disabled:cursor-not-allowed
               disabled:opacity-50"
        @click="cancel"
      >
        Cancel
      </button>

      <button
        type="button"
        :disabled="deleting"
        class="rounded-lg bg-red-600 px-4 py-2
               text-sm font-semibold text-white
               hover:bg-red-700
               disabled:cursor-not-allowed
               disabled:opacity-50"
        @click="deleteItem"
      >
        {{ deleting ? 'Deleting...' : `Delete ${label}` }}
      </button>

    </div>
  </div>
</template>