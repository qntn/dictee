import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function DictationList() {
  const [dictations, setDictations] = useState([])

  useEffect(() => {
    fetch('/api/dictations')
      .then((r) => r.json())
      .then(setDictations)
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📚 Dictations</h1>
      {dictations.length === 0 ? (
        <p className="text-gray-500">No dictation yet. <Link to="/creer" className="text-blue-600 underline">Create one!</Link></p>
      ) : (
        <ul className="space-y-3">
          {dictations.map((d) => (
            <li key={d.id}>
              <Link
                to={`/dictation/${d.id}`}
                className="block bg-white rounded-xl shadow p-4 hover:bg-yellow-100 transition"
              >
                <span className="font-semibold text-lg">{d.name}</span>
                <span className="ml-3 text-gray-500 text-sm">{d.words.length} word(s)</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
