import { Routes, Route, Link } from 'react-router-dom'
import DicteeList from './components/DicteeList'
import CreateDictee from './components/CreateDictee'
import PlayDictee from './components/PlayDictee'

export default function App() {
  return (
    <div className="min-h-screen bg-yellow-50">
      <nav className="bg-yellow-400 p-4 flex gap-6 text-lg font-bold">
        <Link to="/" className="hover:underline">📋 Les dictées</Link>
        <Link to="/creer" className="hover:underline">✏️ Créer une dictée</Link>
      </nav>
      <main className="p-6 max-w-2xl mx-auto">
        <Routes>
          <Route path="/" element={<DicteeList />} />
          <Route path="/creer" element={<CreateDictee />} />
          <Route path="/dictee/:id" element={<PlayDictee />} />
        </Routes>
      </main>
    </div>
  )
}
