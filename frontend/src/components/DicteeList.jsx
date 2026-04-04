import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function DicteeList() {
  const [dictees, setDictees] = useState([])

  useEffect(() => {
    fetch('/api/dictees')
      .then((r) => r.json())
      .then(setDictees)
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📚 Les dictées</h1>
      {dictees.length === 0 ? (
        <p className="text-gray-500">Aucune dictée pour l'instant. <Link to="/creer" className="text-blue-600 underline">Créez-en une !</Link></p>
      ) : (
        <ul className="space-y-3">
          {dictees.map((d) => (
            <li key={d.id}>
              <Link
                to={`/dictee/${d.id}`}
                className="block bg-white rounded-xl shadow p-4 hover:bg-yellow-100 transition"
              >
                <span className="font-semibold text-lg">{d.nom}</span>
                <span className="ml-3 text-gray-500 text-sm">{d.mots.length} mot(s)</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
