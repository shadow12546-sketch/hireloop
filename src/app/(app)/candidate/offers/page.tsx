"use client"
import { offerService } from "@/services/offerService"

import { useState, useEffect } from "react"
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
        <div className="text-center py-20 border rounded-2xl bg-card">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No offers yet</h3>
          <p className="text-muted-foreground mt-1">Keep up the great work in your interviews!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => (
            <Card key={offer.id} className={`overflow-hidden transition-colors ${offer.status === 'Accepted' ? 'border-green-500/50' : offer.status === 'Rejected' ? 'border-destructive/50' : 'hover:border-primary/50'}`}>
              <div className={`px-6 py-3 border-b flex justify-between items-center ${
                offer.status === 'Accepted' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                offer.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                'bg-primary/5 text-primary'
              }`}>
                <span className="font-bold flex items-center gap-2">
                  {offer.status === 'Accepted' && <CheckCircle2 className="w-4 h-4" />}
                  {offer.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                  {offer.status === 'Pending' ? 'Action Required' : offer.status}
                </span>
                {offer.status === 'Pending' && <span className="text-sm font-medium">Expires {new Date(offer.expires).toLocaleDateString()}</span>}
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
                    
                    {offer.status === 'Pending' && (
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
                    )}
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
