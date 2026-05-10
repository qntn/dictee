<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { API_BASE } from '../config'

const route = useRoute()
const router = useRouter()

const textDictation = ref(null)
const phase = ref('intro') // intro, discovery, dictation, review, results
const currentSegmentIndex = ref(0)
const userSegments = ref([])
const currentAnswer = ref('')
const feedback = ref(null)
const scores = ref([])
const currentHint = ref(null)
const hintLevel = ref(0)
const hintsUsed = ref([]) // Track hints used per segment

let speakTimeout = null
let feedbackTimeout = null

const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

function launchFireworks() {
  const duration = 3000
  const end = Date.now() + duration
  const colors = ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

function speak(text, rate = 0.85) {
  if (!ttsAvailable) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = rate
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

/** Normalize text for comparison: remove punctuation and extra spaces */
function normalizeForComparison(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[.,!?;:]/g, '') // Remove punctuation
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
}

/** Calculate word-level similarity score */
function calculateSimilarity(expected, actual) {
  const expectedWords = normalizeForComparison(expected).split(' ')
  const actualWords = normalizeForComparison(actual).split(' ')

  let correctWords = 0
  const maxLength = Math.max(expectedWords.length, actualWords.length)

  for (let i = 0; i < Math.min(expectedWords.length, actualWords.length); i++) {
    if (expectedWords[i] === actualWords[i]) {
      correctWords++
    }
  }

  return maxLength > 0 ? Math.round((correctWords / maxLength) * 100) : 0
}

onMounted(() => {
  fetch(`${API_BASE}/api/text-dictations/${route.params.id}`)
    .then((r) => {
      if (!r.ok) throw new Error('Not found')
      return r.json()
    })
    .then((data) => {
      textDictation.value = data
      userSegments.value = new Array(data.segments.length).fill('')
      hintsUsed.value = new Array(data.segments.length).fill(0)
      document.title = `${data.name} — Dictée de texte`
    })
    .catch(() => router.push('/'))
})

onUnmounted(() => {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
  window.speechSynthesis.cancel()
})

function startDiscovery() {
  phase.value = 'discovery'
  clearTimeout(speakTimeout)
  speakTimeout = setTimeout(() => {
    speak(textDictation.value.fullText, 0.8)
  }, 500)
}

function startDictation() {
  phase.value = 'dictation'
  currentSegmentIndex.value = 0
  speakSegmentWithRepetitions()
}

function speakSegmentWithRepetitions() {
  const segment = textDictation.value.segments[currentSegmentIndex.value]
  clearTimeout(speakTimeout)

  // First repetition
  speakTimeout = setTimeout(() => {
    speak(segment)

    // Second repetition after 2.5 seconds
    speakTimeout = setTimeout(() => {
      speak(segment)
    }, 2500)
  }, 500)
}

function listenAgain() {
  const segment = textDictation.value.segments[currentSegmentIndex.value]
  speak(segment)
}

function validateSegment() {
  userSegments.value[currentSegmentIndex.value] = currentAnswer.value.trim()

  feedback.value = 'validé'

  clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    feedback.value = null
    currentAnswer.value = ''
    currentHint.value = null
    hintLevel.value = 0

    if (currentSegmentIndex.value + 1 >= textDictation.value.segments.length) {
      // All segments done, move to review phase
      phase.value = 'review'
    } else {
      currentSegmentIndex.value++
      speakSegmentWithRepetitions()
    }
  }, 800)
}

function reviewFullText() {
  speak(textDictation.value.fullText, 0.8)
}

