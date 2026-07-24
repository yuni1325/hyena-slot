import type { Premise } from '../types'
import {
  ENEN_MODE_LABEL,
  EV_NORMAL,
  EV_SHORTENED,
  PREMISES,
  interpolateEv,
  medalsPerGame,
  modeCeilingFor,
  resolveEnenMode,
  winMedalsFromEv,
  type EnenMode,
} from './data'

export type Enen2Input = {
  /** ボーナス間実G */
  actualGames: number
  mode: EnenMode
  /** 設定変更後の短縮天井 */
  shortened: boolean
  /** 伝導者の罠連続スルー 0〜5 */
  trapThrough: number
}

export type Enen2Result = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  primaryPath: 'bonus' | 'mode' | 'trap' | null
  bonusPayoutRate: number | null
  modePayoutRate: number | null
  trapPayoutRate: number | null
  yenEv: number | null
  investYen: number | null
  reachRate: number | null
  bonusRemaining: number | null
  bonusCeilingG: number
  modeRemaining: number | null
  modeCeilingG: number
  resolvedMode: Exclude<EnenMode, 'unknown'>
  trapThroughReady: boolean
  trapRemaining: number
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
 * モード天井の残りGを、通常850表の打ち出し位置へ写す。
 * 残りが同じなら同じ出玉率、という近似。
 */
export function modeLookupGames(
  actualGames: number,
  modeCeilingG: number,
): number {
  const rem = Math.max(0, modeCeilingG - actualGames)
  return Math.max(0, PREMISES.refCeilingG - rem)
}

export function calculateEnen2(input: Enen2Input): Enen2Result {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const shortened = Boolean(input.shortened)
  const trapThrough = Math.min(
    PREMISES.trapThroughMax,
    Math.max(0, Math.floor(input.trapThrough)),
  )
  const trapReady = trapThrough >= PREMISES.trapThroughMax
  const resolvedMode = resolveEnenMode(input.mode)
  const bonusCeilingG = shortened
    ? PREMISES.bonusCeilingG.shortened
    : PREMISES.bonusCeilingG.normal
  /** 短縮時はモード天井もボーナス間短縮に合わせて上限 */
  const modeCeilingG = Math.min(modeCeilingFor(input.mode), bonusCeilingG)
  const mPerG = medalsPerGame()

  const rows = shortened ? EV_SHORTENED : EV_NORMAL
  const lastG = rows[rows.length - 1].games
  const row = interpolateEv(rows, Math.min(actual, lastG))
  const bonusDone = actual >= bonusCeilingG
  const tableWin = winMedalsFromEv(row)
  const bonusPayoutRate = bonusDone ? null : rateFromEv(row)
  const bonusInvest = bonusDone ? null : row.investYen / PREMISES.yenPerMedal

  const modeRem = Math.max(0, modeCeilingG - actual)
  const modeDone = actual >= modeCeilingG
  let modePayoutRate: number | null = null
  let modeInvest: number | null = null
  let modeWin = tableWin
  if (!modeDone) {
    const lookup = modeLookupGames(actual, modeCeilingG)
    const modeRow = interpolateEv(EV_NORMAL, Math.min(lookup, EV_NORMAL[EV_NORMAL.length - 1].games))
    modePayoutRate = rateFromEv(modeRow)
    modeInvest = modeRow.investYen / PREMISES.yenPerMedal
    modeWin = winMedalsFromEv(modeRow)
  }

  /** 伝導者5スルー済: 次回ボーナスがSP → 初当たりまで≈1/272、獲得出玉はSP目安 */
  const trapGames = PREMISES.bonusHitDenom
  const trapInvest = trapGames * mPerG
  const trapPayoutRate = trapReady
    ? (PREMISES.spWinMedals / trapInvest) * 100
    : null

  type Cand = {
    path: 'bonus' | 'mode' | 'trap'
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
  // モード不明 or A（表と同じ天井）はモード経路を別表示しない（主比較はボーナス表）
  if (
    input.mode !== 'unknown' &&
    input.mode !== 'A' &&
    modePayoutRate != null &&
    modeInvest != null
  ) {
    cands.push({
      path: 'mode',
      rate: modePayoutRate,
      invest: modeInvest,
      games: modeInvest / mPerG,
      win: modeWin,
    })
  }
  if (trapPayoutRate != null) {
    cands.push({
      path: 'trap',
      rate: trapPayoutRate,
      invest: trapInvest,
      games: trapGames,
      win: PREMISES.spWinMedals,
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
    modePayoutRate:
      input.mode !== 'unknown' && input.mode !== 'A' ? modePayoutRate : null,
    trapPayoutRate,
    yenEv: bonusDone ? null : row.yen,
    investYen: bonusDone ? null : row.investYen,
    reachRate: bonusDone ? null : row.reachRate,
    bonusRemaining: Math.max(0, bonusCeilingG - actual),
    bonusCeilingG,
    modeRemaining: modeRem,
    modeCeilingG,
    resolvedMode,
    trapThroughReady: trapReady,
    trapRemaining: Math.max(0, PREMISES.trapThroughMax - trapThrough),
    avgGames: best?.games ?? null,
    avgInvestment: best?.invest ?? null,
  }
}

export function buildEnen2Premises(input: Enen2Input): Premise[] {
  const mPerG = medalsPerGame()
  const resolved = resolveEnenMode(input.mode)
  return [
    {
      label: '出玉率の主軸',
      value: 'ボーナス間表／モード天井写像／伝導者スルーの高い方',
      basis:
        'ボーナス間はweb情報表。上位モードは残Gを850表へ写像。5スルー済はSP期待を近似',
    },
    {
      label: '初当たり期待獲得出玉（表）',
      value: `約${PREMISES.tableWinMedals.toFixed(1)}枚`,
      basis: '通常表0Gの invest+期待値から逆算',
    },
    {
      label: 'SPボーナス期待獲得出玉（近似）',
      value: `約${PREMISES.spWinMedals}枚`,
      basis: '炎炎大戦ループ期待を代理。伝導者5スルー後の経路に使用',
      derived: true,
    },
    {
      label: 'ボーナス間天井',
      value: input.shortened
        ? `短縮 ${PREMISES.bonusCeilingG.shortened}G+α（設定変更）`
        : `通常 ${PREMISES.bonusCeilingG.normal}G+α`,
      basis: '到達で初当たりボーナス',
    },
    {
      label: 'モード天井',
      value: `${ENEN_MODE_LABEL[resolved]}${input.mode === 'unknown' ? '（不明→A）' : ''}`,
      basis: 'A〜E。不明時はモード経路を主比較に使わない',
    },
    {
      label: '伝導者の罠スルー',
      value: `最大${PREMISES.trapThroughMax}回 → 次回SPボーナス濃厚`,
      basis: `成功率約${(PREMISES.trapSuccessRate * 100).toFixed(0)}%。現在 ${Math.min(PREMISES.trapThroughMax, Math.max(0, input.trapThrough))}回`,
    },
    {
      label: '炎炎ループ間天井（参考）',
      value: input.shortened
        ? `${PREMISES.loopCeilingG.shortened}G+α`
        : `${PREMISES.loopCeilingG.normal}G+α`,
      basis: '期待値表なし・表示のみ',
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
      label: '純増',
      value: `${PREMISES.pureInc}枚/G`,
      basis: '全ボーナス共通',
    },
    {
      label: '出典',
      value: 'web情報のボーナス間天井期待値表',
      basis: '等価・平均投資。閉店欠損なし',
    },
  ]
}
