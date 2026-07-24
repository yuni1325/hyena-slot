import type { Premise } from '../types'
import {
  EV_NORMAL,
  EV_SHORTENED,
  PERIOD_MODE_LABEL,
  PREMISES,
  avgReachForCycle,
  effectiveMaxCycle,
  expectedWinMedalsAfterCzSuccess,
  interpolateEv,
  medalsPerGame,
  resolvePeriodMode,
  winMedalsFromEv,
  type PeriodMode,
} from './data'

export type Valvrave2Input = {
  /** 実G（ボーナス&AT間） */
  actualGames: number
  /** CZ間G（CZ天井999用） */
  czGames: number
  /** 現在周期 */
  cycle: number
  mode: PeriodMode
  /** 設定変更後の短縮天井 */
  shortened: boolean
  /** 決戦ボーナス連続スルー 0〜3 */
  kessenThrough: number
}

export type Valvrave2Result = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  primaryPath: 'bonus' | 'cz' | 'cycle' | null
  bonusPayoutRate: number | null
  czPayoutRate: number | null
  cyclePayoutRate: number | null
  yenEv: number | null
  investYen: number | null
  reachRate: number | null
  bonusRemaining: number | null
  bonusCeilingG: number
  czRemaining: number | null
  czCeilingG: number
  cycleRemainingEst: number | null
  resolvedMode: Exclude<PeriodMode, 'unknown'>
  effectiveMaxCycle: number
  kessenThroughReady: boolean
  expectedCzAttempts: number | null
  czAvgGames: number | null
  cycleAvgGames: number | null
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

/** 幾何分布: 成功率 p で成功するまでの期待試行回数 */
export function expectedAttemptsGeometric(p: number): number {
  if (p <= 0) return Infinity
  if (p >= 1) return 1
  return 1 / p
}

/**
 * CZ天井経路の期待G。
 * 初回まで＝CZ残、失敗後の間隔≈1/CZ確率。成功率は固定（スルー天井なし）。
 */
export function expectedGamesCzPath(czRemaining: number): {
  attempts: number
  games: number
} {
  const attempts = expectedAttemptsGeometric(PREMISES.czSuccessRate)
  const first = Math.max(1, czRemaining)
  const gap = PREMISES.czHitDenom
  const games =
    attempts <= 1 ? first : first + (attempts - 1) * gap
  return { attempts, games }
}

/** 周期天井到達までの期待G（平均到達の積み上げ） */
export function expectedGamesToCycleCeiling(
  cycle: number,
  maxCycle: number,
): number {
  const c0 = Math.min(Math.max(1, Math.floor(cycle)), maxCycle)
  let games = avgReachForCycle(c0)
  for (let c = c0 + 1; c <= maxCycle; c++) {
    games += avgReachForCycle(c)
  }
  return games
}

/**
 * 周期天井でCZへ入ったあと、成功までの期待G。
 * 初回CZまで＝周期積み上げ、以降はCZ間隔。
 */
export function expectedGamesCyclePath(
  cycle: number,
  maxCycle: number,
): {
  attempts: number
  games: number
} {
  const attempts = expectedAttemptsGeometric(PREMISES.czSuccessRate)
  const first = Math.max(1, expectedGamesToCycleCeiling(cycle, maxCycle))
  const gap = PREMISES.czHitDenom
  const games =
    attempts <= 1 ? first : first + (attempts - 1) * gap
  return { attempts, games }
}

