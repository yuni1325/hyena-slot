import type { CalcInput, ModeResult, Premise } from '../types'
import {
  MODE_CEILING,
  MODE_LABELS,
  MODE_STAY_RATE,
  PHASE_LABELS,
  PREMISES,
  SHUTTER_CAP,
  medalsPerGame,
  zoneRepresentative,
  zonesFor,
  type HokutoMode,
  type Phase,
} from './data'

const MODES: HokutoMode[] = ['A', 'B', 'C', 'heaven']

type Mass = { weight: number; prescribed: number }

function toResult(
  modeId: string,
  modeLabel: string,
  remaining: number | null,
  stayProbability: number | null,
): ModeResult {
  if (remaining === null || remaining <= 0) {
    return {
      modeId,
      modeLabel,
      reachable: false,
      expectedPayoutRate: null,
      avgGames: null,
      avgInvestment: null,
      expectedRemainingAbeshi: remaining,
      stayProbability,
    }
  }

  const g0 = remaining / PREMISES.abeshiPerGame
  const avgGames = avgGamesWithDirect(g0, 1 / PREMISES.directHitDenom)
  const avgInvestment = avgGames * medalsPerGame()
  const expectedPayoutRate = (PREMISES.avgWinMedals / avgInvestment) * 100

  return {
    modeId,
    modeLabel,
    reachable: true,
    expectedPayoutRate,
    avgGames,
    avgInvestment,
    expectedRemainingAbeshi: remaining,
    stayProbability,
  }
}

/**
 * 現在あべし n 条件付きで、モード別の残り規定あべし期待値を返す。
 * 各ゾーンの規定あべしは区間中央値。
 */
export function expectedRemainingAbeshi(
  mode: HokutoMode,
  current: number,
  phase: Phase,
): number | null {
  if (current < 0) return null
  if (current >= MODE_CEILING[phase][mode]) return null

  const masses: Mass[] = []

  for (const zone of zonesFor(phase)) {
    const ratePct = zone.rates[mode]
    if (ratePct <= 0) continue

    const prescribed = zoneRepresentative(zone)
    if (prescribed <= current) continue

    masses.push({
      weight: ratePct / 100,
      prescribed,
    })
  }

  return expectedRemainingFromMasses(masses, current)
}

/**
 * シャッター判別あり: 896打ち切り＋モード混合の残りあべし期待値。
 */
export function expectedRemainingAbeshiShutter(
  current: number,
  phase: Phase,
): number | null {
  if (current < 0) return null
  if (current >= SHUTTER_CAP) return null

  const stay = MODE_STAY_RATE[phase]
  const masses: Mass[] = []

  for (const mode of MODES) {
    for (const zone of zonesFor(phase)) {
      if (zone.max > SHUTTER_CAP) continue
      const ratePct = zone.rates[mode]
      if (ratePct <= 0) continue

      const prescribed = zoneRepresentative(zone)
      if (prescribed <= current) continue

      masses.push({
        weight: (stay[mode] / 100) * (ratePct / 100),
        prescribed,
      })
    }
  }

  return expectedRemainingFromMasses(masses, current)
}

function expectedRemainingFromMasses(
  masses: Mass[],
  current: number,
): number | null {
  const total = masses.reduce((s, m) => s + m.weight, 0)
  if (total <= 0) return null

  const expectedPrescribed =
    masses.reduce((s, m) => s + m.weight * m.prescribed, 0) / total
  return expectedPrescribed - current
}

/**
 * 規定到達までのベースGと毎Gの直撃が競合するときの平均G。
 * E[min(Geo(p), G0)] = (1 - (1-p)^G0) / p
 */
export function avgGamesWithDirect(g0: number, pDirect: number): number {
  if (g0 <= 0) return 0
  if (pDirect <= 0) return g0
  const q = 1 - pDirect
  return (1 - q ** g0) / pDirect
}

