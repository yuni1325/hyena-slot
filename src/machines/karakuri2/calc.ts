import type { Premise } from '../types'
import {
  MODE_DISPLAY_CEILING,
  MODE_IDS,
  MODE_LABEL,
  PREMISES,
  SITUATION_LABEL,
  displayCeilingFor,
  EV_AT,
  EV_CZ_ACTUAL,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type ModeId,
  type Situation,
} from './data'

export type Karakuri2Input = {
  /** 実G（CZ実890／AT2500共用） */
  actualGames: number
  /** 液晶表示G */
  displayGames: number
  situation: Situation
  mode: ModeId
  /** CZ「女神」連続スルー回数 0〜4 */
  throughCount: number
}

export type Karakuri2ModeRow = {
  id: ModeId
  label: string
  displayCeiling: number
  displayRemaining: number
  payoutRate: number | null
  avgGames: number | null
}

export type Karakuri2Result = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  primaryPath: 'czActual' | 'display' | 'through' | 'at' | null
  czActualPayoutRate: number | null
  displayPayoutRate: number | null
  throughPayoutRate: number | null
  atPayoutRate: number | null
  czActualYenEv: number | null
  atYenEv: number | null
  czActualInvestYen: number | null
  atInvestYen: number | null
  czActualReachRate: number | null
  atReachRate: number | null
  actualCzRemaining: number | null
  displayRemaining: number | null
  atRemaining: number | null
  throughHitsNeeded: number
  displayCeilingG: number
  avgGames: number | null
  avgInvestment: number | null
  byMode: Karakuri2ModeRow[]
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

function expectedGamesToAtViaCz(
  rem: number,
  full: number,
  pPerGame: number,
  pSuccess: number,
): number {
  if (pSuccess <= 0) return Infinity
  if (pSuccess >= 1) return expectedGamesToEvent(rem, pPerGame)
  const first = expectedGamesToEvent(rem, pPerGame)
  const retry = expectedGamesToEvent(full, pPerGame)
  return first + ((1 - pSuccess) / pSuccess) * retry
}

/**
 * スルー天井: あと nHits 回CZが必要。最後の1回がAT直撃。
 * nHits = 5 - throughCount
 */
function expectedGamesThrough(
  rem: number,
  full: number,
  pPerGame: number,
  throughCount: number,
): number {
  const nHits = Math.max(1, PREMISES.throughCeilingHits - throughCount)
  const first = expectedGamesToEvent(rem, pPerGame)
  if (nHits <= 1) return first
  const retry = expectedGamesToEvent(full, pPerGame)
  return first + (nHits - 1) * retry
}

function successForMode(mode: ModeId): number {
  if (mode === 'C') return 1
  if (mode === 'D') return PREMISES.czSuccessTheater
  return PREMISES.czSuccessGoddess
}

function winForMode(mode: ModeId): number {
  // C直撃・D劇場・スルー/AT天井は激情込みAT枚数寄り
  if (mode === 'C' || mode === 'D') return PREMISES.atWinMedals
  return PREMISES.czWinMedals
}

