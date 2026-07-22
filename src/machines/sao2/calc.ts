import type { Premise } from '../types'
import {
  CZ_MODE_DISPLAY_CEILING,
  CZ_MODE_IDS,
  CZ_MODE_LABEL,
  EV_AT,
  PREMISES,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type CzModeId,
} from './data'

export type Sao2Input = {
  /** AT間の実G */
  atGames: number
  /** CZ間の実G */
  czGames: number
  /** 液晶表示G */
  displayGames: number
  /** 内部モード（液晶CZ天井） */
  czMode: CzModeId
  /** CZ間実G短縮（設定変更・初回上位CZ失敗後など） */
  czShortened: boolean
}

export type Sao2ModeRow = {
  id: CzModeId
  label: string
  displayCeiling: number
  displayRemaining: number
  /** CZ経由近似の出玉率（未閉店補正） */
  czPayoutRate: number | null
  avgGamesToAtViaCz: number | null
}

export type Sao2Result = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  primaryPath: 'at' | 'cz' | null
  atPayoutRate: number | null
  czPayoutRate: number | null
  atYenEv: number | null
  atInvestYen: number | null
  atRemaining: number | null
  czActualRemaining: number | null
  czDisplayRemaining: number | null
  czEffectiveRemaining: number | null
  atCeilingG: number
  czActualCeilingG: number
  czDisplayCeilingG: number
  avgGames: number | null
  avgInvestment: number | null
  byMode: Sao2ModeRow[]
}

function rate(win: number, investMedals: number): number | null {
  if (investMedals <= 0) return null
  return (win / investMedals) * 100
}

/**
 * 天井残り rem までに CZ（レア役・バレット・ゾーン・天井を平均化した 1/denom）へ
 * 到達する期待G。Geo(p) と硬天井の競合: E[min(T, rem)] = (1-(1-p)^rem)/p
 */
function expectedGamesToCz(remToCz: number, pPerGame: number): number {
  if (remToCz <= 0) return 0
  if (pPerGame <= 0) return remToCz
  if (pPerGame >= 1) return 1
  return (1 - Math.pow(1 - pPerGame, remToCz)) / pPerGame
}

/**
 * CZ経由で AT までの期待G。
 * 初回は現在の残り天井、失敗後はカウンターリセット後のフル天井で再挑戦。
 * E = E_cz(rem) + ((1-s)/s) * E_cz(full)
 */
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

export function calculateSao2(input: Sao2Input): Sao2Result {
  const atG = Math.max(0, Math.floor(input.atGames))
  const czG = Math.max(0, Math.floor(input.czGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const mode = input.czMode
  const shortened = Boolean(input.czShortened)
  const mPerG = medalsPerGame()
  const winMedals = PREMISES.tableWinMedals
  const pSuccess = PREMISES.czSuccessRate
  const pCzPerGame = 1 / PREMISES.czHitDenom

  const atCeilingG = PREMISES.atCeilingG
  const czActualCeilingG = shortened
    ? PREMISES.czActualCeiling.shortened
    : PREMISES.czActualCeiling.normal
  const czDisplayCeilingG = CZ_MODE_DISPLAY_CEILING[mode]

  const atRem = Math.max(0, atCeilingG - atG)
  const czActualRem = Math.max(0, czActualCeilingG - czG)
  const czDisplayRem = Math.max(0, czDisplayCeilingG - display)
  const czEffRem = Math.min(czActualRem, czDisplayRem)
  const czFullRem = Math.min(czActualCeilingG, czDisplayCeilingG)

  const atRow = interpolateEv(EV_AT, Math.min(atG, 1150))
  const atDone = atG >= atCeilingG
  const atInvest = atRow.investYen / PREMISES.yenPerMedal
  const atPayoutRate = atDone ? null : rate(winMedalsFromEv(atRow), atInvest)

  const czGamesToAt = expectedGamesToAtViaCz(
    czEffRem,
    czFullRem,
    pCzPerGame,
    pSuccess,
  )
  const czInvest = Number.isFinite(czGamesToAt) ? czGamesToAt * mPerG : null
  const czPayoutRate =
    czInvest == null || czInvest <= 0 ? null : rate(winMedals, czInvest)

  const byMode: Sao2ModeRow[] = CZ_MODE_IDS.map((id) => {
    const ceil = CZ_MODE_DISPLAY_CEILING[id]
    const dRem = Math.max(0, ceil - display)
    const eff = Math.min(czActualRem, dRem)
    const full = Math.min(czActualCeilingG, ceil)
    const gToAt = expectedGamesToAtViaCz(eff, full, pCzPerGame, pSuccess)
    const inv = Number.isFinite(gToAt) ? gToAt * mPerG : null
    return {
      id,
      label: CZ_MODE_LABEL[id],
      displayCeiling: ceil,
      displayRemaining: dRem,
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
    atRemaining: atRem,
    czActualRemaining: czActualRem,
    czDisplayRemaining: czDisplayRem,
    czEffectiveRemaining: czEffRem,
    atCeilingG,
    czActualCeilingG,
    czDisplayCeilingG,
    avgGames,
    avgInvestment,
    byMode,
  }
}

export function buildSao2Premises(input: Sao2Input): Premise[] {
  const mPerG = medalsPerGame()
  const czCeil = input.czShortened
    ? PREMISES.czActualCeiling.shortened
    : PREMISES.czActualCeiling.normal

  return [
    {
      label: '出玉率の主軸',
      value: 'AT間表とCZ経由近似の高い方',
      basis:
        'AT間＝なな徹暫定表。CZ＝平均1/238.4（レア役・バレット・ゾーン込み）と天井の競合＋成功率55%',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: 'なな徹AT間表の invest+期待値から逆算。CZ当選は初当たりに含めない',
    },
    {
      label: 'AT間天井',
      value: `${PREMISES.atCeilingG}G+α`,
      basis: '到達でAT当選',
    },
    {
      label: 'CZ間・途中当選',
      value: `平均1/${PREMISES.czHitDenom}（設定1）`,
      basis:
        'シューティングチャージ・バレット満タン抽選などは個別未入力。公表CZ確率に平均化して織込み',
    },
    {
      label: 'CZ間天井',
      value: `実G${czCeil}G+α / 液晶${CZ_MODE_LABEL[input.czMode]}`,
      basis: 'いずれか早い方でCZ保証。失敗後はカウンターリセット前提でフル天井を再挑戦',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: 'AT終了後即ヤメ',
      basis: 'なな徹シミュ。表はCZ天井・モード未考慮',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: 'なな徹',
      value: 'https://nana-press.com/kaiseki/machine/1158/37243/',
      basis: 'AT間期待値は暫定。CZ経路は自前近似',
      derived: true,
    },
  ]
}
