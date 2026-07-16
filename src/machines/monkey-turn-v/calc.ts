import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  PREMISES,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type MonkeyMode,
} from './data'

export type MonkeyInput = {
  /** 実G（データカウンター等。液晶表示Gではない） */
  actualGames: number
  cycle: number
  mode: MonkeyMode
  shortened: boolean
}

export type MonkeyResult = {
  reachable: boolean
  expectedPayoutRate: number | null
  /** 初当たり1回あたりの期待獲得出玉（AT・枚） */
  expectedWinMedals: number | null
  tablePayoutRate: number | null
  cycleCorrectionPp: number | null
  avgGames: number | null
  avgInvestment: number | null
  tableYenEv: number | null
  tableInvestYen: number | null
  tableAvgGames: number | null
  modelGamesToAt: number | null
  remainingByG: number | null
  effectiveMaxCycle: number
  ceilingG: number
}

export function effectiveMaxCycle(
  mode: MonkeyMode,
  shortened: boolean,
): number {
  const byShort = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  if (mode === 'unknown') return byShort
  return Math.min(PREMISES.modeMaxCycle[mode], byShort)
}

/** 実Gと周期のゆるい整合（1周期は平均80G・上限はポイント制のため厳格強制なし） */
export function cycleBoundsForGames(
  _actualGames: number,
  mode: MonkeyMode,
  shortened: boolean,
): { minCycle: number; maxCycle: number } {
  const maxCycle = effectiveMaxCycle(mode, shortened)
  return { minCycle: 1, maxCycle }
}

export function clampCycle(
  cycle: number,
  actualGames: number,
  mode: MonkeyMode,
  shortened: boolean,
): number {
  const { minCycle, maxCycle } = cycleBoundsForGames(
    actualGames,
    mode,
    shortened,
  )
  const c = Math.floor(cycle)
  if (!Number.isFinite(c)) return minCycle
  return Math.min(maxCycle, Math.max(minCycle, c))
}

function gamesToFinishCycle(cycle: number, isFirstSeg: boolean): number {
  if (cycle === 1 && isFirstSeg) return PREMISES.cycleAvgGames[1]
  return PREMISES.cycleAvgGames.later
}

function expectedGamesUntilOrCap(p: number, t: number): number {
  if (t <= 0) return 0
  if (p <= 0) return t
  if (p >= 1) return 1
  return (1 - Math.pow(1 - p, t)) / p
}

/**
 * モード既知時の周期経路ST(=AT)期待G。
 * 超抜CZ等はなな徹表側に織込み想定のため、ここでは周期のみ。
 */
export function expectedGamesToAtModel(
  cycle: number,
  currentG: number,
  mode: Exclude<MonkeyMode, 'unknown'>,
  shortened: boolean,
): number {
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(mode, shortened)
  const remGCap = Math.max(0, ceilingG - currentG)
  if (remGCap <= 0) return 0

  const rates = PREMISES.cycleAtRate[mode]
  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  // 公表AT 1/299.8 から粗い周期寄与を差し引いた残余を1Gあたりに（表校正用）
  const pAtPerGame = 1 / PREMISES.atHitDenom

  let survive = 1
  let expected = 0
  let elapsed = currentG
  let first = true

  for (let c = c0; c <= maxCycle; c++) {
    if (survive < 1e-9) break
    const toCeil = Math.max(0, ceilingG - elapsed)
    if (toCeil <= 0) break

    let t = gamesToFinishCycle(c, first && c === c0)
    // 現周期の残り: 周期内位置不明のため平均長さを上限クリップ
    if (first && c === c0 && c === 1) {
      t = Math.max(1, Math.min(t, PREMISES.cycleAvgGames[1]))
    }
    t = Math.min(Math.max(1, t), toCeil)
    first = false

    const eInSeg = expectedGamesUntilOrCap(pAtPerGame * 0.35, t) // CZ/直撃の薄い寄与
    expected += survive * eInSeg
    const surviveDirect = Math.pow(1 - pAtPerGame * 0.35, t)

    const hitCeil = elapsed + t >= ceilingG
    const isCeilingCycle = c === maxCycle || hitCeil
    const pHit = isCeilingCycle ? 1 : (rates[c] ?? 0.2)
    const pStop = pHit

    survive *= surviveDirect * (1 - pStop)
    elapsed += t
    if (hitCeil || pStop >= 1) {
      survive = 0
      break
    }
  }

  if (survive > 1e-9) {
    const rem = Math.max(0, ceilingG - elapsed)
    expected += survive * expectedGamesUntilOrCap(pAtPerGame * 0.35, rem)
  }

  return Math.min(expected, remGCap)
}

