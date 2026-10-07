import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BackToHomeButton from './BackToHomeButton'
import ClosingCorrectionRows from './ClosingCorrectionRows'
import ClosingHoursField from './ClosingHoursField'
import {
  applyClosingCorrection,
  DEFAULT_CLOSING_HOURS,
  type ClosingHours,
} from '../lib/closingCorrection'
import { formatNum, formatYen } from '../lib/format'
import type { HazardCeilingResult } from '../lib/hazardCeiling'
import type { Premise } from '../machines/types'

type Props<S extends string> = {
  machineId: string
  title: string
  tagline: string
  gamesLabel: string
  situationIds: S[]
  situationLabel: Record<S, string>
  defaultSituation: S
  defaultGames: number
  ceilingFor: (s: S) => number
  pureIncPerGame: number
  calculate: (input: { actualGames: number; situation: S }) => HazardCeilingResult
  premises: (input: { actualGames: number; situation: S }) => Premise[]
  inputNote?: string
  premisesNote: string
  footnote: string
}

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function HazardCeilingPage<S extends string>(props: Props<S>) {
  const [actualText, setActualText] = useState(String(props.defaultGames))
  const [situation, setSituation] = useState<S>(props.defaultSituation)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const input = useMemo(
    () => ({ actualGames, situation }),
    [actualGames, situation],
  )
  const { calculate, premises: buildPremises } = props
  const result = useMemo(() => calculate(input), [calculate, input])
  const premises = useMemo(() => buildPremises(input), [buildPremises, input])

  const closing = useMemo(
    () =>
      applyClosingCorrection({
        hoursUntilClose: closingHours,
        avgGamesToHit: result.avgGames,
        expectedWinMedals: result.expectedWinMedals,
        pureIncPerGame: props.pureIncPerGame,
        rawPayoutRate: result.expectedPayoutRate,
      }),
    [closingHours, result, props.pureIncPerGame],
  )

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <BackToHomeButton />
        <p className="brand">
          <Link to="/" className="brand-link">
            HYENA SLOT
          </Link>
        </p>
        <h1 className="machine-name">{props.title}</h1>
        <p className="tagline">{props.tagline}</p>
      </header>

      <main className="panel">
        <label className="field">
          <span>前回の状況</span>
          <select
            value={situation}
            onChange={(e) => setSituation(e.target.value as S)}
          >
            {props.situationIds.map((id) => (
              <option key={id} value={id}>
                {props.situationLabel[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{props.gamesLabel}</span>
          <input
            type="text"
            inputMode="numeric"
            value={actualText}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || /^\d+$/.test(v)) setActualText(v)
            }}
            onBlur={() =>
              setActualText(actualGames === 0 ? '' : String(actualGames))
            }
          />
        </label>
        <p className="inline-note">
          データカウンター想定の実G。天井 {props.ceilingFor(situation)}G+α。
          {props.inputNote ? ` ${props.inputNote}` : ''}
        </p>

        <ClosingHoursField value={closingHours} onChange={setClosingHours} />

        <section className="results" aria-label="計算結果">
          <div className="results-head results-head-kaba">
            <span>項目</span>
            <span>値</span>
          </div>
          <ClosingCorrectionRows
            closing={closing}
            bonusLabel="AT"
            machineId={props.machineId}
            pureIncPerGame={props.pureIncPerGame}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり等価獲得（モデル）</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">等価期待値</span>
            <span>{formatYen(result.yenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資</span>
            <span>
              {result.investYen == null
                ? '—'
                : `${Math.round(result.investYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井到達率</span>
            <span>
              {result.reachRate == null
                ? '—'
                : `${result.reachRate.toFixed(2)}%`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井残り</span>
            <span>{formatNum(result.remaining, 0)}G</span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">{props.premisesNote}</p>
          <ul>
            {premises.map((p) => (
              <li key={p.label}>
                <div className="premise-top">
                  <strong>{p.label}</strong>
                  <span className="premise-value">{p.value}</span>
                  {p.derived && <span className="badge">自前算出</span>}
                </div>
                <p className="premise-basis">{p.basis}</p>
              </li>
            ))}
          </ul>
          <p className="footnote">{props.footnote}</p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}
