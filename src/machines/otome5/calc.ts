import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  PERIOD_MODE_AVG,
  PERIOD_MODE_HARD,
  PERIOD_MODE_IDS,
  PERIOD_MODE_LABEL,
  PERIOD_TABLE_IDS,
  PERIOD_TABLE_LABEL,
  PERIOD_TABLE_MAX,
  PREMISES,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type PeriodTableId,
} from './data'

export type Otome5Input = {
  /** 実G（AT間天井。強カワチャンス加算なし） */
  actualGames: number
  /** 表示G（液晶・当該周期内。加算込み） */
  displayGames: number
  /** 現在周期 1〜6 */
  cycle: number
  /** 設定変更後の短縮天井 */
  shortened: boolean
}

export type Otome5ScenarioResult = {
  id: string
  label: string
  reachable: boolean
  expectedPayoutRate: number | null
  avgGames: number | null
  avgInvestment: number | null
  modelGamesToAt: number | null
  cycleCorrectionPp: number | null
  maxCycle: number
  /** 当該周期の表示G残り目安 */
  remainingInCycleDisplay: number | null
}

export type Otome5Result = {
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
  ceilingG: number
  maxCycle: number
  /** 周期テーブル別（通常A/B/天国） */
  byTable: Otome5ScenarioResult[]
  /** 周期モード別（A/B/C/チャンス/引き戻し） */
  byMode: Otome5ScenarioResult[]
}

export type ModelOpts = {
  maxCycle: number
  /** 当該周期の残り表示G */
  remCurrentDisplay: number
  /** 以降周期の平均到達表示G */
  avgLaterDisplay: number
}

export function effectiveMaxCycle(shortened: boolean): number {
  return shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
}

export function clampCycle(cycle: number, shortened: boolean): number {
  const max = effectiveMaxCycle(shortened)
  const c = Math.floor(cycle)
  if (!Number.isFinite(c)) return 1
  return Math.min(max, Math.max(1, c))
}

function expectedGamesUntilOrCap(p: number, t: number): number {
  if (t <= 0) return 0
  if (p <= 0) return t
  if (p >= 1) return 1
  return (1 - Math.pow(1 - p, t)) / p
}

function avgReachMixed(cycle: number): number {
  return cycle === 1
    ? PREMISES.cycleAvgReachDisplay[1]
    : PREMISES.cycleAvgReachDisplay.later
}

/** 当該周期の表示G残り（混合平均・主表示用） */
export function remainingDisplayInCycle(
  cycle: number,
  displayGames: number,
): number {
  const soft = avgReachMixed(cycle)
  const hard = PREMISES.cycleDisplayHardCap
  const d = Math.max(0, Math.floor(displayGames))
  const remSoft = soft - d
  if (remSoft > 0) return remSoft
  return Math.max(40, hard - d)
}

export function remainingForModeHard(
  modeHard: number,
  displayGames: number,
): number {
  const d = Math.max(0, Math.floor(displayGames))
  return Math.max(1, modeHard - d)
}

/** モードの平均到達を優先し、超過時のみハード上限まで */
export function remainingForMode(
  modeAvg: number,
  modeHard: number,
  displayGames: number,
): number {
  const d = Math.max(0, Math.floor(displayGames))
  const remSoft = modeAvg - d
  if (remSoft > 0) return remSoft
  return Math.max(1, modeHard - d)
}

export function tableMaxCycle(
  table: PeriodTableId,
  shortened: boolean,
): number {
  const byShort = effectiveMaxCycle(shortened)
  return Math.min(PERIOD_TABLE_MAX[table], byShort)
}

/**
 * 周期経路のAT期待G（実G換算・近似）。
 */
export function expectedGamesToAtModel(
  cycle: number,
  actualGames: number,
  shortened: boolean,
  opts: ModelOpts,
): number {
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = Math.max(1, opts.maxCycle)
  const remGCap = Math.max(0, ceilingG - actualGames)
  if (remGCap <= 0) return 0

  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  const pAtPerGame = 1 / PREMISES.atHitDenom
  const pThin = pAtPerGame * 0.25

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
      t = opts.remCurrentDisplay
    } else {
      t = opts.avgLaterDisplay
    }
    t = Math.min(Math.max(1, t), toCeil)
    first = false

    const eInSeg = expectedGamesUntilOrCap(pThin, t)
    expected += survive * eInSeg
    const surviveDirect = Math.pow(1 - pThin, t)

    const hitCeil = elapsed + t >= ceilingG
    const isCeilingCycle = c === maxCycle || hitCeil
    const pHit = isCeilingCycle ? 1 : (PREMISES.cycleAtRate[c] ?? 0.3)

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

