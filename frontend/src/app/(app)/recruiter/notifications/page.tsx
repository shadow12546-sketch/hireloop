"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Users, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react"

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([
    { id: "1", title: "New Application", message: "John Doe applied for Senior React Developer.", type: "application", time: "2 hours ago", read: false },
    { id: "2", title: "Assessment Completed", message: "Alice Johnson completed the technical assessment with score 92/100.", type: "assessment", time: "5 hours ago", read: false },
    { id: "3", title: "Offer Accepted", message: "Bob Wilson accepted the offer for Backend Engineer. Joining on Sep 1st.", type: "offer", time: "1 day ago", read: true },
    { id: "4", title: "Action Required", message: "Jane Smith requires technical round feedback.", type: "alert", time: "2 days ago", read: true },
  ])

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'application': return <Users className="w-5 h-5 text-blue-500" />
      case 'assessment': return <MessageSquare className="w-5 h-5 text-purple-500" />
      case 'offer': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'alert': return <AlertCircle className="w-5 h-5 text-amber-500" />
      default: return <Bell className="w-5 h-5 text-primary" />
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your hiring pipeline.</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <Card 
            key={notif.id} 
            className={`transition-all duration-300 ${!notif.read ? 'bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10' : 'bg-card'}`}
            onClick={() => !notif.read && markAsRead(notif.id)}
          >
            <CardContent className="p-4 sm:p-6 flex gap-4 items-start">
              <div className={`p-3 rounded-full shrink-0 ${!notif.read ? 'bg-background shadow-sm' : 'bg-muted/50'}`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                  <h3 className={`font-medium truncate pr-4 ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className={`text-sm ${!notif.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                  {notif.message}
                </p>
              </div>
              
              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
