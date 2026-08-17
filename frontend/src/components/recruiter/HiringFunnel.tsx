"use client"

interface FunnelStage {
  stage: string
  count: number
  conversionFromPrev?: number | null
}

interface HiringFunnelProps {
  data: FunnelStage[]
}

export function HiringFunnel({ data }: HiringFunnelProps) {
  if (!data || data.length === 0) return <div className="text-sm text-muted-foreground">No data available</div>
  
  // Find max value to calculate widths
  const max = Math.max(...data.map(d => d.count), 1)
  
  const defaultColors = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500"
  ]

  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-4">
      {data.map((step, index) => {
        const width = Math.max((step.count / max) * 100, 15) // minimum 15% width
        const color = defaultColors[index % defaultColors.length]
        
        return (
          <div key={step.stage} className="w-full flex flex-col items-center group relative">
            <div 
              className={`h-12 ${color} rounded-sm flex items-center justify-between px-4 text-white transition-all duration-500 shadow-sm`}
              style={{ width: `${width}%` }}
            >
              <span className="font-medium text-sm hidden sm:block truncate opacity-90">{step.stage}</span>
              <span className="font-bold">{step.count}</span>
            </div>
            
            {/* Tooltip for mobile or smaller widths */}
            <div className="sm:hidden absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {step.stage}: {step.count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

