<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { API_BASE } from '../config'

// The free Render backend sleeps after 15 min idle and takes 1–2 min to wake up.
// Meanwhile requests hang or fail, so we tell the user and keep retrying.
const WAKING_MESSAGE_AFTER_MS = 4000
const RETRY_DELAY_MS = 5000
const GIVE_UP_AFTER_MS = 3 * 60 * 1000

const dictations = ref([])
const textDictations = ref([])
const loading = ref(true)
const error = ref(false)
const waking = ref(false)
let unmounted = false

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchAll() {
  const [res1, res2] = await Promise.all([
    fetch(`${API_BASE}/api/dictations`),
    fetch(`${API_BASE}/api/text-dictations`)
  ])
  if (!res1.ok || !res2.ok) throw new Error('Erreur serveur')
  dictations.value = await res1.json()
  textDictations.value = await res2.json()
}

async function loadDictations() {
  loading.value = true
  error.value = false
  waking.value = false
  const wakingTimer = setTimeout(() => { waking.value = true }, WAKING_MESSAGE_AFTER_MS)
  const deadline = Date.now() + GIVE_UP_AFTER_MS
  try {
    while (!unmounted) {
      try {
        await fetchAll()
        return
      } catch {
        if (Date.now() + RETRY_DELAY_MS > deadline) {
          error.value = true
          return
        }
        waking.value = true
        await wait(RETRY_DELAY_MS)
      }
    }
  } finally {
    clearTimeout(wakingTimer)
    loading.value = false
    waking.value = false
  }
}

async function deleteDictation(id, name) {
  if (!window.confirm(`Supprimer la dictée "${name}" ?`)) return

  // Optimistic UI update - remove immediately for instant visual feedback
  const originalDictations = dictations.value
  dictations.value = dictations.value.filter((d) => d.id !== id)

  try {
    const res = await fetch(`${API_BASE}/api/dictations/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Rollback on failure
      dictations.value = originalDictations
      alert('Impossible de supprimer la dictée.')
    }
  } catch {
    // Rollback on error
    dictations.value = originalDictations
    alert('Impossible de supprimer la dictée.')
  }
}

async function deleteTextDictation(id, name) {
  if (!window.confirm(`Supprimer la dictée de texte "${name}" ?`)) return
  try {
    const res = await fetch(`${API_BASE}/api/text-dictations/${id}`, { method: 'DELETE' })
    if (res.ok) textDictations.value = textDictations.value.filter((d) => d.id !== id)
  } catch {
    alert('Impossible de supprimer la dictée.')
  }
}

onMounted(loadDictations)
onUnmounted(() => { unmounted = true })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">📚 Les dictées</h1>

    <div v-if="loading">
      <p class="text-gray-400 animate-pulse">Chargement…</p>
      <p v-if="waking" class="mt-2 text-gray-500" role="status">
        😴 Le serveur se réveille, ça peut prendre une ou deux minutes…
      </p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
      role="alert"
    >
      <p class="text-red-700 font-semibold">
        ❌ Impossible de charger les dictées. Vérifiez votre connexion.
      </p>
      <button
        class="mt-2 text-sm text-red-600 underline hover:text-red-800"
        @click="loadDictations"
      >
        Réessayer
      </button>
    </div>

    <div v-else>
      <p v-if="dictations.length === 0 && textDictations.length === 0" class="text-gray-500 mb-4">
        Aucune dictée pour l'instant.
      </p>

      <!-- Word Dictations Section -->
      <div v-if="dictations.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
          ✏️ Dictées de mots
        </h2>
        <ul class="space-y-3">
          <li
            v-for="d in dictations"
            :key="d.id"
            class="flex items-center gap-2"
          >
            <RouterLink
              :to="`/dictation/${d.id}`"
              class="flex-1 bg-white rounded-xl shadow p-4 hover:bg-yellow-100 transition"
            >
              <span class="font-semibold text-lg">{{ d.name }}</span>
              <span class="ml-3 text-gray-500 text-sm">{{ d.words.length }} mot(s)</span>
            </RouterLink>
            <button
              :aria-label="`Supprimer la dictée ${d.name}`"
              class="text-red-400 hover:text-red-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition"
              @click="deleteDictation(d.id, d.name)"
            >
              🗑️
            </button>
          </li>
        </ul>
      </div>

      <!-- Text Dictations Section -->
      <div v-if="textDictations.length > 0">
        <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
          📝 Dictées de texte
        </h2>
        <ul class="space-y-3">
          <li
            v-for="d in textDictations"
            :key="d.id"
            class="flex items-center gap-2"
          >
            <RouterLink
              :to="`/text-dictation/${d.id}`"
              class="flex-1 bg-white rounded-xl shadow p-4 hover:bg-blue-100 transition"
            >
              <span class="font-semibold text-lg">{{ d.name }}</span>
              <span class="ml-3 text-gray-500 text-sm">{{ d.segments.length }} phrase(s)</span>
            </RouterLink>
            <button
              :aria-label="`Supprimer la dictée de texte ${d.name}`"
              class="text-red-400 hover:text-red-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition"
              @click="deleteTextDictation(d.id, d.name)"
            >
              🗑️
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
