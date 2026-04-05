import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { API_BASE } from '../config'

function shootConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c'],
  })
}

function launchFireworks() {
  const duration = 3000
  const end = Date.now() + duration
  const colors = ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']

  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

function speak(word) {
  if (!ttsAvailable) return
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

/** Supprime les diacritiques et met en minuscule pour la comparaison. */
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function PlayDictation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dictation, setDictation] = useState(null)
  const [words, setWords] = useState([])       // mots actifs (peut être sous-ensemble)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [ignoreAccents, setIgnoreAccents] = useState(false)
  const [scores, setScores] = useState([])

  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    document.title = dictation ? `${dictation.name} — Dictée` : 'Dictée'
  }, [dictation])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/api/dictations/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((d) => {
        setDictation(d)
        setWords(d.words)
      })
      .catch(() => navigate('/'))
  }, [id, navigate])

  useEffect(() => {
    if (dictation && !finished) {
      setTimeout(() => speak(words[index]), 300)
    }
  }, [dictation, index, finished, words])

  useEffect(() => {
    if (finished) {
      launchFireworks()
      // Fetch previous scores
      fetch(`${API_BASE}/api/dictations/${id}/scores`)
        .then((r) => r.ok ? r.json() : [])
        .then(setScores)
        .catch(() => {})
    }
  }, [finished, id])

  function validate() {
    const expectedWord = words[index]
    const compare = ignoreAccents
      ? normalize(answer.trim()) === normalize(expectedWord)
      : answer.trim().toLowerCase() === expectedWord.toLowerCase()
    const correct = compare
    const newResults = [...results, { word: expectedWord, answer: answer.trim(), correct }]
    setResults(newResults)
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) shootConfetti()

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setFeedback(null)
      setAnswer('')
      if (index + 1 >= words.length) {
        setFinished(true)
        // Record score
        fetch(`${API_BASE}/api/dictations/${id}/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: newResults.filter((r) => r.correct).length,
            total: newResults.length,
          }),
        }).catch(() => {})
      } else {
        setIndex(index + 1)
      }
    }, 1200)
  }

  function restart(customWords) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const nextWords = customWords ?? dictation.words
    setWords(nextWords)
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
          Score :{' '}
          <span className="font-bold text-green-600">{score}</span> / {results.length}
        </p>

        {errors.length > 0 && (
          <div className="text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-2 text-red-700">Mots à retravailler :</p>
            <ul className="space-y-1">
              {errors.map((e, i) => (
                <li key={i} className="text-sm">
                  Tu as écrit{' '}
                  <span className="font-bold text-red-600">{e.answer || '(vide)'}</span>
                  {' '}→ c&apos;était{' '}
                  <span className="font-bold text-green-700">{e.word}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {scores.length > 1 && (
          <div className="text-left bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-2 text-gray-600">Historique :</p>
            <ul className="space-y-1">
              {scores.slice(0, 5).map((s) => (
                <li key={s.id} className="text-sm text-gray-500">
                  {new Date(s.playedAt).toLocaleDateString('fr-FR')} —{' '}
                  <span className="font-semibold">{s.score}/{s.total}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => restart()}
            className="bg-yellow-400 hover:bg-yellow-500 font-bold py-2 px-6 rounded-xl"
          >
            🔄 Recommencer
          </button>
          {errors.length > 0 && (
            <button
              onClick={() => restart(errors.map((e) => e.word))}
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-xl"
            >
              🔁 Retravailler les {errors.length} mot(s) raté(s)
            </button>
          )}
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
      <p className="text-gray-500 mb-4">
        Mot {index + 1} / {words.length}
      </p>

      <label className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={ignoreAccents}
          onChange={(e) => setIgnoreAccents(e.target.checked)}
          className="rounded"
        />
        Accepter sans accents
      </label>

      {!ttsAvailable && (
        <p className="text-amber-600 text-sm mb-4">
          ⚠️ La synthèse vocale n&apos;est pas disponible sur ce navigateur.
        </p>
      )}

      <button
        onClick={() => speak(words[index])}
        disabled={!ttsAvailable}
        className="text-5xl mb-6 hover:scale-110 transition-transform disabled:opacity-40"
        aria-label="Réécouter le mot"
      >
        🔊
      </button>

      <label htmlFor="answer-input" className="sr-only">
        Écrire le mot
      </label>
      <input
        id="answer-input"
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
        onKeyDown={(e) => e.key === 'Enter' && !feedback && answer.trim() && validate()}
        disabled={!!feedback}
        placeholder="Écris le mot…"
      />

      <div aria-live="polite" aria-atomic="true" className="h-8 mb-3">
        {feedback && (
          <p className={`text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback === 'correct' ? '✅ Bravo !' : '❌ Raté !'}
          </p>
        )}
      </div>

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