function scenarioFromModel(
  id: string,
  label: string,
  modelGames: number,
  tableAvgGames: number,
  tablePayoutRate: number | null,
  winMedals: number,
  mPerG: number,
  maxCycle: number,
  remDisplay: number,
  actualDone: boolean,
): Otome5ScenarioResult {
  if (actualDone) {
    return {
      id,
      label,
      reachable: false,
      expectedPayoutRate: null,
      avgGames: null,
      avgInvestment: null,
      modelGamesToAt: 0,
      cycleCorrectionPp: null,
      maxCycle,
      remainingInCycleDisplay: remDisplay,
    }
  }

  const scale = PREMISES.cycleCorrectionScale
  const avgGames = tableAvgGames + (modelGames - tableAvgGames) * scale
  const avgInvestment = avgGames * mPerG
  const expectedPayoutRate =
    avgInvestment > 0 ? (winMedals / avgInvestment) * 100 : null
  const cycleCorrectionPp =
    expectedPayoutRate != null && tablePayoutRate != null
      ? expectedPayoutRate - tablePayoutRate
      : null

  return {
    id,
    label,
    reachable: true,
    expectedPayoutRate,
    avgGames,
    avgInvestment,
    modelGamesToAt: modelGames,
    cycleCorrectionPp,
    maxCycle,
    remainingInCycleDisplay: remDisplay,
  }
}

export function calculateOtome5(input: Otome5Input): Otome5Result {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const shortened = Boolean(input.shortened)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(shortened)
  const cycle = clampCycle(input.cycle, shortened)
  const mPerG = medalsPerGame()
  const yenPer = PREMISES.yenPerMedal
  const winMedals = PREMISES.tableWinMedals

  const table = interpolateEv(
    shortened ? EV_SHORTENED : EV_NORMAL,
    Math.min(actual, shortened ? 600 : 950),
  )
  const tableInvestMedals = table.investYen / yenPer
  const tableWin = winMedalsFromEv(table)
  const tablePayoutRate =
    tableInvestMedals > 0 ? (tableWin / tableInvestMedals) * 100 : null
  const tableAvgGames = tableInvestMedals / mPerG
  const remainingInCycleDisplay =
    cycle === 1
      ? // AT後1周期目は引き戻し確定 → 平均到達寄り（最大200）
        remainingForMode(
          PERIOD_MODE_AVG.pullback,
          PERIOD_MODE_HARD.pullback,
          display,
        )
      : remainingDisplayInCycle(cycle, display)
  const actualDone = actual >= ceilingG

  const blendModel = actualDone
    ? 0
    : expectedGamesToAtModel(cycle, actual, shortened, {
        maxCycle,
        remCurrentDisplay: remainingInCycleDisplay,
        // 1周期失敗後のモードは不明 → 以降は混合平均
        avgLaterDisplay: PREMISES.cycleAvgReachDisplay.later,
      })

  const blend = scenarioFromModel(
    'blend',
    '混合（主表示）',
    blendModel,
    tableAvgGames,
    tablePayoutRate,
    winMedals,
    mPerG,
    maxCycle,
    remainingInCycleDisplay,
    actualDone,
  )

  const byTable: Otome5ScenarioResult[] = PERIOD_TABLE_IDS.map((tid) => {
    const tMax = tableMaxCycle(tid, shortened)
    const unreachableByCycle = cycle > tMax
    const cEff = Math.min(cycle, tMax)
    const rem = remainingInCycleDisplay
    const model =
      actualDone || unreachableByCycle
        ? 0
        : expectedGamesToAtModel(cEff, actual, shortened, {
            maxCycle: tMax,
            remCurrentDisplay: rem,
            avgLaterDisplay: PREMISES.cycleAvgReachDisplay.later,
          })
    return scenarioFromModel(
      `table-${tid}`,
      PERIOD_TABLE_LABEL[tid],
      model,
      tableAvgGames,
      tablePayoutRate,
      winMedals,
      mPerG,
      tMax,
      rem,
      actualDone || unreachableByCycle,
    )
  })

  const byMode: Otome5ScenarioResult[] = PERIOD_MODE_IDS.map((mid) => {
    const hard = PERIOD_MODE_HARD[mid]
    const avg = PERIOD_MODE_AVG[mid]
    const rem = remainingForMode(avg, hard, display)
    const model = actualDone
      ? 0
      : expectedGamesToAtModel(cycle, actual, shortened, {
          maxCycle,
          remCurrentDisplay: rem,
          avgLaterDisplay: avg,
        })
    return scenarioFromModel(
      `mode-${mid}`,
      PERIOD_MODE_LABEL[mid],
      model,
      tableAvgGames,
      tablePayoutRate,
      winMedals,
      mPerG,
      maxCycle,
      rem,
      actualDone,
    )
  })

  return {
    reachable: blend.reachable,
    expectedPayoutRate: blend.expectedPayoutRate,
    expectedWinMedals: winMedals,
    tablePayoutRate,
    cycleCorrectionPp: blend.cycleCorrectionPp,
    avgGames: blend.avgGames,
    avgInvestment: blend.avgInvestment,
    tableYenEv: table.yen,
    tableInvestYen: table.investYen,
    tableAvgGames,
    modelGamesToAt: blend.modelGamesToAt,
    remainingByG: actualDone ? 0 : ceilingG - actual,
    remainingInCycleDisplay,
    ceilingG,
    maxCycle,
    byTable,
    byMode,
  }
}

