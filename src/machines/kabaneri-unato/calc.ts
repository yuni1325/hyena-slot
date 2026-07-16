import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  PREMISES,
  czStPerGame,
  interpolateEv,
  medalsPerGame,
  stRateOnBonus,
  winMedalsFromEv,
} from './data'

export type KabaneriInput = {
  /** 表示G（サブ液晶など） */
  displayGames: number
  /** 現在周期 1〜6 */
  cycle: number
  /** 短縮天井（設定変更/駆け抜け/景之ST後など） */
  shortened: boolean
}

/**
 * 表示Gと強制周期進行の整合。
 * DMM: 150G消化で2周期目へ、300G消化で3周期目へ強制。
 * （ポイントで先に進むのは可＝低G＋高周期は許可）
 */
export function cycleBoundsForDisplay(
  displayGames: number,
  shortened: boolean,
): { minCycle: number; maxCycle: number } {
  const g = Math.max(0, Math.floor(displayGames))
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  let minCycle = 1
  if (g >= 300) minCycle = 3
  else if (g >= 150) minCycle = 2
  return { minCycle: Math.min(minCycle, maxCycle), maxCycle }
}

export function clampCycleToDisplay(
  cycle: number,
  displayGames: number,
  shortened: boolean,
): number {
  const { minCycle, maxCycle } = cycleBoundsForDisplay(displayGames, shortened)
  const c = Math.floor(cycle)
  if (!Number.isFinite(c)) return minCycle
  return Math.min(maxCycle, Math.max(minCycle, c))
}

export type KabaneriResult = {
  reachable: boolean
  /** 主表示：なな徹表 + 周期補正（抑制済み） */
  expectedPayoutRate: number | null
  /** 初当たり1回あたりの期待獲得出玉（ST・枚。CZではない） */
  expectedWinMedals: number | null
  /** なな徹表のみの出玉率 */
  tablePayoutRate: number | null
  /** 周期補正（pt）＝ expected − table */
  cycleCorrectionPp: number | null
  avgGames: number | null
  avgInvestment: number | null
  tableYenEv: number | null
  tableInvestYen: number | null
  tableAvgGames: number | null
  /** 周期+CZモデル単体のST期待G（補正前） */
  modelGamesToSt: number | null
  remainingByG: number | null
  remainingToCycleG: number | null
  ceilingG: number
  maxCycle: number
}

/**
 * 当該周期が終わるまでの期待G。
 * 1・2周期は平均到達Gを優先し、規定G天井（150/300）は上限。
 * 平均を過ぎた区間は規定Gまで（直前ゾーンは当選率側で減衰）。
 */
export function gamesToFinishCycle(
  cycle: number,
  currentG: number,
  maxCycle: number,
  ceilingG: number,
): number {
  const toMachineCeil = Math.max(0, ceilingG - currentG)
  if (toMachineCeil <= 0) return 0

  if (cycle >= maxCycle) return Math.max(1, toMachineCeil)

  const hard = PREMISES.cycleGCeiling[cycle]
  const soft = PREMISES.cycleAvgReachG[cycle]

  if (hard != null) {
    const hardRem = hard - currentG
    if (hardRem <= 0) return 1
    if (soft != null && currentG < soft) {
      return Math.min(hardRem, Math.max(1, soft - currentG))
    }
    return Math.min(hardRem, Math.max(1, toMachineCeil))
  }

  return Math.min(120, Math.max(1, toMachineCeil))
}

/** 規定G天井直前は周期当選を減衰（CZ校正との二重カウント抑制） */
export function dampenedCycleHitRate(
  cycle: number,
  hardRem: number | null,
  isCeilingCycle: boolean,
): number {
  if (isCeilingCycle) return 1
  const base = PREMISES.cycleHitRate[cycle] ?? 0.22
  if (hardRem == null) return base
  const window = PREMISES.nearCycleCeilingG
  if (hardRem >= window) return base
  const t = Math.max(0, hardRem) / window
  const damp =
    PREMISES.nearCycleCeilingDampMin +
    (1 - PREMISES.nearCycleCeilingDampMin) * t
  return base * damp
}

