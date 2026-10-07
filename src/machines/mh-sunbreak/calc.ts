import {
  evaluateHazardCeiling,
  type HazardCeilingResult,
} from '../../lib/hazardCeiling'
import type { Premise } from '../types'
import {
  AIM_GAMES,
  AIM_RATE,
  CEILING_G,
  HAZARD,
  PREMISES,
  SITUATION_LABEL,
  WIN_MEDALS,
  medalsPerGame,
  type Situation,
} from './data'

export type MhSunbreakInput = {
  /** AT間の実G（データカウンター想定） */
  actualGames: number
  situation: Situation
}

export function calculateMhSunbreak(
  input: MhSunbreakInput,
): HazardCeilingResult {
  return evaluateHazardCeiling({
    p: HAZARD,
    winMedals: WIN_MEDALS[input.situation],
    ceilingG: CEILING_G,
    actualGames: input.actualGames,
    medalsPerGame: medalsPerGame(),
    yenPerMedal: PREMISES.yenPerMedal,
  })
}

export function buildMhSunbreakPremises(input: MhSunbreakInput): Premise[] {
  const s = input.situation
  return [
    {
      label: '出玉率の主軸（暫定）',
      value: `狙い目${AIM_GAMES[s]}G＝${AIM_RATE}%と仮置きした天井モデル`,
      basis:
        'G数別の期待値・出玉率が未公開のため、解析サイトの狙い目から逆算。表が出たら差し替え',
      derived: true,
    },
    {
      label: '状況',
      value: SITUATION_LABEL[s],
      basis: s === 'reset' ? PREMISES.resetNote : 'AT間999G+αでAT当選',
    },
    {
      label: '初当たり（モデル）',
      value: `1/${(1 / HAZARD).toFixed(1)}`,
      basis: '公表AT初当たり（設定1）をそのまま使用',
    },
    {
      label: '初当たり等価獲得（モデル）',
      value: `約${WIN_MEDALS[s].toFixed(1)}枚`,
      basis: '仮置きの出玉率から逆算。ヤメ時までのフォロー込み',
      derived: true,
    },
    {
      label: '他の天井（未反映）',
      value: `CZ間${PREMISES.czCeiling}G／CZ${PREMISES.czThrough}スルー／潜水艇${PREMISES.replayCycle}周期`,
      basis:
        'どれもATを近づける要素。CZスルー・周期が深い台はこの表示より上振れ',
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
      value: `約${PREMISES.pureInc}枚/G（上位AT ${PREMISES.pureIncUpper}枚/G）`,
      basis: '閉店補正は保守側の通常AT純増を使用',
    },
  ]
}
