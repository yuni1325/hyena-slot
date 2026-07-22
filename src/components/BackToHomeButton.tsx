import { Link } from 'react-router-dom'

type Props = {
  /** ページ下部用の余白 */
  footer?: boolean
}

/** 機種ページからホーム（機種一覧）へ戻る */
export default function BackToHomeButton({ footer = false }: Props) {
  return (
    <p className={`back-home-wrap${footer ? ' is-footer' : ''}`}>
      <Link to="/" className="back-home">
        ← TOPへ戻る
      </Link>
    </p>
  )
}
