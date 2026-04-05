<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { API_BASE } from '../config'

const dictations = ref([])
const loading = ref(true)
const error = ref(false)

async function loadDictations() {
  loading.value = true
  error.value = false
  try {
    const res = await fetch(`${API_BASE}/api/dictations`)
    if (!res.ok) throw new Error('Erreur serveur')
    dictations.value = await res.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function deleteDictation(id, name) {
  if (!window.confirm(`Supprimer la dictée "${name}" ?`)) return
  try {
    const res = await fetch(`${API_BASE}/api/dictations/${id}`, { method: 'DELETE' })
    if (res.ok) dictations.value = dictations.value.filter((d) => d.id !== id)
  } catch {
    alert('Impossible de supprimer la dictée.')
  }
}

onMounted(loadDictations)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">📚 Les dictées</h1>

    <p v-if="loading" class="text-gray-400 animate-pulse">Chargement…</p>

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

    <p v-else-if="dictations.length === 0" class="text-gray-500">
      Aucune dictée pour l'instant.
      <RouterLink to="/creer" class="text-blue-600 underline">Créez-en une !</RouterLink>
    </p>

    <ul v-else class="space-y-3">
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
</template>