export function calculateMonkey(input: MonkeyInput): MonkeyResult {
  const g = Math.max(0, Math.floor(input.actualGames))
  const mode = input.mode
  const shortened = Boolean(input.shortened)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(mode, shortened)
  const cycle = clampCycle(input.cycle, g, mode, shortened)
  const mPerG = medalsPerGame()
  const yenPer = PREMISES.yenPerMedal
  const winMedals = PREMISES.tableWinMedals

  const table = interpolateEv(
    shortened ? EV_SHORTENED : EV_NORMAL,
    Math.min(g, shortened ? 450 : 750),
  )
  const tableInvestMedals = table.investYen / yenPer
  const tableWin = winMedalsFromEv(table)
  const tablePayoutRate =
    tableInvestMedals > 0 ? (tableWin / tableInvestMedals) * 100 : null
  const tableAvgGames = tableInvestMedals / mPerG

  if (g >= ceilingG) {
    return {
      reachable: false,
      expectedPayoutRate: null,
      expectedWinMedals: winMedals,
      tablePayoutRate,
      cycleCorrectionPp: null,
      avgGames: null,
      avgInvestment: null,
      tableYenEv: table.yen,
      tableInvestYen: table.investYen,
      tableAvgGames,
      modelGamesToAt: 0,
      remainingByG: 0,
      effectiveMaxCycle: maxCycle,
      ceilingG,
    }
  }

  const remainingByG = ceilingG - g
  let modelGames = tableAvgGames
  let useCorrection = false

  if (mode !== 'unknown') {
    modelGames = expectedGamesToAtModel(cycle, g, mode, shortened)
    useCorrection = true
  }

  const scale = useCorrection ? PREMISES.cycleCorrectionScale : 0
  const avgGames = tableAvgGames + (modelGames - tableAvgGames) * scale
  const avgInvestment = avgGames * mPerG
  const expectedPayoutRate =
    avgInvestment > 0 ? (winMedals / avgInvestment) * 100 : null
  const cycleCorrectionPp =
    expectedPayoutRate != null && tablePayoutRate != null
      ? expectedPayoutRate - tablePayoutRate
      : null

  return {
    reachable: true,
    expectedPayoutRate,
    expectedWinMedals: winMedals,
    tablePayoutRate,
    cycleCorrectionPp,
    avgGames,
    avgInvestment,
    tableYenEv: table.yen,
    tableInvestYen: table.investYen,
    tableAvgGames,
    modelGamesToAt: useCorrection ? modelGames : null,
    remainingByG,
    effectiveMaxCycle: maxCycle,
    ceilingG,
  }
}

export function buildMonkeyPremises(input: MonkeyInput): Premise[] {
  const shortened = input.shortened
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(input.mode, shortened)
  const mPerG = medalsPerGame()
  const modeLabel =
    input.mode === 'A'
      ? 'モードA'
      : input.mode === 'B'
        ? 'モードB'
        : input.mode === 'heaven'
          ? '天国'
          : '不明'

  return [
    {
      label: '出玉率の主軸',
      value: 'なな徹ゲーム数天井期待値表',
      basis:
        '周期・モード未考慮。モード判明時のみ周期補正を50%反映。モード不明時は表のみ',
    },
    {
      label: '初当たり（AT）期待獲得出玉（分子）',
      value: `${PREMISES.tableWinMedals.toFixed(2)}枚（なな徹表・一定）`,
      basis: '表の invest+期待値 から逆算。算出条件はAT終了後即ヤメ・各状態平均純増固定',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: '天井',
      value: shortened
        ? `短縮 ${ceilingG}G+α / 最大${maxCycle}周期`
        : `通常 ${ceilingG}G+α / 最大${maxCycle}周期`,
      basis:
        '短縮＝設定変更後・青島VS波多野敗北後。到達でAT「SGラッシュ」当選',
    },
    {
      label: 'モード',
      value: `${modeLabel}（周期天井 ${maxCycle}）`,
      basis: 'A=6 / B=3 / 天国=1。短縮時は全体上限4周期',
    },
    {
      label: '周期長さの近似',
      value: '1周期平均80G / 以降平均100G',
      basis: 'なな徹・1激。規定ptはゾロ目（1周期≤222pt）',
      derived: true,
    },
    {
      label: '周期AT率',
      value: '◎≈25% / ○≈3% / △≈1% / 「-」≈0% / 天井=100%',
      basis: 'ユーザー指定。なな徹の◎○△表に対応',
      derived: true,
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}（なな徹シミュ条件）`,
    },
    {
      label: 'なな徹期待値表',
      value: 'https://nana-press.com/kaiseki/machine/644/18016/',
      basis: '等価・平均投資。周期数は考慮しない',
    },
    {
      label: '未反映（意図的）',
      value: 'ライバルモード / EXアイテム / ヘルメット示唆',
      basis:
        'いずれも判明時は機械割100%超だが、落ち台では稀／判別ヤメ前提。保守のため未入力',
    },
  ]
}
