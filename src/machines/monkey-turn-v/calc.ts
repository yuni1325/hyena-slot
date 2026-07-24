import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  MODE_IDS,
  MODE_LABEL,
  PREMISES,
  avgReachForCycle,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type MonkeyMode,
} from './data'

export type MonkeyInput = {
  /** 実G（データカウンター等・AT間） */
  actualGames: number
  cycle: number
  mode: MonkeyMode
  shortened: boolean
}

export type MonkeyModeRow = {
  id: Exclude<MonkeyMode, 'unknown'>
  label: string
  expectedPayoutRate: number | null
  avgGames: number | null
  modelGamesToAt: number | null
  /** 当該周期の想定残G（平均到達） */
  remainingInCycleDisplay: number | null
  maxCycle: number
}

export type MonkeyResult = {
  reachable: boolean
  expectedPayoutRate: number | null
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
  remainingInCycleDisplay: number | null
  effectiveMaxCycle: number
  ceilingG: number
  /** 主計算に使ったモード（不明→A） */
  resolvedMode: Exclude<MonkeyMode, 'unknown'>
  byMode: MonkeyModeRow[]
}

/** 不明は通常A */
export function resolveMode(
  mode: MonkeyMode,
): Exclude<MonkeyMode, 'unknown'> {
  return mode === 'unknown' ? 'A' : mode
}

export function effectiveMaxCycle(
  mode: MonkeyMode,
  shortened: boolean,
): number {
  const resolved = resolveMode(mode)
  const byShort = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  return Math.min(PREMISES.modeMaxCycle[resolved], byShort)
}

