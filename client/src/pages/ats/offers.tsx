import { useState } from "react";
import { FileSignature, Send, CheckCircle2, XCircle } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { FormDialog } from "@/components/hr/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { offers, candidates, jobOpenings, type Offer } from "@/lib/mock-data-ats";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky-100 text-sky-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700",
};

export default function AtsOffers() {
  const isLoading = useSimulatedLoading(700);
  const [offerData, setOfferData] = useState(offers);
  const [preview, setPreview] = useState<Offer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sent = offerData.filter(o => o.status === "sent").length;
  const accepted = offerData.filter(o => o.status === "accepted").length;
  const declined = offerData.filter(o => o.status === "declined").length;
  const awaiting = offerData.filter(o => o.status === "sent").length;

  const handleMarkAccepted = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" as const } : o));
  const handleMarkDeclined = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "declined" as const } : o));
  const handleSend = (id: string) => setOfferData(prev => prev.map(o => o.id === id ? { ...o, status: "sent" as const } : o));

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Offers</h1>
            <p className="text-sm text-muted-foreground">Manage offer letters and candidate responses</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700" data-testid="create-offer-btn">
            <FileSignature className="size-4 mr-2" /> Create Offer
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Offers Sent", value: sent + accepted + declined, color: "text-violet-600" },
            { label: "Accepted", value: accepted, color: "text-emerald-600" },
            { label: "Declined", value: declined, color: "text-red-600" },
            { label: "Awaiting Response", value: awaiting, color: "text-sky-600" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground mt-0.5">{s.label}</p></CardContent></Card>
          ))}
        </div>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Candidate</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Offered Salary</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joining Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Expiry</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offerData.map(offer => (
                  <tr key={offer.id} className="hover:bg-muted/20" data-testid={`offer-row-${offer.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{offer.candidateName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{offer.jobTitle}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{offer.offeredSalary.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{offer.joiningDate}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{offer.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[offer.status]}`}>{offer.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreview(offer)} data-testid={`preview-offer-${offer.id}`}>Preview</Button>
                        {offer.status === "draft" && (
                          <button onClick={() => handleSend(offer.id)} className="p-1.5 rounded hover:bg-sky-100 text-sky-600 transition-colors" title="Send Offer" data-testid={`send-offer-${offer.id}`}>
                            <Send className="size-3.5" />
                          </button>
                        )}
                        {offer.status === "sent" && (
                          <>
                            <button onClick={() => handleMarkAccepted(offer.id)} className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors" title="Mark Accepted" data-testid={`accept-offer-${offer.id}`}>
                              <CheckCircle2 className="size-3.5" />
                            </button>
                            <button onClick={() => handleMarkDeclined(offer.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Mark Declined" data-testid={`decline-offer-${offer.id}`}>
                              <XCircle className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {offerData.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No offers created yet</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Offer Letter Preview</DialogTitle></DialogHeader>
          {preview && (
            <div className="border rounded-xl p-6 space-y-4 text-sm font-serif">
              <div className="text-center space-y-1">
                <p className="font-bold text-lg text-violet-700">TeamSync</p>
                <p className="text-xs text-muted-foreground">Official Offer Letter</p>
              </div>
              <Separator />
              <p>Dear <strong>{preview.candidateName}</strong>,</p>
              <p>We are pleased to extend an offer of employment for the position of <strong>{preview.jobTitle}</strong> at TeamSync.</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Annual CTC</span><span className="font-bold text-emerald-600">₹{preview.offeredSalary.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joining Date</span><span className="font-semibold">{preview.joiningDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Offer Valid Till</span><span className="font-semibold">{preview.expiryDate}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">This offer is contingent upon successful completion of background verification. Please sign and return this letter by the expiry date.</p>
              <div className="flex justify-between pt-2 text-xs text-muted-foreground border-t">
                <span>HR Department</span>
                <span>TeamSync · Bengaluru</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FormDialog title="Create Offer" description="Prepare an offer letter for a candidate" open={createOpen} onOpenChange={setCreateOpen}>
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Candidate</label>
            <Select><SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
              <SelectContent>{candidates.slice(0, 10).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Job Opening</label>
            <Select><SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
              <SelectContent>{jobOpenings.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Offered Salary (₹ annual)</label><Input type="number" placeholder="e.g. 1800000" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Joining Date</label><Input type="date" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Offer Expiry</label><Input type="date" /></div>
          </div>
        </div>
        <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700" data-testid="submit-offer">Create Offer</Button>
      </FormDialog>
    </PageTransition>
  );
}
