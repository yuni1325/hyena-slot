/**
 * 公開期待値表（ゲーム数→等価期待値）をそのまま使う天井計算。
 *
 *  - 期待値（円）: 公開表の点を直線補間（表の範囲外はモデル曲線で延長）
 *  - 平均投資: ハザード一定モデル（p は表に最小二乗で合わせる）
 *  - 出玉率 = (平均投資 + 期待値) ÷ 平均投資
 *
 * 表の値を変えずに出玉率・投資・天井到達率を出すための仕組み。
 */

import { expectedGames, type HazardCeilingResult } from './hazardCeiling'
import type { Premise } from '../machines/types'

export type EvPoint = [games: number, yen: number]

export type AnchoredSituation = {
  label: string
  /** 入力するゲーム数の種類（例: 'AT間の実G'） */
  gamesLabel: string
  ceiling: number
  points: EvPoint[]
  /** 状況固有の補足（前提一覧に表示） */
  note?: string
}

export type AnchoredSpec<S extends string> = {
  situations: Record<S, AnchoredSituation>
  order: S[]
  baseGamesPer50: number
  pureInc: number
  source: string
  /** 表が実戦データでなく推定・目安なら true（自前算出バッジ） */
  provisional?: boolean
  extraPremises?: Premise[]
}

const YEN_PER_MEDAL = 20

type Fitted = { p: number; w: number }

/** 表の点に最も合う p（と参考用の W）を求める */
export function fitHazard(points: EvPoint[], ceiling: number, mPerG: number): Fitted {
  let best: { err: number; p: number; w: number } | null = null
  for (let inv = 80; inv <= 1500; inv++) {
    const p = 1 / inv
    const xs = points.map(([g]) => mPerG * expectedGames(p, ceiling - g))
    const w =
      points.reduce((acc, [, y], i) => acc + y / YEN_PER_MEDAL + xs[i], 0) / points.length
    const err = points.reduce((acc, [, y], i) => {
      const d = (w - xs[i]) * YEN_PER_MEDAL - y
      return acc + d * d
    }, 0)
    if (!best || err < best.err) best = { err, p, w }
  }
  return { p: best!.p, w: best!.w }
}

function modelYen(f: Fitted, ceiling: number, g: number, mPerG: number): number {
  return (f.w - mPerG * expectedGames(f.p, ceiling - g)) * YEN_PER_MEDAL
}

/** 表の点を補間。範囲外は端の点に合わせたモデル曲線で延長 */
export function interpolateYen(
  points: EvPoint[],
  f: Fitted,
  ceiling: number,
  g: number,
  mPerG: number,
): number {
  const first = points[0]
  const last = points[points.length - 1]
  if (g <= first[0]) {
    return modelYen(f, ceiling, g, mPerG) + (first[1] - modelYen(f, ceiling, first[0], mPerG))
  }
  if (g >= last[0]) {
    return modelYen(f, ceiling, g, mPerG) + (last[1] - modelYen(f, ceiling, last[0], mPerG))
  }
  for (let i = 0; i < points.length - 1; i++) {
    const [g0, y0] = points[i]
    const [g1, y1] = points[i + 1]
    if (g >= g0 && g <= g1) return y0 + ((y1 - y0) * (g - g0)) / (g1 - g0)
  }
  return last[1]
}

