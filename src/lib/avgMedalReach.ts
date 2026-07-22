/**
 * 初当たり1回で平均獲得枚数以上になる確率。
 *
 * 実践の平均・中央値があれば対数正規で推定:
 *   σ² = 2 ln(mean/median)
 *   P(X ≥ mean) = 1 − Φ(σ/2)
 *
 * 中央値がない機種は駆け抜け右歪みの指数近似 1/e。
 * ※期待値の分子（平均枚数）には掛けない。
 */

export type WinMedalDist = {
  /** 実践平均（枚） */
  mean: number
  /** 実践中央値（枚） */
  median: number
  /** 出典メモ */
  source: string
}

/** 標準正規 CDF（Abramowitz & Stegun 7.1.26） */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

/** 平均・中央値 → P(X ≥ mean)。不正値は 1/e */
export function reachRateFromMeanMedian(
  mean: number,
  median: number,
): number {
  if (!(mean > 0) || !(median > 0)) return 1 / Math.E
  if (mean <= median) return 0.5
  const sigma = Math.sqrt(2 * Math.log(mean / median))
  return Math.max(0, Math.min(1, 1 - normalCdf(sigma / 2)))
}

/**
 * 機種別・実践分布（たられば／ためスロ等の公開値）。
 * SAO2 は中央値未公開のため未登録 → 指数近似。
 */
export const WIN_MEDAL_DIST_BY_MACHINE: Record<string, WinMedalDist> = {
  'hokuto-tensei2': {
    mean: 555.8,
    median: 346,
    source: 'たられば・獲得枚数分布',
  },
  'kabaneri-unato': {
    mean: 598.7,
    median: 405,
    source: 'ためスロ・約90万G調査',
  },
  'monkey-turn-v': {
    mean: 439.0,
    median: 272,
    source: 'たられば・全AT分布',
  },
  'tokyo-ghoul': {
    mean: 590.8,
    median: 240,
    source: 'たらればAT期待枚数＋中央値は実践目安',
  },
  otome5: {
    mean: 534.8,
    median: 241,
    source: 'たられば・獲得枚数分布',
  },
}

export type AvgMedalReachInfo = {
  rate: number
  mean: number | null
  median: number | null
  /** 平均継続G目安（mean / pureInc）。不明なら null */
  avgGames: number | null
  method: 'lognormal' | 'exponential'
  basis: string
}

export function getAvgMedalReach(
  machineId: string,
  pureIncPerGame: number,
): AvgMedalReachInfo {
  const dist = WIN_MEDAL_DIST_BY_MACHINE[machineId]
  if (dist) {
    const rate = reachRateFromMeanMedian(dist.mean, dist.median)
    const avgGames =
      pureIncPerGame > 0 ? dist.mean / pureIncPerGame : null
    return {
      rate,
      mean: dist.mean,
      median: dist.median,
      avgGames,
      method: 'lognormal',
      basis: `${dist.source}（平均${dist.mean}／中央${dist.median}・対数正規）`,
    }
  }
  return {
    rate: 1 / Math.E,
    mean: null,
    median: null,
    avgGames: null,
    method: 'exponential',
    basis: '実践中央値未公開のため指数近似（P=1/e）。分布が出次第差し替え',
  }
}
