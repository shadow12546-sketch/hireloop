"use client"
import { offerService } from "@/services/offerService"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Building2, DollarSign, Clock, Download, CheckCircle2, XCircle } from "lucide-react"

export default function CandidateOffers() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await offerService.getOffers()
        setOffers(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setProcessing(id)
    await new Promise(r => setTimeout(r, 1000))
    setOffers(offers.map(o => o.id === id ? { ...o, status: action === 'accept' ? 'Accepted' : 'Rejected' } : o))
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Offers</h1>
        <p className="text-muted-foreground mt-1">Review and respond to your job offers.</p>
      </div>

      {offers.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-primary opacity-80" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No offers yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Keep up the great work in your interviews! Job offers will appear here when you receive them.
            </p>
            <Button render={<Link href="/candidate/applications" />} className="h-9 px-4 shadow-sm" variant="outline">
              Track Applications
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <Card key={offer.id} className={`overflow-hidden transition-colors ${offer.status === 'Accepted' ? 'border-green-500/50' : offer.status === 'Rejected' ? 'border-destructive/50' : 'hover:border-primary/50'}`}>
              <div className={`px-6 py-3 border-b flex justify-between items-center ${
                offer.status === 'Accepted' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                offer.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                offer.status === 'Expired' ? 'bg-muted/50 text-muted-foreground' :
                'bg-primary/5 text-primary'
              }`}>
                <span className="font-bold flex items-center gap-2">
                  {offer.status === 'Accepted' && <CheckCircle2 className="w-4 h-4" />}
                  {offer.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                  {offer.status === 'Pending' || offer.status === 'Sent' || offer.status === 'Viewed' ? 'Action Required' : offer.status}
                </span>
                {(offer.status === 'Pending' || offer.status === 'Sent' || offer.status === 'Viewed') && <span className="text-sm font-medium">Expires {new Date(offer.expires).toLocaleDateString()}</span>}
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{offer.jobTitle}</h3>
                      <div className="flex items-center text-muted-foreground text-lg">
                        <Building2 className="w-5 h-5 mr-2" />
                        <span>{offer.company}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 pt-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> Base Salary
                        </p>
                        <p className="text-xl font-semibold">{offer.salary}</p>
                      </div>
                      <div className="space-y-1 border-l pl-6">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="w-4 h-4" /> Equity
                        </p>
                        <p className="text-xl font-semibold">{offer.equity}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-48 shrink-0">
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="w-4 h-4" /> View Offer Letter
                    </Button>
                    
                    {offer.status === 'Pending' || offer.status === 'Sent' || offer.status === 'Viewed' ? (
                      <>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white" 
                          onClick={() => handleAction(offer.id, 'accept')}
                          disabled={processing === offer.id}
                        >
                          {processing === offer.id ? "Processing..." : "Accept Offer"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleAction(offer.id, 'reject')}
                          disabled={processing === offer.id}
                        >
                          Decline
                        </Button>
                      </>
                    ) : offer.status === 'Expired' ? (
                      <Button variant="secondary" className="w-full text-muted-foreground" disabled>
                        Offer Expired
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
