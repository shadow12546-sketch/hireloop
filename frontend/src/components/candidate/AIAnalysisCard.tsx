import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AIAnalysisCardProps {
  score: number
  strengths: string[]
  gaps: string[]
  recommendation: string
}

export function AIAnalysisCard({ score, strengths, gaps, recommendation }: AIAnalysisCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          AI Match Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-background border-4 border-primary">
            <span className="text-xl font-bold text-primary">{score}%</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Overall Match Score</h4>
            <Progress value={score} className="h-2" />
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {strengths.map((str, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  {str}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Skill Gaps
            </h4>
            <ul className="space-y-1">
              {gaps.length > 0 ? (
                gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {gap}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No significant gaps found.</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="p-3 bg-background rounded-lg border text-sm font-medium">
          <span className="text-muted-foreground mr-2">Recommendation:</span>
          {recommendation}
        </div>
      </CardContent>
    </Card>
  )
}
