"use client"
import { notificationService } from "@/services/notificationService"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Briefcase, Calendar, CheckCircle2, MessageSquare } from "lucide-react"

export default function CandidateNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationService.getNotifications()
        setNotifications(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'interview': return <Calendar className="w-5 h-5 text-amber-500" />
      case 'status': return <Briefcase className="w-5 h-5 text-blue-500" />
      case 'message': return <MessageSquare className="w-5 h-5 text-green-500" />
      default: return <Bell className="w-5 h-5 text-primary" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your applications and interviews.</p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any new notifications right now.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  )
}
