import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApplicationTimelineProps {
  stages: string[]
  currentStageIndex: number
}

export function ApplicationTimeline({ stages, currentStageIndex }: ApplicationTimelineProps) {
  return (
    <div className="relative pt-6 pb-2">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full hidden sm:block" />
      <div 
        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500" 
        style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }} 
      />
      
      <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex
          const isCurrent = index === currentStageIndex
          
          return (
            <div key={stage} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10">
              <div className="sm:hidden absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-muted z-[-1]" />
              {index < currentStageIndex && (
                <div className="sm:hidden absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-primary z-[-1]" />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isCompleted ? "bg-primary text-primary-foreground" : "bg-card border-2 border-muted text-muted-foreground"
              )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              
              <div className={cn(
                "text-sm font-medium",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
