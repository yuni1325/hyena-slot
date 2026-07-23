import type { Premise } from '../types'
import {
  CZ_MODE_IDS,
  CZ_MODE_LABEL,
  CZ_MODE_MAX_CYCLE,
  PREMISES,
  SITUATION_LABEL,
  atCeilingFor,
  atEvRowsFor,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type CzModeId,
  type Situation,
} from './data'

export type YoshimuneInput = {
  /** AT間G */
  atGames: number
  /** CZ間G */
  czGames: number
  /** 現在周期 1〜6 */
  cycle: number
  situation: Situation
  czMode: CzModeId
}

export type YoshimuneModeRow = {
  id: CzModeId
  label: string
  maxCycle: number
  cycleRemaining: number
  czPayoutRate: number | null
  avgGamesToAtViaCz: number | null
}

export type YoshimuneResult = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  primaryPath: 'at' | 'cz' | null
  atPayoutRate: number | null
  czPayoutRate: number | null
  atYenEv: number | null
  atInvestYen: number | null
  atReachRate: number | null
  atRemaining: number | null
  czGamesRemaining: number | null
  cycleRemaining: number | null
  czEffectiveRemaining: number | null
  atCeilingG: number
  czGamesCeilingG: number
  maxCycle: number
  avgGames: number | null
  avgInvestment: number | null
  byMode: YoshimuneModeRow[]
}

function rate(win: number, investMedals: number): number | null {
  if (investMedals <= 0) return null
  return (win / investMedals) * 100
}

function expectedGamesToEvent(rem: number, pPerGame: number): number {
  if (rem <= 0) return 0
  if (pPerGame <= 0) return rem
  if (pPerGame >= 1) return 1
  return (1 - Math.pow(1 - pPerGame, rem)) / pPerGame
}

/**
 * CZ/周期イベント経由でATまでの期待G。
 * 通常Cはイベント＝AT直撃（成功1）。それ以外は成功 p のCZ経由。
 */
function expectedGamesToAtViaEvent(
  remToEvent: number,
  fullToEvent: number,
  pPerGame: number,
  pSuccess: number,
): number {
  if (pSuccess <= 0) return Infinity
  if (pSuccess >= 1) {
    return expectedGamesToEvent(remToEvent, pPerGame)
  }
  const first = expectedGamesToEvent(remToEvent, pPerGame)
  const retry = expectedGamesToEvent(fullToEvent, pPerGame)
  return first + ((1 - pSuccess) / pSuccess) * retry
}

function clampCycle(cycle: number, maxCycle: number): number {
  const c = Math.floor(cycle)
  if (!Number.isFinite(c)) return 1
  return Math.min(maxCycle, Math.max(1, c))
}

/** 周期天井までの残りG目安（現周期含む） */
function cycleRemGames(cycle: number, maxCycle: number): number {
  const c = clampCycle(cycle, maxCycle)
  const remCycles = Math.max(0, maxCycle - c + 1)
  return remCycles * PREMISES.avgGamesPerCycle
}

function successForMode(mode: CzModeId): number {
  return mode === 'C' ? 1 : PREMISES.czSuccessRate
}

function fullRemForMode(mode: CzModeId, czGamesCeiling: number): number {
  const cycleFull = CZ_MODE_MAX_CYCLE[mode] * PREMISES.avgGamesPerCycle
  return Math.min(czGamesCeiling, cycleFull)
}

