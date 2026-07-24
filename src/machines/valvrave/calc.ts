import type { Premise } from '../types'
import {
  CZ_MODE_LABEL,
  EV_BONUS,
  PREMISES,
  czCeilingFor,
  expectedWinMedalsAfterCzSuccess,
  interpolateEv,
  medalsPerGame,
  resolveCzMode,
  winMedalsFromEv,
  type CzMode,
} from './data'

export type ValvraveInput = {
  /** 実G（ボーナス&AT間・データカウンター） */
  actualGames: number
  /** 表示G（CZ間・液晶・加算込み） */
  displayGames: number
  /** CZ天井モード。不明はA扱い（参考残G用） */
  czMode: CzMode
  /** CZ連続スルー回数 0〜7 */
  throughCount: number
}

export type ValvraveResult = {
  reachable: boolean
  /** 主表示: ボーナス間表とスルー経路の高い方 */
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  /** どちらを主に採用したか */
  primaryPath: 'bonus' | 'through' | null
  bonusPayoutRate: number | null
  throughPayoutRate: number | null
  yenEv: number | null
  investYen: number | null
  reachRate: number | null
  bonusRemaining: number | null
  bonusCeilingG: number
  czRemaining: number | null
  czCeilingG: number
  resolvedCzMode: Exclude<CzMode, 'unknown'>
  throughRemaining: number
  throughMax: number
  throughCeilingReady: boolean
  /** スルー経路: 成功までの期待CZ回数 */
  expectedCzAttempts: number | null
  /** スルー経路: 成功までの期待G */
  throughAvgGames: number | null
  avgGames: number | null
  avgInvestment: number | null
}

function rateFromEv(row: {
  games: number
  yen: number
  investYen: number
  reachRate: number
}): number | null {
  const invest = row.investYen / PREMISES.yenPerMedal
  if (invest <= 0) return null
  return (winMedalsFromEv(row) / invest) * 100
}

/**
 * 現在スルー t から、ボーナス当選までの期待CZ回数。
 * 通常成功率 p、t>=7 なら次回成功率100%。
 */
export function expectedCzAttemptsToSuccess(throughCount: number): number {
  const maxT = PREMISES.czThroughMax
  const p = PREMISES.czSuccessRate
  const t = Math.min(maxT, Math.max(0, Math.floor(throughCount)))
  if (t >= maxT) return 1

  const failsAllowed = maxT - t
  let expected = 0
  let reach = 1
  for (let i = 0; i < failsAllowed; i++) {
    expected += reach * p * (i + 1)
    reach *= 1 - p
  }
  expected += reach * (failsAllowed + 1)
  return expected
}

/**
 * スルー経路の期待G。
 * 次回CZまで＝表示GベースのCZ残、以降のCZ間隔≈1/CZ確率。
 */
export function expectedGamesThroughPath(
  throughCount: number,
  czRemaining: number,
): number {
  const attempts = expectedCzAttemptsToSuccess(throughCount)
  const first = Math.max(1, czRemaining)
  const gap = PREMISES.czHitDenom
  if (attempts <= 1) return first
  return first + (attempts - 1) * gap
}

