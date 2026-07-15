import { Link } from 'react-router-dom'
import { machineCards } from '../machines/catalog'

export default function HomePage() {
  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <p className="brand">HYENA SLOT</p>
        <h1 className="machine-name">機種を選ぶ</h1>
        <p className="tagline">ハイエナ専用サポート — 出先でも期待値をその場で確認</p>
      </header>

      <main className="panel">
        <ul className="machine-list">
          {machineCards.map((m) => (
            <li key={m.id}>
              <Link className="machine-card" to={m.path}>
                <span className="machine-card-short">{m.shortName}</span>
                <span className="machine-card-name">{m.name}</span>
                <span className="machine-card-blurb">{m.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
