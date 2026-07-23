import { useMemo, useState } from 'react'
import {
  calculateMonkey,
  effectiveMaxCycle,
  isValidMonkeyGames,
} from '../machines/monkey-turn-v/calc'
import type { MonkeyMode } from '../machines/monkey-turn-v/data'

type ChartView = 'cycles' | 'table'

type Props = {
  actualGames: number
  displayGames: number
  cycle: number
  mode: MonkeyMode
  shortened: boolean
}

const ACTUAL_STEP = 25
const ACTUAL_MAX = 750
const Y_MIN = 90
const Y_MAX = 130

const CYCLE_COLORS = [
  '#64748b',
  '#b91c1c',
  '#0f766e',
  '#a16207',
  '#7c3aed',
  '#0369a1',
]

function buildActualSteps(maxG: number): number[] {
  const steps: number[] = []
  for (let g = 0; g <= maxG; g += ACTUAL_STEP) steps.push(g)
  return steps
}

function polylinePoints(
  xs: number[],
  ys: Array<number | null>,
  xAt: (g: number) => number,
  yAt: (r: number) => number,
): string[] {
  // Split on nulls into contiguous segments
  const segments: string[] = []
  let buf: string[] = []
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i]
    if (y == null || !Number.isFinite(y)) {
      if (buf.length > 1) segments.push(buf.join(' '))
      buf = []
      continue
    }
    buf.push(`${xAt(xs[i]).toFixed(1)},${yAt(y).toFixed(1)}`)
  }
  if (buf.length > 1) segments.push(buf.join(' '))
  return segments
}

export default function MonkeyPayoutChart({
  actualGames,
  displayGames,
  cycle,
  mode,
  shortened,
}: Props) {
  const [view, setView] = useState<ChartView>('cycles')
  const maxCycle = effectiveMaxCycle(mode, shortened)
  const ceilingG = shortened ? 495 : 795
  const actualSteps = useMemo(
    () => buildActualSteps(Math.min(ACTUAL_MAX, ceilingG)),
    [ceilingG],
  )

  const series = useMemo(() => {
    if (view === 'table') {
      const corrected: Array<number | null> = []
      const table: Array<number | null> = []
      for (const g of actualSteps) {
        if (!isValidMonkeyGames(cycle, g, displayGames)) {
          corrected.push(null)
          table.push(null)
          continue
        }
        const r = calculateMonkey({
          actualGames: g,
          displayGames,
          cycle,
          mode,
          shortened,
        })
        corrected.push(r.expectedPayoutRate)
        table.push(r.tablePayoutRate)
      }
      return [
        { id: 'corrected', label: `${cycle}周期・補正後`, color: '#b91c1c', values: corrected },
        { id: 'table', label: 'web情報表', color: '#64748b', values: table },
      ]
    }

    return Array.from({ length: maxCycle }, (_, i) => {
      const c = i + 1
      const values: Array<number | null> = []
      for (const g of actualSteps) {
        if (!isValidMonkeyGames(c, g, displayGames)) {
          values.push(null)
          continue
        }
        const r = calculateMonkey({
          actualGames: g,
          displayGames,
          cycle: c,
          mode,
          shortened,
        })
        values.push(r.expectedPayoutRate)
      }
      return {
        id: `c${c}`,
        label: `${c}周期`,
        color: CYCLE_COLORS[(c - 1) % CYCLE_COLORS.length],
        values,
        emphasize: c === cycle,
      }
    })
  }, [view, actualSteps, displayGames, cycle, mode, shortened, maxCycle])

  const W = 640
  const H = 280
  const pad = { top: 16, right: 16, bottom: 36, left: 44 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const xMax = actualSteps[actualSteps.length - 1] || 1

  const xAt = (g: number) => pad.left + (g / xMax) * innerW
  const yAt = (r: number) => {
    const t = (r - Y_MIN) / (Y_MAX - Y_MIN)
    return pad.top + (1 - Math.min(1, Math.max(0, t))) * innerH
  }

  const yTicks = [90, 100, 110, 120, 130]
  const xTicks = actualSteps.filter((g) => g % 100 === 0)

  const markerX = xAt(Math.min(Math.max(0, actualGames), xMax))

  return (
    <div className="monkey-chart">
      <div className="monkey-chart-toolbar">
        <label className="field field-inline">
          <span>グラフ</span>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ChartView)}
          >
            <option value="cycles">周期比較（表示G固定）</option>
            <option value="table">補正後 vs 表（現在周期）</option>
          </select>
        </label>
      </div>
      <p className="inline-note">
        横軸=実G / 縦軸=期待出玉率%。表示G={displayGames}
        {view === 'cycles' ? '固定で周期別' : `・現在${cycle}周期`}。1周期目は表示G≥実Gのみ。閉店補正なし。
      </p>
      <div className="monkey-chart-frame">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="モンキーターン期待出玉率の推移"
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={W - pad.right}
                y1={yAt(t)}
                y2={yAt(t)}
                className={t === 100 ? 'monkey-chart-ref' : 'monkey-chart-grid'}
              />
              <text
                x={pad.left - 6}
                y={yAt(t) + 3}
                textAnchor="end"
                className="monkey-chart-label"
              >
                {t}%
              </text>
            </g>
          ))}
          {xTicks.map((g) => (
            <text
              key={g}
              x={xAt(g)}
              y={H - 10}
              textAnchor="middle"
              className="monkey-chart-label"
            >
              {g}
            </text>
          ))}
          <text
            x={pad.left + innerW / 2}
            y={H - 0}
            textAnchor="middle"
            className="monkey-chart-axis"
          >
            実G
          </text>

          {series.map((s) =>
            polylinePoints(actualSteps, s.values, xAt, yAt).map((pts, si) => (
              <polyline
                key={`${s.id}-${si}`}
                fill="none"
                points={pts}
                stroke={s.color}
                strokeWidth={'emphasize' in s && s.emphasize ? 2.5 : 1.5}
                opacity={'emphasize' in s && s.emphasize === false ? 0.55 : 0.95}
              />
            )),
          )}

          <line
            x1={markerX}
            x2={markerX}
            y1={pad.top}
            y2={H - pad.bottom}
            className="monkey-chart-now"
          />
        </svg>
      </div>
      <ul className="monkey-chart-legend">
        {series.map((s) => (
          <li key={s.id}>
            <span
              className="monkey-chart-swatch"
              style={{ background: s.color }}
            />
            {s.label}
            {'emphasize' in s && s.emphasize ? '（現在）' : ''}
          </li>
        ))}
        <li>
          <span className="monkey-chart-swatch monkey-chart-swatch-now" />
          現在の実G（{actualGames}）
        </li>
      </ul>
    </div>
  )
}
