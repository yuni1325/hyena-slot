import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  PREMISES,
  interpolateEv,
  medalsPerGame,
} from './data'

export type KabaneriInput = {
  /** サブ液晶などの表示G */
  displayGames: number
  /** 実G（ST間など） */
  actualGames: number
  /** 現在周期 1〜6 */
  cycle: number
  /** 短縮天井（設定変更/駆け抜け/景之ST後など） */
  shortened: boolean
}

export type KabaneriResult = {
  reachable: boolean
  expectedPayoutRate: number | null
  avgGames: number | null
  avgInvestment: number | null
  /** なな徹表ベースの等価期待値（円）※周期未考慮の参考 */
  tableYenEv: number | null
  /** なな徹表の平均投資（円） */
  tableInvestYen: number | null
  remainingByG: number | null
  remainingByCycle: number | null
  effectiveRemaining: number | null
  ceilingG: number
  maxCycle: number
}

function gamesToFinishCycle(
  cycle: number,
  actualG: number,
  maxCycle: number,
  ceilingG: number,
): number {
  if (cycle <= 0) return Math.max(1, ceilingG - actualG)
  if (cycle === 1) return Math.max(1, 150 - actualG)
  if (cycle === 2) return Math.max(1, 300 - actualG)
  if (cycle >= maxCycle) return Math.max(1, ceilingG - actualG)
  // 3周期以降はポイント到達中心。暫定で平均120G（参照サイトに非掲載）
  return 120
}

/**
 * 周期当選率（設定1）を使い、現在周期から天井までの期待残りGを算出。
 * 最終周期はエピソードボーナス確定（p=1）。
 */
export function expectedRemainingByCycle(
  cycle: number,
  actualG: number,
  shortened: boolean,
): number {
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal

  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  let survive = 1
  let expected = 0
  let elapsedGuess = actualG

  for (let c = c0; c <= maxCycle; c++) {
    const t =
      c === c0
        ? gamesToFinishCycle(c, actualG, maxCycle, ceilingG)
        : c <= 2
          ? 150
          : c === maxCycle
            ? Math.max(1, ceilingG - elapsedGuess)
            : 120

    const p =
      c === maxCycle ? 1 : (PREMISES.cycleHitRate[c] ?? 0.25)

    // 周期終了時点で抽選、という近似（当たりなら t 消化）
    expected += survive * p * t
    survive *= 1 - p
    elapsedGuess += t
    if (p >= 1 || survive < 1e-9) break
  }

  const remG = Math.max(0, ceilingG - actualG)
  return Math.min(expected, remG)
}

export function calculateKabaneri(input: KabaneriInput): KabaneriResult {
  const actualG = Math.max(0, Math.floor(input.actualGames))
  const cycle = Math.min(6, Math.max(1, Math.floor(input.cycle)))
  const shortened = Boolean(input.shortened)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal

  if (actualG >= ceilingG) {
    return {
      reachable: false,
      expectedPayoutRate: null,
      avgGames: null,
      avgInvestment: null,
      tableYenEv: null,
      tableInvestYen: null,
      remainingByG: 0,
      remainingByCycle: 0,
      effectiveRemaining: 0,
      ceilingG,
      maxCycle,
    }
  }

  const remainingByG = ceilingG - actualG
  const remainingByCycle = expectedRemainingByCycle(cycle, actualG, shortened)
  const effectiveRemaining = Math.min(remainingByG, remainingByCycle)

  const table = interpolateEv(
    shortened ? EV_SHORTENED : EV_NORMAL,
    Math.min(actualG, shortened ? 550 : 950),
  )

  // 周期がG天井より先に切れそうなら、残りGを周期側に合わせて投資・出玉率を再計算
  const mPerG = medalsPerGame()
  const avgGames = effectiveRemaining
  const avgInvestment = avgGames * mPerG
  const expectedPayoutRate =
    avgInvestment > 0
      ? (PREMISES.avgWinMedals / avgInvestment) * 100
      : null

  return {
    reachable: true,
    expectedPayoutRate,
    avgGames,
    avgInvestment,
    tableYenEv: table.yen,
    tableInvestYen: table.investYen,
    remainingByG,
    remainingByCycle,
    effectiveRemaining,
    ceilingG,
    maxCycle,
  }
}

export function buildKabaneriPremises(input: KabaneriInput): Premise[] {
  const shortened = input.shortened
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  const mPerG = medalsPerGame()

  return [
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: '天井',
      value: shortened
        ? `短縮 ${ceilingG}G / ${maxCycle}周期`
        : `通常 ${ceilingG}G / ${maxCycle}周期`,
      basis:
        'なな徹「天井の期待値や恩恵」。短縮＝設定変更後・ST駆け抜け後・景之ST後',
    },
    {
      label: '初当たり後の平均獲得枚数',
      value: `${PREMISES.avgWinMedals}枚`,
      basis: `ST平均獲得（設定1）。ST ${PREMISES.stHitDenom}分の1・機械割${PREMISES.payoutRate}%系の実践値（flick7）`,
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}（なな徹シミュ条件）`,
    },
    {
      label: '周期ボーナス当選率（設定1）',
      value: '1・2周期≈33% / 3周期18.4% / 4周期33.6% / 天井周期=100%',
      basis: 'なな徹「ゾーンや周期抽選の詳細」。5周期は調査中のため暫定25%',
      derived: true,
    },
    {
      label: '周期長さの近似',
      value: '1周期目〜150G / 2周期目〜300G / 以降ポイント周期は平均120G',
      basis:
        '規定G到達は公開。3周期以降の平均Gは参照サイト非掲載のため暫定（自前）',
      derived: true,
    },
    {
      label: '有効残りG',
      value: 'min(G数天井残り, 周期モデル期待残り)',
      basis: '表示Gは参考。計算の主軸は実G数＋現在周期',
    },
    {
      label: 'なな徹期待値表',
      value: '等価期待値・平均投資を参考表示（周期数は表側で未考慮）',
      basis: 'https://nana-press.com/kaiseki/machine/1097/35403/',
    },
  ]
}
