<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE } from '../config'

const router = useRouter()

const name = ref('')
const fullText = ref('')
const error = ref(false)

onMounted(() => {
  document.title = 'Créer une dictée de texte | Dictée'
})

async function save() {
  if (!name.value.trim() || !fullText.value.trim()) return
  error.value = false
  try {
    const response = await fetch(`${API_BASE}/api/text-dictations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), fullText: fullText.value.trim() }),
    })
    if (!response.ok) {
      error.value = true
      return
    }
    const textDictation = await response.json()
    router.push(`/text-dictation/${textDictation.id}`)
  } catch {
    error.value = true
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">📝 Créer une dictée de texte</h1>
    <p class="text-gray-600 mb-4">
      Le texte sera dicté phrase par phrase, comme une maîtresse d'école.
    </p>

    <label for="dictation-name" class="block mb-1 font-semibold">Nom de la dictée</label>
    <input
      id="dictation-name"
      v-model="name"
      class="border rounded-lg p-2 w-full mb-4"
      placeholder="ex : Histoire de Noël"
    />

    <label for="text-input" class="block mb-1 font-semibold">Texte complet</label>
    <textarea
      id="text-input"
      v-model="fullText"
      class="border rounded-lg p-2 w-full mb-4 min-h-[200px]"
      placeholder="Entrez le texte complet à dicter. Il sera automatiquement découpé en phrases."
    ></textarea>

    <button
      :disabled="!name.trim() || !fullText.trim()"
      class="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-xl"
      @click="save"
    >
      Enregistrer la dictée de texte
    </button>

    <p v-if="error" class="mt-4 text-red-600 font-semibold" role="alert">
      ❌ Une erreur est survenue. Veuillez réessayer.
    </p>
  </div>
</template>
