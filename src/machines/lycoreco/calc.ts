import type { Premise } from '../types'
import {
  ANCHORS,
  HAZARD,
  PREMISES,
  SITUATION_CEILING,
  SITUATION_LABEL,
  WIN_MEDALS,
  expectedGames,
  medalsPerGame,
  type Situation,
} from './data'

export type LycorecoInput = {
  /** AT間の実G（データカウンター想定） */
  actualGames: number
  situation: Situation
}

export type LycorecoResult = {
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

export function calculateLycoreco(input: LycorecoInput): LycorecoResult {
  const g = Math.max(0, Math.floor(input.actualGames))
  const situation = input.situation
  const ceilingG = SITUATION_CEILING[situation]
  const remaining = Math.max(0, ceilingG - g)
  const winMedals = WIN_MEDALS[situation]

  if (remaining <= 0) {
    return {
      reachable: false,
      expectedPayoutRate: null,
      expectedWinMedals: winMedals,
      yenEv: null,
      investYen: null,
      reachRate: null,
      remaining: 0,
      ceilingG,
      avgGames: null,
      avgInvestment: null,
    }
  }

  const avgGames = expectedGames(HAZARD, remaining)
  const avgInvestment = avgGames * medalsPerGame()
  const rate = (winMedals / avgInvestment) * 100

  return {
    reachable: true,
    expectedPayoutRate: rate,
    expectedWinMedals: winMedals,
    yenEv: (winMedals - avgInvestment) * PREMISES.yenPerMedal,
    investYen: avgInvestment * PREMISES.yenPerMedal,
    reachRate: Math.pow(1 - HAZARD, remaining) * 100,
    remaining,
    ceilingG,
    avgGames,
    avgInvestment,
  }
}

export function buildLycorecoPremises(input: LycorecoInput): Premise[] {
  const mPerG = medalsPerGame()
  const s = input.situation
  return [
    {
      label: '出玉率の主軸',
      value: '公開値2点に合わせた天井モデル',
      basis: `AT間300G〜${ANCHORS.normal300}%・400G〜${ANCHORS.normal400}%（設定1）に一致させて補間`,
      derived: true,
    },
    {
      label: '状況',
      value: SITUATION_LABEL[s],
      basis:
        s === 'upperFail'
          ? `ラッシュ濃厚CZまで最大250G。0G〜${ANCHORS.upperFail0}%に合わせて獲得を補正`
          : s === 'shortened'
            ? 'リセット・ラッシュ駆け抜け時はAT間600G／CZ間250Gに短縮'
            : 'AT間850G+α（プロローグ経由でラッシュ＋Vストック抽選）',
    },
    {
      label: '実効初当たり（モデル）',
      value: `約1/${(1 / HAZARD).toFixed(1)}`,
      basis: `CZ経由込みの1G当たり当選率。公表AT初当り1/${PREMISES.atHitDenom}より軽いのはゾーン・CZ天井を含むため`,
      derived: true,
    },
    {
      label: '初当たり等価獲得（モデル）',
      value: `約${WIN_MEDALS[s].toFixed(1)}枚`,
      basis: 'ヤメ時までのフォロー込みの差枚換算。AT単体の平均獲得ではない',
      derived: true,
    },
    {
      label: 'CZ間天井',
      value: `${PREMISES.czCeiling.normal}G+α（短縮時${PREMISES.czCeiling.shortened}G）`,
      basis: '到達でCZ当選。CZ間Gは入力せずモデルに平均的に含む',
    },
    {
      label: '初当たり確率（参考）',
      value: `CZ 1/${PREMISES.czHitDenom}／AT 1/${PREMISES.atHitDenom}`,
      basis: `設定1・機械割${PREMISES.payoutRate}%`,
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時',
      value: PREMISES.stopNote,
      basis: '各解析サイトの推奨',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '純増',
      value: `約${PREMISES.pureInc}枚/G（ラッシュ中）`,
      basis: '閉店補正のAT所要G計算に使用',
    },
    {
      label: 'ゾーン',
      value: PREMISES.zoneHint,
      basis: 'ゾーン狙いは別途判断',
    },
  ]
}
