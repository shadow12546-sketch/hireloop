import { apiClient, IS_MOCK } from "@/lib/apiClient"
import { mockAiResults, type AiAnalysisResult } from "@/lib/mockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const aiService = {
  analyzeCandidate: async (applicationId: string): Promise<AiAnalysisResult> => {
    if (IS_MOCK) {
      await delay(1200)
      // Return mock data if it exists, otherwise generate a realistic placeholder
      if (mockAiResults[applicationId]) {
        return mockAiResults[applicationId]
      }
      return {
        matchScore: Math.floor(Math.random() * 30) + 65, // 65-94
        strengths: ["Strong relevant experience", "Good cultural fit potential"],
        missingSkills: ["Specific framework knowledge"],
        skillGaps: ["Leadership experience"],
        recommendations: ["Probe deeper on system design during interview"],
      }
    }
    
    // In production, this might route through our backend which then calls the AI service
    // Or call the AI service directly if NEXT_PUBLIC_AI_SERVICE_URL is configured
    const AI_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL
    if (AI_URL) {
      const res = await fetch(`${AI_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId })
      })
      if (!res.ok) throw new Error("AI analysis failed")
      return res.json()
    }
    
    return apiClient.post<AiAnalysisResult>(`/ai/analyze/${applicationId}`, {})
  }
}
