import { useState } from "react";
import { Plus, MoreHorizontal, MessageSquare, DollarSign, Calendar } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { faireRetailerLeads, type RetailerLead, type RetailerLeadStage } from "@/lib/mock-data-faire";

const BRAND_COLOR = "#1A6B45";

const stages: RetailerLeadStage[] = ["Prospect", "Outreach", "Demo Scheduled", "Proposal Sent", "Partner Signed"];

export default function FairePipeline() {
  const isLoading = useSimulatedLoading(600);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-32 bg-muted rounded-xl w-full" />
              <div className="h-32 bg-muted rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6 overflow-hidden flex flex-col h-full">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Retailer Pipeline</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage the acquisition funnel for new retail partners</p>
          </div>
          <Button 
            style={{ backgroundColor: BRAND_COLOR }} 
            className="text-white hover-elevate" 
            data-testid="button-add-pipeline-lead"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </div>
      </Fade>

      <Fade className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-full">
          {stages.map((stage) => {
            const stageLeads = faireRetailerLeads.filter(l => l.stage === stage);
            const stageTotalValue = stageLeads.reduce((acc, curr) => acc + curr.dealValue, 0);

            return (
              <div key={stage} className="flex-1 flex flex-col min-w-[240px]">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{stage}</h3>
                    <Badge variant="secondary" className="rounded-full h-5 px-1.5 text-[10px]">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Value: ${stageTotalValue.toLocaleString()}</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-2 flex-1 flex flex-col gap-3 min-h-[500px]">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="hover-elevate cursor-grab active:cursor-grabbing" data-testid={`lead-card-${lead.id}`}>
                      <CardContent className="p-3 space-y-3">
                        <div>
                          <p className="font-bold text-sm leading-tight">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lead.storeType}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center text-[10px] text-emerald-600 font-bold">
                            <DollarSign size={10} className="mr-0.5" />
                            {lead.dealValue.toLocaleString()}
                          </div>
                          <div className="flex items-center text-[10px] text-muted-foreground">
                            <Calendar size={10} className="mr-1" />
                            {lead.daysInStage}d
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-muted">
                          <Badge variant="outline" className="text-[9px] font-normal py-0">
                            {lead.source}
                          </Badge>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <MoreHorizontal size={12} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Fade>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Retailer Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs">Retailer</Label>
              <Input id="name" placeholder="Store Name" className="col-span-3 h-8 text-sm" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-xs">Store Type</Label>
              <Input id="type" placeholder="Boutique, Gift Shop, etc." className="col-span-3 h-8 text-sm" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right text-xs">Deal Value</Label>
              <Input id="value" type="number" placeholder="5000" className="col-span-3 h-8 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button size="sm" style={{ backgroundColor: BRAND_COLOR }} className="text-white" onClick={() => setIsAddDialogOpen(false)}>Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
