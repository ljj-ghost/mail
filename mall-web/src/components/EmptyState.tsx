import { Link } from 'react-router-dom'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="section-title__eyebrow">当前状态</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel ? (
        actionHref ? (
          <Link className="button button--primary" to={actionHref}>
            {actionLabel}
          </Link>
        ) : (
          <button className="button button--primary" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  )
}
