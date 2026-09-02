<script setup lang="ts">
import {  computed,  onMounted, ref, } from 'vue'


import platform from '~/platforms'
const isTauri = computed(() => {
  return import.meta.client && !!window.__TAURI_INTERNALS__
})

const props = defineProps({
  database: {
    type: String,
    default: 'sqlite:lessons.db',
  },
  subjectName: {
    type: String,
    default: '',
  },
  subjectId: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  resourceFile: {
    type: String,
    default: 'l.json',
  },
  autoLoad: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['imported', 'error'])

const db = ref(null)
const rawJson = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)
const importing = ref(false)
const status = ref('idle')
const errorMessage = ref('')
const importResult = ref(null)
const isDragging = ref(false)
const showPreview = ref(true)
const showJson = ref(false)
const expandedTopics = ref({})
const importedBlocks = ref([])



const statusText = computed(() => {
  switch (status.value) {
    case 'valid': return 'Valid curriculum'
    case 'saving': return 'Importing...'
    case 'success': return 'Import completed'
    case 'invalid': return 'Invalid JSON'
    case 'error': return 'Import failed'
    default: return 'Ready'
  }
})

async function loadCurriculumResource() {
  try {
    const basePath = await resourceDir()
    const filePath = `${basePath}/${props.resourceFile}`
    console.log('Loading curriculum resource:', filePath)

    const jsonText = await readTextFile(filePath)
    if (!jsonText?.trim()) {
      throw new Error('Curriculum resource is empty.')
    }
    return JSON.parse(jsonText)
  } catch (error) {
    throw new Error(`Unable to load curriculum resource: ${error?.message || error}`)
  }
}

async function loadBundledCurriculum() {
  try {
    const data = await loadCurriculumResource()
    rawJson.value = JSON.stringify(data, null, 2)
    validateInput()
    return data
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error?.message || 'Unable to load curriculum.'
    emit('error', error)
    throw error
  }
}

function paraHtml(text) {
  return String(text || '')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isMathFormula(value) {
  const s = String(value || '')
  const words = s.match(/[A-Za-z]{4,}/g) || []
  return words.length === 0
}

function toLatex(value) {
  return String(value || '')
    .replaceAll('...', '\\ldots')
    .replaceAll('×', '\\times ')
    .replaceAll('÷', '\\div ')
    .replaceAll('≠', '\\neq ')
    .replaceAll('≤', '\\leq ')
    .replaceAll('≥', '\\geq ')
    .replaceAll('≈', '\\approx ')
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stripTags(value) {
  return String(value || '').replace(/<[^<]+?>/g, '')
}

function stripLatex(value) {
  return String(value || '').replace(/\\[a-zA-Z]+|[{}\\()]/g, ' ')
}

function parseMarkdownTable(text) {
  const lines = String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return null
  if (!lines[0].includes('|') || !lines[1].includes('|')) return null

  const separator = lines[1].replace(/\|/g, '').replace(/[-:\s]/g, '')
  if (separator.length !== 0) return null

  const parseRow = line =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim())

  return {
    headers: parseRow(lines[0]),
    rows: lines.slice(2).map(parseRow),
  }
}

/*
|--------------------------------------------------------------------------
| TABLE HELPER
|--------------------------------------------------------------------------
*/
function processTable(tableObj, defaultCaption = '') {
  if (!tableObj || typeof tableObj !== 'object') return null

  const headers = tableObj.headers || []
  const rows = tableObj.rows || []

  if (!Array.isArray(headers) || !Array.isArray(rows)) return null

  return {
    type: 'table',
    headers,
    rows,
    caption: tableObj.title || tableObj.caption || defaultCaption,
  }
}

/*
|--------------------------------------------------------------------------
| CONCEPT → BLOCKS
|--------------------------------------------------------------------------
*/
function convertConcept(concept) {
  const blocks = []

  // Title
  const title = concept?.title || ''
  if (title) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: title,
    })
  }

  // Explanation (paragraphs, lists, or markdown table)
  const explanation = concept?.explanation || ''
  const table = parseMarkdownTable(explanation)

  if (table) {
    blocks.push({
      type: 'table',
      headers: table.headers,
      rows: table.rows,
    })
  } else {
    for (const paragraph of String(explanation).split(/\n\n+/)) {
      const trimmed = paragraph.trim()
      if (!trimmed) continue

      const lines = trimmed.split('\n')

      // Unordered list
      const isList = lines.length > 1 && lines.every(line => /^\s*[-*]\s+/.test(line))
      if (isList) {
        blocks.push({
          type: 'list',
          ordered: false,
          items_html: lines.map(line => line.replace(/^\s*[-*]\s+/, '').trim()),
        })
        continue
      }

      // Ordered list
      const isOrderedList = lines.length > 1 && lines.every(line => /^\s*\d+[.)]\s+/.test(line))
      if (isOrderedList) {
        blocks.push({
          type: 'list',
          ordered: true,
          items_html: lines.map(line => line.replace(/^\s*\d+[.)]\s+/, '').trim()),
        })
        continue
      }

      blocks.push({
        type: 'paragraph',
        text_html: paraHtml(trimmed),
      })
    }
  }

  // Overview table
  const overviewBlock = processTable(concept?.overviewTable, concept?.title || 'Overview')
  if (overviewBlock) blocks.push(overviewBlock)

  // Plain table
  const tableBlock = processTable(concept?.table, concept?.title || 'Table')
  if (tableBlock) blocks.push(tableBlock)

  // Plotting table
  const plottingBlock = processTable(concept?.plottingTable, concept?.title || 'Plotting Table')
  if (plottingBlock) blocks.push(plottingBlock)

  // Comparison table
  const comparisonBlock = processTable(concept?.comparisonTable, concept?.title || 'Comparison')
  if (comparisonBlock) blocks.push(comparisonBlock)

  // Formulas
  const formulas = [concept?.formula, concept?.formula2].filter(Boolean)
  for (const formula of formulas) {
    if (isMathFormula(formula)) {
      blocks.push({
        type: 'math',
        display: true,
        latex: toLatex(formula),
      })
    } else {
      blocks.push({
        type: 'tip',
        text: formula,
      })
    }
  }

  // Steps
  if (Array.isArray(concept?.steps) && concept.steps.length) {
    blocks.push({
      type: 'steps',
      items: concept.steps.map(step => String(step)),
    })
  }

  // Examples
  for (const example of concept?.examples || []) {
    if (typeof example === 'string') {
      blocks.push({
        type: 'example',
        title: 'Example',
        text_html: paraHtml(example),
      })
    } else if (example && typeof example === 'object') {
      blocks.push({
        type: 'example',
        title: example.title || 'Example',
        text_html: paraHtml(example.text_html || example.text || ''),
      })

      if (example.math) {
        blocks.push({
          type: 'math',
          display: example.math.display !== false,
          latex: example.math.latex || '',
          caption: example.math.caption || example.math.title || '',
        })
      }
    }
  }

  // SVG diagram
  if (concept?.svg) {
    blocks.push({
      type: 'svg',
      svg: concept.svg,
      caption: concept.caption || concept.title || '',
    })
  }

  // IMAGE (newly added)
  if (concept?.image) {
    const img = concept.image
    if (typeof img === 'string') {
      blocks.push({
        type: 'image',
        src: img,
        alt: concept.title || '',
        caption: concept.title || '',
      })
    } else if (img && typeof img === 'object') {
      blocks.push({
        type: 'image',
        src: img.src || '',
        alt: img.alt || concept.title || '',
        caption: img.caption || concept.title || '',
      })
    }
  }

  return blocks
}

