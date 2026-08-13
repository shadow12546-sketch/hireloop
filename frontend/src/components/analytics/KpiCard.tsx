"use client"

import { Card, CardContent } from "@/components/ui/card"

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  bg: string
  suffix?: string
  trend?: { value: number; positive: boolean }
}

export function KpiCard({ label, value, icon: Icon, color, bg, suffix, trend }: KpiCardProps) {
  return (
    <Card className="hover:border-primary/40 transition-colors group">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground leading-tight group-hover:text-foreground transition-colors">
            {label}
          </p>
          <div className={`p-2 rounded-lg shrink-0 ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold tabular-nums">
            {value}{suffix && <span className="text-base font-medium text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
          {trend && (
            <span className={`text-xs font-semibold ${trend.positive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
