import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Kanban, UserPlus, ClipboardList, Briefcase, CheckCircle2, FileText,
  Ticket, CheckSquare, Building2, Users,
} from "lucide-react";
import {
  FORMATION_STAGES, FORMATION_CLIENTS, KYC_QUEUE, EIN_TRACKER,
} from "@/lib/mock-data-dashboard-ln";

const KYC_STATUS_COLORS: Record<string, string> = {
  "approved": "border-green-300 text-green-700 bg-green-50",
  "in-review": "border-amber-300 text-amber-700 bg-amber-50",
  "incomplete": "border-red-300 text-red-700 bg-red-50",
  "not-started": "border-gray-200 text-gray-500",
};

const EIN_STATUS_COLORS: Record<string, string> = {
  "received": "border-green-300 text-green-700 bg-green-50",
  "pending": "border-amber-300 text-amber-700 bg-amber-50",
  "not-started": "border-gray-200 text-gray-500",
};

const MANAGER_TICKETS = [
  { id: "TK-001", company: "TechVentures LLC", client: "Rajesh Kumar", subject: "KYC document re-upload needed", priority: "high" as const, status: "open" as const, created: "2026-03-24" },
  { id: "TK-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", subject: "EIN delay follow-up", priority: "medium" as const, status: "in-progress" as const, created: "2026-03-22" },
  { id: "TK-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", subject: "Articles filing status check", priority: "low" as const, status: "open" as const, created: "2026-03-21" },
];

const MANAGER_TASKS = [
  { id: "MT-001", title: "Review and approve KYC for SwiftPay", company: "SwiftPay Solutions Inc", due: "2026-03-27", done: false },
  { id: "MT-002", title: "Coordinate EIN fax submission for TechVentures", company: "TechVentures LLC", due: "2026-03-28", done: false },
  { id: "MT-003", title: "Send Articles of Organization draft to Amit", company: "GreenLeaf Organics LLC", due: "2026-03-29", done: false },
  { id: "MT-004", title: "Follow up on BOI filing for DataBridge", company: "DataBridge Analytics LLC", due: "2026-03-26", done: true },
];

const PRIORITY_COLORS: Record<string, string> = {
  "high": "border-red-300 text-red-700 bg-red-50",
  "medium": "border-amber-300 text-amber-700 bg-amber-50",
  "low": "border-gray-200 text-gray-500 bg-gray-50",
};

