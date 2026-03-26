import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, Clock, MessageSquare, Users, DollarSign, FileText,
} from "lucide-react";
import {
  FORMATION_PACKAGES, SALES_LEADS, SALES_PROPOSALS,
} from "@/lib/mock-data-dashboard-ln";

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "bg-gray-100 text-gray-600",
  "Qualified": "bg-blue-100 text-blue-700",
  "Proposal Sent": "bg-purple-100 text-purple-700",
  "Converted": "bg-green-100 text-green-700",
};

export default function LnSalesPortal() {
  const todayFollowups = SALES_LEADS.filter(l => l.followUp === "Today").length;
  const hotLeads = SALES_LEADS.filter(l => l.hot).length;
  const totalPipelineValue = SALES_LEADS.reduce((s, l) => s + l.value, 0);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-sales-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-pink-200 mb-1">Sales & Business Development</p>
          <h1 className="text-2xl font-bold" data-testid="text-sales-title">Lead Pipeline</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-pink-200">
            <span><strong className="text-white">{SALES_LEADS.length}</strong> Active Leads</span>
            <span><strong className="text-white">{todayFollowups}</strong> Follow-ups Today</span>
            <span><strong className="text-white">{hotLeads}</strong> Hot Leads</span>
            <span><strong className="text-white">${totalPipelineValue.toLocaleString()}</strong> Pipeline Value</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" /> Lead Pipeline
              </CardTitle>
              <Badge variant="outline" className="text-xs">{SALES_LEADS.length} leads</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {SALES_LEADS.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`sales-lead-${lead.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    {lead.hot && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.company} · {lead.state} · {lead.source}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge className={`text-[10px] ${STAGE_COLORS[lead.stage] || "bg-gray-100 text-gray-600"}`} variant="outline">
                    {lead.stage}
                  </Badge>
                  <p className={`text-[10px] font-medium ${lead.followUp === "Today" ? "text-red-500" : "text-muted-foreground"}`}>
                    {lead.followUp === "Today" ? "Follow up now" : lead.followUp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" /> Follow-up Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {SALES_LEADS.filter(l => l.followUp === "Today").map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg border border-red-100 bg-red-50/50" data-testid={`sales-followup-${lead.id}`}>
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.stage} · {lead.company}</p>
                  </div>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1 h-7 text-xs" data-testid={`sales-wa-${lead.id}`}>
                    <MessageSquare className="w-3 h-3" /> WA
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> Recent Proposals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {SALES_PROPOSALS.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2" data-testid={`sales-proposal-${p.id}`}>
                  <div>
                    <p className="text-sm font-medium">{p.client}</p>
                    <p className="text-xs text-muted-foreground">{p.package} · {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.amount}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${p.status === "Accepted" ? "border-green-300 text-green-700" : p.status === "Sent" ? "border-blue-300 text-blue-700" : p.status === "Under Review" ? "border-amber-300 text-amber-700" : "border-gray-200 text-gray-500"}`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnSalesPipeline() {
  const stages = ["New Lead", "Qualified", "Proposal Sent", "Converted"];
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Lead Pipeline</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const count = SALES_LEADS.filter(l => l.stage === stage).length;
          return (
            <Card key={stage} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage}</p>
                <p className="text-2xl font-bold mt-1 text-pink-600" data-testid={`sales-pipeline-count-${stage}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {SALES_LEADS.map((lead) => (
          <div key={lead.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors" data-testid={`sales-pipeline-lead-${lead.id}`}>
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-xs">{lead.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm">{lead.name}</p>
                {lead.hot && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{lead.company} · {lead.state} · {lead.source}</p>
            </div>
            <Badge className={`text-xs ${STAGE_COLORS[lead.stage] || ""}`} variant="outline">{lead.stage}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnSalesProposals() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Proposals</h1>
      <div className="space-y-3">
        {SALES_PROPOSALS.map((p) => (
          <Card key={p.id} className="border-0 shadow-sm" data-testid={`sales-proposal-card-${p.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.client}</p>
                <p className="text-sm text-muted-foreground">{p.company} · {p.package} Package · Sent {p.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{p.amount}</p>
                <Badge variant="outline" className="mt-1">{p.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnSalesFollowups() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Follow-up Queue</h1>
      <div className="space-y-3">
        {SALES_LEADS.map((lead) => (
          <div
            key={lead.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${lead.followUp === "Today" ? "border-red-200 bg-red-50/50" : "bg-white"}`}
            data-testid={`sales-followup-item-${lead.id}`}
          >
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-xs">{lead.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{lead.name}</p>
                {lead.hot && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{lead.company} · {lead.stage} · via {lead.source}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lead.followUp === "Today" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {lead.followUp}
              </span>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 gap-1 text-xs" data-testid={`sales-followup-wa-${lead.id}`}>
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnSalesPackages() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Formation Packages</h1>
        <p className="text-sm text-muted-foreground">Packages available for client proposals</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {FORMATION_PACKAGES.map((pkg) => (
          <Card key={pkg.id} className={`border-0 shadow-sm ${pkg.popular ? "ring-2 ring-pink-500" : ""}`} data-testid={`package-card-${pkg.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{pkg.name}</h3>
                {pkg.popular && <Badge className="bg-pink-500 text-white text-[10px]">Most Popular</Badge>}
              </div>
              <p className="text-3xl font-bold text-pink-600 mb-4">${pkg.price}<span className="text-sm text-muted-foreground font-normal"> USD</span></p>
              <div className="space-y-2">
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <DollarSign className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
