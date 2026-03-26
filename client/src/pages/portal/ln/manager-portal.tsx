import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, Users, CheckSquare, Ticket, Building2,
  ChevronRight, AlertTriangle, Clock, TrendingUp, UserPlus,
  FileText, CheckCircle2, XCircle, Circle, Search,
  ArrowRight, Activity, Star, Banknote, Gavel, ShieldCheck,
  CreditCard, Package, ClipboardList, RotateCcw, Plus, Eye,
} from "lucide-react";
import {
  MANAGER_CLIENTS, MANAGER_ALL_LEADS, MANAGER_TEAM,
  type ManagerClient, type ManagerClientDoc, type ManagerTask, type ManagerTicket,
} from "@/lib/mock-data-manager-ln";
import { FORMATION_STAGES } from "@/lib/mock-data-dashboard-ln";

const HEALTH_COLOR = (h: number) =>
  h >= 80 ? "text-green-600" : h >= 50 ? "text-amber-600" : "text-red-600";
const HEALTH_BG = (h: number) =>
  h >= 80 ? "bg-green-50 border-green-200" : h >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

const STAGE_ICONS = [Package, UserPlus, Gavel, ClipboardList, ShieldCheck, Banknote, CheckCircle2];

const DOC_STATUS_COLORS: Record<string, string> = {
  "approved": "border-green-300 text-green-700 bg-green-50",
  "in-review": "border-amber-300 text-amber-700 bg-amber-50",
  "uploaded": "border-sky-300 text-sky-700 bg-sky-50",
  "action-required": "border-red-300 text-red-700 bg-red-50",
  "rejected": "border-red-300 text-red-700 bg-red-50",
  "pending-upload": "border-gray-200 text-gray-500 bg-gray-50",
};

const TICKET_PRIORITY_COLORS: Record<string, string> = {
  "high": "border-red-300 text-red-700 bg-red-50",
  "medium": "border-amber-300 text-amber-700 bg-amber-50",
  "low": "border-gray-200 text-gray-500 bg-gray-50",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  "open": "border-sky-300 text-sky-700 bg-sky-50",
  "in-progress": "border-amber-300 text-amber-700 bg-amber-50",
  "resolved": "border-green-300 text-green-700 bg-green-50",
};

