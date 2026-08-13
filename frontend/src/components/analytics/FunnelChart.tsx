"use client"

import type { FunnelStage } from "@/services/analyticsService"

interface FunnelChartProps {
  data: FunnelStage[]
}

const STAGE_COLORS = [
  "from-blue-500 to-blue-600",
  "from-indigo-500 to-indigo-600",
  "from-violet-500 to-violet-600",
  "from-purple-500 to-purple-600",
  "from-fuchsia-500 to-fuchsia-600",
  "from-pink-500 to-pink-600",
]

const STAGE_BG = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
  "bg-pink-500/10 text-pink-700 dark:text-pink-400",
]

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No funnel data available.
      </div>
    )
  }

  const maxCount = data[0].count

  return (
    <div className="space-y-2 py-2">
      {data.map((stage, index) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 12)
        const color = STAGE_COLORS[index % STAGE_COLORS.length]
        const bg = STAGE_BG[index % STAGE_BG.length]

        return (
          <div key={stage.stage} className="group">
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className={`h-11 rounded-lg bg-gradient-to-r ${color} flex items-center justify-between px-4 text-white transition-all duration-700 shadow-sm cursor-default`}
                style={{ width: `${widthPct}%`, minWidth: "10rem" }}
                role="img"
                aria-label={`${stage.stage}: ${stage.count} candidates`}
              >
                <span className="font-medium text-sm truncate opacity-90 hidden sm:block">{stage.stage}</span>
                <span className="font-bold text-lg">{stage.count.toLocaleString()}</span>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {stage.conversionFromPrev !== null && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${bg}`}>
                    ↓ {stage.conversionFromPrev}% conv.
                  </span>
                )}
                <span className="text-xs text-muted-foreground hidden md:block">
                  {((stage.count / maxCount) * 100).toFixed(0)}% of total
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
