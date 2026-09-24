<template>
  <div class="q-search">
    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->
    <header class="qs-header">
      <div class="qs-header__brand">
        <span class="qs-header__mark">
          <Icon name="lucide:search-check" />
        </span>

        <div class="qs-header__heading">
          <h1 class="qs-header__title">Question Bank</h1>
          <p class="qs-header__sub">
            Search by topic, subject, or any words
          </p>
        </div>
      </div>

      <button
        type="button"
        class="qs-header__home"
        aria-label="Go home"
        title="Go home"
        @click="goHome"
      >
        <Icon name="lucide:house" />
      </button>
    </header>

    <!-- ========================================= -->
    <!-- MAIN -->
    <!-- ========================================= -->
    <main class="qs-main">
      <!-- SEARCH BOX -->
      <div class="lookup-slip">
        <Icon name="lucide:search" class="lookup-slip__icon" />

        <input
          v-model="query"
          type="text"
          class="lookup-slip__input"
          placeholder="Search questions..."
          autocomplete="off"
          @input="onInput"
          @keydown.enter="runSearch"
        />

        <button
          v-if="query"
          type="button"
          class="lookup-slip__clear"
          aria-label="Clear search"
          title="Clear search"
          @click="onClear"
        >
          <Icon name="lucide:x" />
        </button>
      </div>

      <!-- SUBJECT FILTER CHIPS -->
      <div v-if="subjects.length" class="filter-wrapper">
        <div class="filter-row">
          <button
            type="button"
            class="filter-chip"
            :class="{ 'filter-chip--active': !activeSubject }"
            @click="setSubject(null)"
          >
            All subjects
          </button>

          <button
            v-for="subject in subjects"
            :key="subject"
            type="button"
            class="filter-chip"
            :class="{
              'filter-chip--active': activeSubject === subject,
            }"
            @click="setSubject(subject)"
          >
            {{ formatLabel(subject) }}
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading && !currentQuestion"
        class="qs-status"
        role="status"
        aria-live="polite"
      >
        <Icon name="lucide:loader-2" class="qs-status__spin" />
        <span>Searching...</span>
      </div>

      <!-- EMPTY / IDLE -->
      <div
        v-if="!query && !currentQuestion"
        class="qs-empty"
      >
        <div class="qs-empty__mark">
          <Icon name="lucide:layers" />
        </div>

        <h2 class="qs-empty__title">
          Search the question bank
        </h2>

        <p class="qs-empty__sub">
          Try a topic, a keyword, or part of a question.
        </p>
      </div>

      <!-- NO RESULTS -->
      <div
        v-else-if="
          query &&
          !loading &&
          !results.length &&
          !currentQuestion
        "
        class="qs-empty"
      >
        <div class="qs-empty__mark qs-empty__mark--bad">
          <Icon name="lucide:file-question" />
        </div>

        <h2 class="qs-empty__title">
          No matching questions
        </h2>

        <p class="qs-empty__sub">
          Try fewer or different words.
        </p>
      </div>

      <!-- RESULTS LIST -->
      <ul
        v-if="!currentQuestion && results.length"
        class="result-list"
      >
        <li
          v-for="row in results"
          :key="row.id"
          class="result-card"
          tabindex="0"
          role="button"
          @click="openQuestion(row.id)"
          @keydown.enter="openQuestion(row.id)"
          @keydown.space.prevent="openQuestion(row.id)"
        >
          <div class="result-card__tags">
            <span class="tag tag--subject">
              {{ formatLabel(row.subject) }}
            </span>

            <span v-if="row.year" class="tag">
              {{ row.year }}
            </span>

            <span v-if="row.topic" class="tag tag--topic">
              {{ row.topic }}
            </span>
          </div>

          <p
            class="result-card__snippet"
            v-html="renderSnippet(row.snippet)"
          ></p>

          <div class="result-card__footer">
            <span>View question</span>
            <Icon name="lucide:arrow-up-right" />
          </div>
        </li>
      </ul>

      <!-- FULL QUESTION DETAIL -->
      <article
        v-if="currentQuestion"
        class="quiz-card"
      >
        <div class="quiz-card__top">
          <div class="quiz-card__tags">
            <span class="tag tag--subject">
              {{ formatLabel(currentQuestion.subject) }}
            </span>

            <span
              v-if="currentQuestion.year"
              class="tag"
            >
              {{ currentQuestion.year }}
            </span>

            <span
              v-if="currentQuestion.examType"
              class="tag"
            >
              {{ currentQuestion.examType.toUpperCase() }}
            </span>
          </div>

          <button
            type="button"
            class="quiz-card__close"
            aria-label="Back to results"
            title="Back to results"
            @click="closeQuestion"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <p class="quiz-card__question">
          {{ currentQuestion.question }}
        </p>

        <ul class="options">
          <li
            v-for="(text, letter) in currentQuestion.options"
            :key="letter"
            class="option"
            :class="{
              'option--correct':
                letter === currentQuestion.answer,
            }"
          >
            <span class="option__letter">
              {{ letter }}
            </span>

            <span class="option__text">
              {{ text }}
            </span>

            <Icon
              v-if="letter === currentQuestion.answer"
              name="lucide:check-circle-2"
              class="option__check"
            />
          </li>
        </ul>

        <div
          v-if="currentQuestion.solution"
          class="explanation"
        >
          <span class="explanation__label">
            <Icon name="lucide:lightbulb" />
            Explanation
          </span>

          <p class="explanation__text">
            {{ currentQuestion.solution }}
          </p>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['gohome'])

