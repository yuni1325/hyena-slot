import type { ClosingCorrection } from '../lib/closingCorrection'
import { CLOSING_GAMES_PER_HOUR } from '../lib/closingCorrection'
import { formatMinutes, formatNum, formatRate, rateTone } from '../lib/format'

type Props = {
  closing: ClosingCorrection
  /** AT or ST */
  bonusLabel: 'AT' | 'ST'
}

/** 閉店補正の結果行（期待出玉率＝補正後を主表示） */
export default function ClosingCorrectionRows({
  closing,
  bonusLabel,
}: Props) {
  return (
    <>
      <div
        className={`result-row result-row-kaba is-blend tone-${rateTone(closing.correctedPayoutRate)}`}
      >
        <span className="mode">期待出玉率（閉店補正後）</span>
        <span className="rate">{formatRate(closing.correctedPayoutRate)}</span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">補正前出玉率</span>
        <span>{formatRate(closing.rawPayoutRate)}</span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">閉店補正係数</span>
        <span>
          {closing.closingFactor <= 0 && closing.rawPayoutRate == null
            ? '—'
            : `${(closing.closingFactor * 100).toFixed(0)}%`}
        </span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">閉店まで打てる目安</span>
        <span>
          {formatNum(closing.availableGames, 0)}G（
          {formatMinutes(closing.availableMinutes)}）
        </span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">初当たりまで平均時間</span>
        <span>{formatMinutes(closing.avgMinutesToHit)}</span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">{bonusLabel}回せる時間</span>
        <span>
          {formatMinutes(closing.minutesForAtSt)}
          {closing.atStMinutesNeeded != null
            ? `（必要目安 ${formatMinutes(closing.atStMinutesNeeded)}）`
            : ''}
        </span>
      </div>
      <p className="inline-note">
        換算: 1時間≈{CLOSING_GAMES_PER_HOUR}
        G。必要量＝（初当平均G＋{bonusLabel}所要G）×1.1 に対する充足率で出玉率を掛ける（保守）。
      </p>
    </>
  )
}
