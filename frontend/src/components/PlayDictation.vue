<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { API_BASE } from '../config'

const route = useRoute()
const router = useRouter()

const dictation = ref(null)
const words = ref([])         // active word list (may be subset for retry mode)
const index = ref(0)
const answer = ref('')
const results = ref([])
const finished = ref(false)
const feedback = ref(null)
const ignoreAccents = ref(false)
const scores = ref([])
const currentHint = ref(null)
const hintLevel = ref(0)
const hintsUsed = ref(0)
const errorFeedback = ref(null)

// Voice synthesis settings
const availableVoices = ref([])
const selectedVoice = ref(null)
const repetitionCount = ref(2)  // Number of times to repeat each word
const showVoiceSettings = ref(false)

let speakTimeout = null
let feedbackTimeout = null
let repetitionTimeouts = []

const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

function shootConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c'],
  })
}

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

// Load available voices
function loadVoices() {
  if (!ttsAvailable || typeof window.speechSynthesis.getVoices !== 'function') return

  const voices = window.speechSynthesis.getVoices()
  // Filter French voices only
  availableVoices.value = voices.filter((v) => v.lang.startsWith('fr'))

  // Load saved voice preference
  const savedVoiceURI = localStorage.getItem('dictee-voice')
  if (savedVoiceURI) {
    const saved = availableVoices.value.find((v) => v.voiceURI === savedVoiceURI)
    if (saved) selectedVoice.value = saved
  }

  // Default to first French voice if available
  if (!selectedVoice.value && availableVoices.value.length > 0) {
    selectedVoice.value = availableVoices.value[0]
  }
}

// Save voice preference
function selectVoice(voice) {
  selectedVoice.value = voice
  localStorage.setItem('dictee-voice', voice.voiceURI)
}

// Load repetition preference
function loadRepetitionPreference() {
  const saved = localStorage.getItem('dictee-repetitions')
  if (saved) {
    repetitionCount.value = parseInt(saved, 10)
  }
}

// Save repetition preference
function saveRepetitionPreference(count) {
  repetitionCount.value = count
  localStorage.setItem('dictee-repetitions', count.toString())
}

// Clear any pending repetitions
function clearRepetitions() {
  repetitionTimeouts.forEach(clearTimeout)
  repetitionTimeouts = []
}

// Improved speak function with repetitions and prosody
function speak(word) {
  if (!ttsAvailable) return

  window.speechSynthesis.cancel()
  clearRepetitions()

  const wordLength = word.length
  const baseRate = 0.85
  // Adapt rate based on word length (longer words = slower)
  const adaptiveRate = wordLength > 8 ? baseRate - 0.1 : baseRate

  // Schedule multiple repetitions with progressive pauses
  for (let i = 0; i < repetitionCount.value; i++) {
    const delay = i === 0 ? 400 : 1000 + (i - 1) * 1200  // First read after 400ms, then 1s pause between repetitions

    const timeout = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'fr-FR'

      // First repetition at normal adapted rate, subsequent ones slightly slower
      utterance.rate = i === 0 ? adaptiveRate : adaptiveRate - 0.05

      // Slight pitch variation to add naturalness
      utterance.pitch = 1.0 + (Math.random() * 0.1 - 0.05)

      // Use selected voice if available
      if (selectedVoice.value) {
        utterance.voice = selectedVoice.value
      }

      window.speechSynthesis.speak(utterance)
    }, delay)

    repetitionTimeouts.push(timeout)
  }
}

/** Suppress diacritics for accent-tolerant comparison. */
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/** Shuffle array using Fisher-Yates algorithm. */
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

