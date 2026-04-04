import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateDictee() {
  const [nom, setNom] = useState('')
  const [motInput, setMotInput] = useState('')
  const [mots, setMots] = useState([])
  const navigate = useNavigate()

  function ajouterMot() {
    const mot = motInput.trim().toLowerCase()
    if (mot && !mots.includes(mot)) {
      setMots([...mots, mot])
      setMotInput('')
    }
  }

  function supprimerMot(index) {
    setMots(mots.filter((_, i) => i !== index))
  }

  async function enregistrer() {
    if (!nom.trim() || mots.length === 0) return
    await fetch('/api/dictees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nom.trim(), mots }),
    })
    navigate('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">✏️ Créer une dictée</h1>

      <label className="block mb-1 font-semibold">Nom de la dictée</label>
      <input
        className="border rounded-lg p-2 w-full mb-4"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="ex : Animaux de la ferme"
      />

      <label className="block mb-1 font-semibold">Ajouter un mot</label>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded-lg p-2 flex-1"
          value={motInput}
          onChange={(e) => setMotInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ajouterMot()}
          placeholder="ex : chat"
        />
        <button
          onClick={ajouterMot}
          className="bg-yellow-400 hover:bg-yellow-500 font-bold px-4 rounded-lg"
        >
          +
        </button>
      </div>

      {mots.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-6">
          {mots.map((m, i) => (
            <li
              key={i}
              className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 text-sm"
            >
              {m}
              <button
                onClick={() => supprimerMot(i)}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={enregistrer}
        disabled={!nom.trim() || mots.length === 0}
        className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-xl"
      >
        Enregistrer la dictée
      </button>
    </div>
  )
}
