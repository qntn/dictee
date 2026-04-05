import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'

export default function DictationList() {
  const [dictations, setDictations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadDictations() {
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/api/dictations`)
      .then((r) => {
        if (!r.ok) throw new Error('Erreur serveur')
        return r.json()
      })
      .then((data) => {
        setDictations(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadDictations()
  }, [])

  async function deleteDictation(e, id) {
    e.preventDefault()
    if (!window.confirm('Supprimer cette dictée ?')) return
    try {
      const res = await fetch(`${API_BASE}/api/dictations/${id}`, { method: 'DELETE' })
      if (res.ok) setDictations((prev) => prev.filter((d) => d.id !== id))
    } catch {
      alert('Impossible de supprimer la dictée.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📚 Les dictées</h1>

      {loading && <p className="text-gray-400 animate-pulse">Chargement…</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-semibold">
            ❌ Impossible de charger les dictées. Vérifiez votre connexion.
          </p>
          <button
            onClick={loadDictations}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && dictations.length === 0 && (
        <p className="text-gray-500">
          Aucune dictée pour l&apos;instant.{' '}
          <Link to="/creer" className="text-blue-600 underline">
            Créez-en une !
          </Link>
        </p>
      )}

      {!loading && !error && dictations.length > 0 && (
        <ul className="space-y-3">
          {dictations.map((d) => (
            <li key={d.id} className="flex items-center gap-2">
              <Link
                to={`/dictation/${d.id}`}
                className="flex-1 bg-white rounded-xl shadow p-4 hover:bg-yellow-100 transition"
              >
                <span className="font-semibold text-lg">{d.name}</span>
                <span className="ml-3 text-gray-500 text-sm">{d.words.length} mot(s)</span>
              </Link>
              <button
                onClick={(e) => deleteDictation(e, d.id)}
                aria-label={`Supprimer la dictée ${d.name}`}
                className="text-red-400 hover:text-red-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