function StageTracker({ client }: { client: ManagerClient }) {
  return (
    <div className="space-y-1">
      {FORMATION_STAGES.map((s, idx) => {
        const stageNum = idx + 1;
        const Icon = STAGE_ICONS[idx];
        const isDone = client.stage > stageNum;
        const isCurrent = client.stage === stageNum;
        return (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors
              ${isCurrent ? "bg-sky-50 border border-sky-200" : isDone ? "bg-green-50/60" : "bg-muted/30"}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
              ${isCurrent ? "bg-sky-500 text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0">
              <p className={`font-medium text-xs leading-tight
                ${isCurrent ? "text-sky-700" : isDone ? "text-green-700" : "text-muted-foreground"}`}>
                {s.shortName}
              </p>
              {isCurrent && (
                <p className="text-[10px] text-sky-500 mt-0.5">In progress</p>
              )}
            </div>
            {isCurrent && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

export default function LnManagerPortal() {
  const [, navigate] = useLocation();

  const totalClients = MANAGER_CLIENTS.length;
  const stalled = MANAGER_CLIENTS.filter(c => c.daysInStage > 7 && c.stage < 7);
  const unassignedLeads = MANAGER_ALL_LEADS.filter(l => l.stage !== "Converted").length;
  const openTickets = MANAGER_CLIENTS.flatMap(c => c.tickets).filter(t => t.status !== "resolved").length;
  const openTasks = MANAGER_CLIENTS.flatMap(c => c.tasks).filter(t => !t.done).length;

  const recentActivity = MANAGER_CLIENTS
    .flatMap(c => c.activityLog.map(a => ({ ...a, company: c.companyName, clientName: c.clientName })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-manager-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Manager Portal</p>
          <h1 className="text-2xl font-bold" data-testid="text-manager-title">Good morning, Vikas</h1>
          <p className="text-sky-200 text-sm mt-1">Here's your client journey overview for today</p>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-300" />
              <span className="text-sky-200">Clients:</span>
              <strong className="text-white">{totalClients}</strong>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span className="text-sky-200">Stalled:</span>
              <strong className="text-white">{stalled.length}</strong>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-sky-300" />
              <span className="text-sky-200">Open Tasks:</span>
              <strong className="text-white">{openTasks}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-sky-300" />
              <span className="text-sky-200">Open Tickets:</span>
              <strong className="text-white">{openTickets}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: totalClients, icon: Building2, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Stalled", value: stalled.length, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Leads to Assign", value: unassignedLeads, icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Open Tasks", value: openTasks, icon: CheckSquare, color: "text-green-500", bg: "bg-green-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Stalled Clients
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate("/portal-ln/manager/clients")} data-testid="btn-view-all-clients">
                View All <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {stalled.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No stalled clients — all on track!</p>
            ) : stalled.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => navigate(`/portal-ln/manager/client/${c.id}`)}
                data-testid={`stalled-client-${c.id}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.companyName}</p>
                    <p className="text-xs text-muted-foreground">{c.clientName} · Stage {c.stage}/7 · {c.stageName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50">
                      <Clock className="w-3 h-3 mr-1" />{c.daysInStage}d stalled
                    </Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-500" /> Lead Inbox
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate("/portal-ln/manager/leads")} data-testid="btn-view-all-leads">
                View All <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {MANAGER_ALL_LEADS.filter(l => l.stage !== "Converted").slice(0, 4).map((lead) => (
              <div key={lead.id} className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.company} · {lead.state} · {lead.stage}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.hot && <Badge variant="outline" className="text-[10px] border-red-300 text-red-600 bg-red-50">Hot</Badge>}
                  <Badge variant="outline" className="text-[10px]">${lead.value.toLocaleString()}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {recentActivity.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${entry.type === "stage" ? "bg-green-100" : entry.type === "document" ? "bg-sky-100" : entry.type === "action" ? "bg-purple-100" : "bg-gray-100"}`}>
                {entry.type === "stage" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> :
                 entry.type === "document" ? <FileText className="w-3.5 h-3.5 text-sky-600" /> :
                 <Activity className="w-3.5 h-3.5 text-purple-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{entry.description}</p>
                <p className="text-xs text-muted-foreground">{entry.company} · {entry.by} · {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LnManagerLeads() {
  const [assignedTo, setAssignedTo] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const filtered = MANAGER_ALL_LEADS.filter(
    l => l.name.toLowerCase().includes(search.toLowerCase()) ||
         l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-leads">
      <div>
        <h1 className="text-xl font-bold">Lead Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">All inbound leads — assign to team members and track conversion</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="pl-9"
          data-testid="input-lead-search"
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Lead</th>
                  <th className="text-left px-4 py-3 font-medium">Company</th>
                  <th className="text-left px-4 py-3 font-medium">State</th>
                  <th className="text-left px-4 py-3 font-medium">Stage</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Value</th>
                  <th className="text-left px-4 py-3 font-medium">Follow Up</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors" data-testid={`lead-row-${lead.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lead.hot && <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.state}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${
                        lead.stage === "Converted" ? "border-green-300 text-green-700 bg-green-50" :
                        lead.stage === "Qualified" ? "border-sky-300 text-sky-700 bg-sky-50" :
                        lead.stage === "Proposal Sent" ? "border-purple-300 text-purple-700 bg-purple-50" :
                        "border-gray-200 text-gray-500"
                      }`}>{lead.stage}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                    <td className="px-4 py-3 font-medium">${lead.value.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${lead.followUp === "Today" ? "text-red-600 font-medium" : lead.followUp === "Tomorrow" ? "text-amber-600" : "text-muted-foreground"}`}>
                        {lead.followUp}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={assignedTo[lead.id] ?? lead.assignedSalesName}
                        onValueChange={v => setAssignedTo(prev => ({ ...prev, [lead.id]: v }))}
                      >
                        <SelectTrigger className="h-7 text-xs w-36" data-testid={`select-assign-${lead.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MANAGER_TEAM.map(m => (
                            <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LnManagerClients() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = MANAGER_CLIENTS.filter(c => {
    const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
                        c.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || String(c.stage) === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-clients">
      <div>
        <h1 className="text-xl font-bold">All Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">Full formation pipeline — click any client to manage their journey</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9"
            data-testid="input-clients-search"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44 h-9" data-testid="select-stage-filter">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {FORMATION_STAGES.map((s, i) => (
              <SelectItem key={s.id} value={String(i + 1)}>Stage {i + 1}: {s.shortName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Company</th>
                  <th className="text-left px-4 py-3 font-medium">Client</th>
                  <th className="text-left px-4 py-3 font-medium">State</th>
                  <th className="text-left px-4 py-3 font-medium">Package</th>
                  <th className="text-left px-4 py-3 font-medium">Stage Progress</th>
                  <th className="text-left px-4 py-3 font-medium">Health</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/portal-ln/manager/client/${c.id}`)}
                    data-testid={`client-row-${c.id}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">{c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.state}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${
                        c.package === "Premium" ? "border-purple-300 text-purple-700 bg-purple-50" :
                        c.package === "Standard" ? "border-sky-300 text-sky-700 bg-sky-50" :
                        "border-gray-200 text-gray-500"
                      }`}>{c.package}</Badge>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Progress value={(c.stage / 7) * 100} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{c.stageName}</span>
                      </div>
                      {c.daysInStage > 7 && c.stage < 7 && (
                        <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{c.daysInStage}d in stage
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${HEALTH_COLOR(c.healthScore)}`}>{c.healthScore}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                          {c.assignedToInitials}
                        </div>
                        <span className="text-xs text-muted-foreground">{c.assignedTo.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const CLIENT_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "llc", label: "LLC Filing", icon: Gavel },
  { id: "ein", label: "EIN", icon: ClipboardList },
  { id: "boi", label: "BOI", icon: ShieldCheck },
  { id: "banking", label: "Banking", icon: Banknote },
  { id: "tasks", label: "Tasks & Notes", icon: CheckSquare },
  { id: "tickets", label: "Tickets", icon: Ticket },
] as const;
type ClientTabId = typeof CLIENT_TABS[number]["id"];

export function LnManagerClientDetail() {
  const [match, params] = useRoute("/portal-ln/manager/client/:id");
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ClientTabId>("overview");
  const [docStates, setDocStates] = useState<Record<string, ManagerClientDoc["status"]>>({});
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});
  const [ticketStates, setTicketStates] = useState<Record<string, ManagerTicket["status"]>>({});

  const clientId = params?.id;
  const client = MANAGER_CLIENTS.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="px-16 lg:px-24 py-12 text-center">
        <p className="text-muted-foreground">Client not found.</p>
        <Button className="mt-4" onClick={() => navigate("/portal-ln/manager/clients")} data-testid="btn-back-to-clients">Back to Clients</Button>
      </div>
    );
  }

  const getDocStatus = (doc: ManagerClientDoc) => docStates[doc.id] ?? doc.status;
  const getTaskDone = (task: ManagerTask) => taskStates[task.id] ?? task.done;
  const getTicketStatus = (ticket: ManagerTicket) => ticketStates[ticket.id] ?? ticket.status;

  function renderOverview() {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Info</p>
              {[
                ["Company", client.companyName],
                ["Entity", client.entityType],
                ["Client", client.clientName],
                ["Email", client.email],
                ["Phone", client.phone],
                ["State", client.state],
                ["Package", client.package],
                ["Started", client.startedAt],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formation Status</p>
              {[
                ["Stage", `${client.stage}/7 — ${client.stageName}`],
                ["Health Score", `${client.healthScore}%`],
                ["Days in Stage", client.daysInStage === 0 ? "Complete" : `${client.daysInStage} days`],
                ["Assigned To", client.assignedTo],
                ["Payment", client.paymentStatus === "paid" ? `Paid — $${client.packageAmount.toLocaleString()}` : "Pending"],
                ["KYC", client.kycStatus],
                ["EIN", client.einNumber ?? client.einStatus],
                ["BOI", client.boiStatus],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {client.activityLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0
                  ${entry.type === "stage" ? "bg-green-500" : entry.type === "document" ? "bg-sky-500" : "bg-purple-400"}`} />
                <div>
                  <p className="text-sm">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{entry.by} · {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderDocuments() {
    const allDocs = client.kycDocs;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{allDocs.length} document(s) on file</p>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" data-testid="btn-request-doc">
            <Plus className="w-3.5 h-3.5" /> Request Document
          </Button>
        </div>
        <div className="space-y-2">
          {allDocs.map(doc => {
            const status = getDocStatus(doc);
            return (
              <div key={doc.id} className="p-3 rounded-xl border bg-card flex items-center gap-3" data-testid={`doc-${doc.id}`}>
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{doc.name}</p>
                  {doc.uploadedAt && <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</p>}
                  {doc.notes && <p className="text-xs text-amber-600 mt-0.5">{doc.notes}</p>}
                </div>
                <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${DOC_STATUS_COLORS[status]}`}>
                  {status.replace("-", " ")}
                </Badge>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => setDocStates(p => ({ ...p, [doc.id]: "approved" }))}
                    data-testid={`btn-approve-doc-${doc.id}`}
                    title="Approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDocStates(p => ({ ...p, [doc.id]: "rejected" }))}
                    data-testid={`btn-reject-doc-${doc.id}`}
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View" data-testid={`btn-view-doc-${doc.id}`}>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {client.kycNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">KYC Notes: </span>{client.kycNotes}
          </div>
        )}
      </div>
    );
  }

  function renderLLC() {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Articles of Organization</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${
                  client.articlesState === "approved" ? "border-green-300 text-green-700 bg-green-50" :
                  client.articlesState === "submitted" ? "border-sky-300 text-sky-700 bg-sky-50" :
                  client.articlesState === "in-progress" ? "border-amber-300 text-amber-700 bg-amber-50" :
                  "border-gray-200 text-gray-500"
                }`}>{client.articlesState.replace("-", " ")}</Badge>
              </div>
              {client.articlesFiledDate && (
                <p className="text-sm text-muted-foreground">Filed on {client.articlesFiledDate}</p>
              )}
              {client.articlesState !== "approved" && (
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" data-testid="btn-submit-articles">
                  Mark as Submitted
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operating Agreement</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${
                  client.operatingAgreement === "signed" ? "border-green-300 text-green-700 bg-green-50" :
                  client.operatingAgreement === "generated" ? "border-sky-300 text-sky-700 bg-sky-50" :
                  "border-gray-200 text-gray-500"
                }`}>{client.operatingAgreement}</Badge>
              </div>
              {client.operatingAgreement === "pending" && (
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" data-testid="btn-generate-oa">
                  Generate Agreement
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        {client.llcNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes: </span>{client.llcNotes}
          </div>
        )}
      </div>
    );
  }

  function renderEIN() {
    return (
      <div className="space-y-4">
        <Card className="border shadow-none">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EIN Application Status</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${
                client.einStatus === "received" ? "border-green-300 text-green-700 bg-green-50" :
                client.einStatus === "submitted-fax" || client.einStatus === "submitted-online" ? "border-amber-300 text-amber-700 bg-amber-50" :
                "border-gray-200 text-gray-500"
              }`}>{client.einStatus.replace(/-/g, " ")}</Badge>
              {client.einMethod !== "-" && <Badge variant="outline" className="text-[10px]">via {client.einMethod}</Badge>}
            </div>
            {[
              ["EIN Number", client.einNumber ?? "Not yet received"],
              ["Submitted Date", client.einSubmittedDate ?? "—"],
              ["Received Date", client.einReceivedDate ?? "—"],
              ["Method", client.einMethod],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            {client.einStatus === "not-started" && (
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" data-testid="btn-submit-ein">
                Submit SS-4 Form
              </Button>
            )}
            {(client.einStatus === "submitted-fax" || client.einStatus === "submitted-online") && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" data-testid="btn-record-ein">
                Record EIN Received
              </Button>
            )}
          </CardContent>
        </Card>
        {client.einNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes: </span>{client.einNotes}
          </div>
        )}
      </div>
    );
  }

  function renderBOI() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`${
            client.boiStatus === "filed" ? "border-green-300 text-green-700 bg-green-50" :
            client.boiStatus === "draft-ready" ? "border-sky-300 text-sky-700 bg-sky-50" :
            client.boiStatus === "in-progress" ? "border-amber-300 text-amber-700 bg-amber-50" :
            "border-gray-200 text-gray-500"
          }`}>BOI Status: {client.boiStatus.replace(/-/g, " ")}</Badge>
          {client.boiFiledDate && <p className="text-xs text-muted-foreground">Filed: {client.boiFiledDate}</p>}
        </div>
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Beneficial Owners ({client.boiOwners.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {client.boiOwners.map(owner => (
              <div key={owner.id} className="p-3 rounded-xl bg-muted/30 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{owner.name}</p>
                  <Badge variant="outline" className="text-[10px] border-sky-300 text-sky-700 bg-sky-50">{owner.ownership}</Badge>
                </div>
                {owner.dob && <p className="text-muted-foreground text-xs">DOB: {owner.dob}</p>}
                {owner.address && <p className="text-muted-foreground text-xs">{owner.address}</p>}
                {owner.passportNum && <p className="text-muted-foreground text-xs">Passport: {owner.passportNum}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
        {client.boiStatus !== "filed" && client.boiStatus !== "pending-kyc" && client.boiStatus !== "not-started" && (
          <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" data-testid="btn-file-boi">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Mark BOI as Filed
          </Button>
        )}
        {client.boiNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes: </span>{client.boiNotes}
          </div>
        )}
      </div>
    );
  }

  function renderBanking() {
    const mercurySteps = [
      { label: "Prepare application documents", done: client.mercuryStatus !== "not-started" },
      { label: "Submit Mercury application", done: client.mercuryStatus === "applied" || client.mercuryStatus === "approved" },
      { label: "Account approved & active", done: client.mercuryStatus === "approved" },
    ];
    const stripeSteps = [
      { label: "EIN & company docs ready", done: client.einStatus === "received" },
      { label: "Submit Stripe application", done: client.stripeStatus === "applied" || client.stripeStatus === "approved" },
      { label: "Stripe account live", done: client.stripeStatus === "approved" },
    ];
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Mercury Bank", status: client.mercuryStatus, steps: mercurySteps, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", testId: "btn-apply-mercury" },
            { label: "Stripe Payments", status: client.stripeStatus, steps: stripeSteps, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", testId: "btn-apply-stripe" },
          ].map(({ label, status, steps, color, bg, border, testId }) => (
            <Card key={label} className="border shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{label}</p>
                  <Badge variant="outline" className={`text-[10px] ${
                    status === "approved" ? "border-green-300 text-green-700 bg-green-50" :
                    status === "applied" ? "border-amber-300 text-amber-700 bg-amber-50" :
                    status === "rejected" ? "border-red-300 text-red-700 bg-red-50" :
                    "border-gray-200 text-gray-500"
                  }`}>{status}</Badge>
                </div>
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {step.done
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                    </div>
                  ))}
                </div>
                {status === "not-started" && (
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-7 text-xs" data-testid={testId}>
                    Start Application
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {client.bankingNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes: </span>{client.bankingNotes}
          </div>
        )}
      </div>
    );
  }

  function renderTasks() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{client.tasks.length} task(s) for this client</p>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" data-testid="btn-add-task">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>
        </div>
        {client.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet for this client.</p>
        ) : client.tasks.map(task => {
          const done = getTaskDone(task);
          return (
            <div key={task.id} className={`p-3 rounded-xl border flex items-start gap-3 ${done ? "bg-muted/20 border-transparent opacity-60" : "bg-card border-border/50"}`} data-testid={`task-${task.id}`}>
              <button
                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                  ${done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-sky-400"}`}
                onClick={() => setTaskStates(p => ({ ...p, [task.id]: !done }))}
                data-testid={`btn-toggle-task-${task.id}`}
              >
                {done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${done ? "line-through text-muted-foreground" : "font-medium"}`}>{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.assignedTo} · Due {task.due}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${TICKET_PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
            </div>
          );
        })}
      </div>
    );
  }

  function renderTickets() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{client.tickets.length} ticket(s)</p>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" data-testid="btn-raise-ticket">
            <Plus className="w-3.5 h-3.5" /> Raise Ticket
          </Button>
        </div>
        {client.tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tickets for this client.</p>
        ) : client.tickets.map(ticket => {
          const status = getTicketStatus(ticket);
          return (
            <div key={ticket.id} className="p-3 rounded-xl border bg-card" data-testid={`ticket-${ticket.id}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{ticket.subject}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${TICKET_STATUS_COLORS[status]}`}>{status.replace("-", " ")}</Badge>
                </div>
              </div>
              {ticket.notes && <p className="text-xs text-muted-foreground mt-1.5">{ticket.notes}</p>}
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-muted-foreground">Created {ticket.created}</p>
                <Select
                  value={status}
                  onValueChange={v => setTicketStates(p => ({ ...p, [ticket.id]: v as ManagerTicket["status"] }))}
                >
                  <SelectTrigger className="h-6 text-xs w-32" data-testid={`select-ticket-status-${ticket.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const TAB_CONTENT: Record<ClientTabId, () => JSX.Element> = {
    overview: renderOverview,
    documents: renderDocuments,
    llc: renderLLC,
    ein: renderEIN,
    boi: renderBOI,
    banking: renderBanking,
    tasks: renderTasks,
    tickets: renderTickets,
  };

  return (
    <div className="px-8 lg:px-16 py-6" data-testid="ln-manager-client-detail">
      <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
        <button onClick={() => navigate("/portal-ln/manager/clients")} className="hover:text-foreground transition-colors" data-testid="breadcrumb-clients">All Clients</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{client.companyName}</span>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-48 flex-shrink-0 sticky top-24">
          <div className="mb-4">
            <p className="font-semibold text-sm">{client.companyName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{client.clientName} · {client.package}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={(client.stage / 7) * 100} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground">{client.stage}/7</span>
            </div>
            <div className={`mt-2 text-xs font-bold ${HEALTH_COLOR(client.healthScore)}`}>
              Health: {client.healthScore}%
            </div>
          </div>
          <StageTracker client={client} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-5 border-b pb-2 overflow-x-auto">
            {CLIENT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                    ${activeTab === tab.id ? "bg-sky-50 text-sky-700 border border-sky-200" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          {TAB_CONTENT[activeTab]()}
        </div>
      </div>
    </div>
  );
}

export function LnManagerTasks() {
  const [, navigate] = useLocation();
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});

  const allTasks = MANAGER_CLIENTS.flatMap(c =>
    c.tasks.map(t => ({ ...t, company: c.companyName, clientId: c.id }))
  );
  const openTasks = allTasks.filter(t => !(taskStates[t.id] ?? t.done));
  const doneTasks = allTasks.filter(t => taskStates[t.id] ?? t.done);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-tasks">
      <div>
        <h1 className="text-xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">{openTasks.length} open · {doneTasks.length} completed</p>
      </div>

      <div className="space-y-2">
        {openTasks.map(task => (
          <div
            key={task.id}
            className="p-3 rounded-xl border bg-card flex items-start gap-3"
            data-testid={`task-row-${task.id}`}
          >
            <button
              className="w-5 h-5 rounded border border-gray-300 hover:border-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5"
              onClick={() => setTaskStates(p => ({ ...p, [task.id]: true }))}
              data-testid={`btn-complete-task-${task.id}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{task.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <button
                  className="text-xs text-sky-600 hover:underline"
                  onClick={() => navigate(`/portal-ln/manager/client/${task.clientId}`)}
                  data-testid={`link-client-${task.clientId}`}
                >
                  {task.company}
                </button>
                <span className="text-xs text-muted-foreground">{task.assignedTo} · Due {task.due}</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${TICKET_PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
          </div>
        ))}
        {openTasks.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">All tasks completed!</p>
        )}
      </div>

      {doneTasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completed</p>
          <div className="space-y-1.5">
            {doneTasks.map(task => (
              <div key={task.id} className="p-3 rounded-xl bg-muted/20 flex items-center gap-3 opacity-60">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LnManagerTickets() {
  const [, navigate] = useLocation();
  const [ticketStates, setTicketStates] = useState<Record<string, ManagerTicket["status"]>>({});

  const allTickets = MANAGER_CLIENTS.flatMap(c =>
    c.tickets.map(t => ({ ...t, company: c.companyName, clientId: c.id }))
  );

  const getStatus = (t: typeof allTickets[number]) => ticketStates[t.id] ?? t.status;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-tickets">
      <div>
        <h1 className="text-xl font-bold">Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">{allTickets.filter(t => getStatus(t) !== "resolved").length} open · {allTickets.filter(t => getStatus(t) === "resolved").length} resolved</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {allTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tickets raised.</p>
          ) : (
            <div className="divide-y">
              {allTickets.map(ticket => {
                const status = getStatus(ticket);
                return (
                  <div key={ticket.id} className="p-4 flex items-start gap-4" data-testid={`ticket-row-${ticket.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{ticket.subject}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          className="text-xs text-sky-600 hover:underline"
                          onClick={() => navigate(`/portal-ln/manager/client/${ticket.clientId}`)}
                          data-testid={`link-ticket-client-${ticket.clientId}`}
                        >
                          {ticket.company}
                        </button>
                        <span className="text-xs text-muted-foreground">Created {ticket.created}</span>
                      </div>
                      {ticket.notes && <p className="text-xs text-muted-foreground mt-1">{ticket.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                      <Select
                        value={status}
                        onValueChange={v => setTicketStates(p => ({ ...p, [ticket.id]: v as ManagerTicket["status"] }))}
                      >
                        <SelectTrigger className="h-7 text-xs w-32" data-testid={`select-ticket-${ticket.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RedirectStub({ title, to, label }: { title: string; to: string; label: string }) {
  const [, navigate] = useLocation();
  return (
    <div className="px-16 lg:px-24 py-12 flex flex-col items-center gap-4">
      <RotateCcw className="w-8 h-8 text-muted-foreground" />
      <p className="text-muted-foreground text-sm">{title} has been consolidated into the new portal.</p>
      <Button onClick={() => navigate(to)} data-testid={`btn-redirect-${label}`}>{label}</Button>
    </div>
  );
}

export function LnManagerPipeline() {
  return <RedirectStub title="Pipeline" to="/portal-ln/manager/clients" label="Go to All Clients" />;
}
export function LnManagerKYC() {
  return <RedirectStub title="KYC Review" to="/portal-ln/manager/clients" label="Go to All Clients" />;
}
export function LnManagerEIN() {
  return <RedirectStub title="EIN Tracker" to="/portal-ln/manager/clients" label="Go to All Clients" />;
}
export function LnManagerActions() {
  return <RedirectStub title="Stage Actions" to="/portal-ln/manager/clients" label="Go to All Clients" />;
}
export function LnManagerDocs() {
  return <RedirectStub title="Client Docs" to="/portal-ln/manager/clients" label="Go to All Clients" />;
}