async function showResults() {
  phase.value = 'results'
  launchFireworks()

  // Calculate scores
  try {
    let totalScore = 0
    let totalWords = 0

    textDictation.value.segments.forEach((segment, i) => {
      const similarity = calculateSimilarity(segment, userSegments.value[i])
      const words = normalizeForComparison(segment).split(' ').length
      totalScore += (similarity / 100) * words
      totalWords += words
    })

    const finalScore = Math.round(totalScore)

    await fetch(`${API_BASE}/api/text-dictations/${route.params.id}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: finalScore, total: totalWords }),
    })

    const res = await fetch(`${API_BASE}/api/text-dictations/${route.params.id}/scores`)
    if (res.ok) scores.value = await res.json()
  } catch {
    // score history is non-critical
  }
}

function restart() {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
  window.speechSynthesis.cancel()
  phase.value = 'intro'
  currentSegmentIndex.value = 0
  userSegments.value = new Array(textDictation.value.segments.length).fill('')
  hintsUsed.value = new Array(textDictation.value.segments.length).fill(0)
  currentAnswer.value = ''
  feedback.value = null
  currentHint.value = null
  hintLevel.value = 0
}

async function requestHint() {
  if (feedback.value) return // Don't allow hints during feedback
  if (hintLevel.value >= 3) return // Max 3 hint levels

  hintLevel.value++
  hintsUsed.value[currentSegmentIndex.value]++

  try {
    // Get hint for the current segment
    const segment = textDictation.value.segments[currentSegmentIndex.value]
    const response = await fetch(`${API_BASE}/api/dictations/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: segment,
        level: hintLevel.value
      })
    })

    if (response.ok) {
      const data = await response.json()
      currentHint.value = data.hint
    }
  } catch (error) {
    console.error('Failed to fetch hint:', error)
  }
}

const totalScore = computed(() => {
  if (!textDictation.value) return 0
  let total = 0
  textDictation.value.segments.forEach((segment, i) => {
    total += calculateSimilarity(segment, userSegments.value[i])
  })
  return Math.round(total / textDictation.value.segments.length)
})

const inputClass = computed(() => {
  if (feedback.value === 'validé') return 'border-green-400 bg-green-50'
  return 'border-gray-300'
})
</script>