/*
|--------------------------------------------------------------------------
| LESSON → BLOCKS
|--------------------------------------------------------------------------
*/
function convertLesson(lesson) {
  const blocks = []

  // Introduction
  if (lesson?.introduction) {
    blocks.push({
      type: 'paragraph',
      text_html: paraHtml(lesson.introduction),
    })
  }

  // Learning objectives
  if (Array.isArray(lesson?.learningObjectives) && lesson.learningObjectives.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Learning Objectives',
    })
    blocks.push({
      type: 'list',
      ordered: false,
      items_html: lesson.learningObjectives,
    })
  }

  // Top-level overviewTable
  const overviewTableBlock = processTable(lesson?.overviewTable, lesson?.title || 'Overview')
  if (overviewTableBlock) blocks.push(overviewTableBlock)

  // Concepts
  for (const concept of lesson?.concepts || []) {
    blocks.push(...convertConcept(concept))
  }

  // Formulas
  if (Array.isArray(lesson?.formulas) && lesson.formulas.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Key Formulas',
    })

    for (const formulaItem of lesson.formulas) {
      const formula = formulaItem?.formula || ''
      if (isMathFormula(formula)) {
        blocks.push({
          type: 'math',
          display: true,
          latex: toLatex(formula),
        })
      } else {
        blocks.push({
          type: 'tip',
          text: formula,
        })
      }

      const extra = [formulaItem?.explanation, formulaItem?.variables].filter(Boolean).join(' ')
      if (extra) {
        blocks.push({
          type: 'note',
          text_html: paraHtml(extra),
        })
      }
    }
  }

  // Worked examples
  if (Array.isArray(lesson?.workedExamples) && lesson.workedExamples.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Worked Examples',
    })

    for (const worked of lesson.workedExamples) {
      const items = [
        worked?.question || '',
        ...(Array.isArray(worked?.steps) ? worked.steps : []),
        `Answer: ${worked?.answer || ''}`,
      ].map(item => String(item).replace(/\n/g, '<br>'))

      blocks.push({
        type: 'steps',
        items,
      })
    }
  }

  // JAMB question patterns
  if (Array.isArray(lesson?.jambQuestionPatterns) && lesson.jambQuestionPatterns.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'JAMB Question Patterns',
    })
    blocks.push({
      type: 'list',
      ordered: false,
      items_html: lesson.jambQuestionPatterns,
    })
  }

  // Exam techniques
  if (Array.isArray(lesson?.jambExamTechniques) && lesson.jambExamTechniques.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Exam Techniques',
    })
    blocks.push({
      type: 'list',
      ordered: false,
      items_html: lesson.jambExamTechniques,
    })
  }

  // Common mistakes
  if (Array.isArray(lesson?.commonMistakes) && lesson.commonMistakes.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Common Mistakes',
    })

    for (const mistake of lesson.commonMistakes) {
      blocks.push({
        type: 'warning',
        text: `<strong>${escapeHtml(mistake?.mistake || '')}</strong> ${escapeHtml(mistake?.explanation || '')} ${escapeHtml(mistake?.correction || '')}`,
      })
    }
  }

  // Shortcuts
  if (Array.isArray(lesson?.examShortcuts) && lesson.examShortcuts.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Shortcuts',
    })

    for (const shortcut of lesson.examShortcuts) {
      blocks.push({
        type: 'tip',
        text: `${shortcut?.method || ''}${shortcut?.example ? ` e.g. ${shortcut.example}` : ''}`,
      })
    }
  }

  // Practice questions
  if (Array.isArray(lesson?.practiceQuestions) && lesson.practiceQuestions.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Practice Questions',
    })

    lesson.practiceQuestions.forEach((question, index) => {
      const options = Object.entries(question?.options || {})
        .map(([key, value]) => `${key}. ${value}`)
        .join('<br>')

      blocks.push({
        type: 'question',
        text: `<strong>Practice Question ${index + 1}</strong> ${question?.question || ''}${options ? `<br>${options}` : ''}`,
      })

      blocks.push({
        type: 'answer',
        text: `<strong>Correct Answer: ${question?.answer || ''}</strong><br><br><strong>Explanation:</strong> ${question?.solution || ''}`,
      })
    })
  }

  // Mastery check
  if (Array.isArray(lesson?.masteryCheck) && lesson.masteryCheck.length) {
    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Mastery Check',
    })

    for (const mastery of lesson.masteryCheck) {
      blocks.push({
        type: 'question',
        text: mastery?.question || '',
      })

      blocks.push({
        type: 'answer',
        text: `Answer: ${mastery?.answer || ''}`,
      })
    }
  }

  // Quiz
  if (lesson.quiz) {
    blocks.push({
      type: 'quiz',
      title: lesson.quiz.title || 'Quiz',
      description: lesson.quiz.description || '',
      questions: lesson.quiz.questions || [],
    })
  }

  // Quick revision
  if (lesson?.quickRevision) {
    const revision = lesson.quickRevision

    blocks.push({
      type: 'heading',
      level: 2,
      text: 'Quick Revision',
    })

    if (Array.isArray(revision.keyDefinitions) && revision.keyDefinitions.length) {
      blocks.push({
        type: 'list',
        ordered: false,
        items_html: revision.keyDefinitions,
      })
    }

    if (Array.isArray(revision.importantFormulas)) {
      for (const formula of revision.importantFormulas) {
        if (isMathFormula(formula)) {
          blocks.push({
            type: 'math',
            display: true,
            latex: toLatex(formula),
          })
        } else {
          blocks.push({
            type: 'tip',
            text: formula,
          })
        }
      }
    }

    if (Array.isArray(revision.commonTraps) && revision.commonTraps.length) {
      blocks.push({
        type: 'list',
        ordered: false,
        items_html: revision.commonTraps,
      })
    }
  }

  return blocks
}

