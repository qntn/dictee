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

let speakTimeout = null
let feedbackTimeout = null

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

function speak(word) {
  if (!ttsAvailable) return
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

/** Suppress diacritics for accent-tolerant comparison. */
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

onMounted(() => {
  fetch(`${API_BASE}/api/dictations/${route.params.id}`)
    .then((r) => {
      if (!r.ok) throw new Error('Not found')
      return r.json()
    })
    .then((data) => {
      dictation.value = data
      words.value = data.words
      document.title = `${data.name} — Dictée`
    })
    .catch(() => router.push('/'))
})

onUnmounted(() => {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
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

  results.value.push({ word: expectedWord, answer: answer.value.trim(), correct: compare })
  feedback.value = compare ? 'correct' : 'incorrect'
  if (compare) shootConfetti()

  clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    feedback.value = null
    answer.value = ''
    if (index.value + 1 >= words.value.length) {
      finished.value = true
    } else {
      index.value++
    }
  }, 1200)
}

function restart(customWords) {
  clearTimeout(speakTimeout)
  clearTimeout(feedbackTimeout)
  words.value = customWords ?? dictation.value.words
  index.value = 0
  answer.value = ''
  results.value = []
  finished.value = false
  feedback.value = null
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

    <div aria-live="polite" aria-atomic="true" class="h-8 mb-3">
      <p
        v-if="feedback"
        :class="`text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`"
      >
        {{ feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !' }}
      </p>
    </div>

    <button
      :disabled="!!feedback || !answer.trim()"
      class="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
      @click="validate"
    >
      Valider
    </button>
  </div>
</template>