export function calculateValvrave(input: ValvraveInput): ValvraveResult {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const through = Math.min(
    PREMISES.czThroughMax,
    Math.max(0, Math.floor(input.throughCount)),
  )
  const resolvedCzMode = resolveCzMode(input.czMode)
  const bonusCeilingG = PREMISES.bonusCeilingG
  const czCeilingG = czCeilingFor(input.czMode)
  const mPerG = medalsPerGame()
  const czRemaining = Math.max(0, czCeilingG - display)
  const bonusRemaining = Math.max(0, bonusCeilingG - actual)

  const lastG = EV_BONUS[EV_BONUS.length - 1].games
  const row = interpolateEv(EV_BONUS, Math.min(actual, lastG))
  const bonusDone = actual >= bonusCeilingG
  const tableWinMedals = winMedalsFromEv(row)
  const bonusPayoutRate = bonusDone ? null : rateFromEv(row)
  const bonusInvestMedals = bonusDone
    ? null
    : row.investYen / PREMISES.yenPerMedal

  const czAttempts = expectedCzAttemptsToSuccess(through)
  const throughGames = expectedGamesThroughPath(through, czRemaining)
  const throughWin = expectedWinMedalsAfterCzSuccess()
  const throughInvest = throughGames * mPerG
  const throughPayoutRate =
    throughInvest > 0 ? (throughWin / throughInvest) * 100 : null

  let primaryPath: 'bonus' | 'through' | null = null
  let expectedPayoutRate: number | null = null
  let avgInvestment: number | null = null
  let avgGames: number | null = null
  let expectedWinMedals: number | null = tableWinMedals

  const bonusOk = bonusPayoutRate != null
  const throughOk = throughPayoutRate != null

  if (bonusOk && throughOk) {
    if (throughPayoutRate! > bonusPayoutRate!) {
      primaryPath = 'through'
      expectedPayoutRate = throughPayoutRate
      avgInvestment = throughInvest
      avgGames = throughGames
      expectedWinMedals = throughWin
    } else {
      primaryPath = 'bonus'
      expectedPayoutRate = bonusPayoutRate
      avgInvestment = bonusInvestMedals
      avgGames =
        bonusInvestMedals != null ? bonusInvestMedals / mPerG : null
      expectedWinMedals = tableWinMedals
    }
  } else if (throughOk) {
    primaryPath = 'through'
    expectedPayoutRate = throughPayoutRate
    avgInvestment = throughInvest
    avgGames = throughGames
    expectedWinMedals = throughWin
  } else if (bonusOk) {
    primaryPath = 'bonus'
    expectedPayoutRate = bonusPayoutRate
    avgInvestment = bonusInvestMedals
    avgGames =
      bonusInvestMedals != null ? bonusInvestMedals / mPerG : null
    expectedWinMedals = tableWinMedals
  }

  return {
    reachable: expectedPayoutRate != null,
    expectedPayoutRate,
    expectedWinMedals,
    primaryPath,
    bonusPayoutRate,
    throughPayoutRate,
    yenEv: bonusDone ? null : row.yen,
    investYen: bonusDone ? null : row.investYen,
    reachRate: bonusDone ? null : row.reachRate,
    bonusRemaining,
    bonusCeilingG,
    czRemaining,
    czCeilingG,
    resolvedCzMode,
    throughRemaining: Math.max(0, PREMISES.czThroughMax - through),
    throughMax: PREMISES.czThroughMax,
    throughCeilingReady: through >= PREMISES.czThroughMax,
    expectedCzAttempts: czAttempts,
    throughAvgGames: throughGames,
    avgGames,
    avgInvestment,
  }
}

export function buildValvravePremises(input: ValvraveInput): Premise[] {
  const mPerG = medalsPerGame()
  const resolved = resolveCzMode(input.czMode)
  const throughWin = expectedWinMedalsAfterCzSuccess()
  return [
    {
      label: '出玉率の主軸',
      value: 'ボーナス間表とCZスルー経路の高い方',
      basis:
        'ボーナス&AT間はweb情報表。スルー経路は CZ確率・成功率・スルー天井から自前近似',
    },
    {
      label: 'ボーナス間・期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '表0Gの invest+期待値から逆算',
    },
    {
      label: 'スルー経路・期待獲得出玉',
      value: `約${throughWin.toFixed(1)}枚`,
      basis: `CZ成功後＝革命${PREMISES.bonusWinMedals.revolution}／決戦${PREMISES.bonusWinMedals.kessen}を等分`,
      derived: true,
    },
    {
      label: 'CZ確率・成功率',
      value: `1/${PREMISES.czHitDenom} ／ ${(PREMISES.czSuccessRate * 100).toFixed(0)}%（7スルー後は100%）`,
      basis: '設定1。スルー経路のCZ間隔・当選回数に使用',
    },
    {
      label: 'ボーナス&AT間天井',
      value: `${PREMISES.bonusCeilingG}G+α（実ゲーム数）`,
      basis: 'データカウンター。到達で革命ボーナス or 決戦ボーナス',
    },
    {
      label: 'CZ間天井',
      value: `${CZ_MODE_LABEL[resolved]}${input.czMode === 'unknown' ? '（不明→A）' : ''}`,
      basis: '次回CZまでの残G（スルー経路の初回CZ）に使用',
    },
    {
      label: 'CZスルー天井',
      value: `最大${PREMISES.czThroughMax}スルー → 次回CZ成功確定`,
      basis: `現在スルー ${Math.min(PREMISES.czThroughMax, Math.max(0, input.throughCount))}回`,
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: `ボーナスorAT終了後${PREMISES.stopAfterBonusGames}G消化後に即ヤメ`,
      basis: 'web情報シミュ条件（ボーナス間表）',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '純増',
      value: `${PREMISES.pureInc}枚/G`,
      basis: '革命ラッシュ／超革命ラッシュ',
    },
    {
      label: '出典',
      value: 'web情報表＋CZ確率/成功率の自前近似',
      basis: '決戦4連続天井・ボーナス振り分け詳細は未反映',
    },
  ]
}
