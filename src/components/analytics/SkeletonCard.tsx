export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-muted/50 ${className}`} />
  )
}

export function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} className="h-28" />
      ))}
    </div>
  )
}

export function SkeletonChartCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-6 animate-pulse space-y-4 ${className}`}>
      <div className="h-4 bg-muted/60 rounded w-1/3" />
      <div className="h-3 bg-muted/40 rounded w-1/2" />
      <div className="h-48 bg-muted/30 rounded-xl mt-4" />
    </div>
  )
}
