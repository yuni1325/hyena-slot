import type { Premise } from '../types'
import {
  PREMISES,
  SITUATION_LABEL,
  ZEN_MODE_CZ_CEILING,
  ZEN_MODE_IDS_NORMAL,
  ZEN_MODE_LABEL,
  atCeilingFor,
  atEvRowsFor,
  effectiveCzCeiling,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type Situation,
  type ZenModeId,
} from './data'

export type KokakuInput = {
  /** AT間G（データカウンター想定） */
  atGames: number
  /** CZ間表示G（液晶左下） */
  displayGames: number
  situation: Situation
  /** 殲滅モード（通常時）。リセット／白失敗時は天井側で上書き */
  zenMode: ZenModeId
}

export type KokakuModeRow = {
  id: ZenModeId
  label: string
  czCeiling: number
  displayRemaining: number
  czPayoutRate: number | null
  avgGamesToAtViaCz: number | null
}

export type KokakuResult = {
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
  czRemaining: number | null
  atCeilingG: number
  czCeilingG: number
  avgGames: number | null
  avgInvestment: number | null
  byMode: KokakuModeRow[]
}

function rate(win: number, investMedals: number): number | null {
  if (investMedals <= 0) return null
  return (win / investMedals) * 100
}

function expectedGamesToCz(remToCz: number, pPerGame: number): number {
  if (remToCz <= 0) return 0
  if (pPerGame <= 0) return remToCz
  if (pPerGame >= 1) return 1
  return (1 - Math.pow(1 - pPerGame, remToCz)) / pPerGame
}

function expectedGamesToAtViaCz(
  remToCz: number,
  fullToCz: number,
  pCzPerGame: number,
  pSuccess: number,
): number {
  if (pSuccess <= 0) return Infinity
  const first = expectedGamesToCz(remToCz, pCzPerGame)
  const retry = expectedGamesToCz(fullToCz, pCzPerGame)
  return first + ((1 - pSuccess) / pSuccess) * retry
}

function czSuccessRate(situation: Situation): number {
  return situation === 'whiteFail'
    ? PREMISES.czSuccessTachikoma
    : PREMISES.czSuccessSam
}

export function calculateKokaku(input: KokakuInput): KokakuResult {
  const atG = Math.max(0, Math.floor(input.atGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const situation = input.situation
  const mode: ZenModeId =
    situation === 'reset'
      ? 'reset'
      : situation === 'whiteFail'
        ? 'A'
        : input.zenMode === 'reset'
          ? 'A'
          : input.zenMode

  const mPerG = medalsPerGame()
  const winMedals = PREMISES.tableWinMedals
  const pCz = 1 / PREMISES.czHitDenom
  const pSuccess = czSuccessRate(situation)

  const atCeilingG = atCeilingFor(situation)
  const czCeilingG = effectiveCzCeiling(situation, mode)
  const atRem = Math.max(0, atCeilingG - atG)
  const czRem = Math.max(0, czCeilingG - display)

  const rows = atEvRowsFor(situation)
  const lastG = rows[rows.length - 1].games
  const atRow = interpolateEv(rows, Math.min(atG, lastG))
  const atDone = atG >= atCeilingG
  const atInvest = atRow.investYen / PREMISES.yenPerMedal
  const atPayoutRate = atDone ? null : rate(winMedalsFromEv(atRow), atInvest)

  const czGamesToAt = expectedGamesToAtViaCz(czRem, czCeilingG, pCz, pSuccess)
  const czInvest = Number.isFinite(czGamesToAt) ? czGamesToAt * mPerG : null
  const czPayoutRate =
    czInvest == null || czInvest <= 0 ? null : rate(winMedals, czInvest)

  const byMode: KokakuModeRow[] =
    situation === 'normal'
      ? ZEN_MODE_IDS_NORMAL.map((id) => {
          const ceil = ZEN_MODE_CZ_CEILING[id]
          const rem = Math.max(0, ceil - display)
          const gToAt = expectedGamesToAtViaCz(rem, ceil, pCz, pSuccess)
          const inv = Number.isFinite(gToAt) ? gToAt * mPerG : null
          return {
            id,
            label: ZEN_MODE_LABEL[id],
            czCeiling: ceil,
            displayRemaining: rem,
            czPayoutRate: inv == null || inv <= 0 ? null : rate(winMedals, inv),
            avgGamesToAtViaCz: Number.isFinite(gToAt) ? gToAt : null,
          }
        })
      : [
          {
            id: situation === 'reset' ? 'reset' : 'A',
            label:
              situation === 'reset'
                ? ZEN_MODE_LABEL.reset
                : `白の境界失敗（CZ${PREMISES.whiteFailCzCeiling}G）`,
            czCeiling: czCeilingG,
            displayRemaining: czRem,
            czPayoutRate,
            avgGamesToAtViaCz: Number.isFinite(czGamesToAt)
              ? czGamesToAt
              : null,
          },
        ]

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
    czRemaining: czRem,
    atCeilingG,
    czCeilingG,
    avgGames,
    avgInvestment,
    byMode,
  }
}

export function buildKokakuPremises(input: KokakuInput): Premise[] {
  const mPerG = medalsPerGame()
  const pSuccess = czSuccessRate(input.situation)
  const czLabel =
    input.situation === 'whiteFail'
      ? `白の境界失敗 ${PREMISES.whiteFailCzCeiling}G`
      : input.situation === 'reset'
        ? ZEN_MODE_LABEL.reset
        : ZEN_MODE_LABEL[input.zenMode === 'reset' ? 'A' : input.zenMode]

  return [
    {
      label: '出玉率の主軸',
      value: 'AT間表とCZ経由近似の高い方',
      basis:
        'AT間＝web情報表（CZ天井・殲滅モード未考慮）。CZ＝平均1/238と天井の競合＋成功率',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: 'web情報通常表0Gの invest+期待値から逆算',
    },
    {
      label: '状況',
      value: SITUATION_LABEL[input.situation],
      basis: 'AT間天井・CZ天井の短縮を切替',
    },
    {
      label: 'AT間天井',
      value: `${atCeilingFor(input.situation)}G`,
      basis: '通常999／リセット699',
    },
    {
      label: 'CZ天井',
      value: czLabel,
      basis: `成功期待度 ${(pSuccess * 100).toFixed(1)}%（S.A.M.52.6%／タチコマ65%）`,
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: 'AT終了後50Gゾーンまでフォロー',
      basis: 'web情報シミュ条件',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: 'AT間暫定。CZ経路は自前近似',
      derived: true,
    },
  ]
}
