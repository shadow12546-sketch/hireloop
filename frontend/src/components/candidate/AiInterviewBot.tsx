"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Send, Bot, User, Loader2, CheckCircle2 } from "lucide-react"
import { aiService } from "@/services/aiService"

interface Message {
  id: string
  role: "bot" | "candidate"
  text: string
}

export function AiInterviewBot({ sessionId = "demo_session", onComplete }: { sessionId?: string; onComplete?: (summary: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg_1", role: "bot", text: "Hello! I'm your AI interviewer. To get started, could you briefly introduce yourself and highlight a project you are most proud of?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || finished) return

    const userMessage: Message = { id: Date.now().toString(), role: "candidate", text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await aiService.conductInterview(sessionId, userMessage.text)
      
      const botMessage: Message = { id: Date.now().toString(), role: "bot", text: response.reply }
      setMessages(prev => [...prev, botMessage])
      
      if (response.finished) {
        setFinished(true)
        if (response.summary) setSummary(response.summary)
        if (onComplete) onComplete({ status: "completed", messageCount: messages.length + 1 })
      }
    } catch (error) {
      console.error("Interview error", error)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text: "AI temporarily unavailable, please retry" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[600px] shadow-lg border-primary/20">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <CardTitle>AI Pre-Screening Interview</CardTitle>
            <CardDescription>Session ID: {sessionId}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        {summary ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-between">
               <h3 className="font-bold text-lg">Interview Completed</h3>
               <span className="text-2xl font-black">{summary.overallScore}/100</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
               <div className="space-y-2 p-3 bg-muted rounded-lg">
                 <h4 className="font-semibold border-b pb-1">Summary</h4>
                 <p className="text-muted-foreground">{summary.summary}</p>
               </div>
               <div className="space-y-2 p-3 bg-muted rounded-lg">
                 <h4 className="font-semibold border-b pb-1">Recommendation</h4>
                 <p className="text-muted-foreground">{summary.recommendation}</p>
               </div>
               <div className="space-y-2 p-3 bg-muted rounded-lg">
                 <h4 className="font-semibold border-b pb-1">Strengths</h4>
                 <ul className="list-disc pl-4 text-muted-foreground">{summary.strengths.map((s:string, i:number)=><li key={i}>{s}</li>)}</ul>
               </div>
               <div className="space-y-2 p-3 bg-muted rounded-lg">
                 <h4 className="font-semibold border-b pb-1">Areas for Improvement</h4>
                 <ul className="list-disc pl-4 text-muted-foreground">{summary.weaknesses.map((w:string, i:number)=><li key={i}>{w}</li>)}</ul>
               </div>
            </div>
            <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
               <h4 className="font-semibold border-b pb-1">Assessments</h4>
               <p className="text-muted-foreground"><strong className="text-foreground">Technical:</strong> {summary.technicalAssessment}</p>
               <p className="text-muted-foreground"><strong className="text-foreground">Communication:</strong> {summary.communicationAssessment}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "candidate" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "bot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.role === "bot" ? "bg-muted text-foreground rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-muted rounded-tl-none flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 border-t bg-background">
        {finished ? (
          <div className="w-full p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Interview Completed Successfully</span>
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex w-full items-center space-x-2"
          >
            <Input 
              type="text" 
              placeholder="Type your answer here..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={loading || finished}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || loading || finished} className="shrink-0 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  )
}