const {
  results,
  currentQuestion,
  subjects,
  loading,
  search,
  loadQuestion,
  loadSubjects,
  clear,
} = useQuestionSearch()

const query = ref('')
const activeSubject = ref(null)

let debounceTimer = null

onMounted(() => {
  loadSubjects()
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// =========================================
// SEARCH
// =========================================

const runSearch = () => {
  const searchText = query.value.trim()

  if (!searchText) {
    clear()
    return
  }

  search(searchText, {
    subject: activeSubject.value,
  })
}

const onInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (!query.value.trim()) {
    clear()
    return
  }

  debounceTimer = setTimeout(() => {
    runSearch()
  }, 250)
}

const setSubject = (subject) => {
  activeSubject.value = subject

  if (query.value.trim()) {
    runSearch()
  }
}

const onClear = () => {
  query.value = ''
  activeSubject.value = null
  clear()
}

// =========================================
// QUESTION DETAIL
// =========================================

const openQuestion = async (id) => {
  if (!id) return

  await loadQuestion(id)
}

const closeQuestion = () => {
  currentQuestion.value = null
}

// =========================================
// FORMATTING
// =========================================

const formatLabel = (value) => {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
}

// Converts ⟦matched text⟧ into highlighted <mark> text
const renderSnippet = (snippet) => {
  if (!snippet) return ''

  return String(snippet)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/⟦/g, '<mark>')
    .replace(/⟧/g, '</mark>')
}

// =========================================
// NAVIGATION
// =========================================

const goHome = () => {
  emit('gohome')
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap");

.q-search {
  --bg: #f6f3ec;
  --surface: #fffdf8;
  --ink: #201f22;
  --ink-soft: #6b665c;
  --line: #e6e0d2;
  --navy: #24304a;
  --navy-soft: #3c4c6e;
  --gold: #b9873b;
  --good: #3f7a5c;
  --good-bg: #e7f0e8;
  --bad: #ab5137;
  --bad-bg: #f7e9e2;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
}

/* =========================================
   HEADER
========================================= */

.qs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 3.75rem;
  padding: 0.6rem 1.25rem;
  gap: 1rem;
  background: var(--navy);
  color: #f4efe2;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.qs-header__brand {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.75rem;
}

.qs-header__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: rgba(244, 239, 226, 0.12);
  font-size: 1.1rem;
}

.qs-header__heading {
  min-width: 0;
}

