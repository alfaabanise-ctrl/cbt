<template>
  <div class="dict-search">
    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->
    <header class="ds-header">
      <div class="ds-header__brand">
        <span class="ds-header__mark">
          <Icon name="lucide:book-marked" />
        </span>

        <div class="ds-header__heading">
          <h1 class="ds-header__title">Dictionary</h1>
          <p class="ds-header__sub">
            Look up any word — fully offline
          </p>
        </div>
      </div>

      <button
        type="button"
        class="ds-header__home"
        aria-label="Go home"
        @click="goHome"
      >
        <Icon name="lucide:house" />
      </button>
    </header>

    <!-- ========================================= -->
    <!-- MAIN -->
    <!-- ========================================= -->
    <main class="ds-main">
      <!-- SEARCH BOX -->
      <div class="lookup-slip">
        <Icon
          name="lucide:search"
          class="lookup-slip__icon"
        />

        <input
          ref="inputEl"
          v-model="query"
          type="text"
          class="lookup-slip__input"
          placeholder="Type a word…"
          autocomplete="off"
          spellcheck="false"
          @input="onInput"
          @keydown.enter="onEnter"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.esc="onEscape"
        />

        <button
          v-if="query"
          type="button"
          class="lookup-slip__clear"
          aria-label="Clear search"
          @click="onClear"
        >
          <Icon name="lucide:x" />
        </button>
      </div>

      <!-- LIVE SUGGESTIONS -->
      <ul
        v-if="showSuggestions"
        class="suggestions"
      >
        <li
          v-for="(row, i) in results"
          :key="row.word"
          class="suggestion"
          :class="{
            'suggestion--active': i === highlighted
          }"
          @mouseenter="highlighted = i"
          @click="selectWord(row.word)"
        >
          <span class="suggestion__word">
            {{ row.word }}
          </span>

          <span class="suggestion__meaning">
            {{ firstSense(row.meaning) }}
          </span>
        </li>
      </ul>

      <!-- LOADING -->
      <div
        v-if="loading && !currentWord"
        class="ds-status"
      >
        <Icon
          name="lucide:loader-2"
          class="ds-status__spin"
        />
        <span>Searching…</span>
      </div>

      <!-- EMPTY / IDLE STATE -->
      <div
        v-if="!query && !currentWord"
        class="ds-empty"
      >
        <div class="ds-empty__mark">
          <Icon name="lucide:library-big" />
        </div>

        <h2 class="ds-empty__title">
          Nothing looked up yet
        </h2>

        <p class="ds-empty__sub">
          Start typing above to search the offline dictionary.
        </p>
      </div>

      <!-- NOT FOUND -->
      <div
        v-if="notFound && query"
        class="ds-empty"
      >
        <div class="ds-empty__mark ds-empty__mark--bad">
          <Icon name="lucide:file-question" />
        </div>

        <h2 class="ds-empty__title">
          "{{ lastLookedUp }}" isn't in the dictionary
        </h2>

        <p class="ds-empty__sub">
          Check the spelling, or try a different word.
        </p>
      </div>

      <!-- WORD DETAIL CARD -->
      <article
        v-if="currentWord"
        class="index-card"
      >
        <!-- CARD HEADER -->
        <div class="index-card__top">
          <div class="index-card__heading">
            <h2 class="index-card__word">
              {{ currentWord.word }}
            </h2>

            <span
              v-if="currentWord.partOfSpeech"
              class="index-card__pos"
            >
              {{ currentWord.partOfSpeech }}
            </span>
          </div>

          <button
            type="button"
            class="index-card__close"
            aria-label="Close definition"
            @click="onClear"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <div
          class="index-card__rule"
          role="presentation"
        />

        <!-- HAS REAL DEFINITION -->
        <div
          v-if="currentWord.hasDefinition"
          class="index-card__body"
        >
          <ol class="senses">
            <li
              v-for="(sense, i) in senseList(currentWord.meaning)"
              :key="i"
              class="sense"
            >
              {{ sense }}
            </li>
          </ol>

          <p
            v-if="currentWord.example"
            class="index-card__example"
          >
            &ldquo;{{ currentWord.example }}&rdquo;
          </p>
        </div>

        <!-- VALID WORD WITHOUT DEFINITION -->
        <div
          v-else
          class="index-card__body"
        >
          <p class="index-card__no-def">
            <Icon name="lucide:info" />

            <span>
              This is a recognized word, but no definition is on file
              for it yet.
            </span>
          </p>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onBeforeUnmount
} from 'vue'

