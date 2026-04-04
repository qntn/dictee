import { Routes, Route, Link } from 'react-router-dom'
import DictationList from './components/DictationList'
import CreateDictation from './components/CreateDictation'
import PlayDictation from './components/PlayDictation'

export default function App() {
  return (
    <div className="min-h-screen bg-yellow-50">
      <nav className="bg-yellow-400 p-4 flex gap-6 text-lg font-bold">
        <Link to="/" className="hover:underline">📋 Dictations</Link>
        <Link to="/creer" className="hover:underline">✏️ Create a dictation</Link>
      </nav>
      <main className="p-6 max-w-2xl mx-auto">
        <Routes>
          <Route path="/" element={<DictationList />} />
          <Route path="/creer" element={<CreateDictation />} />
          <Route path="/dictation/:id" element={<PlayDictation />} />
        </Routes>
      </main>
    </div>
  )
}
