import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HokutoTensei2Page from './pages/HokutoTensei2Page'
import KabaneriUnatoPage from './pages/KabaneriUnatoPage'
import MonkeyTurnVPage from './pages/MonkeyTurnVPage'
import Otome5Page from './pages/Otome5Page'
import KokakuPage from './pages/KokakuPage'
import MillionGodPage from './pages/MillionGodPage'
import Sao2Page from './pages/Sao2Page'
import Karakuri2Page from './pages/Karakuri2Page'
import ShinuchiYoshimunePage from './pages/ShinuchiYoshimunePage'
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
        <Route path="/machines/otome5" element={<Otome5Page />} />
        <Route path="/machines/sao2" element={<Sao2Page />} />
        <Route path="/machines/million-god" element={<MillionGodPage />} />
        <Route path="/machines/kokaku" element={<KokakuPage />} />
        <Route
          path="/machines/shinuchi-yoshimune"
          element={<ShinuchiYoshimunePage />}
        />
        <Route path="/machines/karakuri2" element={<Karakuri2Page />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
