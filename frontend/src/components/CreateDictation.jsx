import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

export default function CreateDictation() {
  const [name, setName] = useState('')
  const [wordInput, setWordInput] = useState('')
  const [words, setWords] = useState([])
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function addWord() {
    const word = wordInput.trim().toLowerCase()
    if (word && !words.includes(word)) {
      setWords([...words, word])
      setWordInput('')
    }
  }

  function deleteWord(index) {
    setWords(words.filter((_, i) => i !== index))
  }

  async function save() {
    if (!name.trim() || words.length === 0) return
    setError(false)
    try {
      const response = await fetch(`${API_BASE}/api/dictations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), words }),
      })
      if (!response.ok) {
        setError(true)
        return
      }
      const dictation = await response.json()
      navigate(`/dictation/${dictation.id}`)
    } catch {
      setError(true)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">✏️ Créer une dictée</h1>

      <label className="block mb-1 font-semibold">Nom de la dictée</label>
      <input
        className="border rounded-lg p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex : Animaux de la ferme"
      />

      <label className="block mb-1 font-semibold">Ajouter un mot</label>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded-lg p-2 flex-1"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          placeholder="ex : chat"
        />
        <button
          onClick={addWord}
          className="bg-yellow-400 hover:bg-yellow-500 font-bold px-4 rounded-lg"
        >
          +
        </button>
      </div>

      {words.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-6">
          {words.map((w, i) => (
            <li
              key={i}
              className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 text-sm"
            >
              {w}
              <button
                onClick={() => deleteWord(i)}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={save}
        disabled={!name.trim() || words.length === 0}
        className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-xl"
      >
        Enregistrer la dictée
      </button>

      {error && (
        <p className="mt-4 text-red-600 font-semibold">
          ❌ Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </div>
  )
}
