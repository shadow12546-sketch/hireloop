"use client"

interface FunnelData {
  applied: number
  screening: number
  shortlisted: number
  interview: number
  offer: number
  hired: number
}

interface HiringFunnelProps {
  data: FunnelData
}

export function HiringFunnel({ data }: HiringFunnelProps) {
  const max = data.applied
  
  const steps = [
    { label: "Applied", value: data.applied, color: "bg-blue-500" },
    { label: "Screening", value: data.screening, color: "bg-indigo-500" },
    { label: "Shortlisted", value: data.shortlisted, color: "bg-violet-500" },
    { label: "Interview", value: data.interview, color: "bg-purple-500" },
    { label: "Offer", value: data.offer, color: "bg-fuchsia-500" },
    { label: "Hired", value: data.hired, color: "bg-pink-500" },
  ]

  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-4">
      {steps.map((step, index) => {
        const width = Math.max((step.value / max) * 100, 15) // minimum 15% width
        return (
          <div key={step.label} className="w-full flex flex-col items-center group relative">
            <div 
              className={`h-12 ${step.color} rounded-sm flex items-center justify-between px-4 text-white transition-all duration-500 shadow-sm`}
              style={{ width: `${width}%` }}
            >
              <span className="font-medium text-sm hidden sm:block truncate opacity-90">{step.label}</span>
              <span className="font-bold">{step.value}</span>
            </div>
            
            {/* Tooltip for mobile or smaller widths */}
            <div className="sm:hidden absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {step.label}: {step.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