const emit = defineEmits(['gohome'])

const {
  results,
  currentWord,
  loading,
  notFound,
  search,
  lookup,
  clear
} = useDictionary()

// --------------------------------------------------
// STATE
// --------------------------------------------------

const query = ref('')
const inputEl = ref(null)
const highlighted = ref(-1)
const lastLookedUp = ref('')

let debounceTimer = null

// --------------------------------------------------
// DEBOUNCED LIVE SEARCH
// --------------------------------------------------

const onInput = () => {
  notFound.value = false
  highlighted.value = -1

  clearTimeout(debounceTimer)

  const term = query.value.trim()

  if (!term) {
    clear()
    return
  }

  debounceTimer = setTimeout(() => {
    search(term)
  }, 200)
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

// --------------------------------------------------
// SUGGESTIONS
// --------------------------------------------------

const showSuggestions = computed(() => {
  return (
    results.value.length > 0 &&
    !currentWord.value &&
    query.value.trim().length > 0
  )
})

// --------------------------------------------------
// SELECT WORD
// --------------------------------------------------

const selectWord = async (word) => {
  query.value = word
  results.value = []
  highlighted.value = -1
  lastLookedUp.value = word

  await lookup(word)
}

// --------------------------------------------------
// ENTER SEARCH
// --------------------------------------------------

const onEnter = async () => {
  const term = query.value.trim()

  if (!term) return

  // Use highlighted suggestion if available
  if (
    highlighted.value >= 0 &&
    results.value[highlighted.value]
  ) {
    await selectWord(
      results.value[highlighted.value].word
    )

    return
  }

  lastLookedUp.value = term
  results.value = []
  highlighted.value = -1

  await lookup(term)
}

// --------------------------------------------------
// KEYBOARD NAVIGATION
// --------------------------------------------------

const moveHighlight = (direction) => {
  if (!results.value.length) return

  const max = results.value.length - 1

  let next = highlighted.value + direction

  if (next < 0) {
    next = max
  }

  if (next > max) {
    next = 0
  }

  highlighted.value = next
}

// --------------------------------------------------
// ESCAPE
// --------------------------------------------------

const onEscape = () => {
  results.value = []
  highlighted.value = -1
}

// --------------------------------------------------
// CLEAR SEARCH
// --------------------------------------------------

const onClear = () => {
  query.value = ''
  highlighted.value = -1
  lastLookedUp.value = ''

  clear()

  inputEl.value?.focus()
}

// --------------------------------------------------
// FORMAT DEFINITIONS
// Example:
// "1. (noun) definition one 2. (verb) definition two"
// --------------------------------------------------

const senseList = (meaning) => {
  if (!meaning) return []

  return String(meaning)
    .split(/(?=\d+\.\s)/)
    .map((sense) => {
      return sense
        .replace(/^\d+\.\s*/, '')
        .trim()
    })
    .filter(Boolean)
}

const firstSense = (meaning) => {
  const list = senseList(meaning)

  return list.length ? list[0] : ''
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

const goHome = () => {
  emit('gohome')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

/* ==================================================
   ROOT
================================================== */

.dict-search {
  --bg: #f6f3ec;
  --surface: #fffdf8;
  --ink: #201f22;
  --ink-soft: #6b665c;
  --line: #e6e0d2;
  --navy: #24304a;
  --navy-soft: #3c4c6e;
  --gold: #b9873b;
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

  font-family: 'Inter', system-ui, sans-serif;
}

/* ==================================================
   HEADER
================================================== */

.ds-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-shrink: 0;

  min-height: 3.75rem;
  padding: 0.65rem 1.25rem;

  background: var(--navy);
  color: #f4efe2;

  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.ds-header__brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;

  min-width: 0;
}

.ds-header__mark {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 2.45rem;
  height: 2.45rem;

  border-radius: 0.75rem;

  background: rgba(244, 239, 226, 0.12);

  font-size: 1.1rem;
}

.ds-header__heading {
  min-width: 0;
}

.ds-header__title {
  margin: 0;

  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.ds-header__sub {
  margin: 0.2rem 0 0;

  color: rgba(244, 239, 226, 0.65);

  font-size: 0.72rem;
  line-height: 1.3;
}

.ds-header__home {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 2.5rem;
  height: 2.5rem;

  border: none;
  border-radius: 0.75rem;

  background: transparent;
  color: inherit;

  font-size: 1.15rem;

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.ds-header__home:hover {
  background: rgba(244, 239, 226, 0.12);
  transform: translateY(-1px);
}

.ds-header__home:active {
  transform: scale(0.95);
}

/* ==================================================
   MAIN
================================================== */

.ds-main {
  flex: 1;
  min-height: 0;

  width: 100%;
  max-width: 100%;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 1.25rem 1rem 4rem;

  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
}

/* ==================================================
   SEARCH BOX
================================================== */

.lookup-slip {
  position: relative;

  display: flex;
  align-items: center;

  width: min(100%, 700px);
  min-height: 3.2rem;

  margin: 0 auto;
  padding: 0.45rem 0.85rem;

  gap: 0.6rem;

  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 0.85rem;

  box-shadow:
    0 1px 2px rgba(36, 48, 74, 0.05);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.lookup-slip:focus-within {
  border-color: var(--navy-soft);

  box-shadow:
    0 0 0 3px rgba(60, 76, 110, 0.12);
}

.lookup-slip__icon {
  flex-shrink: 0;

  color: var(--ink-soft);
  font-size: 1rem;
}

.lookup-slip__input {
  flex: 1;
  min-width: 0;
  width: 100%;

  border: none;
  outline: none;

  background: transparent;

  padding: 0.25rem 0;

  color: var(--ink);

  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  line-height: 1.4;
}

.lookup-slip__input::placeholder {
  color: var(--ink-soft);

  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.95rem;
}

.lookup-slip__clear {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 1.8rem;
  height: 1.8rem;

  border: none;
  border-radius: 50%;

  background: var(--bg);
  color: var(--ink-soft);

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.lookup-slip__clear:hover {
  background: var(--line);
}

.lookup-slip__clear:active {
  transform: scale(0.9);
}

/* ==================================================
   SUGGESTIONS
================================================== */

.suggestions {
  width: min(100%, 700px);

  max-height: 300px;

  list-style: none;

  margin: 0.55rem auto 0;
  padding: 0.35rem;

  overflow-y: auto;

  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 0.85rem;

  box-shadow:
    0 8px 20px -12px rgba(36, 48, 74, 0.25);
}

.suggestion {
  display: flex;
  align-items: center;

  min-width: 0;

  gap: 0.65rem;

  padding: 0.65rem 0.7rem;

  border-radius: 0.6rem;

  cursor: pointer;

  transition: background 0.15s ease;
}

.suggestion--active,
.suggestion:hover {
  background: var(--bg);
}

.suggestion__word {
  flex-shrink: 0;
  max-width: 42%;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--navy);

  font-family: 'Fraunces', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
}

.suggestion__meaning {
  flex: 1;
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--ink-soft);

  font-size: 0.8rem;
  line-height: 1.4;
}

/* ==================================================
   STATUS
================================================== */

.ds-status {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  margin-top: 1.25rem;

  color: var(--ink-soft);

  font-size: 0.85rem;
}

.ds-status__spin {
  animation: ds-spin 0.8s linear infinite;
}

@keyframes ds-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================================================
   EMPTY STATE
================================================== */

.ds-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  max-width: 560px;

  margin: 0 auto;

  padding: 4rem 1rem 2rem;

  text-align: center;
}

.ds-empty__mark {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 4.5rem;
  height: 4.5rem;

  margin-bottom: 1.1rem;

  border: 1px solid var(--line);
  border-radius: 50%;

  background: var(--surface);
  color: var(--gold);

  font-size: 1.75rem;
}

.ds-empty__mark--bad {
  border-color: var(--bad-bg);
  background: var(--bad-bg);
  color: var(--bad);
}

.ds-empty__title {
  max-width: 100%;

  margin: 0;

  color: var(--ink);

  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.4;

  overflow-wrap: anywhere;
}

.ds-empty__sub {
  max-width: 32rem;

  margin: 0.45rem 0 0;

  color: var(--ink-soft);

  font-size: 0.875rem;
  line-height: 1.6;
}

/* ==================================================
   WORD DETAIL CARD
================================================== */

.index-card {
  position: relative;

  width: 100%;
  max-width: 700px;

  margin: 1.1rem auto 0;

  overflow: hidden;

  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 1rem;

  box-shadow:
    0 10px 24px -14px rgba(36, 48, 74, 0.22);
}

/* Ruled paper background */
.index-card::before {
  content: '';

  position: absolute;
  inset: 0;

  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 1.65rem,
      var(--line) 1.65rem,
      var(--line) calc(1.65rem + 1px)
    );

  opacity: 0.5;

  pointer-events: none;
}

/* ==================================================
   CARD HEADER
================================================== */

.index-card__top {
  position: relative;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  min-width: 0;

  gap: 1rem;

  padding: 1.25rem 1.25rem 0.6rem;
}

.index-card__heading {
  min-width: 0;
}

.index-card__word {
  max-width: 100%;

  margin: 0;

  color: var(--navy);

  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 600;
  line-height: 1.25;

  overflow-wrap: anywhere;
}

.index-card__pos {
  display: inline-block;

  max-width: 100%;

  margin-top: 0.4rem;
  padding: 0.2rem 0.55rem;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  border: 1px solid var(--line);
  border-radius: 999px;

  background: var(--bg);
  color: var(--gold);

  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.index-card__close {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 2.15rem;
  height: 2.15rem;

  border: none;
  border-radius: 50%;

  background: transparent;
  color: var(--ink-soft);

  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.index-card__close:hover {
  background: var(--bg);
}

.index-card__close:active {
  transform: scale(0.92);
}

/* ==================================================
   CARD CONTENT
================================================== */

.index-card__rule {
  position: relative;

  height: 0;

  margin: 0.35rem 1.25rem 0;

  border-top: 2px dashed var(--line);
}

.index-card__body {
  position: relative;

  padding: 1rem 1.25rem 1.5rem;
}

.senses {
  display: flex;
  flex-direction: column;

  gap: 0.65rem;

  margin: 0;
  padding-left: 1.2rem;
}

.sense {
  color: var(--ink);

  font-size: 0.98rem;
  line-height: 1.7;

  overflow-wrap: anywhere;
}

.index-card__example {
  margin: 1rem 0 0;
  padding-left: 0.85rem;

  border-left: 2px solid var(--line);

  color: var(--ink-soft);

  font-family: 'Fraunces', Georgia, serif;
  font-size: 0.95rem;
  font-style: italic;
  line-height: 1.6;

  overflow-wrap: anywhere;
}

.index-card__no-def {
  display: flex;
  align-items: flex-start;

  gap: 0.55rem;

  margin: 0;

  color: var(--ink-soft);

  font-size: 0.9rem;
  line-height: 1.6;
}

.index-card__no-def :deep(svg) {
  flex-shrink: 0;
  margin-top: 0.2rem;
}

/* ==================================================
   TABLET
================================================== */

@media (max-width: 768px) {
  .ds-main {
    padding: 1rem 0.85rem 3rem;
  }

  .lookup-slip {
    min-height: 3rem;
  }

  .index-card__word {
    font-size: 1.45rem;
  }

  .index-card__body {
    padding: 0.9rem 1rem 1.25rem;
  }

  .index-card__top {
    padding: 1rem 1rem 0.55rem;
  }

  .index-card__rule {
    margin-left: 1rem;
    margin-right: 1rem;
  }
}

/* ==================================================
   MOBILE
================================================== */

@media (max-width: 480px) {
  .ds-header {
    min-height: 3.4rem;
    padding: 0.55rem 0.75rem;
  }

  .ds-header__brand {
    gap: 0.55rem;
  }

  .ds-header__mark {
    width: 2.15rem;
    height: 2.15rem;

    border-radius: 0.6rem;

    font-size: 0.95rem;
  }

  .ds-header__title {
    font-size: 0.98rem;
  }

  .ds-header__sub {
    margin-top: 0.12rem;
    font-size: 0.64rem;
  }

  .ds-header__home {
    width: 2.2rem;
    height: 2.2rem;

    border-radius: 0.6rem;

    font-size: 1rem;
  }

  .ds-main {
    padding: 0.8rem 0.65rem 2.5rem;
  }

  .lookup-slip {
    width: 100%;

    min-height: 2.9rem;

    padding: 0.35rem 0.7rem;
    gap: 0.45rem;

    border-radius: 0.7rem;
  }

  .lookup-slip__icon {
    font-size: 0.9rem;
  }

  .lookup-slip__input {
    font-size: 0.98rem;
  }

  .lookup-slip__input::placeholder {
    font-size: 0.82rem;
  }

  .lookup-slip__clear {
    width: 1.65rem;
    height: 1.65rem;
  }

  .suggestions {
    margin-top: 0.45rem;
    border-radius: 0.7rem;
  }

  .suggestion {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.15rem;

    padding: 0.6rem 0.65rem;
  }

  .suggestion__word {
    max-width: 100%;
    font-size: 0.9rem;
  }

  .suggestion__meaning {
    width: 100%;
    max-width: 100%;

    font-size: 0.75rem;
  }

  .ds-empty {
    padding: 3rem 0.75rem 1.5rem;
  }

  .ds-empty__mark {
    width: 3.8rem;
    height: 3.8rem;

    margin-bottom: 0.9rem;

    font-size: 1.45rem;
  }

  .ds-empty__title {
    font-size: 1rem;
  }

  .ds-empty__sub {
    font-size: 0.78rem;
    line-height: 1.55;
  }

  .index-card {
    margin-top: 0.85rem;
    border-radius: 0.8rem;
  }

  .index-card__top {
    gap: 0.65rem;
    padding: 0.9rem 0.85rem 0.5rem;
  }

  .index-card__word {
    font-size: 1.3rem;
  }

  .index-card__pos {
    margin-top: 0.3rem;
    padding: 0.15rem 0.45rem;

    font-size: 0.6rem;
  }

  .index-card__close {
    width: 1.9rem;
    height: 1.9rem;
  }

  .index-card__rule {
    margin-left: 0.85rem;
    margin-right: 0.85rem;
  }

  .index-card__body {
    padding: 0.8rem 0.85rem 1.15rem;
  }

  .senses {
    gap: 0.45rem;
    padding-left: 1.05rem;
  }

  .sense {
    font-size: 0.86rem;
    line-height: 1.6;
  }

  .index-card__example {
    margin-top: 0.8rem;
    padding-left: 0.65rem;

    font-size: 0.82rem;
    line-height: 1.55;
  }

  .index-card__no-def {
    gap: 0.4rem;
    font-size: 0.8rem;
    line-height: 1.55;
  }
}

/* ==================================================
   VERY SMALL DEVICES
================================================== */

@media (max-width: 340px) {
  .ds-header__sub {
    display: none;
  }

  .ds-main {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .index-card__word {
    font-size: 1.18rem;
  }

  .sense {
    font-size: 0.82rem;
  }
}

/* ==================================================
   REDUCE MOTION
================================================== */

@media (prefers-reduced-motion: reduce) {
  .ds-status__spin {
    animation: none;
  }

  .ds-header__home,
  .lookup-slip,
  .lookup-slip__clear,
  .index-card__close,
  .suggestion {
    transition: none;
  }
}
</style>