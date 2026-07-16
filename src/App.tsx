import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HokutoTensei2Page from './pages/HokutoTensei2Page'
import KabaneriUnatoPage from './pages/KabaneriUnatoPage'
import MonkeyTurnVPage from './pages/MonkeyTurnVPage'
import TokyoGhoulPage from './pages/TokyoGhoulPage'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/machines/hokuto-tensei2" element={<HokutoTensei2Page />} />
        <Route path="/machines/kabaneri-unato" element={<KabaneriUnatoPage />} />
        <Route path="/machines/monkey-turn-v" element={<MonkeyTurnVPage />} />
        <Route path="/machines/tokyo-ghoul" element={<TokyoGhoulPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
