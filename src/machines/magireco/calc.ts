import type { Premise } from '../types'
import {
  PREMISES,
  evRowsFor,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
} from './data'

export type MagirecoInput = {
  /** ボーナス間の実G（データカウンター想定） */
  actualGames: number
  /** 設定変更後の短縮天井 */
  shortened: boolean
}

export type MagirecoResult = {
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

export function calculateMagireco(input: MagirecoInput): MagirecoResult {
  const g = Math.max(0, Math.floor(input.actualGames))
  const shortened = Boolean(input.shortened)
  const ceilingG = shortened
    ? PREMISES.ceilingG.shortened
    : PREMISES.ceilingG.normal
  const mPerG = medalsPerGame()
  const rows = evRowsFor(shortened)
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

export function buildMagirecoPremises(input: MagirecoInput): Premise[] {
  const mPerG = medalsPerGame()
  return [
    {
      label: '出玉率の主軸',
      value: input.shortened
        ? 'web情報・天井短縮時表（約400G）'
        : 'web情報・通常天井表（約600G）',
      basis: '等価・設定1。ポイント天井を1G≒1.5pt換算',
    },
    {
      label: '初当たり期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '通常表0Gの invest+期待値から逆算',
    },
    {
      label: 'ボーナス間天井',
      value: input.shortened
        ? `最大${PREMISES.ceilingPt.shortened}pt+α（約${PREMISES.ceilingG.shortened}G）`
        : `最大${PREMISES.ceilingPt.normal}pt+α（約${PREMISES.ceilingG.normal}G）`,
      basis: '到達でボーナス濃厚。魔法少女モード・穢れは表未反映',
    },
    {
      label: '初当たり確率（参考）',
      value: `ボーナス1/${PREMISES.bonusHitDenom}／AT1/${PREMISES.atHitDenom}`,
      basis: '設定1',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: PREMISES.stopNote,
      basis: 'web情報シミュ条件',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '純増（表）',
      value: `${PREMISES.pureInc}枚/G（マギアラッシュ）`,
      basis: 'AT獲得枚数は常に一定とする条件',
    },
    {
      label: 'ゾーン目安',
      value: PREMISES.zoneHint,
      basis: '天井表には未反映',
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: '等価・平均投資。閉店欠損なし・非前兆中',
    },
  ]
}
