"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Settings } from "lucide-react"

export default function AdminAssessments() {
  const templates = [
    { id: 1, name: "React Fundamentals", category: "Technical", uses: 450 },
    { id: 2, name: "System Design", category: "Architecture", uses: 120 },
    { id: 3, name: "Product Management Case", category: "Case Study", uses: 85 },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Templates</h1>
          <p className="text-muted-foreground mt-1">Manage standard test templates used across the platform.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>Used {template.uses} times</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Settings className="w-4 h-4" /> Edit Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
