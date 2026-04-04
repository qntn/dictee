import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function speak(word) {
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export default function PlayDictation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dictation, setDictation] = useState(null)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetch(`/api/dictations/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setDictation)
      .catch(() => navigate('/'))
  }, [id, navigate])

  useEffect(() => {
    if (dictation && !finished) {
      setTimeout(() => speak(dictation.words[index]), 300)
    }
  }, [dictation, index, finished])

  function validate() {
    const expectedWord = dictation.words[index]
    const correct = answer.trim().toLowerCase() === expectedWord.toLowerCase()
    const newResults = [...results, { word: expectedWord, answer: answer.trim(), correct }]
    setResults(newResults)
    setFeedback(correct ? 'correct' : 'incorrect')

    setTimeout(() => {
      setFeedback(null)
      setAnswer('')
      if (index + 1 >= dictation.words.length) {
        setFinished(true)
      } else {
        setIndex(index + 1)
      }
    }, 1200)
  }

  function restart() {
    setIndex(0)
    setAnswer('')
    setResults([])
    setFinished(false)
    setFeedback(null)
  }

  if (!dictation) return <p className="text-gray-400">Chargement…</p>

  if (finished) {
    const score = results.filter((r) => r.correct).length
    const errors = results.filter((r) => !r.correct)
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎉 Terminé !</h1>
        <p className="text-2xl mb-4">
          Score : <span className="font-bold text-green-600">{score}</span> / {dictation.words.length}
        </p>
        {errors.length > 0 && (
          <div className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-2 text-red-700">Mots à retravailler :</p>
            <ul className="space-y-1">
              {errors.map((e, i) => (
                <li key={i} className="text-sm">
                  Tu as écrit <span className="font-bold text-red-600">{e.answer || '(vide)'}</span>
                  {' '}→ c'était <span className="font-bold text-green-700">{e.word}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
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
      <h1 className="text-2xl font-bold mb-1">{dictation.name}</h1>
      <p className="text-gray-500 mb-6">Mot {index + 1} / {dictation.words.length}</p>

      <button
        onClick={() => speak(dictation.words[index])}
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
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !feedback && validate()}
        disabled={!!feedback}
        placeholder="Écris le mot…"
      />

      {feedback && (
        <p className={`text-lg font-bold mb-3 ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !'}
        </p>
      )}

      <button
        onClick={validate}
        disabled={!!feedback || !answer.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-2 px-8 rounded-xl"
      >
        Valider
      </button>
    </div>
  )
}