<template>
  <p v-if="!textDictation" class="text-gray-400">Chargement…</p>

  <!-- INTRO PHASE -->
  <div v-else-if="phase === 'intro'" class="text-center">
    <h1 class="text-3xl font-bold mb-4">📝 {{ textDictation.name }}</h1>
    <p class="text-gray-600 mb-6">
      Cette dictée contient {{ textDictation.segments.length }} phrase(s).
    </p>
    <p class="text-gray-600 mb-8">
      Comme une maîtresse d'école, je vais d'abord lire le texte complet,<br />
      puis dicter phrase par phrase avec des répétitions.
    </p>
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl"
      @click="startDiscovery"
    >
      🎧 Commencer
    </button>
  </div>

  <!-- DISCOVERY PHASE -->
  <div v-else-if="phase === 'discovery'" class="text-center">
    <h1 class="text-2xl font-bold mb-4">🎧 Lecture découverte</h1>
    <p class="text-gray-600 mb-6">
      Écoute bien le texte complet en entier.
    </p>
    <p class="text-5xl mb-8 animate-pulse">🔊</p>
    <button
      :disabled="!ttsAvailable"
      class="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl mb-4"
      @click="speak(textDictation.fullText, 0.8)"
    >
      🔄 Réécouter le texte
    </button>
    <br />
    <button
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl"
      @click="startDictation"
    >
      ✏️ Commencer la dictée
    </button>
  </div>

  <!-- DICTATION PHASE -->
  <div v-else-if="phase === 'dictation'" class="text-center">
    <h1 class="text-2xl font-bold mb-1">{{ textDictation.name }}</h1>
    <p class="text-gray-500 mb-4">
      Phrase {{ currentSegmentIndex + 1 }} / {{ textDictation.segments.length }}
    </p>

    <p v-if="!ttsAvailable" class="text-amber-600 text-sm mb-4">
      ⚠️ La synthèse vocale n'est pas disponible sur ce navigateur.
    </p>

    <button
      :disabled="!ttsAvailable"
      class="text-5xl mb-6 hover:scale-110 transition-transform disabled:opacity-40"
      aria-label="Réécouter la phrase"
      @click="listenAgain"
    >
      🔊
    </button>

    <!-- Hint System -->
    <div v-if="currentHint" class="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 mx-auto max-w-2xl">
      <p class="text-sm text-blue-800">
        💡 <strong>Indice {{ hintLevel }}/3 :</strong> {{ currentHint }}
      </p>
    </div>

    <label for="segment-input" class="sr-only">Écrire la phrase</label>
    <textarea
      id="segment-input"
      v-model="currentAnswer"
      autofocus
      :class="`border-2 rounded-xl p-3 text-lg w-full max-w-2xl mx-auto block mb-4 transition min-h-[100px] ${inputClass}`"
      :disabled="!!feedback"
      placeholder="Écris la phrase…"
      @keydown.ctrl.enter="!feedback && currentAnswer.trim() && validateSegment()"
    ></textarea>

    <div aria-live="polite" aria-atomic="true" class="h-8 mb-3">
      <p v-if="feedback" class="text-lg font-bold text-green-600">
        ✅ Phrase validée !
      </p>
    </div>

    <div class="flex gap-3 justify-center">
      <button
        :disabled="!!feedback || !currentAnswer.trim()"
        class="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
        @click="validateSegment"
      >
        Valider (Ctrl+Enter)
      </button>
      <button
        v-if="hintLevel < 3"
        :disabled="!!feedback"
        class="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 font-bold py-2 px-6 rounded-xl"
        @click="requestHint"
      >
        💡 Indice {{ hintLevel + 1 }}
      </button>
    </div>
  </div>

  <!-- REVIEW PHASE -->
  <div v-else-if="phase === 'review'" class="text-center">
    <h1 class="text-2xl font-bold mb-4">🎧 Relecture finale</h1>
    <p class="text-gray-600 mb-6">
      Tu peux réécouter le texte complet avant de voir ton résultat.
    </p>
    <button
      :disabled="!ttsAvailable"
      class="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl mb-4"
      @click="reviewFullText"
    >
      🔊 Réécouter le texte
    </button>
    <br />
    <button
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl"
      @click="showResults"
    >
      ✨ Voir mon résultat
    </button>
  </div>

  <!-- RESULTS PHASE -->
  <div v-else-if="phase === 'results'" class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-2 text-center">🎉 Terminé !</h1>
    <p class="text-2xl mb-6 text-center">
      Score global : <span class="font-bold text-green-600">{{ totalScore }}%</span>
    </p>

    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
      <h2 class="font-semibold text-lg mb-4">Comparaison :</h2>
      <div v-for="(segment, i) in textDictation.segments" :key="i" class="mb-6 last:mb-0">
        <p class="text-sm text-gray-500 mb-1">Phrase {{ i + 1 }}</p>
        <div class="bg-white border rounded-lg p-3 mb-2">
          <p class="text-xs text-gray-500 mb-1">Attendu :</p>
          <p class="text-sm">{{ segment }}</p>
        </div>
        <div class="bg-white border rounded-lg p-3 mb-2">
          <p class="text-xs text-gray-500 mb-1">Ta réponse :</p>
          <p class="text-sm">{{ userSegments[i] || '(vide)' }}</p>
        </div>
        <p class="text-sm font-semibold" :class="calculateSimilarity(segment, userSegments[i]) >= 80 ? 'text-green-600' : 'text-orange-600'">
          Similarité : {{ calculateSimilarity(segment, userSegments[i]) }}%
        </p>
      </div>
    </div>

    <div
      v-if="scores.length > 1"
      class="text-left bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
    >
      <p class="font-semibold mb-2 text-gray-600">Historique :</p>
      <ul class="space-y-1">
        <li
          v-for="s in scores.slice(0, 5)"
          :key="s.id"
          class="text-sm text-gray-500"
        >
          {{ new Date(s.playedAt).toLocaleDateString('fr-FR') }} —
          <span class="font-semibold">{{ s.score }}/{{ s.total }} mots</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap gap-3 justify-center">
      <button
        class="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl"
        @click="restart"
      >
        🔄 Recommencer
      </button>
      <button
        class="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-6 rounded-xl"
        @click="router.push('/')"
      >
        ← Retour
      </button>
    </div>
  </div>
</template>
