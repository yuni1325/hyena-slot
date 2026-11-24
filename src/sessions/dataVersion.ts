/**
 * 稼働記録の期待出玉率をどのデータ版で計算するか。
 * 機種データを更新しても、過去の記録を旧データでも見直せるようにする。
 * 端末ごとの表示設定なので localStorage に保存（失敗しても既定値で動く）。
 */

export type DataVersionPref = 'latest' | 'legacy'

export const DATA_VERSION_PREF_LABEL: Record<DataVersionPref, string> = {
  latest: '最新データ',
  legacy: '旧データ',
}

const KEY = 'hyena-slot.dataVersion.v1'

export function loadDataVersionPref(): DataVersionPref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'legacy' ? 'legacy' : 'latest'
  } catch {
    return 'latest'
  }
}

export function saveDataVersionPref(v: DataVersionPref): void {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    // 保存できなくても表示は切り替わる
  }
}

export function otherVersion(v: DataVersionPref): DataVersionPref {
  return v === 'latest' ? 'legacy' : 'latest'
}