/*
|--------------------------------------------------------------------------
| BLOCK SEARCH TEXT
|--------------------------------------------------------------------------
*/
function blockPlain(block) {
  const parts = []

  for (const key of ['text', 'text_html', 'term', 'title']) {
    if (block?.[key] != null) {
      parts.push(stripTags(block[key]))
    }
  }

  if (Array.isArray(block?.items_html)) {
    parts.push(...block.items_html.map(item => stripTags(item)))
  }

  if (Array.isArray(block?.items)) {
    parts.push(...block.items.map(item => stripTags(item)))
  }

  if (block?.type === 'table') {
    parts.push(...(block.rows || []).flat())
    parts.push(...(block.headers || []))
  }

  if (block?.type === 'svg') {
    parts.push(block.caption || '')
  }

  if (block?.type === 'image') {
    parts.push(block.alt || '')
    parts.push(block.caption || '')
  }

  if (block?.type === 'quiz') {
    parts.push(block.title || '')
    parts.push(block.description || '')
    if (Array.isArray(block.questions)) {
      block.questions.forEach(q => {
        parts.push(q.question || '')
        if (q.options) parts.push(...Object.values(q.options))
        parts.push(q.explanation || '')
      })
    }
  }

  if (block?.type === 'math') {
    parts.push(stripLatex(block.latex || ''))
    if (block.caption) parts.push(block.caption)
  }

  return parts.filter(Boolean).join(' ')
}

