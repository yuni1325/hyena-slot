import {
  evaluateHazardCeiling,
  type HazardCeilingResult,
} from '../../lib/hazardCeiling'
import type { Premise } from '../types'
import {
  ANCHORS,
  HAZARD,
  PREMISES,
  SITUATION_CEILING,
  SITUATION_LABEL,
  WIN_MEDALS,
  medalsPerGame,
  type Situation,
} from './data'

export type JuohInput = {
  /** SC間の実G（データカウンター想定） */
  actualGames: number
  situation: Situation
}

export function calculateJuoh(input: JuohInput): HazardCeilingResult {
  return evaluateHazardCeiling({
    p: HAZARD,
    winMedals: WIN_MEDALS[input.situation],
    ceilingG: SITUATION_CEILING[input.situation],
    actualGames: input.actualGames,
    medalsPerGame: medalsPerGame(),
    yenPerMedal: PREMISES.yenPerMedal,
  })
}

export function buildJuohPremises(input: JuohInput): Premise[] {
  const s = input.situation
  const a = ANCHORS[s]
  return [
    {
      label: '出玉率の主軸',
      value: '公開期待値に合わせた天井モデル',
      basis: `${SITUATION_LABEL[s]}：${a.games}G〜 +${a.yen.toLocaleString('ja-JP')}円（等価・設定1）に一致させて補間`,
      derived: true,
    },
    {
      label: '天井',
      value: `${SITUATION_CEILING[s]}G+α`,
      basis:
        s === 'reset'
          ? `到達でSC/BIG/REG。${PREMISES.resetNote}`
          : '到達でSC/BIG/REG',
    },
    {
      label: '初当たり（モデル）',
      value: `1/${(1 / HAZARD).toFixed(1)}`,
      basis: '公表SC初当たり（設定1）をそのまま使用。ゾーンは未反映',
    },
    {
      label: '初当たり等価獲得（モデル）',
      value: `約${WIN_MEDALS[s].toFixed(1)}枚`,
      basis: 'アンカーから逆算。ヤメ時までのフォロー込みの差枚換算',
      derived: true,
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: `機械割${PREMISES.payoutRate}%`,
    },
    {
      label: 'ヤメ時',
      value: PREMISES.stopNote,
      basis: '各解析サイトの推奨',
    },
    {
      label: '通常時消費',
      value: `約${medalsPerGame().toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '純増',
      value: `約${PREMISES.pureInc}枚/G（SC中）`,
      basis: '閉店補正のAT所要G計算に使用',
    },
  ]
}