export function cycleBoundsForGames(
  _actualGames: number,
  mode: MonkeyMode,
  shortened: boolean,
): { minCycle: number; maxCycle: number } {
  return { minCycle: 1, maxCycle: effectiveMaxCycle(mode, shortened) }
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

/**
 * 当該周期の想定残G。表示Gは使わず平均到達を用いる。
 * 1周期目のみハード222は平均80の根拠として残す（入力には使わない）。
 */
export function remainingInCycle(cycle: number): number {
  return avgReachForCycle(cycle)
}

/** @deprecated remainingInCycle を使用 */
export function remainingDisplayInCycle(cycle: number, _displayGames?: number): number {
  return remainingInCycle(cycle)
}

function expectedGamesUntilOrCap(p: number, t: number): number {
  if (t <= 0) return 0
  if (p <= 0) return t
  if (p >= 1) return 1
  return (1 - Math.pow(1 - p, t)) / p
}

/**
 * モード既知時の周期経路AT期待G。
 * 当該周期残り＝平均到達G、以降も平均到達。
 * 周期AT率（◎○△）とG数天井の競合を考慮。
 * 通常Bは天井2周期65%／3周期35%の事前混合（3周期到達時は後者のみ）。
 */
export function expectedGamesToAtModel(
  cycle: number,
  actualGames: number,
  mode: Exclude<MonkeyMode, 'unknown'>,
  shortened: boolean,
): number {
  if (mode === 'B' && !shortened) {
    // 設定1の振り分けは事前分布。観測周期で条件付けする。
    // 3周期目に到達している＝2周期天井側（65%）は既にAT済みなので除外し、
    // 3周期天井側（35%）のみを使う。そうしないと cycle>max でG数天井残りまで悪化する。
    if (cycle >= 3) {
      return expectedGamesToAtModelFixedMax(
        cycle,
        actualGames,
        'B',
        shortened,
        3,
      )
    }
    const w2 = PREMISES.modeBCeilingSplit.cycle2
    const w3 = PREMISES.modeBCeilingSplit.cycle3
    const e2 = expectedGamesToAtModelFixedMax(
      cycle,
      actualGames,
      'B',
      shortened,
      2,
    )
    const e3 = expectedGamesToAtModelFixedMax(
      cycle,
      actualGames,
      'B',
      shortened,
      3,
    )
    return w2 * e2 + w3 * e3
  }
  const maxCycle = Math.min(
    PREMISES.modeMaxCycle[mode],
    shortened ? PREMISES.maxCycle.shortened : PREMISES.maxCycle.normal,
  )
  return expectedGamesToAtModelFixedMax(
    cycle,
    actualGames,
    mode,
    shortened,
    maxCycle,
  )
}

function expectedGamesToAtModelFixedMax(
  cycle: number,
  actualGames: number,
  mode: Exclude<MonkeyMode, 'unknown'>,
  shortened: boolean,
  maxCycle: number,
): number {
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const remGCap = Math.max(0, ceilingG - actualGames)
  if (remGCap <= 0) return 0
  if (cycle > maxCycle) return remGCap

  const rates = PREMISES.cycleAtRate[mode]
  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  const pAtPerGame = 1 / PREMISES.atHitDenom
  const pThin = pAtPerGame * 0.35

  let survive = 1
  let expected = 0
  let elapsed = actualGames
  let first = true

  for (let c = c0; c <= maxCycle; c++) {
    if (survive < 1e-9) break
    const toCeil = Math.max(0, ceilingG - elapsed)
    if (toCeil <= 0) break

    let t: number
    if (first && c === c0) {
      t = remainingInCycle(c)
    } else {
      t = avgReachForCycle(c)
    }
    t = Math.min(Math.max(1, t), toCeil)
    first = false

    const eInSeg = expectedGamesUntilOrCap(pThin, t)
    expected += survive * eInSeg
    const surviveDirect = Math.pow(1 - pThin, t)

    const hitCeil = elapsed + t >= ceilingG
    const isCeilingCycle = c === maxCycle || hitCeil
    const pHit = isCeilingCycle ? 1 : (rates[c] ?? 0)

    survive *= surviveDirect * (1 - pHit)
    elapsed += t
    if (hitCeil || pHit >= 1) {
      survive = 0
      break
    }
  }

  if (survive > 1e-9) {
    const rem = Math.max(0, ceilingG - elapsed)
    expected += survive * expectedGamesUntilOrCap(pThin, rem)
  }

  return Math.min(expected, remGCap)
}

function scenarioForMode(
  mode: Exclude<MonkeyMode, 'unknown'>,
  cycle: number,
  actualGames: number,
  shortened: boolean,
  tableAvgGames: number,
  winMedals: number,
  mPerG: number,
  actualDone: boolean,
): MonkeyModeRow {
  const maxCycle = Math.min(
    PREMISES.modeMaxCycle[mode],
    shortened ? PREMISES.maxCycle.shortened : PREMISES.maxCycle.normal,
  )
  const remDisplay = remainingInCycle(cycle)

  if (actualDone || cycle > maxCycle) {
    return {
      id: mode,
      label: MODE_LABEL[mode],
      expectedPayoutRate: null,
      avgGames: null,
      modelGamesToAt: actualDone ? 0 : null,
      remainingInCycleDisplay: remDisplay,
      maxCycle,
    }
  }

  const modelGames = expectedGamesToAtModel(
    cycle,
    actualGames,
    mode,
    shortened,
  )
  const scale = PREMISES.cycleCorrectionScale
  const avgGames = tableAvgGames + (modelGames - tableAvgGames) * scale
  const avgInvestment = avgGames * mPerG
  const expectedPayoutRate =
    avgInvestment > 0 ? (winMedals / avgInvestment) * 100 : null

  return {
    id: mode,
    label: MODE_LABEL[mode],
    expectedPayoutRate,
    avgGames,
    modelGamesToAt: modelGames,
    remainingInCycleDisplay: remDisplay,
    maxCycle,
  }
}

export function calculateMonkey(input: MonkeyInput): MonkeyResult {
  const g = Math.max(0, Math.floor(input.actualGames))
  const shortened = Boolean(input.shortened)
  const resolvedMode = resolveMode(input.mode)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(resolvedMode, shortened)
  const cycle = clampCycle(input.cycle, g, resolvedMode, shortened)
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
  const remainingByG = Math.max(0, ceilingG - g)
  const remDisplay = remainingInCycle(cycle)
  const actualDone = g >= ceilingG

  const byMode = MODE_IDS.map((id) =>
    scenarioForMode(
      id,
      cycle,
      g,
      shortened,
      tableAvgGames,
      winMedals,
      mPerG,
      actualDone,
    ),
  )

  const primary = byMode.find((r) => r.id === resolvedMode) ?? byMode[0]

  if (actualDone || primary.expectedPayoutRate == null) {
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
      modelGamesToAt: primary.modelGamesToAt,
      remainingByG,
      remainingInCycleDisplay: remDisplay,
      effectiveMaxCycle: maxCycle,
      ceilingG,
      resolvedMode,
      byMode,
    }
  }

  const cycleCorrectionPp =
    tablePayoutRate != null
      ? primary.expectedPayoutRate - tablePayoutRate
      : null

  return {
    reachable: true,
    expectedPayoutRate: primary.expectedPayoutRate,
    expectedWinMedals: winMedals,
    tablePayoutRate,
    cycleCorrectionPp,
    avgGames: primary.avgGames,
    avgInvestment:
      primary.avgGames != null ? primary.avgGames * mPerG : null,
    tableYenEv: table.yen,
    tableInvestYen: table.investYen,
    tableAvgGames,
    modelGamesToAt: primary.modelGamesToAt,
    remainingByG,
    remainingInCycleDisplay: remDisplay,
    effectiveMaxCycle: maxCycle,
    ceilingG,
    resolvedMode,
    byMode,
  }
}

