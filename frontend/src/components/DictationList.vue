<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { API_BASE } from '../config'

const dictations = ref([])

onMounted(() => {
  fetch(`${API_BASE}/api/dictations`)
    .then((r) => r.json())
    .then((data) => { dictations.value = data })
    .catch(() => {})
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">📚 Les dictées</h1>
    <p v-if="dictations.length === 0" class="text-gray-500">
      Aucune dictée pour l'instant.
      <RouterLink to="/creer" class="text-blue-600 underline">Créez-en une !</RouterLink>
    </p>
    <ul v-else class="space-y-3">
      <li v-for="d in dictations" :key="d.id">
        <RouterLink
          :to="`/dictation/${d.id}`"
          class="block bg-white rounded-xl shadow p-4 hover:bg-yellow-100 transition"
        >
          <span class="font-semibold text-lg">{{ d.name }}</span>
          <span class="ml-3 text-gray-500 text-sm">{{ d.words.length }} mot(s)</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
