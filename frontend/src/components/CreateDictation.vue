<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE } from '../config'

const router = useRouter()

const name = ref('')
const wordInput = ref('')
const words = ref([])
const error = ref(false)

function addWord() {
  const word = wordInput.value.trim().toLowerCase()
  if (word && !words.value.includes(word)) {
    words.value.push(word)
    wordInput.value = ''
  }
}

function deleteWord(index) {
  words.value = words.value.filter((_, i) => i !== index)
}

async function save() {
  if (!name.value.trim() || words.value.length === 0) return
  error.value = false
  try {
    const response = await fetch(`${API_BASE}/api/dictations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), words: words.value }),
    })
    if (!response.ok) {
      error.value = true
      return
    }
    const dictation = await response.json()
    router.push(`/dictation/${dictation.id}`)
  } catch {
    error.value = true
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">✏️ Créer une dictée</h1>

    <label class="block mb-1 font-semibold">Nom de la dictée</label>
    <input
      v-model="name"
      class="border rounded-lg p-2 w-full mb-4"
      placeholder="ex : Animaux de la ferme"
    />

    <label class="block mb-1 font-semibold">Ajouter un mot</label>
    <div class="flex gap-2 mb-4">
      <input
        v-model="wordInput"
        class="border rounded-lg p-2 flex-1"
        placeholder="ex : chat"
        @keydown.enter="addWord"
      />
      <button
        class="bg-yellow-400 hover:bg-yellow-500 font-bold px-4 rounded-lg"
        @click="addWord"
      >
        +
      </button>
    </div>

    <ul v-if="words.length > 0" class="flex flex-wrap gap-2 mb-6">
      <li
        v-for="(w, i) in words"
        :key="i"
        class="bg-white border rounded-full px-3 py-1 flex items-center gap-2 text-sm"
      >
        {{ w }}
        <button
          class="text-red-400 hover:text-red-600 font-bold"
          @click="deleteWord(i)"
        >
          ×
        </button>
      </li>
    </ul>

    <button
      :disabled="!name.trim() || words.length === 0"
      class="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-xl"
      @click="save"
    >
      Enregistrer la dictée
    </button>

    <p v-if="error" class="mt-4 text-red-600 font-semibold">
      ❌ Une erreur est survenue. Veuillez réessayer.
    </p>
  </div>
</template>
