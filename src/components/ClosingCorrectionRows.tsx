import type { ClosingCorrection } from '../lib/closingCorrection'
import { CLOSING_GAMES_PER_HOUR } from '../lib/closingCorrection'
import {
  getAvgMedalReach,
  type AvgMedalReachInfo,
} from '../lib/avgMedalReach'
import { formatMinutes, formatNum, formatRate, rateTone } from '../lib/format'

type Props = {
  closing: ClosingCorrection
  /** AT or ST */
  bonusLabel: 'AT' | 'ST'
  /** catalog の機種 id */
  machineId: string
  /** AT/ST 純増（枚/G）。平均継続Gの表示用 */
  pureIncPerGame: number
}

function formatReach(info: AvgMedalReachInfo): string {
  return `${(info.rate * 100).toFixed(0)}%`
}

/** 閉店補正の結果行（期待出玉率＝補正後を主表示） */
export default function ClosingCorrectionRows({
  closing,
  bonusLabel,
  machineId,
  pureIncPerGame,
}: Props) {
  const reach = getAvgMedalReach(machineId, pureIncPerGame)

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
          {closing.rawPayoutRate == null && closing.closingFactor <= 0
            ? '—'
            : `${(closing.closingFactor * 100).toFixed(0)}%`}
        </span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">平均獲得枚数への到達割合</span>
        <span>{formatReach(reach)}</span>
      </div>
      {reach.mean != null && reach.median != null && (
        <div className="result-row result-row-kaba">
          <span className="mode">実践・平均／中央値</span>
          <span>
            {formatNum(reach.mean, 0)}枚 / {formatNum(reach.median, 0)}枚
            {reach.avgGames != null
              ? `（平均約${formatNum(reach.avgGames, 0)}G）`
              : ''}
          </span>
        </div>
      )}
      <div className="result-row result-row-kaba">
        <span className="mode">初当確率×閉店{bonusLabel}完走</span>
        <span>
          {(closing.hitProbability * 100).toFixed(0)}% ×{' '}
          {(closing.atCompleteFraction * 100).toFixed(0)}%
        </span>
      </div>
      <div className="result-row result-row-kaba">
        <span className="mode">閉店補正後の期待獲得出玉</span>
        <span>{formatNum(closing.correctedWinMedals, 1)}枚</span>
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
        到達割合＝初当1回が平均枚数以上になる目安（{reach.basis}
        ）。期待値の分子には未使用。閉店完走は別（当たり時刻平均×1.2、
        {bonusLabel}所要×1.15、1時間≈{CLOSING_GAMES_PER_HOUR}
        G）。係数＝初当確率×閉店完走率。
      </p>
    </>
  )
}