/*
|--------------------------------------------------------------------------
| PARSED CURRICULUM
|--------------------------------------------------------------------------
*/
const parsedCurriculum = computed(() => {
  if (!rawJson.value.trim()) return null
  try {
    const data = JSON.parse(rawJson.value)
    return data?.curriculum ?? data
  } catch {
    return null
  }
})

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/
const validation = computed(() => {
  if (!rawJson.value.trim()) {
    return { valid: false, message: 'Paste or upload JSON.' }
  }

  let data
  try {
    data = JSON.parse(rawJson.value)
  } catch (error) {
    return { valid: false, message: `Invalid JSON: ${error?.message || ''}` }
  }

  const curriculum = data?.curriculum ?? data

  if (!curriculum || typeof curriculum !== 'object' || Array.isArray(curriculum)) {
    return { valid: false, message: 'Curriculum must be an object.' }
  }

  if (!Array.isArray(curriculum.topics)) {
    return { valid: false, message: 'curriculum.topics must be an array.' }
  }

  if (!curriculum.lessons || typeof curriculum.lessons !== 'object' || Array.isArray(curriculum.lessons)) {
    return { valid: false, message: 'curriculum.lessons must be an object.' }
  }

  for (const topic of curriculum.topics) {
    if (!topic || typeof topic !== 'object') {
      return { valid: false, message: 'Every curriculum topic must be an object.' }
    }
    if (!topic.topicId) {
      return { valid: false, message: 'Every topic must have a topicId.' }
    }
    if (!topic.topicName) {
      return { valid: false, message: `Topic ${topic.topicId} is missing topicName.` }
    }
  }

  for (const [lessonKey, entry] of Object.entries(curriculum.lessons)) {
    const lesson = entry?.lesson ?? entry
    if (!lesson || typeof lesson !== 'object') {
      return { valid: false, message: `Lesson ${lessonKey} is invalid.` }
    }
    if (!lesson.title) {
      return { valid: false, message: `Lesson ${lessonKey} is missing a title.` }
    }
  }

  return { valid: true, message: 'Valid curriculum.' }
})

const canImport = computed(() => validation.value.valid && status.value !== 'saving')

/*
|--------------------------------------------------------------------------
| PREVIEW
|--------------------------------------------------------------------------
*/
const preview = computed(() => {
  const curriculum = parsedCurriculum.value
  if (!curriculum) return null

  const lessons = curriculum.lessons || {}
  const lessonsByTopic = {}

  for (const [lessonKey, entry] of Object.entries(lessons)) {
    const lesson = entry?.lesson ?? entry
    const topicCode = lessonKey.split('.')[0]

    if (!lessonsByTopic[topicCode]) {
      lessonsByTopic[topicCode] = []
    }

    lessonsByTopic[topicCode].push({
      key: lessonKey,
      title: lesson?.title || 'Untitled Lesson',
      syllabusReference: lesson?.syllabusReference || '',
      blocks: convertLesson(lesson),
    })
  }

  const topics = (curriculum.topics || []).map(topic => {
    const lessonList = lessonsByTopic[topic.topicId] || []
    return {
      code: topic.topicId,
      title: topic.topicName,
      declaredLessons: topic.lessons?.length || 0,
      lessons: lessonList,
    }
  })

  return {
    subject: curriculum.subject || 'Untitled Subject',
    examType: curriculum.examType || '',
    version: curriculum.version || '',
    generatedDate: curriculum.generatedDate || '',
    declaredLessons: curriculum.totalLessons ?? Object.keys(lessons).length,
    actualLessons: Object.keys(lessons).length,
    topics,
  }
})

const totalPreviewBlocks = computed(() => {
  if (!preview.value) return 0
  return preview.value.topics.reduce(
    (total, topic) => total + topic.lessons.reduce((sum, lesson) => sum + lesson.blocks.length, 0),
    0,
  )
})

function toggleTopic(code) {
  expandedTopics.value[code] = !expandedTopics.value[code]
}

function isExpanded(code) {
  return Boolean(expandedTopics.value[code])
}

function openFilePicker() {
  fileInput.value?.click()
}

async function readFile(file) {
  if (!file) return
  selectedFile.value = file

  try {
    const text = await file.text()
    if (!text?.trim()) throw new Error('The selected file is empty.')
    rawJson.value = text
    validateInput()
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error?.message || 'Unable to read JSON file.'
    emit('error', error)
  }
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  await readFile(file)
  event.target.value = ''
}

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.json')) {
    status.value = 'error'
    errorMessage.value = 'Please upload a JSON file.'
    return
  }

  await readFile(file)
}

function validateInput() {
  errorMessage.value = ''
  if (!rawJson.value.trim()) {
    status.value = 'idle'
    return
  }
  if (validation.value.valid) {
    status.value = 'valid'
  } else {
    status.value = 'invalid'
    errorMessage.value = validation.value.message
  }
}

function clearImporter() {
  rawJson.value = ''
  selectedFile.value = null
  status.value = 'idle'
  errorMessage.value = ''
  importResult.value = null
  importedBlocks.value = []
  expandedTopics.value = {}
  showJson.value = false
}




















