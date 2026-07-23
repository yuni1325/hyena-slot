import type { Premise } from '../types'
import {
  CZ_CEILING_G,
  CZ_CEILING_LABEL,
  EV_AT,
  PREMISES,
  czEvRowsFor,
  interpolateEv,
  medalsPerGame,
  winMedalsFromEv,
  type CzCeilingKind,
} from './data'

export type GhoulInput = {
  /** 実G（AT間・データカウンター。スイカ加算なし） */
  actualGames: number
  /** 表示G（CZ間・液晶。スイカ加算込み） */
  displayGames: number
  czCeiling: CzCeilingKind
}

export type GhoulResult = {
  reachable: boolean
  /** 主表示：AT経路とCZ経路の良い方 */
  expectedPayoutRate: number | null
  /** 初当たり1回あたりの期待獲得出玉（AT・枚。CZではない） */
  expectedWinMedals: number | null
  /** どちらを主に採用したか */
  primaryPath: 'at' | 'cz' | null
  atPayoutRate: number | null
  czPayoutRate: number | null
  atYenEv: number | null
  czYenEv: number | null
  atInvestYen: number | null
  czInvestYen: number | null
  atRemaining: number | null
  czRemaining: number | null
  atCeilingG: number
  czCeilingG: number
  avgInvestment: number | null
  avgGames: number | null
}

function rateFromEv(row: {
  games: number
  yen: number
  investYen: number
  reachRate: number
}): number | null {
  const invest = row.investYen / PREMISES.yenPerMedal
  if (invest <= 0) return null
  const win = winMedalsFromEv(row)
  return (win / invest) * 100
}

export function calculateGhoul(input: GhoulInput): GhoulResult {
  const actual = Math.max(0, Math.floor(input.actualGames))
  const display = Math.max(0, Math.floor(input.displayGames))
  const czCeilingG = CZ_CEILING_G[input.czCeiling]
  const atCeilingG = PREMISES.atCeilingG
  const mPerG = medalsPerGame()

  const atRem = Math.max(0, atCeilingG - actual)
  const czRem = Math.max(0, czCeilingG - display)

  const atCap = Math.min(actual, 1150)
  const atRow = interpolateEv(EV_AT, atCap)
  const atPayoutRate = actual >= atCeilingG ? null : rateFromEv(atRow)

  const czRows = czEvRowsFor(input.czCeiling)
  const czLast = czRows[czRows.length - 1].games
  // 通常600表は「天井まで残り = 600−表示G」前提。
  // 天国100等の短い天井は、同じ残りGの位置へ写す（表示0の天国 ≈ 通常表500G）。
  // ※ゾーン優遇は未反映のため天国はまだやや保守寄り。
  let czLookupG: number
  if (input.czCeiling === 'reset200') {
    czLookupG = Math.min(display, czLast)
  } else if (input.czCeiling === 'normal600') {
    czLookupG = Math.min(display, czLast)
  } else {
    const refCeiling = 600
    czLookupG = Math.min(
      czLast,
      Math.max(0, refCeiling - czRem),
    )
  }

  const czRow = interpolateEv(czRows, czLookupG)
  const czPayoutRate = display >= czCeilingG ? null : rateFromEv(czRow)

  const atDone = actual >= atCeilingG
  const czDone = display >= czCeilingG
  const atWinMedals = winMedalsFromEv(atRow)

  if (atDone && czDone) {
    return {
      reachable: false,
      expectedPayoutRate: null,
      expectedWinMedals: atWinMedals,
      primaryPath: null,
      atPayoutRate: null,
      czPayoutRate: null,
      atYenEv: atRow.yen,
      czYenEv: czRow.yen,
      atInvestYen: atRow.investYen,
      czInvestYen: czRow.investYen,
      atRemaining: 0,
      czRemaining: 0,
      atCeilingG,
      czCeilingG,
      avgInvestment: null,
      avgGames: null,
    }
  }

  // 主経路: 出玉率が高い方（両方有効なとき）。片方だけならそちら。
  let primaryPath: 'at' | 'cz' | null = null
  let expectedPayoutRate: number | null = null
  let avgInvestment: number | null = null
  let avgGames: number | null = null

  const atOk = atPayoutRate != null
  const czOk = czPayoutRate != null

  if (atOk && czOk) {
    if (czPayoutRate! >= atPayoutRate!) {
      primaryPath = 'cz'
      expectedPayoutRate = czPayoutRate
      avgInvestment = czRow.investYen / PREMISES.yenPerMedal
    } else {
      primaryPath = 'at'
      expectedPayoutRate = atPayoutRate
      avgInvestment = atRow.investYen / PREMISES.yenPerMedal
    }
  } else if (czOk) {
    primaryPath = 'cz'
    expectedPayoutRate = czPayoutRate
    avgInvestment = czRow.investYen / PREMISES.yenPerMedal
  } else if (atOk) {
    primaryPath = 'at'
    expectedPayoutRate = atPayoutRate
    avgInvestment = atRow.investYen / PREMISES.yenPerMedal
  }

  if (avgInvestment != null) avgGames = avgInvestment / mPerG

  return {
    reachable: expectedPayoutRate != null,
    expectedPayoutRate,
    expectedWinMedals: atWinMedals,
    primaryPath,
    atPayoutRate,
    czPayoutRate,
    atYenEv: atDone ? null : atRow.yen,
    czYenEv: czDone ? null : czRow.yen,
    atInvestYen: atDone ? null : atRow.investYen,
    czInvestYen: czDone ? null : czRow.investYen,
    atRemaining: atRem,
    czRemaining: czRem,
    atCeilingG,
    czCeilingG,
    avgInvestment,
    avgGames,
  }
}

