"use client"
import { offerService } from "@/services/offerService"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Award, Send, Edit, MoreHorizontal } from "lucide-react"

export default function RecruiterOffers() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [form, setForm] = useState({
    candidate: "",
    role: "",
    salary: "",
    joiningDate: "",
    benefits: "Standard Health, 401k, 20 PTO days"
  })

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const newOffer = {
      id: Math.random().toString(),
      candidate: form.candidate,
      role: form.role,
      salary: form.salary,
      joiningDate: form.joiningDate,
      status: "Sent"
    }
    setOffers([newOffer, ...offers])
    setIsCreating(false)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offer Management</h1>
          <p className="text-muted-foreground mt-1">Generate and track job offers.</p>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : <><Award className="w-4 h-4" /> Create New Offer</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-green-500/50 animate-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Draft Job Offer</CardTitle>
            <CardDescription>Enter the final details for the selected candidate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Candidate Name</label>
                  <Input required placeholder="e.g. John Doe" value={form.candidate} onChange={e => setForm({...form, candidate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input required placeholder="e.g. Senior React Developer" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary / Compensation</label>
                  <Input required placeholder="e.g. $130,000" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Joining Date</label>
                  <Input required type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Benefits Overview</label>
                  <Input required value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="button" variant="secondary" className="gap-2">Preview Letter</Button>
                <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Send className="w-4 h-4" /> Send Offer to Candidate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Track Offers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-y">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Salary Offered</th>
                  <th className="px-6 py-4">Joining Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offers.length > 0 ? (
                  offers.map(offer => (
                    <tr key={offer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{offer.candidate}</td>
                      <td className="px-6 py-4">{offer.role}</td>
                      <td className="px-6 py-4">{offer.salary}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(offer.joiningDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={
                          offer.status === 'Accepted' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 
                          offer.status === 'Sent' || offer.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 
                          'bg-muted text-muted-foreground'
                        }>
                          {offer.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No offers have been sent out.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
