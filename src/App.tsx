import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HokutoTensei2Page from './pages/HokutoTensei2Page'
import KabaneriUnatoPage from './pages/KabaneriUnatoPage'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/machines/hokuto-tensei2" element={<HokutoTensei2Page />} />
        <Route path="/machines/kabaneri-unato" element={<KabaneriUnatoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