export function buildGhoulPremises(input: GhoulInput): Premise[] {
  const mPerG = medalsPerGame()
  return [
    {
      label: '出玉率の主軸',
      value: 'AT間表とCZ間表の高い方を採用',
      basis:
        '実G→AT間天井（web情報）、表示G→CZ間天井（web情報）。両方有効なら出玉率が高い経路を主表示',
    },
    {
      label: '初当たり（AT）期待獲得出玉',
      value: `約${PREMISES.atWinMedals.toFixed(1)}枚`,
      basis: 'AT間web情報表の invest+期待値から逆算。CZ当選は初当たりに含めない',
    },
    {
      label: 'AT間天井',
      value: `${PREMISES.atCeilingG}G+α（実ゲーム数）`,
      basis: 'スイカ加算なし。データカウンター／メニューの実G。到達でAT当選',
    },
    {
      label: 'CZ間天井',
      value: `${CZ_CEILING_LABEL[input.czCeiling]} → ${CZ_CEILING_G[input.czCeiling]}G+α（表示G）`,
      basis: '液晶の加算G。到達でCZ（稀にEPボーナス）。モードで天井Gが変わる',
    },
    {
      label: '設定',
      value: '設定1・固定',
      basis: 'ハイエナ想定',
    },
    {
      label: 'ヤメ時（表の条件）',
      value: 'AT/CZ終了後即ヤメ',
      basis: 'web情報シミュ条件',
    },
    {
      label: '通常時消費',
      value: `約${mPerG.toFixed(3)}枚/G`,
      basis: `50 ÷ ${PREMISES.baseGamesPer50}`,
    },
    {
      label: '短いCZ天井の近似',
      value:
        input.czCeiling === 'normal600' || input.czCeiling === 'reset200'
          ? '専用／通常表をそのまま使用'
          : `通常600表の「残り${czRemApproxLabel(input)}G相当」位置`,
      basis:
        '通常C・天国準備・天国は専用表がないため、天井までの残りGが同じ通常表の行を参照（ゾーン優遇は未反映）',
      derived: true,
    },
    {
      label: '出典',
      value: 'web情報の天井期待値表',
      basis: 'AT間・CZ間それぞれの期待値表。モード・スイカ加算は表側で未考慮',
    },
  ]
}

function czRemApproxLabel(input: GhoulInput): number {
  const ceil = CZ_CEILING_G[input.czCeiling]
  const display = Math.max(0, Math.floor(input.displayGames))
  return Math.max(0, ceil - display)
}
