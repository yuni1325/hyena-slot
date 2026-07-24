import type { Premise } from '../types'
import {
  PREMISES,
  evRowsFor,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
} from './data'

export type BakeInput = {
  /** AT後（夢の時間ヲ終わラセルな抜け後）の実G */
  actualGames: number
  /** 設定変更後の短縮天井 */
  shortened: boolean
}

export type BakeResult = {
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

export function calculateBake(input: BakeInput): BakeResult {
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

export function buildBakePremises(input: BakeInput): Premise[] {
  const mPerG = medalsPerGame()
  return [
    {
      label: '出玉率の主軸',
      value: input.shortened
        ? 'web情報・設定変更時天井表（600G）'
        : 'web情報・AT後天井表（1000G）',
      basis: '等価・設定1。天井到達時はAT+倍倍チャンスを考慮',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '通常表0Gの invest+期待値から逆算（倍倍チャンス込み）',
    },
    {
      label: 'ゲーム数天井',
      value: input.shortened
        ? `${PREMISES.ceilingG.shortened}G（設定変更）`
        : `${PREMISES.ceilingG.normal}G（AT後）`,
      basis: '到達でAT「倖時間」+倍倍チャンス',
    },
    {
      label: '解呪ノ儀（参考）',
      value: `成功率約${(PREMISES.czSuccessRate * 100).toFixed(0)}%／AT初当り1/${PREMISES.atHitDenom}`,
      basis: '表はゾーン・解呪連を平均化した条件',
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
      value: `${PREMISES.pureInc}枚/G（倖時間）`,
      basis: `超倖時間は約${PREMISES.pureIncSuper}枚/G（表の分子は倖時間基準）`,
    },
    {
      label: 'ゾーン目安',
      value: PREMISES.zoneHint,
      basis: '天井表には未反映',
    },
    {
      label: '出典',
      value: 'web情報のゲーム数天井期待値表',
      basis: '等価・平均投資。閉店欠損なし',
    },
  ]
}