export function defineAnchoredMachine<S extends string>(spec: AnchoredSpec<S>) {
  const mPerG = 50 / spec.baseGamesPer50
  const fitted = Object.fromEntries(
    spec.order.map((s) => {
      const sit = spec.situations[s]
      return [s, fitHazard(sit.points, sit.ceiling, mPerG)]
    }),
  ) as Record<S, Fitted>

  const situationLabel = Object.fromEntries(
    spec.order.map((s) => [s, spec.situations[s].label]),
  ) as Record<S, string>

  function calculate(input: { actualGames: number; situation: S }): HazardCeilingResult {
    const sit = spec.situations[input.situation]
    const f = fitted[input.situation]
    const g = Math.max(0, Math.floor(input.actualGames))
    const remaining = Math.max(0, sit.ceiling - g)
    // 表の始点より50G以上手前は推定しない（ゾーン等で形が変わるため）
    const belowTable = g < sit.points[0][0] - 50
    if (remaining <= 0 || belowTable) {
      return {
        reachable: false,
        expectedPayoutRate: null,
        expectedWinMedals: null,
        yenEv: null,
        investYen: null,
        reachRate: null,
        remaining: belowTable ? remaining : 0,
        ceilingG: sit.ceiling,
        avgGames: null,
        avgInvestment: null,
      }
    }
    const avgGames = expectedGames(f.p, remaining)
    const investMedals = avgGames * mPerG
    const yen = interpolateYen(sit.points, f, sit.ceiling, g, mPerG)
    const win = Math.max(0, investMedals + yen / YEN_PER_MEDAL)
    return {
      reachable: true,
      expectedPayoutRate: (win / investMedals) * 100,
      expectedWinMedals: win,
      yenEv: yen,
      investYen: investMedals * YEN_PER_MEDAL,
      reachRate: Math.pow(1 - f.p, remaining) * 100,
      remaining,
      ceilingG: sit.ceiling,
      avgGames,
      avgInvestment: investMedals,
    }
  }

  function premises(input: { actualGames: number; situation: S }): Premise[] {
    const sit = spec.situations[input.situation]
    const f = fitted[input.situation]
    const pts = sit.points
    const first = pts[0]
    const last = pts[pts.length - 1]
    const be = breakEven(input.situation)
    return [
      {
        label: '期待値の出典',
        value: spec.source,
        basis: spec.provisional
          ? '実戦データの表ではなく推定・目安の値。新しい表が出たら差し替え'
          : '公開表の値を直線補間（表の外側はモデル曲線で延長）',
        derived: spec.provisional,
      },
      {
        label: '状況',
        value: sit.label,
        basis: sit.note ?? `${sit.gamesLabel}で入力`,
      },
      {
        label: '天井',
        value: `${sit.ceiling}G+α`,
        basis: `表の範囲 ${first[0]}G（${signed(first[1])}）〜 ${last[0]}G（${signed(last[1])}）${
          first[0] > 50 ? `。${first[0] - 50}G未満は表がないため計算しない` : ''
        }`,
      },
      {
        label: '損益分岐（等価）',
        value: be == null ? '—' : `約${be}G`,
        basis: '期待値がプラスに変わるゲーム数',
      },
      {
        label: '平均投資・到達率',
        value: `初当たり 約1/${Math.round(1 / f.p)}（モデル）`,
        basis: '表に合わせて算出した実効の当選率。出玉率の分母（平均投資）に使用',
        derived: true,
      },
      ...(spec.extraPremises ?? []),
      {
        label: '通常時消費',
        value: `約${mPerG.toFixed(3)}枚/G`,
        basis: `50 ÷ ${spec.baseGamesPer50}`,
      },
      {
        label: '純増',
        value: `約${spec.pureInc}枚/G`,
        basis: '閉店補正のAT所要G計算に使用',
      },
    ]
  }

  function breakEven(s: S): number | null {
    const sit = spec.situations[s]
    for (let g = 0; g < sit.ceiling; g += 10) {
      const r = calculate({ actualGames: g, situation: s })
      if (r.yenEv != null && r.yenEv >= 0) return g
    }
    return null
  }

  return {
    order: spec.order,
    situationLabel,
    pureInc: spec.pureInc,
    ceilingFor: (s: S) => spec.situations[s].ceiling,
    gamesLabelFor: (s: S) => spec.situations[s].gamesLabel,
    calculate,
    premises,
    breakEven,
  }
}

function signed(yen: number): string {
  const r = Math.round(yen)
  return `${r >= 0 ? '+' : '−'}${Math.abs(r).toLocaleString('ja-JP')}円`
}
