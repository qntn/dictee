import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

export default function CreateDictation() {
  const [name, setName] = useState('')
  const [wordInput, setWordInput] = useState('')
  const [words, setWords] = useState([])
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Créer une dictée | Dictée'
  }, [])

  function addWord() {
    const word = wordInput.trim().toLowerCase()
    if (word && !words.includes(word)) {
      setWords([...words, word])
      setWordInput('')
    }
  }

  function deleteWord(word) {
    setWords(words.filter((w) => w !== word))
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

      <label htmlFor="dictation-name" className="block mb-1 font-semibold">
        Nom de la dictée
      </label>
      <input
        id="dictation-name"
        className="border rounded-lg p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex : Animaux de la ferme"
      />

      <label htmlFor="word-input" className="block mb-1 font-semibold">
        Ajouter un mot
      </label>
      <div className="flex gap-2 mb-4">
        <input
          id="word-input"
          className="border rounded-lg p-2 flex-1"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          placeholder="ex : chat"
        />
        <button
          onClick={addWord}
          aria-label="Ajouter le mot"
          className="bg-yellow-400 hover:bg-yellow-500 font-bold px-4 rounded-lg"
        >
          +
        </button>
      </div>

      {words.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-6" aria-label="Mots de la dictée">
          {words.map((w) => (
            <li
              key={w}
              className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 text-sm"
            >
              {w}
              <button
                onClick={() => deleteWord(w)}
                aria-label={`Supprimer le mot ${w}`}
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
        <p className="mt-4 text-red-600 font-semibold" role="alert">
          ❌ Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </div>
  )
}