export function calculateValvrave2(input: Valvrave2Input): Valvrave2Result {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const czGames = Math.max(0, Math.floor(input.czGames))
  const shortened = Boolean(input.shortened)
  const kessenThrough = Math.min(
    PREMISES.kessenThroughMax,
    Math.max(0, Math.floor(input.kessenThrough)),
  )
  const kessenThroughReady = kessenThrough >= PREMISES.kessenThroughMax
  const resolvedMode = resolvePeriodMode(input.mode)
  const maxCycle = effectiveMaxCycle(input.mode, shortened)
  const cycle = Math.min(
    maxCycle,
    Math.max(1, Math.floor(input.cycle) || 1),
  )
  const bonusCeilingG = shortened
    ? PREMISES.bonusCeilingG.shortened
    : PREMISES.bonusCeilingG.normal
  const czCeilingG = PREMISES.czCeilingG
  const mPerG = medalsPerGame()
  const czRemaining = Math.max(0, czCeilingG - czGames)
  const bonusRemaining = Math.max(0, bonusCeilingG - actual)

  const rows = shortened ? EV_SHORTENED : EV_NORMAL
  const lastG = rows[rows.length - 1].games
  const row = interpolateEv(rows, Math.min(actual, lastG))
  const bonusDone = actual >= bonusCeilingG
  const tableWin = winMedalsFromEv(row)
  const bonusPayoutRate = bonusDone ? null : rateFromEv(row)
  const bonusInvest = bonusDone ? null : row.investYen / PREMISES.yenPerMedal

  const czWin = expectedWinMedalsAfterCzSuccess(kessenThroughReady)
  const czPath = expectedGamesCzPath(czRemaining)
  const czInvest = czPath.games * mPerG
  const czPayoutRate =
    czRemaining <= 0 && czGames >= czCeilingG
      ? null
      : czInvest > 0
        ? (czWin / czInvest) * 100
        : null

  const cyclePath = expectedGamesCyclePath(cycle, maxCycle)
  const cycleInvest = cyclePath.games * mPerG
  const cyclePayoutRate =
    cycleInvest > 0 ? (czWin / cycleInvest) * 100 : null

  type Cand = {
    path: 'bonus' | 'cz' | 'cycle'
    rate: number
    invest: number
    games: number
    win: number
  }
  const cands: Cand[] = []
  if (bonusPayoutRate != null && bonusInvest != null) {
    cands.push({
      path: 'bonus',
      rate: bonusPayoutRate,
      invest: bonusInvest,
      games: bonusInvest / mPerG,
      win: tableWin,
    })
  }
  if (czPayoutRate != null) {
    cands.push({
      path: 'cz',
      rate: czPayoutRate,
      invest: czInvest,
      games: czPath.games,
      win: czWin,
    })
  }
  if (cyclePayoutRate != null) {
    cands.push({
      path: 'cycle',
      rate: cyclePayoutRate,
      invest: cycleInvest,
      games: cyclePath.games,
      win: czWin,
    })
  }

  cands.sort((a, b) => b.rate - a.rate)
  const best = cands[0] ?? null

  return {
    reachable: best != null,
    expectedPayoutRate: best?.rate ?? null,
    expectedWinMedals: best?.win ?? tableWin,
    primaryPath: best?.path ?? null,
    bonusPayoutRate,
    czPayoutRate,
    cyclePayoutRate,
    yenEv: bonusDone ? null : row.yen,
    investYen: bonusDone ? null : row.investYen,
    reachRate: bonusDone ? null : row.reachRate,
    bonusRemaining,
    bonusCeilingG,
    czRemaining,
    czCeilingG,
    cycleRemainingEst: expectedGamesToCycleCeiling(cycle, maxCycle),
    resolvedMode,
    effectiveMaxCycle: maxCycle,
    kessenThroughReady,
    expectedCzAttempts: czPath.attempts,
    czAvgGames: czPath.games,
    cycleAvgGames: cyclePath.games,
    avgGames: best?.games ?? null,
    avgInvestment: best?.invest ?? null,
  }
}

export function buildValvrave2Premises(input: Valvrave2Input): Premise[] {
  const mPerG = medalsPerGame()
  const resolved = resolvePeriodMode(input.mode)
  const kessenReady =
    input.kessenThrough >= PREMISES.kessenThroughMax
  const czWin = expectedWinMedalsAfterCzSuccess(kessenReady)
  return [
    {
      label: '出玉率の主軸',
      value: 'ボーナス間表／CZ999／周期天井の高い方',
      basis:
        'ボーナス&AT間はweb情報表（暫定）。CZ・周期は確率と成功率から自前近似',
    },
    {
      label: 'ボーナス間・期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '通常表0Gの invest+期待値から逆算',
    },
    {
      label: 'CZ/周期経路・期待獲得出玉',
      value: `約${czWin.toFixed(1)}枚`,
      basis: kessenReady
        ? '決戦3スルー済→革命ボーナス濃厚（460枚）'
        : `革命${PREMISES.bonusWinMedals.revolution}／決戦${PREMISES.bonusWinMedals.kessen}を等分（決戦は暫定）`,
      derived: true,
    },
    {
      label: 'CZ確率・成功率',
      value: `1/${PREMISES.czHitDenom} ／ ${(PREMISES.czSuccessRate * 100).toFixed(0)}%`,
      basis: 'ドルシア攻防戦',
    },
    {
      label: 'ボーナス&AT間天井',
      value: input.shortened
        ? `短縮 ${PREMISES.bonusCeilingG.shortened}G（設定変更）`
        : `通常 ${PREMISES.bonusCeilingG.normal}G+α`,
      basis: '到達で決戦／革命／ATを1:1:1',
    },
    {
      label: 'CZ間天井',
      value: `${PREMISES.czCeilingG}G`,
      basis: '到達でCZ（成功は非保証）',
    },
    {
      label: '周期天井',
      value: `${PERIOD_MODE_LABEL[resolved]}${input.mode === 'unknown' ? '（不明→A）' : ''}／最大${effectiveMaxCycle(input.mode, input.shortened)}周期`,
      basis: '平均到達Gで周期残を近似',
      derived: true,
    },
    {
      label: '決戦スルー天井',
      value: `最大${PREMISES.kessenThroughMax}連続 → 次回革命ボーナス濃厚`,
      basis: `現在 ${Math.min(PREMISES.kessenThroughMax, Math.max(0, input.kessenThrough))}回`,
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: `ボーナスorAT後${PREMISES.stopAfterBonusGames}G消化でヤメ`,
      basis: 'web情報シミュ条件',
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
      value: 'web情報のボーナス間天井期待値表（暫定）',
      basis: '周期振り分けの詳細ベイズは未反映',
    },
  ]
}
