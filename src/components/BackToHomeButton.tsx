import { Link } from 'react-router-dom'

type Props = {
  /** ページ下部用の余白 */
  footer?: boolean
}

/** 機種ページから機種ランキング（参考ページ）へ戻る */
export default function BackToHomeButton({ footer = false }: Props) {
  return (
    <p className={`back-home-wrap${footer ? ' is-footer' : ''}`}>
      <Link to="/ranking" className="back-home">
        ← 機種ランキングへ
      </Link>
    </p>
  )
}
