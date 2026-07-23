import type { Premise } from '../types'
import {
  PHASE_LABEL,
  PREMISES,
  evRowsFor,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type Phase,
} from './data'

export type MillionGodInput = {
  /** GG間の現在G */
  games: number
  phase: Phase
}

export type MillionGodResult = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  yenEv: number | null
  investYen: number | null
  reachRate: number | null
  remaining: number | null
  ceilingG: number
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

export function calculateMillionGod(input: MillionGodInput): MillionGodResult {
  const g = Math.max(0, Math.floor(input.games))
  const ceilingG = PREMISES.ceilingG
  const mPerG = medalsPerGame()
  const rows = evRowsFor(input.phase)
  const lastG = rows[rows.length - 1].games
  const row = interpolateEv(rows, Math.min(g, lastG))
  const done = g >= ceilingG
  const winMedals = winMedalsFromEv(row)
  const payout = done ? null : rateFromEv(row)
  const investMedals = done ? null : row.investYen / PREMISES.yenPerMedal

  return {
    reachable: payout != null,
    expectedPayoutRate: payout,
    expectedWinMedals: winMedals,
    yenEv: done ? null : row.yen,
    investYen: done ? null : row.investYen,
    reachRate: done ? null : row.reachRate,
    remaining: Math.max(0, ceilingG - g),
    ceilingG,
    avgGames: investMedals == null ? null : investMedals / mPerG,
    avgInvestment: investMedals,
  }
}

export function buildMillionGodPremises(input: MillionGodInput): Premise[] {
  const mPerG = medalsPerGame()
  const r = PREMISES.resetCeilings
  return [
    {
      label: '出玉率の主軸',
      value: `${PHASE_LABEL[input.phase]}のweb情報暫定表`,
      basis: '設定1・等価・G-ZONE抜け後GGストック否定ヤメ。天井恩恵（ループストック）込み',
    },
    {
      label: '初当たり（GG）期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '通常表0Gの invest+期待値から逆算（天井恩恵込み）',
    },
    {
      label: 'GG間天井',
      value:
        input.phase === 'reset'
          ? `510G(${(r.g510 * 100).toFixed(1)}%) / 1000G(${(r.g1000 * 100).toFixed(1)}%) / 1480G(${(r.g1480 * 100).toFixed(1)}%)`
          : `${PREMISES.ceilingG}G+α`,
      basis:
        input.phase === 'reset'
          ? '全設定共通振り分け。打ち出しGでベイズ更新された表を使用'
          : '到達でGG＋ループストック抽選',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: 'G-ZONE抜け後のGGストック否定',
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
      basis: 'web情報算出条件・GG',
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: '暫定版・内部状態未考慮',
    },
  ]
}