export function buildPremises(
  phase: Phase = 'afterAt',
  shutter = false,
): Premise[] {
  const mPerG = medalsPerGame()
  const stay = MODE_STAY_RATE[phase]
  const stayText = MODES.map(
    (m) => `${MODE_LABELS[m]}${stay[m].toFixed(1)}%`,
  ).join(' / ')

  const premises: Premise[] = [
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定（低設定固定）',
    },
    {
      label: '状況',
      value: PHASE_LABELS[phase],
      basis: '振り分けテーブルが状況で異なる（なな徹・一撃公開）',
    },
    {
      label: 'シャッター判別',
      value: shutter
        ? `あり（${SHUTTER_CAP}以内打ち切り＋モード混合）`
        : 'なし（モード別）',
      basis: shutter
        ? '人生期待値論ノート準拠。浅いA・B・C・天国をモード滞在率で混合'
        : '各モードの期待値を個別表示。滞在率は公開のモード移行率',
    },
    {
      label: '初当たり1回あたり平均獲得枚数',
      value: `${PREMISES.avgWinMedals}枚`,
      basis:
        '人生期待値論ノート（たらればさん参照）。機械割逆算554.6枚とほぼ同値',
    },
    {
      label: 'AT直撃確率',
      value: `1/${PREMISES.directHitDenom}`,
      basis: '参照サイトにトータル直撃率の公表なし。暫定値（影響は極小）',
      derived: true,
    },
    {
      label: '1Gあたりあべし増加',
      value: `${PREMISES.abeshiPerGame}`,
      basis: '人生期待値論ノートの実務値（天破均し込み）',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}（公開ベース）`,
    },
    {
      label: '規定あべし振り分け',
      value: `${PHASE_LABELS[phase]}・設定1のゾーン別選択率（公開値）`,
      basis:
        'なな徹 / 一撃の％を使用。ゾーン代表あべしは区間中央（人生期待値論ノート逆算に整合）',
    },
  ]

  if (!shutter) {
    premises.push({
      label: 'モード滞在率',
      value: stayText,
      basis: `なな徹「状況別のモード振り分け」設定1（${PHASE_LABELS[phase]}）。モード不問行は未当選で生存するモードの滞在率で残りあべしを加重平均`,
    })
  } else {
    premises.push({
      label: '混合に使うモード滞在率',
      value: stayText,
      basis: `なな徹公開のモード移行率。${SHUTTER_CAP}超ゾーンは除外して再正規化`,
    })
  }

  return premises
}

export function calculateHokutoTensei2(input: CalcInput): ModeResult[] {
  const n = Math.floor(input.currentAbeshi)
  const phase: Phase = input.phase === 'reset' ? 'reset' : 'afterAt'
  const shutter = Boolean(input.shutter)

  if (shutter) {
    return [
      toResult(
        'shutter',
        `シャッター(${SHUTTER_CAP}以内混合)`,
        expectedRemainingAbeshiShutter(n, phase),
        null,
      ),
    ]
  }

  const stay = MODE_STAY_RATE[phase]
  const perMode = MODES.map((mode) =>
    toResult(
      mode,
      MODE_LABELS[mode],
      expectedRemainingAbeshi(mode, n, phase),
      stay[mode],
    ),
  )

  // 未当選で生存しているモードだけ再正規化し、滞在率加重の残りあべしからモード不問EV
  let blendWeight = 0
  let blendRemaining = 0
  for (const row of perMode) {
    if (
      !row.reachable ||
      row.expectedRemainingAbeshi == null ||
      row.stayProbability == null
    ) {
      continue
    }
    blendWeight += row.stayProbability
    blendRemaining += row.stayProbability * row.expectedRemainingAbeshi
  }

  const blended = toResult(
    'blend',
    'モード不問（滞在率加重）',
    blendWeight > 0 ? blendRemaining / blendWeight : null,
    blendWeight > 0 ? blendWeight : null,
  )

  return [blended, ...perMode]
}