/** Geo(p) で最大 t G まで打ったときの消化G期待値 E[min(T,t)] */
function expectedGamesUntilOrCap(p: number, t: number): number {
  if (t <= 0) return 0
  if (p <= 0) return t
  if (p >= 1) return 1
  return (1 - Math.pow(1 - p, t)) / p
}

/**
 * 周期+CZモデル単体の、ST到達までの期待G（なな徹表補正の材料）。
 */
export function expectedGamesToStModel(
  cycle: number,
  currentG: number,
  shortened: boolean,
): number {
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal

  const remGCap = Math.max(0, ceilingG - currentG)
  if (remGCap <= 0) return 0

  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  const pStBonus = stRateOnBonus()
  const pCzSt = czStPerGame()

  let survive = 1
  let expected = 0
  let elapsed = currentG

  for (let c = c0; c <= maxCycle; c++) {
    if (survive < 1e-9) break

    const toCeil = Math.max(0, ceilingG - elapsed)
    if (toCeil <= 0) break

    let t = gamesToFinishCycle(c, elapsed, maxCycle, ceilingG)
    t = Math.min(Math.max(0, t), toCeil)
    if (t <= 0) break

    const hard = PREMISES.cycleGCeiling[c]
    // 区間開始時点の規定G残りで減衰（終了直前に必ず1になる問題を避ける）
    const remToHardAtStart =
      hard == null ? null : Math.max(0, hard - elapsed)

    const eInSeg = expectedGamesUntilOrCap(pCzSt, t)
    expected += survive * eInSeg
    const surviveCz = Math.pow(1 - pCzSt, t)

    const hitMachineCeil = elapsed + t >= ceilingG
    const isCeilingCycle = c === maxCycle || hitMachineCeil
    const pHit = dampenedCycleHitRate(c, remToHardAtStart, isCeilingCycle)
    const pStop = isCeilingCycle ? 1 : pHit * pStBonus

    survive *= surviveCz * (1 - pStop)
    elapsed += t

    if (hitMachineCeil || pStop >= 1) {
      survive = 0
      break
    }
  }

  if (survive > 1e-9) {
    const rem = Math.max(0, ceilingG - elapsed)
    expected += survive * expectedGamesUntilOrCap(pCzSt, rem)
  }

  return Math.min(expected, remGCap)
}