function getValidOrderIndex(value: unknown, fallback: number): number {
  // Empty / null / undefined
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return fallback
  }

  // Only accept actual integers
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0
      ? value
      : fallback
  }

  // Accept numeric strings such as "1", "2", "10"
  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (/^\d+$/.test(trimmed)) {
      const number = Number(trimmed)

      if (Number.isInteger(number) && number > 0) {
        return number
      }
    }
  }

  // Anything invalid → last index + 1
  return fallback
}


async function importCurriculum() {
  if (importing.value) return

  if (!validation.value.valid) {
    validateInput()
    return
  }

  importing.value = true
  status.value = 'saving'
  errorMessage.value = ''
  importResult.value = null
  importedBlocks.value = []

  let transactionStarted = false

  try {
    const curriculum = parsedCurriculum.value
    if (!curriculum) throw new Error('Curriculum data could not be parsed.')

    if (!isTauri.value) {

      console.log(
        "🌐 Web mode → backend import"
      )

      /*
       * IMPORTANT:
       *
       * We send the blocks generated by
       * convertLesson(), because your backend
       * should save the final blocks.
       */

      const backendCurriculum =
        JSON.parse(
          JSON.stringify(curriculum)
        )

      /*
       * Convert lessons to the same structure
       * your SQLite importer creates.
       */
      const lessons =
        backendCurriculum.lessons || {}

      for (
        const [lessonKey, entry]
        of Object.entries(lessons)
      ) {

        const lesson =
          entry?.lesson ?? entry

        if (
          !lesson ||
          typeof lesson !== 'object'
        ) {
          continue
        }

        lesson.blocks =
          convertLesson(lesson)
      }

      const response =  await platform.lesson.importCurriculum(
          backendCurriculum
        )

      if (!response?.success) {

        throw new Error(
          response?.message ||
          "Backend import failed."
        )
      }

      importResult.value = {
        ...(response.data || {}),
        message:
          response.message ||
          "Curriculum imported successfully."
      }

      status.value = 'success'

      emit(
        'imported',
        importResult.value
      )

      return importResult.value
    }
  console.log(' is tauri', isTauri.value);

    const requiredTables = ['subjects', 'topics', 'lessons']
    const existingTables = await platform.lesson.getDatabaseTables()
    console.log(existingTables,'existingTables ');
    
    const tableNames = new Set(existingTables.map(table => table.name))

  console.log(tableNames, 'tableNames');


    for (const table of requiredTables) {
      if (!tableNames.has(table)) {
        throw new Error(`Required database table "${table}" does not exist.`)
      }
    }
    console.log(requiredTables,'requiredTables');
    

    await platform.lesson.beginTransaction()
    transactionStarted = true

    const subjectName = props.subjectName || curriculum.subject || 'Untitled Subject'
    const subjectId = props.subjectId || slugify(subjectName)

    if (!subjectId) throw new Error('Unable to determine subject ID.')

    const subjectAction = await platform.lesson.ensureSubject(subjectName, subjectId)

    let nextTopicNumber = (await platform.lesson.getMaxTopicNumber(subjectId)) + 1
    let nextTopicOrder = (await platform.lesson.getMaxTopicOrder(subjectId)) + 1

    const topicIdMap = {}
    let topicsInserted = 0
    let topicsUpdated = 0

    for (const topic of curriculum.topics || []) {
      const topicCode = String(topic?.topicId || '').trim()
      if (!topicCode) continue

      const topicName = String(topic?.topicName || topicCode).trim()
      const topicId = `${subjectId}-${slugify(topicName)}`

      topicIdMap[topicCode] = topicId

      const existing = await platform.lesson.getTopic(topicId)

      if (existing) {
        await platform.lesson.ensureTopic({
          topicId,
          subjectId,
          topicNumber: existing.topic_number,
          title: topicName,
          orderIndex: existing.order_index,
        })
        topicsUpdated++
      } else {
        await platform.lesson.ensureTopic({
          topicId,
          subjectId,
          topicNumber: nextTopicNumber,
          title: topicName,
          orderIndex: nextTopicOrder,
        })
        topicsInserted++
        nextTopicNumber++
        nextTopicOrder++
      }
    }

    const lessons = curriculum.lessons || {}
    const lessonKeys = Object.keys(lessons).sort(naturalLessonSort)

    let inserted = 0
    let updated = 0
    let totalBlocks = 0
    const orderCounters = {}
    importedBlocks.value = []

    for (const lessonKey of lessonKeys) {
      const entry = lessons[lessonKey]
      const lesson = entry?.lesson ?? entry

      if (!lesson || typeof lesson !== 'object') {
        console.warn(`Skipping invalid lesson: ${lessonKey}`)
        continue
      }

      const parts = String(lessonKey).split('.')
      const topicCode = parts[0]
      const lessonCode = parts[1] || lesson?.id || slugify(lesson?.title)

      if (!topicCode) {
        console.warn(`Skipping lesson without topic code: ${lessonKey}`)
        continue
      }

      let topicId = topicIdMap[topicCode]

      if (!topicId) {
        const fallbackTopicName = lesson?.topic || topicCode
        topicId = `${subjectId}-${slugify(fallbackTopicName)}`

        let existing = await platform.lesson.getTopic(topicId)
        if (!existing) {
          existing = await platform.lesson.getTopicByTitle(subjectId, fallbackTopicName)
          if (existing) topicId = existing.id
        }

        if (!existing) {
          await ensureTopic({
            topicId,
            subjectId,
            topicNumber: nextTopicNumber,
            title: fallbackTopicName,
            orderIndex: nextTopicOrder,
          })
          nextTopicNumber++
          nextTopicOrder++
          topicsInserted++
        }

        topicIdMap[topicCode] = topicId
      }

      if (orderCounters[topicId] == null) {
        orderCounters[topicId] = (await platform.lesson.getMaxLessonOrder(topicId)) + 1
      }

      const blocks = convertLesson(lesson)
      totalBlocks += blocks.length

      importedBlocks.value.push({
        lessonId: lesson?.id || lessonKey,
        title: lesson?.title || 'Untitled Lesson',
        count: blocks.length,
        blocks,
      })

      const slug = slugify(lesson?.title || lessonKey)
      const lessonId = `${subjectId}-${slugify(topicCode)}-${slugify(lessonCode)}-${slug}`

      const objectiveText = Array.isArray(lesson?.learningObjectives)
        ? lesson.learningObjectives.join(' ')
        : ''

      const searchText = [
        lesson?.title || '',
        lesson?.introduction || '',
        objectiveText,
        ...blocks.map(blockPlain),
      ]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      const topicNumber = lesson?.syllabusReference || ''
      const summary = String(lesson?.introduction || '').replace(/\s+/g, ' ').trim().slice(0, 200)

      const existingLesson = await platform.lesson.getLessonId(lessonId)

      let orderIndex
     
     

      if (existingLesson) {
        // Get the last valid index for this topic
        const lastIndex = Math.max(
          0,
          Number(orderCounters[topicId] || 1) - 1
        )

        // Keep existing index only if it is a valid integer.
        // Otherwise use last index + 1.
        orderIndex = getValidOrderIndex(
          existingLesson.order_index,
          lastIndex + 1
        )

        // Make sure the counter continues after the selected index
        orderCounters[topicId] = Math.max(
          Number(orderCounters[topicId] || 1),
          orderIndex + 1
        )
      } else {
        // New lesson
        orderIndex = getValidOrderIndex(
          orderCounters[topicId],
          1
        )

        orderCounters[topicId] = orderIndex + 1
      }



      const row = {
        id: lessonId,
        topic_id: topicId,
        subject_id: subjectId,
        topic_number: topicNumber,
        slug,
        title: lesson?.title || 'Untitled Lesson',
        summary,
        blocks: JSON.stringify(blocks),
        search_text: searchText,
        order_index: orderIndex,
      }

      const action = await platform.lesson.upsertLesson(row)
      if (action === 'inserted') inserted++
      if (action === 'updated') updated++

      if (!existingLesson) {
        orderCounters[topicId] = orderIndex + 1
      }
    }

    const ftsRebuilt = await platform.lesson.rebuildFTS()
    await  platform.lesson.commitTransaction()
    transactionStarted = false

    const verification = await platform.lesson.verifyImport(subjectId)

    importResult.value = {
      subject: subjectName,
      subjectId,
      subjectAction,
      topics: curriculum.topics?.length || 0,
      topicsInserted,
      topicsUpdated,
      total: lessonKeys.length,
      inserted,
      updated,
      totalBlocks,
      databaseTopics: verification.topicCount,
      databaseLessons: verification.lessonCount,
      ftsRebuilt,
      message: 'Curriculum imported successfully.',
    }

    status.value = 'success'
    emit('imported', importResult.value)
    return importResult.value
  } catch (error) {
    console.error('Curriculum import failed:', error)

    if (transactionStarted) {
      try {
       
        await platform.lesson.rollbackTransaction()
        console.log('Curriculum import rolled back.')
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    status.value = 'error'
    errorMessage.value = error?.message || 'Curriculum import failed.'
    emit('error', error)
    return null
  } finally {
    importing.value = false
  }
}



function naturalLessonSort(a, b) {
  const aParts = String(a).split('.')
  const bParts = String(b).split('.')

  const aTopic = aParts[0] || ''
  const bTopic = bParts[0] || ''

  const topicCompare = aTopic.localeCompare(bTopic)
  if (topicCompare !== 0) return topicCompare

  const aNumber = Number(aParts[1] || 0)
  const bNumber = Number(bParts[1] || 0)

  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
    return aNumber - bNumber
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

function blockTypeLabel(type) {
  const labels = {
    heading: 'Heading',
    paragraph: 'Paragraph',
    list: 'List',
    definition: 'Definition',
    table: 'Table',
    note: 'Note',
    warning: 'Warning',
    tip: 'Tip',
    example: 'Example',
    steps: 'Steps',
    question: 'Question',
    answer: 'Answer',
    math: 'Formula',
    svg: 'Diagram',
    image: 'Image',
    quiz: 'Quiz',
  }
  return labels[type] || type || 'Block'
}

function blockTypeIcon(type) {
  const icons = {
    heading: 'lucide:heading-2',
    paragraph: 'lucide:pilcrow',
    list: 'lucide:list',
    definition: 'lucide:book-open',
    table: 'lucide:table-2',
    note: 'lucide:sticky-note',
    warning: 'lucide:triangle-alert',
    tip: 'lucide:lightbulb',
    example: 'lucide:badge-help',
    steps: 'lucide:list-ordered',
    question: 'lucide:circle-help',
    answer: 'lucide:check-circle',
    math: 'lucide:sigma',
    svg: 'lucide:image',
    image: 'lucide:image',
    quiz: 'lucide:file-question',
  }
  return icons[type] || 'lucide:box'
}

async function importCurrent() {
  validateInput()
  if (!validation.value.valid) return
  return await importCurriculum()
}

async function verifyCurrentSubject() {
  const curriculum = parsedCurriculum.value
  if (!curriculum) throw new Error('No curriculum loaded.')

  const subjectName = props.subjectName || curriculum.subject || 'Untitled Subject'
  const subjectId = props.subjectId || slugify(subjectName)

  return await verifyImport(subjectId)
}

onMounted(async () => {
  if (!props.autoLoad) return
  try {
    await loadBundledCurriculum()
  } catch {
    // Error already handled in loadBundledCurriculum
  }
})
</script>

<template>
  <section class="mx-auto w-full max-w-7xl">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="mb-1 flex items-center gap-2">
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Import Curriculum</h1>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">SQLite</span>
        </div>
        <p class="max-w-3xl text-sm leading-6 text-slate-500">
          Upload a curriculum JSON file, preview its lessons and blocks, then save everything directly
          into your Tauri SQLite database.
        </p>
      </div>
      <div
        class="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-semibold"
        :class="{
          'border-slate-200 bg-slate-50 text-slate-600': status === 'idle',
          'border-emerald-200 bg-emerald-50 text-emerald-700': status === 'valid' || status === 'success',
          'border-red-200 bg-red-50 text-red-700': status === 'invalid' || status === 'error',
          'border-blue-200 bg-blue-50 text-blue-700': status === 'saving',
        }"
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="{
            'bg-slate-400': status === 'idle',
            'bg-emerald-500': status === 'valid' || status === 'success',
            'bg-red-500': status === 'invalid' || status === 'error',
            'bg-blue-500': status === 'saving',
          }"
        />
        {{ statusText }}
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <!-- Left side -->
      <div class="min-w-0">
        <div
          class="mb-4 rounded-xl border border-dashed p-5 transition"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white'"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="handleFileUpload">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Icon name="lucide:file-json" class="h-6 w-6 text-slate-500" />
            </div>
            <p class="text-sm font-semibold text-slate-800">Upload curriculum JSON</p>
            <p class="mt-1 text-xs text-slate-500">Drag and drop your JSON file here</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="openFilePicker"
            >
              <Icon name="lucide:upload" class="h-4 w-4" />
              Choose JSON file
            </button>
            <p v-if="selectedFile" class="mt-3 text-xs font-medium text-emerald-600">{{ selectedFile.name }}</p>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-xl border bg-white shadow-sm"
          :class="{
            'border-emerald-300': status === 'valid' || status === 'success',
            'border-red-300': status === 'invalid' || status === 'error',
            'border-slate-200': status === 'idle' || status === 'saving',
          }"
        >
          <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center gap-2">
              <Icon name="lucide:braces" class="h-4 w-4 text-slate-500" />
              <span class="text-xs font-bold uppercase tracking-wide text-slate-600">Curriculum JSON</span>
            </div>
            <span class="text-[10px] text-slate-400">{{ rawJson.length.toLocaleString() }} characters</span>
          </div>
          <textarea
            v-model="rawJson"
            spellcheck="false"
            class="min-h-[520px] w-full resize-y border-0 bg-slate-950 p-4 font-mono text-[12px] leading-6 text-slate-200 outline-none placeholder:text-slate-600"
            placeholder='{
  "curriculum": {
    "subject": "Mathematics",
    "examType": "JAMB",
    "topics": [],
    "lessons": {}
  }
}'
            @input="validateInput"
          />
          <div v-if="status === 'invalid' || status === 'error'" class="border-t border-red-100 bg-red-50 px-4 py-3">
            <div class="flex gap-2">
              <Icon name="lucide:circle-alert" class="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p class="text-xs leading-5 text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            :disabled="!canImport"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            @click="importCurriculum"
          >
            <Icon v-if="status === 'saving'" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="lucide:database" class="h-4 w-4" />
            {{ status === 'saving' ? 'Importing...' : 'Import to SQLite' }}
          </button>
          <button
            type="button"
            :disabled="!rawJson"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="clearImporter"
          >
            <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
            Clear
          </button>
          <button
            v-if="preview"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="showJson = !showJson"
          >
            <Icon :name="showJson ? 'lucide:eye-off' : 'lucide:code'" class="h-4 w-4" />
            {{ showJson ? 'Hide JSON' : 'View JSON' }}
          </button>
        </div>

        <div v-if="showJson" class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
          <pre class="max-h-[500px] overflow-auto p-4 font-mono text-[11px] leading-5 text-slate-300">{{ JSON.stringify(parsedCurriculum, null, 2) }}</pre>
        </div>

        <div v-if="status === 'success'" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div class="flex gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Icon name="lucide:check" class="h-5 w-5 text-emerald-600" />
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-emerald-800">Curriculum imported successfully</h3>
              <p class="mt-1 text-xs text-emerald-700">Existing records were preserved. Matching lesson IDs were updated. New lessons were inserted.</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">Inserted: {{ importResult?.inserted || 0 }}</span>
                <span class="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-blue-700">Updated: {{ importResult?.updated || 0 }}</span>
                <span class="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">Lessons: {{ importResult?.total || 0 }}</span>
                <span class="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-purple-700">Blocks: {{ importResult?.totalBlocks || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right preview -->
      <aside class="min-w-0">
        <div class="sticky top-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            class="flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-left"
            @click="showPreview = !showPreview"
          >
            <div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:eye" class="h-4 w-4 text-slate-500" />
                <span class="text-xs font-bold uppercase tracking-wide text-slate-700">Preview</span>
              </div>
              <p class="mt-1 text-[11px] text-slate-400">Curriculum → Lessons → Blocks</p>
            </div>
            <Icon :name="showPreview ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="h-4 w-4 text-slate-400" />
          </button>

          <div v-if="showPreview" class="p-4">
            <div v-if="!preview" class="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Icon name="lucide:file-search" class="h-5 w-5 text-slate-400" />
              </div>
              <p class="text-sm font-semibold text-slate-600">Nothing to preview</p>
              <p class="mt-1 max-w-[240px] text-xs leading-5 text-slate-400">
                Upload or paste valid curriculum JSON to see your topics, lessons and generated blocks.
              </p>
            </div>

            <template v-else>
              <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold text-slate-900">{{ preview.subject }}</p>
                    <div class="mt-1 flex flex-wrap gap-1.5">
                      <span v-if="preview.examType" class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{{ preview.examType }}</span>
                      <span v-if="preview.version" class="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">v{{ preview.version }}</span>
                    </div>
                  </div>
                  <Icon name="lucide:book-open" class="h-5 w-5 shrink-0 text-slate-400" />
                </div>
                <div class="mt-3 grid grid-cols-3 gap-2">
                  <div class="rounded-lg bg-white p-2.5">
                    <p class="text-[9px] uppercase tracking-wide text-slate-400">Topics</p>
                    <p class="mt-0.5 text-lg font-bold text-slate-900">{{ preview.topics.length }}</p>
                  </div>
                  <div class="rounded-lg bg-white p-2.5">
                    <p class="text-[9px] uppercase tracking-wide text-slate-400">Lessons</p>
                    <p class="mt-0.5 text-lg font-bold text-slate-900">{{ preview.actualLessons }}</p>
                  </div>
                  <div class="rounded-lg bg-white p-2.5">
                    <p class="text-[9px] uppercase tracking-wide text-slate-400">Blocks</p>
                    <p class="mt-0.5 text-lg font-bold text-slate-900">{{ totalPreviewBlocks }}</p>
                  </div>
                </div>
                <p v-if="preview.declaredLessons" class="mt-2 text-[10px] text-slate-400">JSON declares {{ preview.declaredLessons }} lessons.</p>
              </div>

              <div class="max-h-[680px] space-y-2 overflow-y-auto pr-1">
                <div v-for="topic in preview.topics" :key="topic.code" class="overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50"
                    @click="toggleTopic(topic.code)"
                  >
                    <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {{ topic.code }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-xs font-semibold text-slate-800">{{ topic.title }}</p>
                      <p class="mt-0.5 text-[10px] text-slate-400">{{ topic.lessons.length }} lessons</p>
                    </div>
                    <Icon :name="isExpanded(topic.code) ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="h-4 w-4 shrink-0 text-slate-400" />
                  </button>

                  <div v-if="isExpanded(topic.code)" class="border-t border-slate-100 bg-slate-50">
                    <div v-for="lesson in topic.lessons" :key="lesson.key" class="border-b border-slate-100 last:border-0">
                      <div class="px-3 py-3">
                        <div class="flex gap-2">
                          <span class="shrink-0 font-mono text-[9px] text-slate-400">{{ lesson.syllabusReference || lesson.key }}</span>
                          <p class="text-[11px] font-semibold leading-4 text-slate-700">{{ lesson.title }}</p>
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1">
                          <span
                            v-for="(block, index) in lesson.blocks"
                            :key="index"
                            class="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-1 text-[9px] font-medium text-slate-500"
                          >
                            <Icon :name="blockTypeIcon(block.type)" class="h-2.5 w-2.5" />
                            {{ blockTypeLabel(block.type) }}
                          </span>
                        </div>
                        <p class="mt-2 text-[9px] text-slate-400">{{ lesson.blocks.length }} blocks generated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>