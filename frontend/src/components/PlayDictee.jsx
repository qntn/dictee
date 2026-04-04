import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function parler(mot) {
  const utterance = new SpeechSynthesisUtterance(mot)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export default function PlayDictee() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dictee, setDictee] = useState(null)
  const [index, setIndex] = useState(0)
  const [reponse, setReponse] = useState('')
  const [resultats, setResultats] = useState([])
  const [termine, setTermine] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetch(`/api/dictees/${id}`)
      .then((r) => r.json())
      .then(setDictee)
      .catch(() => navigate('/'))
  }, [id, navigate])

  useEffect(() => {
    if (dictee && !termine) {
      setTimeout(() => parler(dictee.mots[index]), 300)
    }
  }, [dictee, index, termine])

  function valider() {
    const motAttendu = dictee.mots[index]
    const correct = reponse.trim().toLowerCase() === motAttendu.toLowerCase()
    const nouveauxResultats = [...resultats, { mot: motAttendu, reponse: reponse.trim(), correct }]
    setResultats(nouveauxResultats)
    setFeedback(correct ? 'correct' : 'incorrect')

    setTimeout(() => {
      setFeedback(null)
      setReponse('')
      if (index + 1 >= dictee.mots.length) {
        setTermine(true)
      } else {
        setIndex(index + 1)
      }
    }, 1200)
  }

  function recommencer() {
    setIndex(0)
    setReponse('')
    setResultats([])
    setTermine(false)
    setFeedback(null)
  }

  if (!dictee) return <p className="text-gray-400">Chargement…</p>

  if (termine) {
    const score = resultats.filter((r) => r.correct).length
    const erreurs = resultats.filter((r) => !r.correct)
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎉 Terminé !</h1>
        <p className="text-2xl mb-4">
          Score : <span className="font-bold text-green-600">{score}</span> / {dictee.mots.length}
        </p>
        {erreurs.length > 0 && (
          <div className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-2 text-red-700">Mots à retravailler :</p>
            <ul className="space-y-1">
              {erreurs.map((e, i) => (
                <li key={i} className="text-sm">
                  Tu as écrit <span className="font-bold text-red-600">{e.reponse || '(vide)'}</span>
                  {' '}→ c'était <span className="font-bold text-green-700">{e.mot}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={recommencer}
            className="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl"
          >
            🔄 Recommencer
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-6 rounded-xl"
          >
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-1">{dictee.nom}</h1>
      <p className="text-gray-500 mb-6">Mot {index + 1} / {dictee.mots.length}</p>

      <button
        onClick={() => parler(dictee.mots[index])}
        className="text-5xl mb-6 hover:scale-110 transition-transform"
        aria-label="Réécouter le mot"
      >
        🔊
      </button>

      <input
        autoFocus
        className={`border-2 rounded-xl p-3 text-xl text-center w-64 block mx-auto mb-4 transition ${
          feedback === 'correct'
            ? 'border-green-400 bg-green-50'
            : feedback === 'incorrect'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300'
        }`}
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !feedback && valider()}
        disabled={!!feedback}
        placeholder="Écris le mot…"
      />

      {feedback && (
        <p className={`text-lg font-bold mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !'}
        </p>
      )}

      <button
        onClick={valider}
        disabled={!!feedback || !reponse.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
      >
        Valider
      </button>
    </div>
  )
}