export function calculateKabaneri(input: KabaneriInput): KabaneriResult {
  const g = Math.max(0, Math.floor(input.displayGames))
  const cycle = Math.min(6, Math.max(1, Math.floor(input.cycle)))
  const shortened = Boolean(input.shortened)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const maxCycle = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  const mPerG = medalsPerGame()
  const yenPer = PREMISES.yenPerMedal
  const winMedals = PREMISES.tableWinMedals

  const table = interpolateEv(
    shortened ? EV_SHORTENED : EV_NORMAL,
    Math.min(g, shortened ? 550 : 950),
  )
  const tableInvestMedals = table.investYen / yenPer
  const tableWin = winMedalsFromEv(table)
  const tablePayoutRate =
    tableInvestMedals > 0 ? (tableWin / tableInvestMedals) * 100 : null
  const tableAvgGames = tableInvestMedals / mPerG

  const hard = PREMISES.cycleGCeiling[cycle]
  const remainingToCycleG =
    hard == null ? null : Math.max(0, hard - g)

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
      modelGamesToSt: 0,
      remainingByG: 0,
      remainingToCycleG,
      ceilingG,
      maxCycle,
    }
  }

  const remainingByG = ceilingG - g
  const modelGames = expectedGamesToStModel(cycle, g, shortened)

  // ① 主軸＝なな徹表、③ 周期差はスケールして半分だけ載せる
  const scale = PREMISES.cycleCorrectionScale
  const avgGames =
    tableAvgGames + (modelGames - tableAvgGames) * scale
  const avgInvestment = avgGames * mPerG

  // ② 分子はなな徹表の一定獲得（≈603枚）
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
    modelGamesToSt: modelGames,
    remainingByG,
    remainingToCycleG,
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
  const pSt = stRateOnBonus()
  const pCz = czStPerGame()

  return [
    {
      label: '出玉率の主軸',
      value: 'なな徹ゲーム数天井期待値表',
      basis:
        '周期未考慮の表をベースにし、周期条件は補正として加味（補正スケール50%）',
    },
    {
      label: '初当たり（ST）期待獲得出玉（分子）',
      value: `${PREMISES.tableWinMedals.toFixed(2)}枚（なな徹表・一定）`,
      basis: `表の invest+期待値 から逆算。実践ST平均 ${PREMISES.practiceWinMedals}枚（flick7）は参考のみ。CZは初当たりに含めない`,
    },
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
        'なな徹「天井の期待値や恩恵」。短縮＝設定変更後・ST駆け抜け後・景之ST後。天井到達時のみエピソード（ST）確定',
    },
    {
      label: '1・2周期の規定G',
      value: '1周期天井=表示150G / 2周期天井=表示300G',
      basis:
        '区間長さは平均到達≈100G/250Gを優先。規定Gは上限。平均超過後の残りは規定Gまで',
    },
    {
      label: '周期当選の抑制',
      value: `1・2周期30%（「約33%以上」を保守側）／規定G残り${PREMISES.nearCycleCeilingG}G以内は減衰`,
      basis: 'CZ校正との二重カウントと規定G直前の楽観を抑える',
      derived: true,
    },
    {
      label: 'ヤメ時',
      value: 'ST終了後即ヤメ',
      basis: 'なな徹シミュ条件に合わせる。REG（駿城失敗）は打ち継ぎ',
    },
    {
      label: 'ボーナス振り分け',
      value: `BIG:REG = ${PREMISES.bigShare * 100}:${PREMISES.regShare * 100}`,
      basis:
        '周期ヒット・カバネリチャンス成功とも同じ。BIG=エピソード(ST濃厚)、REG=駿城',
    },
    {
      label: 'REG→ST',
      value: `約${PREMISES.regStRate * 100}%（失敗時は周期・G数引き継ぎ）`,
      basis: '失敗時はREG消化のみでSTなし',
    },
    {
      label: 'ボーナス時のST率',
      value: `約${(pSt * 100).toFixed(0)}%（天井は100%）`,
      basis: '0.5×1 + 0.5×0.2',
      derived: true,
    },
    {
      label: 'カバネリチャンス',
      value: `成功期待度 無名約${PREMISES.czSuccessRate.mumei * 100}% / 生駒約${PREMISES.czSuccessRate.ikoma * 100}% / 銅藍約${PREMISES.czSuccessRate.doran * 100}%`,
      basis: '成功後のボーナスも BIG:REG=1:1。1GあたりSTは公表値から周期寄与を差引き校正',
    },
    {
      label: 'CZ経路のST（1Gあたり）',
      value: `約1/${(1 / pCz).toFixed(0)}（校正値 ${(pCz * 100).toFixed(3)}%）`,
      basis: `公表ST 1/${PREMISES.stHitDenom} − 周期寄与（当選${PREMISES.czCalibrationCycleHit * 100}%/${PREMISES.czCalibrationCycleLen}G×ST率）`,
      derived: true,
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}（なな徹シミュ条件）`,
    },
    {
      label: 'なな徹期待値表',
      value: 'https://nana-press.com/kaiseki/machine/1097/35403/',
      basis: '等価期待値・平均投資。周期数は考慮しない',
    },
  ]
}
