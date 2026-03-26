import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, FileText, Users, ChevronRight, Clock, Star } from "lucide-react";

const LEADS = [
  { id: "L001", name: "Rahul Agarwal", city: "Pune", stage: "Qualified", assignee: "Harsh", followUp: "Today", hot: true },
  { id: "L002", name: "Sunita Verma", city: "Bhopal", stage: "New Lead", assignee: "Suprans", followUp: "Tomorrow", hot: false },
  { id: "L003", name: "Kiran Patel", city: "Vadodara", stage: "Token Paid", assignee: "Harsh", followUp: "Done", hot: false },
  { id: "L004", name: "Amit Singh", city: "Patna", stage: "Qualified", assignee: "Suprans", followUp: "Today", hot: true },
  { id: "L005", name: "Divya Malhotra", city: "Chandigarh", stage: "New Lead", assignee: "Harsh", followUp: "In 2 days", hot: false },
  { id: "L006", name: "Rajan Mehta", city: "Indore", stage: "Proposal Sent", assignee: "Suprans", followUp: "Today", hot: true },
];

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "bg-gray-100 text-gray-600",
  "Qualified": "bg-blue-100 text-blue-700",
  "Token Paid": "bg-green-100 text-green-700",
  "Proposal Sent": "bg-purple-100 text-purple-700",
};

const WA_SCRIPTS = [
  { id: 1, title: "Initial Introduction", content: "Hi [Name]! 👋 I'm Harsh from EazyToSell. We help people start profitable retail stores in [City]...", stage: "New Lead" },
  { id: 2, title: "Follow-up After No Response", content: "Hi [Name], just checking in! We had a great conversation earlier about your store opportunity...", stage: "Qualified" },
  { id: 3, title: "Proposal Follow-up", content: "Hi [Name]! 🎯 I sent the detailed proposal yesterday. Have you had a chance to review it?...", stage: "Proposal Sent" },
  { id: 4, title: "Token Payment Nudge", content: "Hi [Name]! Great news — your store location in [City] is ready to be blocked...", stage: "Token Stage" },
];

const PROPOSALS = [
  { id: "P001", client: "Rahul Agarwal", city: "Pune", amount: "₹4,50,000", status: "Sent", date: "Mar 24" },
  { id: "P002", client: "Kiran Patel", city: "Vadodara", amount: "₹3,75,000", status: "Accepted", date: "Mar 20" },
  { id: "P003", client: "Rajan Mehta", city: "Indore", amount: "₹5,00,000", status: "Under Review", date: "Mar 25" },
];

export default function EtsSalesPortal() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="sales-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Sales Command Center</p>
          <h1 className="text-2xl font-bold" data-testid="text-sales-title">Lead Pipeline</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-sky-200">
            <span><strong className="text-white">{LEADS.length}</strong> Active Leads</span>
            <span><strong className="text-white">{LEADS.filter(l => l.followUp === "Today").length}</strong> Follow-ups Today</span>
            <span><strong className="text-white">{LEADS.filter(l => l.hot).length}</strong> Hot Leads</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" /> Lead Pipeline
              </CardTitle>
              <Badge variant="outline" className="text-xs">{LEADS.length} leads</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {LEADS.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`lead-row-${lead.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    {lead.hot && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.city} · {lead.assignee}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge className={`text-[10px] ${STAGE_COLORS[lead.stage] || "bg-gray-100 text-gray-600"}`} variant="outline">
                    {lead.stage}
                  </Badge>
                  <p className={`text-[10px] font-medium ${lead.followUp === "Today" ? "text-red-500" : "text-muted-foreground"}`}>
                    {lead.followUp === "Today" ? "⚠ Follow up now" : lead.followUp}
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
              {LEADS.filter(l => l.followUp === "Today").map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg border border-red-100 bg-red-50/50" data-testid={`followup-${lead.id}`}>
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.stage} · {lead.city}</p>
                  </div>
                  <a href={`https://wa.me/91${Math.floor(9000000000 + Math.random() * 999999999)}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1 h-7 text-xs" data-testid={`wa-${lead.id}`}>
                      <MessageSquare className="w-3 h-3" /> WA
                    </Button>
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> Proposals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {PROPOSALS.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2" data-testid={`proposal-${p.id}`}>
                  <div>
                    <p className="text-sm font-medium">{p.client}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.amount}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${p.status === "Accepted" ? "border-green-300 text-green-700" : p.status === "Sent" ? "border-blue-300 text-blue-700" : "border-amber-300 text-amber-700"}`}
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

export function EtsSalesPipeline() {
  const stages = ["New Lead", "Qualified", "Proposal Sent", "Token Paid"];
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Sales Pipeline</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const count = LEADS.filter(l => l.stage === stage).length;
          return (
            <Card key={stage} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage}</p>
                <p className="text-2xl font-bold mt-1 text-sky-600" data-testid={`pipeline-count-${stage}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {LEADS.map((lead) => (
          <div key={lead.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors" data-testid={`pipeline-lead-${lead.id}`}>
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600">{lead.name[0]}</div>
            <div className="flex-1">
              <p className="font-medium">{lead.name}</p>
              <p className="text-sm text-muted-foreground">{lead.city} · Assigned to {lead.assignee}</p>
            </div>
            <Badge className={`text-xs ${STAGE_COLORS[lead.stage] || ""}`} variant="outline">{lead.stage}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EtsSalesProposals() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Proposals</h1>
      <div className="space-y-3">
        {PROPOSALS.map((p) => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.client}</p>
                <p className="text-sm text-muted-foreground">{p.city} · Sent {p.date}</p>
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

export function EtsSalesScripts() {
  const [copied, setCopied] = useState<number | null>(null);
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">WhatsApp Scripts</h1>
        <p className="text-sm text-muted-foreground">Ready-to-use scripts for each pipeline stage</p>
      </div>
      <div className="space-y-4">
        {WA_SCRIPTS.map((script) => (
          <Card key={script.id} className="border-0 shadow-sm" data-testid={`script-${script.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700">{script.stage}</Badge>
                    <span className="text-sm font-semibold">{script.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{script.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={() => { navigator.clipboard?.writeText(script.content); setCopied(script.id); setTimeout(() => setCopied(null), 2000); }}
                  data-testid={`copy-script-${script.id}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {copied === script.id ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsSalesFollowups() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Follow-up Queue</h1>
      <div className="space-y-3">
        {LEADS.map((lead) => (
          <div
            key={lead.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${lead.followUp === "Today" ? "border-red-200 bg-red-50/50" : "bg-white"}`}
            data-testid={`followup-item-${lead.id}`}
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600">{lead.name[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{lead.name}</p>
                {lead.hot && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{lead.city} · {lead.stage}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lead.followUp === "Today" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {lead.followUp}
              </span>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 gap-1 text-xs" data-testid={`wa-action-${lead.id}`}>
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
