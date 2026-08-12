import type { CalcInput, ModeResult, Premise } from '../types'
import {
  MODE_CEILING,
  MODE_LABELS,
  MODE_STAY_RATE,
  PHASE_LABELS,
  PREMISES,
  SHUTTER_CAP,
  SHUTTER_DISC_AVG_ABESHI,
  SHUTTER_DISC_DIST,
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
      expectedWinMedals: PREMISES.avgWinMedals,
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
    expectedWinMedals: PREMISES.avgWinMedals,
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
 * 判別コストなし（内部用）。
 */
export function expectedRemainingAbeshiShutterRaw(
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

/**
 * シャッター判別あり＋判別コスト込み。
 * 体感分布: 判別完了まで 45/175/300/420 あべしに 2:3:3:2 で引っ張られる。
 * - 現在あべしが完了点未満 → 完了点まで進めてからシャッター残り
 * - 完了点以上 → 判別済みとして現在からのシャッター残り
 */
export function expectedRemainingAbeshiShutter(
  current: number,
  phase: Phase,
): number | null {
  if (current < 0) return null
  if (current >= SHUTTER_CAP) return null

  let totalW = 0
  let sum = 0

  for (const { abeshi: d, weight: w } of SHUTTER_DISC_DIST) {
    let rem: number | null
    if (current >= d) {
      rem = expectedRemainingAbeshiShutterRaw(current, phase)
    } else {
      const after = expectedRemainingAbeshiShutterRaw(d, phase)
      if (after == null) rem = null
      else rem = d - current + after
    }
    if (rem == null || rem < 0) continue
    totalW += w
    sum += w * rem
  }

  if (totalW <= 0) return null
  return sum / totalW
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
      basis: '振り分けテーブルが状況で異なる（web情報・一撃公開）',
    },
    {
      label: 'シャッター判別',
      value: shutter
        ? `あり（${SHUTTER_CAP}以内混合＋判別コスト）`
        : 'なし（通常A確定）',
      basis: shutter
        ? `判別完了まで 45/175/300/420あべしに 2:3:3:2（平均約${SHUTTER_DISC_AVG_ABESHI.toFixed(0)}）。完了前は完了点まで進めてから896混合`
        : 'シャッター未判別台は通常Aとして計算（モード混合しない）',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
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
        'web情報 / 一撃の％を使用。ゾーン代表あべしは区間中央（人生期待値論ノート逆算に整合）',
    },
  ]

  if (!shutter) {
    premises.push({
      label: 'モード扱い',
      value: '通常A確定',
      basis: '未判別台の主計算はA。参考として他モードも併記',
    })
  } else {
    premises.push({
      label: '混合に使うモード滞在率',
      value: stayText,
      basis: `web情報公開のモード移行率。${SHUTTER_CAP}超ゾーンは除外して再正規化`,
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
        `シャッター(${SHUTTER_CAP}以内＋判別コスト)`,
        expectedRemainingAbeshiShutter(n, phase),
        null,
      ),
    ]
  }

  const stay = MODE_STAY_RATE[phase]
  // 未判別台は通常A確定を主結果にする
  const modeA = toResult(
    'A',
    MODE_LABELS.A,
    expectedRemainingAbeshi('A', n, phase),
    stay.A,
  )
  const primary = toResult(
    'blend',
    '通常A確定（未判別）',
    modeA.expectedRemainingAbeshi,
    100,
  )

  const others = (['B', 'C', 'heaven'] as const).map((mode) =>
    toResult(
      mode,
      MODE_LABELS[mode],
      expectedRemainingAbeshi(mode, n, phase),
      stay[mode],
    ),
  )

  return [primary, modeA, ...others]
}
