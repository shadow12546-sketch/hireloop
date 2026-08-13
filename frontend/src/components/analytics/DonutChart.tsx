"use client"

import { useState } from "react"
import type { StatusDistribution } from "@/services/analyticsService"

interface DonutChartProps {
  data: StatusDistribution[]
  size?: number
  strokeWidth?: number
}

export function DonutChart({ data, size = 160, strokeWidth = 28 }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data available.
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Build arc segments
  let cumulative = 0
  const segments = data.map((d, i) => {
    const pct = d.count / total
    const offset = circumference * (1 - cumulative)
    const arc = circumference * pct
    cumulative += pct
    return { ...d, pct, offset, arc, index: i }
  })

  const hoveredSegment = hovered !== null ? segments[hovered] : null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut SVG */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Application status distribution donut chart"
          role="img"
          className="rotate-[-90deg]"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${seg.arc} ${circumference - seg.arc}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hoveredSegment ? (
            <>
              <p className="text-xl font-bold">{hoveredSegment.count}</p>
              <p className="text-[10px] text-muted-foreground leading-tight max-w-[60px]">{hoveredSegment.label}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold">{total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors cursor-default ${hovered === i ? "bg-muted/60" : "hover:bg-muted/30"}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-muted-foreground truncate">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold">{seg.count}</span>
              <span className="text-xs text-muted-foreground">{(seg.pct * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