.qs-header__title {
  margin: 0;
  overflow: hidden;
  font-family: "Fraunces", Georgia, serif;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qs-header__sub {
  margin: 0.15rem 0 0;
  overflow: hidden;
  color: rgba(244, 239, 226, 0.65);
  font-size: clamp(0.65rem, 1.5vw, 0.75rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qs-header__home {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.65rem;
  height: 2.65rem;
  border: 1px solid rgba(244, 239, 226, 0.14);
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.15rem;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.qs-header__home:hover {
  background: rgba(244, 239, 226, 0.12);
  transform: translateY(-1px);
}

.qs-header__home:active {
  transform: scale(0.95);
}

/* =========================================
   MAIN
========================================= */

.qs-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: clamp(0.85rem, 3vw, 1.5rem)
    clamp(0.75rem, 3vw, 1.25rem)
    4rem;
  overscroll-behavior: contain;
}

/* =========================================
   SEARCH BOX
========================================= */

.lookup-slip {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 720px;
  min-height: 3rem;
  margin: 0 auto;
  gap: 0.6rem;
  padding: 0.15rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  box-shadow: 0 1px 3px rgba(36, 48, 74, 0.05);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.lookup-slip:focus-within {
  border-color: var(--navy-soft);
  box-shadow: 0 0 0 3px rgba(60, 76, 110, 0.12);
}

.lookup-slip__icon {
  flex-shrink: 0;
  color: var(--ink-soft);
  font-size: 1rem;
}

.lookup-slip__input {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 0.7rem 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink);
  font-family: inherit;
  font-size: clamp(0.82rem, 2vw, 0.95rem);
}

.lookup-slip__input::placeholder {
  color: var(--ink-soft);
  opacity: 0.85;
}

.lookup-slip__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: var(--bg);
  color: var(--ink-soft);
  cursor: pointer;
}

.lookup-slip__clear:hover {
  background: var(--line);
}

/* =========================================
   FILTER CHIPS
========================================= */

.filter-wrapper {
  width: 100%;
  max-width: 900px;
  margin: 0.8rem auto 0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.45rem;
}

.filter-chip {
  min-height: 2rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink-soft);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.filter-chip:hover {
  background: var(--bg);
  border-color: var(--navy-soft);
}

.filter-chip--active {
  background: var(--navy);
  border-color: var(--navy);
  color: #f4efe2;
}

/* =========================================
   STATUS / EMPTY STATE
========================================= */

.qs-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: var(--ink-soft);
  font-size: 0.85rem;
}

.qs-status__spin {
  animation: qs-spin 0.8s linear infinite;
}

@keyframes qs-spin {
  to {
    transform: rotate(360deg);
  }
}

.qs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 420px;
  min-height: 260px;
  margin: 0 auto;
  padding: 3rem 1rem 2rem;
  text-align: center;
}

.qs-empty__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--gold);
  font-size: 1.75rem;
}

.qs-empty__mark--bad {
  border-color: var(--bad-bg);
  background: var(--bad-bg);
  color: var(--bad);
}

.qs-empty__title {
  margin: 0;
  font-family: "Fraunces", Georgia, serif;
  font-size: clamp(1.05rem, 3vw, 1.2rem);
  font-weight: 600;
}

.qs-empty__sub {
  max-width: 300px;
  margin: 0.45rem 0 0;
  color: var(--ink-soft);
  font-size: 0.85rem;
  line-height: 1.5;
}

/* =========================================
   RESULTS
========================================= */

.result-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  margin: 1rem auto 0;
  padding: 0;
  gap: 0.65rem;
  list-style: none;
}

.result-card {
  width: 100%;
  padding: clamp(0.85rem, 3vw, 1.05rem);
  border: 1px solid var(--line);
  border-radius: 0.85rem;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(36, 48, 74, 0.04);
  cursor: pointer;
  outline: none;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;
}

.result-card:hover,
.result-card:focus-visible {
  border-color: rgba(60, 76, 110, 0.35);
  box-shadow: 0 8px 20px -12px rgba(36, 48, 74, 0.3);
  transform: translateY(-1px);
}

.result-card:active {
  transform: scale(0.99);
}

.result-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.55rem;
}

.tag {
  max-width: 100%;
  padding: 0.18rem 0.55rem;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  color: var(--ink-soft);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.tag--subject {
  color: var(--gold);
}

.tag--topic {
  text-transform: none;
  letter-spacing: 0;
}

.result-card__snippet {
  margin: 0;
  color: var(--ink);
  font-size: clamp(0.82rem, 2vw, 0.92rem);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.result-card__snippet :deep(mark) {
  border-bottom: 2px solid var(--gold);
  background: transparent;
  color: var(--navy);
  font-weight: 600;
}

.result-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.3rem;
  margin-top: 0.7rem;
  color: var(--navy-soft);
  font-size: 0.7rem;
  font-weight: 600;
}

/* =========================================
   QUESTION DETAIL CARD
========================================= */

.quiz-card {
  width: 100%;
  max-width: 720px;
  margin: 1rem auto 0;
  padding: clamp(0.9rem, 3vw, 1.35rem);
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--surface);
  box-shadow: 0 10px 24px -14px rgba(36, 48, 74, 0.22);
}

