"use client"

import { useState } from "react"
import type { MonthlyTrend } from "@/services/analyticsService"

interface TrendBarChartProps {
  data: MonthlyTrend[]
  /** Which key to visualize, defaults to "applications" */
  metric?: "applications" | "hires" | "interviews"
}

const METRIC_CONFIG = {
  applications: { label: "Applications", color: "bg-primary", hoverColor: "bg-primary/80", textColor: "text-primary" },
  hires:        { label: "Hires",        color: "bg-green-500", hoverColor: "bg-green-400", textColor: "text-green-600 dark:text-green-400" },
  interviews:   { label: "Interviews",   color: "bg-violet-500", hoverColor: "bg-violet-400", textColor: "text-violet-600 dark:text-violet-400" },
}

export function TrendBarChart({ data, metric = "applications" }: TrendBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const config = METRIC_CONFIG[metric]

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No trend data available for this period.
      </div>
    )
  }

  const max = Math.max(...data.map(d => d[metric]))

  return (
    <div className="relative">
      {/* Y-axis grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
        {[100, 75, 50, 25, 0].map(pct => (
          <div key={pct} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">
              {Math.round((pct / 100) * max)}
            </span>
            <div className="flex-1 border-t border-border/40 border-dashed" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex h-48 items-end justify-between gap-1 pl-10 pb-8 relative">
        {data.map((d, i) => {
          const heightPct = max > 0 ? (d[metric] / max) * 100 : 0
          const isHovered = hoveredIndex === i
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-end flex-1 h-full gap-1 group cursor-default"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 bg-popover border text-popover-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-lg z-10 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <p className="font-semibold">{d.month} {d.year}</p>
                  <p className={config.textColor}>{config.label}: <strong>{d[metric]}</strong></p>
                </div>
              )}
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${isHovered ? config.hoverColor : config.color}`}
                style={{ height: `${Math.max(heightPct, 2)}%` }}
                role="img"
                aria-label={`${d.month}: ${d[metric]} ${metric}`}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between pl-10 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center">{d.month}</span>
        ))}
      </div>
    </div>
  )
}