export function calculateKarakuri2(input: Karakuri2Input): Karakuri2Result {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const situation = input.situation
  const mode = input.mode
  const through = Math.min(4, Math.max(0, Math.floor(input.throughCount)))

  const mPerG = medalsPerGame()
  const pCz = 1 / PREMISES.czHitDenom

  const displayCeil = displayCeilingFor(situation, mode)
  const actualCzRem = Math.max(0, PREMISES.czActualCeiling - actual)
  const displayRem = Math.max(0, displayCeil - display)
  const czEffRem = Math.min(actualCzRem, displayRem)
  const czFullRem = Math.min(
    PREMISES.czActualCeiling,
    situation === 'reset'
      ? PREMISES.resetDisplayCeiling
      : MODE_DISPLAY_CEILING[mode],
  )
  const atRem = Math.max(0, PREMISES.atCeiling - actual)

  // ① CZ実G表
  const czLast = EV_CZ_ACTUAL[EV_CZ_ACTUAL.length - 1].games
  const czRow = interpolateEv(EV_CZ_ACTUAL, Math.min(actual, czLast))
  const czActualDone = actual >= PREMISES.czActualCeiling
  const czActualInvest = czRow.investYen / PREMISES.yenPerMedal
  const czActualPayoutRate = czActualDone
    ? null
    : rate(winMedalsFromEv(czRow), czActualInvest)

  // ② 液晶＋モード近似
  const pSuccess = successForMode(mode)
  const displayWin = winForMode(mode)
  const displayGamesToAt = expectedGamesToAtViaCz(
    czEffRem,
    czFullRem,
    pCz,
    pSuccess,
  )
  const displayInvest = Number.isFinite(displayGamesToAt)
    ? displayGamesToAt * mPerG
    : null
  const displayPayoutRate =
    displayInvest == null || displayInvest <= 0
      ? null
      : rate(displayWin, displayInvest)

  // ③ スルー天井近似（最終CZ＝AT）
  const throughHitsNeeded = PREMISES.throughCeilingHits - through
  const throughGames = expectedGamesThrough(
    czEffRem,
    czFullRem,
    pCz,
    through,
  )
  const throughInvest = Number.isFinite(throughGames)
    ? throughGames * mPerG
    : null
  const throughPayoutRate =
    throughInvest == null || throughInvest <= 0
      ? null
      : rate(PREMISES.atWinMedals, throughInvest)

  // ④ AT天井表
  const atLast = EV_AT[EV_AT.length - 1].games
  const atRow = interpolateEv(EV_AT, Math.min(actual, atLast))
  const atDone = actual >= PREMISES.atCeiling
  const atInvest = atRow.investYen / PREMISES.yenPerMedal
  const atPayoutRate = atDone
    ? null
    : rate(winMedalsFromEv(atRow), atInvest)

  type Cand = {
    path: 'czActual' | 'display' | 'through' | 'at'
    rate: number
    avgG: number
    invest: number
    win: number
  }
  const cands: Cand[] = []
  if (czActualPayoutRate != null) {
    cands.push({
      path: 'czActual',
      rate: czActualPayoutRate,
      avgG: czActualInvest / mPerG,
      invest: czActualInvest,
      win: winMedalsFromEv(czRow),
    })
  }
  if (displayPayoutRate != null && displayInvest != null) {
    cands.push({
      path: 'display',
      rate: displayPayoutRate,
      avgG: displayGamesToAt,
      invest: displayInvest,
      win: displayWin,
    })
  }
  if (throughPayoutRate != null && throughInvest != null) {
    cands.push({
      path: 'through',
      rate: throughPayoutRate,
      avgG: throughGames,
      invest: throughInvest,
      win: PREMISES.atWinMedals,
    })
  }
  if (atPayoutRate != null) {
    cands.push({
      path: 'at',
      rate: atPayoutRate,
      avgG: atInvest / mPerG,
      invest: atInvest,
      win: winMedalsFromEv(atRow),
    })
  }

  cands.sort((a, b) => b.rate - a.rate)
  const best = cands[0] ?? null

  const byMode: Karakuri2ModeRow[] = MODE_IDS.map((id) => {
    const ceil =
      situation === 'reset'
        ? PREMISES.resetDisplayCeiling
        : MODE_DISPLAY_CEILING[id]
    const dRem = Math.max(0, ceil - display)
    const eff = Math.min(actualCzRem, dRem)
    const full = Math.min(PREMISES.czActualCeiling, ceil)
    const gToAt = expectedGamesToAtViaCz(
      eff,
      full,
      pCz,
      successForMode(id),
    )
    const inv = Number.isFinite(gToAt) ? gToAt * mPerG : null
    const win = winForMode(id)
    return {
      id,
      label: MODE_LABEL[id],
      displayCeiling: ceil,
      displayRemaining: dRem,
      payoutRate: inv == null || inv <= 0 ? null : rate(win, inv),
      avgGames: Number.isFinite(gToAt) ? gToAt : null,
    }
  })

  return {
    reachable: best != null,
    expectedPayoutRate: best?.rate ?? null,
    expectedWinMedals: best?.win ?? PREMISES.czWinMedals,
    primaryPath: best?.path ?? null,
    czActualPayoutRate,
    displayPayoutRate,
    throughPayoutRate,
    atPayoutRate,
    czActualYenEv: czActualDone ? null : czRow.yen,
    atYenEv: atDone ? null : atRow.yen,
    czActualInvestYen: czActualDone ? null : czRow.investYen,
    atInvestYen: atDone ? null : atRow.investYen,
    czActualReachRate: czActualDone ? null : czRow.reachRate,
    atReachRate: atDone ? null : atRow.reachRate,
    actualCzRemaining: actualCzRem,
    displayRemaining: displayRem,
    atRemaining: atRem,
    throughHitsNeeded,
    displayCeilingG: displayCeil,
    avgGames: best?.avgG ?? null,
    avgInvestment: best?.invest ?? null,
    byMode,
  }
}

export function buildKarakuri2Premises(input: Karakuri2Input): Premise[] {
  const mPerG = medalsPerGame()
  return [
    {
      label: '出玉率の主軸',
      value: 'CZ実G表／液晶モード／スルー／AT天井の高い方',
      basis: 'web情報暫定表＋自前近似を比較',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `CZ経路約${PREMISES.czWinMedals.toFixed(0)}枚／AT・スルー約${PREMISES.atWinMedals.toFixed(0)}枚`,
      basis: '各表0Gの invest+期待値から逆算（AT表は激情ジャッジ込み）',
    },
    {
      label: '状況',
      value: SITUATION_LABEL[input.situation],
      basis: 'リセット時は液晶CZ天井500G',
    },
    {
      label: 'モード',
      value: MODE_LABEL[input.mode],
      basis: 'Cは到達AT、Dは劇場ジャッジ≈47%',
    },
    {
      label: 'CZスルー',
      value: `${input.throughCount}回（あと${PREMISES.throughCeilingHits - Math.min(4, Math.max(0, input.throughCount))}回でAT）`,
      basis: '4連続スルー後の5回目CZがAT＋激情',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: 'CZ実G・AT天井は暫定。液晶・スルーは自前近似',
      derived: true,
    },
  ]
}
