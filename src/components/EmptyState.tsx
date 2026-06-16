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
      <div className="empty-state">
        <p>{title}</p>
        {children}
      </div>
    )
  }

  return (
    <section className="empty-workflow">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
    </section>
  )
}

export default EmptyState