export function calculateYoshimune(input: YoshimuneInput): YoshimuneResult {
  const atG = Math.max(0, Math.floor(input.atGames))
  const czG = Math.max(0, Math.floor(input.czGames))
  const situation = input.situation
  const mode = input.czMode
  const maxCycle = CZ_MODE_MAX_CYCLE[mode]
  const cycle = clampCycle(input.cycle, maxCycle)

  const mPerG = medalsPerGame()
  const winMedals = PREMISES.tableWinMedals
  const pCz = 1 / PREMISES.czHitDenom
  const pSuccess = successForMode(mode)

  const atCeilingG = atCeilingFor(situation)
  const czGamesCeilingG = PREMISES.czGamesCeiling
  const atRem = Math.max(0, atCeilingG - atG)
  const czGamesRem = Math.max(0, czGamesCeilingG - czG)
  const cycleRem = cycleRemGames(cycle, maxCycle)
  const czEffRem = Math.min(czGamesRem, cycleRem)
  const czFullRem = fullRemForMode(mode, czGamesCeilingG)

  const rows = atEvRowsFor(situation)
  const lastG = rows[rows.length - 1].games
  const atRow = interpolateEv(rows, Math.min(atG, lastG))
  const atDone = atG >= atCeilingG
  const atInvest = atRow.investYen / PREMISES.yenPerMedal
  const atPayoutRate = atDone ? null : rate(winMedalsFromEv(atRow), atInvest)

  const czGamesToAt = expectedGamesToAtViaEvent(
    czEffRem,
    czFullRem,
    pCz,
    pSuccess,
  )
  const czInvest = Number.isFinite(czGamesToAt) ? czGamesToAt * mPerG : null
  const czPayoutRate =
    czInvest == null || czInvest <= 0 ? null : rate(winMedals, czInvest)

  const byMode: YoshimuneModeRow[] = CZ_MODE_IDS.map((id) => {
    const maxC = CZ_MODE_MAX_CYCLE[id]
    const c = clampCycle(cycle, maxC)
    const cRem = cycleRemGames(c, maxC)
    const eff = Math.min(czGamesRem, cRem)
    const full = fullRemForMode(id, czGamesCeilingG)
    const gToAt = expectedGamesToAtViaEvent(
      eff,
      full,
      pCz,
      successForMode(id),
    )
    const inv = Number.isFinite(gToAt) ? gToAt * mPerG : null
    return {
      id,
      label: CZ_MODE_LABEL[id],
      maxCycle: maxC,
      cycleRemaining: Math.max(0, maxC - c + 1),
      czPayoutRate: inv == null || inv <= 0 ? null : rate(winMedals, inv),
      avgGamesToAtViaCz: Number.isFinite(gToAt) ? gToAt : null,
    }
  })

  let primaryPath: 'at' | 'cz' | null = null
  let expectedPayoutRate: number | null = null
  let avgGames: number | null = null
  let avgInvestment: number | null = null

  const atOk = atPayoutRate != null
  const czOk = czPayoutRate != null

  if (atOk && czOk) {
    if (czPayoutRate! >= atPayoutRate!) {
      primaryPath = 'cz'
      expectedPayoutRate = czPayoutRate
      avgGames = czGamesToAt
      avgInvestment = czInvest
    } else {
      primaryPath = 'at'
      expectedPayoutRate = atPayoutRate
      avgGames = atInvest / mPerG
      avgInvestment = atInvest
    }
  } else if (czOk) {
    primaryPath = 'cz'
    expectedPayoutRate = czPayoutRate
    avgGames = czGamesToAt
    avgInvestment = czInvest
  } else if (atOk) {
    primaryPath = 'at'
    expectedPayoutRate = atPayoutRate
    avgGames = atInvest / mPerG
    avgInvestment = atInvest
  }

  return {
    reachable: expectedPayoutRate != null,
    expectedPayoutRate,
    expectedWinMedals: winMedals,
    primaryPath,
    atPayoutRate,
    czPayoutRate,
    atYenEv: atDone ? null : atRow.yen,
    atInvestYen: atDone ? null : atRow.investYen,
    atReachRate: atDone ? null : atRow.reachRate,
    atRemaining: atRem,
    czGamesRemaining: czGamesRem,
    cycleRemaining: Math.max(0, maxCycle - cycle + 1),
    czEffectiveRemaining: czEffRem,
    atCeilingG,
    czGamesCeilingG,
    maxCycle,
    avgGames,
    avgInvestment,
    byMode,
  }
}

export function buildYoshimunePremises(input: YoshimuneInput): Premise[] {
  const mPerG = medalsPerGame()
  return [
    {
      label: '出玉率の主軸',
      value: 'AT間表とCZ/周期近似の高い方',
      basis:
        'AT間＝web情報暫定表。CZ＝CZ間1000Gと周期天井の近い方×平均1/313＋成功率',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: 'web情報通常表0Gの invest+期待値から逆算',
    },
    {
      label: '状況',
      value: SITUATION_LABEL[input.situation],
      basis: 'AT間天井 1500／1000／700 を切替',
    },
    {
      label: 'AT間天井',
      value: `${atCeilingFor(input.situation)}G`,
      basis: '到達でAT当選',
    },
    {
      label: 'CZ・周期',
      value: `${CZ_MODE_LABEL[input.czMode]}／CZ間${PREMISES.czGamesCeiling}G`,
      basis:
        input.czMode === 'C'
          ? '通常Cは周期到達でAT直撃'
          : `CZ成功約${PREMISES.czSuccessRate * 100}%。1周期≈${PREMISES.avgGamesPerCycle}G（自前目安）`,
      derived: input.czMode !== 'C',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: 'AT終了後即ヤメ',
      basis: 'web情報シミュ。周期・モード未考慮',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: 'AT間暫定。CZ/周期は自前近似',
      derived: true,
    },
  ]
}