onMounted(() => {
  // Load voices
  if (ttsAvailable) {
    loadVoices()
    loadRepetitionPreference()
    // Voices may load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  fetch(`${API_BASE}/api/dictations/${route.params.id}`)
    .then((r) => {
      if (!r.ok) throw new Error('Not found')
      return r.json()
    })
    .then((data) => {
      dictation.value = data
      words.value = shuffleArray(data.words)
      document.title = `${data.name} — Dictée`
    })
    .catch(() => router.push('/'))
})

onUnmounted(() => {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
  clearRepetitions()
})

watch([dictation, index, finished], ([d, i, fin]) => {
  if (d && !fin) {
    clearTimeout(speakTimeout)
    speakTimeout = setTimeout(() => speak(words.value[i]), 300)
  }
})

watch(finished, async (fin) => {
  if (fin) {
    launchFireworks()
    try {
      const score = results.value.filter((r) => r.correct).length
      await fetch(`${API_BASE}/api/dictations/${route.params.id}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, total: results.value.length }),
      })
      const res = await fetch(`${API_BASE}/api/dictations/${route.params.id}/scores`)
      if (res.ok) scores.value = await res.json()
    } catch {
      // score history is non-critical
    }
  }
})

function validate() {
  const expectedWord = words.value[index.value]
  const compare = ignoreAccents.value
    ? normalize(answer.value.trim()) === normalize(expectedWord)
    : answer.value.trim().toLowerCase() === expectedWord.toLowerCase()

  results.value.push({
    word: expectedWord,
    answer: answer.value.trim(),
    correct: compare,
    hintsUsed: hintsUsed.value
  })

  feedback.value = compare ? 'correct' : 'incorrect'

  // If incorrect, show error analysis
  if (!compare) {
    analyzeError(answer.value.trim(), expectedWord)
  }

  if (compare) shootConfetti()

  clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    feedback.value = null
    answer.value = ''
    currentHint.value = null
    hintLevel.value = 0
    hintsUsed.value = 0
    errorFeedback.value = null
    if (index.value + 1 >= words.value.length) {
      finished.value = true
    } else {
      index.value++
    }
  }, compare ? 1200 : 2500) // Show error feedback longer
}

function restart(customWords) {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
  words.value = customWords ?? shuffleArray(dictation.value.words)
  index.value = 0
  answer.value = ''
  results.value = []
  finished.value = false
  feedback.value = null
  currentHint.value = null
  hintLevel.value = 0
  hintsUsed.value = 0
  errorFeedback.value = null
}

async function requestHint() {
  if (feedback.value) return // Don't allow hints during feedback
  if (hintLevel.value >= 3) return // Max 3 hint levels

  hintLevel.value++
  hintsUsed.value++

  try {
    const response = await fetch(`${API_BASE}/api/dictations/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: words.value[index.value],
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

async function analyzeError(attempted, expected) {
  try {
    const response = await fetch(`${API_BASE}/api/dictations/analyze-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempted, expected })
    })

    if (response.ok) {
      const data = await response.json()
      errorFeedback.value = data.feedback
    }
  } catch (error) {
    console.error('Failed to analyze error:', error)
  }
}

const errors = computed(() => results.value.filter((r) => !r.correct))
const score = computed(() => results.value.filter((r) => r.correct).length)

const inputClass = computed(() => {
  if (feedback.value === 'correct') return 'border-green-400 bg-green-50'
  if (feedback.value === 'incorrect') return 'border-red-400 bg-red-50'
  return 'border-gray-300'
})
</script>

<template>
  <p v-if="!dictation" class="text-gray-400">Chargement…</p>

  <div v-else-if="finished" class="text-center">
    <h1 class="text-3xl font-bold mb-2">🎉 Terminé !</h1>
    <p class="text-2xl mb-4">
      Score :
      <span class="font-bold text-green-600">{{ score }}</span>
      / {{ results.length }}
    </p>

    <div
      v-if="errors.length > 0"
      class="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="font-semibold mb-2 text-red-700">Mots à retravailler :</p>
      <ul class="space-y-1">
        <li
          v-for="(e, i) in errors"
          :key="i"
          class="text-sm"
        >
          Tu as écrit <span class="font-bold text-red-600">{{ e.answer || '(vide)' }}</span>
          {{ ' ' }}→ c'était <span class="font-bold text-green-700">{{ e.word }}</span>
        </li>
      </ul>
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
          <span class="font-semibold">{{ s.score }}/{{ s.total }}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap gap-3 justify-center">
      <button
        class="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl"
        @click="restart()"
      >
        🔄 Recommencer
      </button>
      <button
        v-if="errors.length > 0"
        class="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-xl"
        @click="restart(errors.map((e) => e.word))"
      >
        🔁 Retravailler les {{ errors.length }} mot(s) raté(s)
      </button>
      <button
        class="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-6 rounded-xl"
        @click="router.push('/')"
      >
        ← Retour
      </button>
    </div>
  </div>

  <div v-else class="text-center">
    <h1 class="text-2xl font-bold mb-1">{{ dictation.name }}</h1>
    <p class="text-gray-500 mb-4">Mot {{ index + 1 }} / {{ words.length }}</p>

    <label class="inline-flex items-center gap-2 text-sm text-gray-600 mb-6 cursor-pointer select-none">
      <input
        v-model="ignoreAccents"
        type="checkbox"
        class="rounded"
      />
      Accepter sans accents
    </label>

    <!-- Voice settings panel -->
    <div v-if="ttsAvailable && availableVoices.length > 0" class="mb-4">
      <button
        class="text-sm text-blue-600 hover:text-blue-800 underline"
        @click="showVoiceSettings = !showVoiceSettings"
      >
        {{ showVoiceSettings ? '🔼 Masquer' : '⚙️ Paramètres de voix' }}
      </button>

      <div
        v-if="showVoiceSettings"
        class="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left max-w-md mx-auto"
      >
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Voix :
          </label>
          <select
            :value="selectedVoice?.voiceURI"
            class="w-full border rounded-lg p-2 text-sm"
            @change="selectVoice(availableVoices.find(v => v.voiceURI === $event.target.value))"
          >
            <option
              v-for="voice in availableVoices"
              :key="voice.voiceURI"
              :value="voice.voiceURI"
            >
              {{ voice.name }} ({{ voice.lang }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Nombre de répétitions : {{ repetitionCount }}
          </label>
          <input
            :value="repetitionCount"
            type="range"
            min="1"
            max="4"
            class="w-full"
            @input="saveRepetitionPreference(parseInt($event.target.value))"
          />
          <p class="text-xs text-gray-500 mt-1">
            Le mot sera lu {{ repetitionCount }} fois avec des pauses
          </p>
        </div>
      </div>
    </div>
    <p v-if="!ttsAvailable" class="text-amber-600 text-sm mb-4">
      ⚠️ La synthèse vocale n'est pas disponible sur ce navigateur.
    </p>

    <button
      :disabled="!ttsAvailable"
      class="text-5xl mb-6 hover:scale-110 transition-transform disabled:opacity-40"
      aria-label="Réécouter le mot"
      @click="speak(words[index])"
    >
      🔊
    </button>

    <!-- Hint System -->
    <div v-if="currentHint" class="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 mx-auto max-w-md">
      <p class="text-sm text-blue-800">
        💡 <strong>Indice {{ hintLevel }}/3 :</strong> {{ currentHint }}
      </p>
    </div>

    <label for="answer-input" class="sr-only">Écrire le mot</label>
    <input
      id="answer-input"
      v-model="answer"
      autofocus
      :class="`border-2 rounded-xl p-3 text-xl text-center w-64 block mx-auto mb-4 transition ${inputClass}`"
      :disabled="!!feedback"
      placeholder="Écris le mot…"
      @keydown.enter="!feedback && answer.trim() && validate()"
    />

    <div aria-live="polite" aria-atomic="true" class="min-h-8 mb-3">
      <p
        v-if="feedback"
        :class="`text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`"
      >
        {{ feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !' }}
      </p>
      <!-- Error analysis feedback -->
      <div v-if="errorFeedback && feedback === 'incorrect'" class="mt-2 bg-orange-50 border border-orange-200 rounded-xl p-3 mx-auto max-w-md">
        <p class="text-sm text-orange-800">
          {{ errorFeedback }}
        </p>
      </div>
    </div>

    <div class="flex gap-3 justify-center mb-4">
      <button
        :disabled="!!feedback || !answer.trim()"
        class="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
        @click="validate"
      >
        Valider
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
</template>