export function buildOtome5Premises(input: Otome5Input): Premise[] {
  const shortened = input.shortened
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = effectiveMaxCycle(shortened)
  const mPerG = medalsPerGame()

  return [
    {
      label: '出玉率の主軸',
      value: 'なな徹ゲーム数天井期待値表（暫定）',
      basis:
        '周期未考慮の表をベースに、周期条件を50%補正。表は規定G・周期モード未考慮',
    },
    {
      label: '初当たり（AT）期待獲得出玉（分子）',
      value: `${PREMISES.tableWinMedals.toFixed(2)}枚（なな徹表・一定）`,
      basis: '表の invest+期待値から逆算。純増2.7枚/G固定・AT終了即ヤメ',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: '天井',
      value: shortened
        ? `短縮 実G${ceilingG}G+α / 最大${maxCycle}周期`
        : `通常 実G${ceilingG}G+α / 最大${maxCycle}周期`,
      basis:
        'ゲーム数天井は実G（強カワチャンス加算なし）。周期天井は表示G管理。いずれか早い方でAT',
    },
    {
      label: '実G / 表示G',
      value: `実G=${input.actualGames} / 表示G=${input.displayGames}`,
      basis:
        '実G→天井表・G数天井。表示G→当該周期の残り見積（1周期最大500G+α）',
    },
    {
      label: '1周期目',
      value: '引き戻しモード確定（最大200G）',
      basis:
        'AT終了後1周期目は引き戻し。主表示・テーブル別の当該周期は引き戻し平均到達（最大200）。失敗後のモードは不明のため以降は混合平均',
    },
    {
      label: 'テーブル別',
      value: '通常A=6 / 通常B=3 / 天国=1（短縮時は最大4まで）',
      basis: 'なな徹。1周期目の到達Gは引き戻し、以降は混合平均',
    },
    {
      label: 'モード別',
      value: 'A500 / B300 / C200 / チャンス50 / 引き戻し200',
      basis:
        '各モード仮定の内訳。1周期目でも一覧は仮定別（主表示のみ引き戻し確定）',
      derived: true,
    },
    {
      label: '周期AT期待度（補正用）',
      value: '1–2周期40% / 3–5周期30% / 天井周期100%',
      basis: 'なな徹設定1。「30%以上」は保守で30%',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}（なな徹シミュ条件）`,
    },
    {
      label: 'なな徹',
      value: 'https://nana-press.com/kaiseki/machine/1160/37315/',
      basis: '天井期待値は暫定版',
    },
  ]
}