.quiz-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.quiz-card__tags {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  gap: 0.35rem;
}

.quiz-card__close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 1.05rem;
}

.quiz-card__close:hover {
  background: var(--bg);
}

.quiz-card__question {
  margin: 1rem 0 0;
  color: var(--ink);
  font-family: "Fraunces", Georgia, serif;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 500;
  line-height: 1.55;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

/* =========================================
   OPTIONS
========================================= */

.options {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 1.15rem 0 0;
  padding: 0;
  list-style: none;
}

.option {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: var(--bg);
}

.option--correct {
  border-color: var(--good);
  background: var(--good-bg);
}

.option__letter {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--ink-soft);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  font-weight: 600;
}

.option--correct .option__letter {
  border-color: var(--good);
  background: var(--good);
  color: #fff;
}

.option__text {
  min-width: 0;
  flex: 1;
  padding-top: 0.15rem;
  color: var(--ink);
  font-size: clamp(0.82rem, 2vw, 0.92rem);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.option__check {
  flex-shrink: 0;
  margin-top: 0.15rem;
  color: var(--good);
  font-size: 1rem;
}

/* =========================================
   EXPLANATION
========================================= */

.explanation {
  margin-top: 1.1rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--bg);
}

.explanation__label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
  color: var(--gold);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.explanation__text {
  margin: 0;
  color: var(--ink-soft);
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

/* =========================================
   TABLET
========================================= */

@media (min-width: 600px) {
  .qs-main {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .filter-row {
    justify-content: flex-start;
  }

  .result-card {
    padding: 1.1rem 1.2rem;
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 480px) {
  .qs-header {
    min-height: 3.4rem;
    padding: 0.55rem 0.75rem;
    gap: 0.5rem;
  }

  .qs-header__brand {
    gap: 0.55rem;
  }

  .qs-header__mark {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.65rem;
  }

  .qs-header__sub {
    max-width: 190px;
  }

  .qs-header__home {
    width: 2.35rem;
    height: 2.35rem;
  }

  .qs-main {
    padding: 0.75rem 0.7rem 3rem;
  }

  .lookup-slip {
    min-height: 2.85rem;
    padding: 0.1rem 0.65rem;
    border-radius: 0.65rem;
  }

  .lookup-slip__input {
    font-size: 0.82rem;
  }

  .filter-wrapper {
    margin-top: 0.7rem;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filter-wrapper::-webkit-scrollbar {
    display: none;
  }

  .filter-row {
    justify-content: flex-start;
    flex-wrap: nowrap;
    width: max-content;
    max-width: none;
    padding-bottom: 0.15rem;
  }

  .filter-chip {
    min-height: 1.9rem;
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
  }

  .qs-empty {
    min-height: 230px;
    padding-top: 2.5rem;
  }

  .qs-empty__mark {
    width: 4rem;
    height: 4rem;
    font-size: 1.5rem;
  }

  .result-list {
    margin-top: 0.85rem;
    gap: 0.55rem;
  }

  .result-card {
    border-radius: 0.75rem;
  }

  .result-card__footer {
    margin-top: 0.6rem;
  }

  .quiz-card {
    margin-top: 0.8rem;
    border-radius: 0.85rem;
  }

  .quiz-card__question {
    margin-top: 0.85rem;
  }

  .option {
    gap: 0.55rem;
    padding: 0.65rem;
  }

  .option__letter {
    width: 1.6rem;
    height: 1.6rem;
  }

  .explanation {
    padding: 0.8rem;
  }
}

/* =========================================
   VERY SMALL DEVICES
========================================= */

@media (max-width: 350px) {
  .qs-header__sub {
    display: none;
  }

  .qs-header__title {
    font-size: 0.95rem;
  }

  .qs-header__mark {
    width: 2rem;
    height: 2rem;
  }

  .quiz-card__top {
    gap: 0.4rem;
  }

  .tag {
    font-size: 0.6rem;
  }
}

/* =========================================
   REDUCED MOTION
========================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .result-card:hover,
  .result-card:focus-visible,
  .qs-header__home:hover {
    transform: none;
  }
}
</style>