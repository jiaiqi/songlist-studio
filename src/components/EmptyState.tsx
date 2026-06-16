import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  children?: ReactNode
  variant?: 'workflow' | 'inline'
}

function EmptyState({ title, description, children, variant = 'workflow' }: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div className="empty-state inline">
        <p className="empty-state-title">{title}</p>
        {description ? <p className="empty-state-description">{description}</p> : null}
        {children}
      </div>
    )
  }

  return (
    <section className="empty-state workflow">
      <h2>{title}</h2>
      {description ? <p className="summary compact">{description}</p> : null}
      {children}
    </section>
  )
}

export default EmptyState
