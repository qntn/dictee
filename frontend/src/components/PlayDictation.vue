<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { API_BASE } from '../config'

const route = useRoute()
const router = useRouter()

const dictation = ref(null)
const index = ref(0)
const answer = ref('')
const results = ref([])
const finished = ref(false)
const feedback = ref(null)

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
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

onMounted(() => {
  fetch(`${API_BASE}/api/dictations/${route.params.id}`)
    .then((r) => {
      if (!r.ok) throw new Error('Not found')
      return r.json()
    })
    .then((data) => { dictation.value = data })
    .catch(() => router.push('/'))
})

watch([dictation, index, finished], ([d, i, fin]) => {
  if (d && !fin) {
    setTimeout(() => speak(d.words[i]), 300)
  }
})

watch(finished, (fin) => {
  if (fin) launchFireworks()
})

function validate() {
  const expectedWord = dictation.value.words[index.value]
  const correct = answer.value.trim().toLowerCase() === expectedWord.toLowerCase()
  results.value.push({ word: expectedWord, answer: answer.value.trim(), correct })
  feedback.value = correct ? 'correct' : 'incorrect'
  if (correct) shootConfetti()

  setTimeout(() => {
    feedback.value = null
    answer.value = ''
    if (index.value + 1 >= dictation.value.words.length) {
      finished.value = true
    } else {
      index.value++
    }
  }, 1200)
}

function restart() {
  index.value = 0
  answer.value = ''
  results.value = []
  finished.value = false
  feedback.value = null
}

const inputClass = (fb) => {
  if (fb === 'correct') return 'border-green-400 bg-green-50'
  if (fb === 'incorrect') return 'border-red-400 bg-red-50'
  return 'border-gray-300'
}
</script>

<template>
  <p v-if="!dictation" class="text-gray-400">Chargement…</p>

  <div v-else-if="finished" class="text-center">
    <h1 class="text-3xl font-bold mb-2">🎉 Terminé !</h1>
    <p class="text-2xl mb-4">
      Score :
      <span class="font-bold text-green-600">{{ results.filter((r) => r.correct).length }}</span>
      / {{ dictation.words.length }}
    </p>
    <div
      v-if="results.some((r) => !r.correct)"
      class="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="font-semibold mb-2 text-red-700">Mots à retravailler :</p>
      <ul class="space-y-1">
        <li
          v-for="(e, i) in results.filter((r) => !r.correct)"
          :key="i"
          class="text-sm"
        >
          Tu as écrit <span class="font-bold text-red-600">{{ e.answer || '(vide)' }}</span>
          {{ ' ' }}→ c'était <span class="font-bold text-green-700">{{ e.word }}</span>
        </li>
      </ul>
    </div>
    <div class="flex gap-3 justify-center">
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

  <div v-else class="text-center">
    <h1 class="text-2xl font-bold mb-1">{{ dictation.name }}</h1>
    <p class="text-gray-500 mb-6">Mot {{ index + 1 }} / {{ dictation.words.length }}</p>

    <button
      class="text-5xl mb-6 hover:scale-110 transition-transform"
      aria-label="Réécouter le mot"
      @click="speak(dictation.words[index])"
    >
      🔊
    </button>

    <input
      v-model="answer"
      autofocus
      :class="`border-2 rounded-xl p-3 text-xl text-center w-64 block mx-auto mb-4 transition ${inputClass(feedback)}`"
      :disabled="!!feedback"
      placeholder="Écris le mot…"
      @keydown.enter="!feedback && validate()"
    />

    <p
      v-if="feedback"
      :class="`text-lg font-bold mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`"
    >
      {{ feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !' }}
    </p>

    <button
      :disabled="!!feedback || !answer.trim()"
      class="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
      @click="validate"
    >
      Valider
    </button>
  </div>
</template>
