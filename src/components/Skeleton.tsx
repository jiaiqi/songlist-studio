function SkeletonStat() {
  return (
    <div className="skeleton skeleton-card">
      <div className="skeleton skeleton-title" style={{ width: '40%', marginBottom: '16px' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  )
}

function SkeletonRow({ columns = 3 }: { columns?: number }) {
  return (
    <div
      className="skeleton-row"
      style={{
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        padding: '14px 0',
        alignItems: 'center',
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={`skeleton-col-${i}`}
          className="skeleton skeleton-text"
          style={{ width: i === 0 ? '80%' : '60%' }}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return <div className="skeleton skeleton-card" />
}

export { SkeletonCard, SkeletonRow, SkeletonStat }