export function buildMonkeyPremises(input: MonkeyInput): Premise[] {
  const shortened = input.shortened
  const resolved = resolveMode(input.mode)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(resolved, shortened)
  const mPerG = medalsPerGame()
  const rem = remainingInCycle(
    clampCycle(input.cycle, input.actualGames, resolved, shortened),
  )

  return [
    {
      label: '出玉率の主軸',
      value: 'web情報表＋周期補正（通常A既定）',
      basis:
        '表は周期未考慮。モード不明は通常A。B・天国は下部参考。周期補正は表との差の35%を反映。Bの2/3周期振り分けは観測周期で条件付け。表示Gは未使用',
    },
    {
      label: '初当たり（AT）期待獲得出玉（分子）',
      value: `${PREMISES.tableWinMedals.toFixed(2)}枚（web情報表・一定）`,
      basis: '表の invest+期待値 から逆算。AT終了後即ヤメ想定',
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
        '短縮＝設定変更後・青島VS波多野敗北後。到達でAT「SGラッシュ」',
    },
    {
      label: '主計算モード',
      value: `${MODE_LABEL[resolved]}${input.mode === 'unknown' ? '（不明→A）' : ''}`,
      basis: 'A=6 / B=3 / 天国=1。短縮時は全体上限4周期',
    },
    {
      label: '当該周期の想定残G',
      value: `約${rem.toFixed(0)}G`,
      basis:
        '表示Gは使わず平均到達（1周期≈80G／以降≈100G）を当該周期残りとする',
      derived: true,
    },
    {
      label: '周期AT率',
      value: '◎≈25% / ○≈3% / △≈1% / 「-」≈0% / 天井=100%',
      basis: 'モード別ゾーン表に対応して周期到達時の当選を近似',
      derived: true,
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: '等価・平均投資。周期数は表側で未考慮',
    },
    {
      label: '未反映（意図的）',
      value: 'ライバルモード / EXアイテム / ヘルメット示唆 / 表示G',
      basis: '表示Gは入力しない。判明時の機械割補正等も未入力',
    },
  ]
}