export default function LnManagerPortal() {
  const inPipeline = FORMATION_CLIENTS.length;
  const kycPending = KYC_QUEUE.filter(k => k.status !== "approved").length;
  const einPending = EIN_TRACKER.filter(e => e.status === "pending").length;
  const openTickets = MANAGER_TICKETS.filter(t => t.status !== "resolved").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-manager-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Manager</p>
          <h1 className="text-2xl font-bold" data-testid="text-manager-title">Client Journey — Vikas</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-sky-200">
            <span><strong className="text-white">{inPipeline}</strong> In Pipeline</span>
            <span><strong className="text-white">{kycPending}</strong> KYC Pending</span>
            <span><strong className="text-white">{einPending}</strong> EIN Pending</span>
            <span><strong className="text-white">{openTickets}</strong> Open Tickets</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Kanban className="w-4 h-4 text-sky-500" /> Active Formations
              </CardTitle>
              <Badge variant="outline" className="text-xs">{inPipeline} clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {FORMATION_CLIENTS.map((fc) => (
              <div
                key={fc.id}
                className={`p-3 rounded-xl border ${fc.daysInStage > 10 ? "border-amber-200 bg-amber-50/40" : "bg-muted/30 border-transparent"}`}
                data-testid={`manager-client-${fc.id}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium">{fc.name}</p>
                    <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · {fc.package}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{fc.stageName}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(fc.stage / 7) * 100} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">Stage {fc.stage}/7</span>
                  {fc.daysInStage > 10 && (
                    <span className="text-[10px] text-amber-600 font-medium">{fc.daysInStage}d</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-sky-500" /> Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {MANAGER_TICKETS.map((ticket) => (
                <div key={ticket.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`manager-ticket-${ticket.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate flex-1 mr-2">{ticket.subject}</span>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ticket.company} · {ticket.client}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-500" /> Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {MANAGER_TASKS.map((task) => (
                <div key={task.id} className="flex items-start gap-2 py-2" data-testid={`manager-task-${task.id}`}>
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${task.done ? "text-green-500" : "text-gray-200"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.company} · Due {task.due}</p>
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

export function LnManagerPipeline() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <h1 className="text-xl font-bold">Formation Pipeline</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMATION_STAGES.slice(0, 4).map((stage) => {
          const count = FORMATION_CLIENTS.filter(c => c.stage === parseInt(stage.id.replace("s", ""))).length;
          return (
            <Card key={stage.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage.shortName}</p>
                <p className="text-2xl font-bold mt-1 text-sky-600" data-testid={`manager-pipeline-count-${stage.id}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {FORMATION_CLIENTS.map((fc) => (
          <div key={fc.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors" data-testid={`manager-pipeline-fc-${fc.id}`}>
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs">{fc.name[0]}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{fc.name}</p>
              <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · Stage {fc.stage}/7</p>
              <Progress value={(fc.stage / 7) * 100} className="h-1 w-40 mt-1" />
            </div>
            <Badge variant="outline" className="text-xs">{fc.stageName}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnManagerKYC() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">KYC Review Queue</h1>
        <p className="text-sm text-muted-foreground">Review client identity documents and approve KYC submissions</p>
      </div>
      <div className="space-y-3">
        {KYC_QUEUE.map((kyc) => (
          <Card key={kyc.id} className="border-0 shadow-sm" data-testid={`manager-kyc-card-${kyc.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{kyc.client}</p>
                  <p className="text-sm text-muted-foreground">{kyc.company} · Submitted {kyc.submitted}</p>
                </div>
                <Badge variant="outline" className={KYC_STATUS_COLORS[kyc.status]}>
                  {kyc.status.replace("-", " ")}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {kyc.docs.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-[10px]">
                    <FileText className="w-3 h-3 mr-1" />{doc}
                  </Badge>
                ))}
              </div>
              {kyc.notes && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3">{kyc.notes}</p>
              )}
              {kyc.status !== "approved" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white gap-1" data-testid={`manager-approve-kyc-${kyc.id}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" data-testid={`manager-request-reupload-${kyc.id}`}>
                    Request Re-upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnManagerEIN() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">EIN Tracker</h1>
        <p className="text-sm text-muted-foreground">Track IRS EIN applications across all formations</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{EIN_TRACKER.filter(e => e.status === "received").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{EIN_TRACKER.filter(e => e.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{EIN_TRACKER.filter(e => e.status === "not-started").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Not Started</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {EIN_TRACKER.map((ein) => (
          <Card key={ein.id} className="border-0 shadow-sm" data-testid={`manager-ein-card-${ein.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{ein.company}</p>
                <p className="text-sm text-muted-foreground">{ein.client} · {ein.state}</p>
                {ein.submittedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {ein.submittedDate} · Method: {ein.method}
                    {ein.estimatedDate !== "-" && ` · ETA: ${ein.estimatedDate}`}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={EIN_STATUS_COLORS[ein.status]}>
                {ein.status === "received" ? ein.ein : ein.status === "pending" ? "Pending IRS" : "Not Started"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnManagerActions() {
  const stageActions = [
    { stage: "Payment", pending: 1, actions: ["Send payment link", "Verify payment receipt", "Assign to specialist"] },
    { stage: "KYC", pending: 2, actions: ["Review uploaded documents", "Request re-uploads", "Approve KYC package"] },
    { stage: "Articles Filing", pending: 1, actions: ["Prepare Articles of Organization", "File with Secretary of State", "Upload stamped copy"] },
    { stage: "EIN Application", pending: 1, actions: ["Prepare SS-4 form", "Submit to IRS (fax/online)", "Upload CP 575 letter"] },
    { stage: "BOI Filing", pending: 1, actions: ["Prepare FinCEN BOI report", "Get client approval", "File with FinCEN"] },
    { stage: "Banking Setup", pending: 1, actions: ["Initiate Mercury application", "Setup Stripe account", "Verify bank connection"] },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Stage Actions</h1>
        <p className="text-sm text-muted-foreground">Checklists and actions for each formation stage</p>
      </div>
      <div className="space-y-4">
        {stageActions.map((sa) => (
          <Card key={sa.stage} className="border-0 shadow-sm" data-testid={`manager-stage-actions-${sa.stage.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold">{sa.stage}</span>
                </div>
                <Badge variant="outline" className="text-xs">{sa.pending} pending</Badge>
              </div>
              <div className="space-y-2">
                {sa.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-200" />
                    <span className="text-muted-foreground">{action}</span>
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

export function LnManagerDocs() {
  const clientDocs = [
    { id: "D-001", company: "TechVentures LLC", client: "Rajesh Kumar", doc: "Articles of Organization", category: "formation", status: "verified" as const },
    { id: "D-002", company: "TechVentures LLC", client: "Rajesh Kumar", doc: "BOI Filing Draft", category: "compliance", status: "action-required" as const },
    { id: "D-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", doc: "Passport - Amit Patel", category: "identity", status: "verified" as const },
    { id: "D-004", company: "SwiftPay Solutions Inc", client: "Neha Joshi", doc: "Address Proof", category: "identity", status: "pending-review" as const },
    { id: "D-005", company: "DataBridge Analytics LLC", client: "Vikram Rao", doc: "EIN Confirmation Letter", category: "tax", status: "verified" as const },
    { id: "D-006", company: "NovaTech AI Inc", client: "Deepak Verma", doc: "Operating Agreement", category: "formation", status: "verified" as const },
  ];

  const STATUS_COLORS: Record<string, string> = {
    "verified": "border-green-300 text-green-700 bg-green-50",
    "pending-review": "border-amber-300 text-amber-700 bg-amber-50",
    "action-required": "border-red-300 text-red-700 bg-red-50",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Client Documents</h1>
        <p className="text-sm text-muted-foreground">All client documents across active formations</p>
      </div>
      <div className="space-y-3">
        {clientDocs.map((doc) => (
          <Card key={doc.id} className="border-0 shadow-sm" data-testid={`manager-doc-${doc.id}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-sky-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.doc}</p>
                <p className="text-xs text-muted-foreground">{doc.company} · {doc.client}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_COLORS[doc.status]}`}>
                {doc.status.replace("-", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnManagerTickets() {
  const MANAGER_TICKETS_FULL = [
    { id: "TK-001", company: "TechVentures LLC", client: "Rajesh Kumar", subject: "KYC document re-upload needed", priority: "high" as const, status: "open" as const, created: "2026-03-24" },
    { id: "TK-002", company: "SwiftPay Solutions Inc", client: "Neha Joshi", subject: "EIN delay follow-up", priority: "medium" as const, status: "in-progress" as const, created: "2026-03-22" },
    { id: "TK-003", company: "GreenLeaf Organics LLC", client: "Amit Patel", subject: "Articles filing status check", priority: "low" as const, status: "open" as const, created: "2026-03-21" },
    { id: "TK-004", company: "NovaTech AI Inc", client: "Deepak Verma", subject: "Banking setup instructions", priority: "medium" as const, status: "open" as const, created: "2026-03-20" },
    { id: "TK-005", company: "DataBridge Analytics LLC", client: "Vikram Rao", subject: "BOI filing confirmation receipt", priority: "low" as const, status: "resolved" as const, created: "2026-03-18" },
  ];

  const PRIORITY_COLORS: Record<string, string> = {
    "high": "border-red-300 text-red-700 bg-red-50",
    "medium": "border-amber-300 text-amber-700 bg-amber-50",
    "low": "border-gray-200 text-gray-500 bg-gray-50",
  };

  const STATUS_LABELS: Record<string, string> = {
    "open": "Open",
    "in-progress": "In Progress",
    "resolved": "Resolved",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Client Tickets</h1>
        <p className="text-sm text-muted-foreground">Support tickets and client queries</p>
      </div>
      <div className="space-y-3">
        {MANAGER_TICKETS_FULL.map((ticket) => (
          <Card key={ticket.id} className="border-0 shadow-sm" data-testid={`manager-ticket-full-${ticket.id}`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ticket.company} · {ticket.client} · Created {ticket.created}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[ticket.status]}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnManagerTasks() {
  const MANAGER_TASKS_FULL = [
    { id: "MT-001", title: "Review and approve KYC for SwiftPay", company: "SwiftPay Solutions Inc", due: "2026-03-27", done: false, priority: "high" as const },
    { id: "MT-002", title: "Coordinate EIN fax submission for TechVentures", company: "TechVentures LLC", due: "2026-03-28", done: false, priority: "high" as const },
    { id: "MT-003", title: "Send Articles of Organization draft to Amit", company: "GreenLeaf Organics LLC", due: "2026-03-29", done: false, priority: "medium" as const },
    { id: "MT-004", title: "Follow up on BOI filing for DataBridge", company: "DataBridge Analytics LLC", due: "2026-03-26", done: true, priority: "low" as const },
    { id: "MT-005", title: "Initiate Mercury bank application for NovaTech", company: "NovaTech AI Inc", due: "2026-03-30", done: false, priority: "medium" as const },
    { id: "MT-006", title: "Upload stamped Articles for UrbanNest", company: "UrbanNest Realty Corp", due: "2026-04-01", done: false, priority: "low" as const },
  ];

  const PRIORITY_COLORS: Record<string, string> = {
    "high": "border-red-300 text-red-700 bg-red-50",
    "medium": "border-amber-300 text-amber-700 bg-amber-50",
    "low": "border-gray-200 text-gray-500 bg-gray-50",
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Task List</h1>
        <p className="text-sm text-muted-foreground">All tasks across the formation pipeline</p>
      </div>
      <div className="space-y-3">
        {MANAGER_TASKS_FULL.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${task.done ? "opacity-60 bg-gray-50" : "bg-white"}`}
            data-testid={`manager-task-full-${task.id}`}
          >
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${task.done ? "text-green-500" : "text-gray-200"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.company} · Due {task.due}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
