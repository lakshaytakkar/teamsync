import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, CheckSquare, Ticket, Building2,
  ChevronRight, AlertTriangle, Clock, UserPlus,
  FileText, CheckCircle2, XCircle, Circle, Search,
  ArrowRight, Activity, Star, Banknote, Gavel, ShieldCheck,
  Package, ClipboardList, Plus, Eye, X, Send,
  StickyNote, RefreshCcw, AlertCircle, MessageSquare, User,
} from "lucide-react";
import {
  MANAGER_CLIENTS, MANAGER_ALL_LEADS, MANAGER_TEAM,
  type ManagerClient, type ManagerClientDoc, type ManagerTask, type ManagerTicket, type ManagerBOIOwner,
} from "@/lib/mock-data-manager-ln";
import { FORMATION_STAGES } from "@/lib/mock-data-dashboard-ln";

const HEALTH_COLOR = (h: number) =>
  h >= 80 ? "text-green-600" : h >= 50 ? "text-amber-600" : "text-red-600";

const STAGE_ICONS = [Package, UserPlus, Gavel, ClipboardList, ShieldCheck, Banknote, CheckCircle2];

const DOC_STATUS_COLORS: Record<string, string> = {
  "approved": "border-green-300 text-green-700 bg-green-50",
  "in-review": "border-amber-300 text-amber-700 bg-amber-50",
  "uploaded": "border-sky-300 text-sky-700 bg-sky-50",
  "action-required": "border-red-300 text-red-700 bg-red-50",
  "rejected": "border-red-300 text-red-700 bg-red-50",
  "pending-upload": "border-gray-200 text-gray-500 bg-gray-50",
};

const PRIORITY_COLORS: Record<string, string> = {
  "high": "border-red-300 text-red-700 bg-red-50",
  "medium": "border-amber-300 text-amber-700 bg-amber-50",
  "low": "border-gray-200 text-gray-500 bg-gray-50",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  "open": "border-sky-300 text-sky-700 bg-sky-50",
  "in-progress": "border-amber-300 text-amber-700 bg-amber-50",
  "resolved": "border-green-300 text-green-700 bg-green-50",
};

const TODAY = "2026-03-26";

function StageTracker({ stage, onTabChange }: { stage: number; onTabChange: (tab: ClientTabId) => void }) {
  const tabForStage: Record<number, ClientTabId> = { 2: "documents", 3: "llc", 4: "ein", 5: "boi", 6: "banking", 7: "tasks" };
  return (
    <div className="space-y-1">
      {FORMATION_STAGES.map((s, idx) => {
        const stageNum = idx + 1;
        const Icon = STAGE_ICONS[idx];
        const isDone = stage > stageNum;
        const isCurrent = stage === stageNum;
        const tab = tabForStage[stageNum];
        return (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer
              ${isCurrent ? "bg-sky-50 border border-sky-200" : isDone ? "bg-green-50/60 hover:bg-green-50" : "bg-muted/30 hover:bg-muted/50"}`}
            onClick={() => tab && onTabChange(tab)}
            data-testid={`stage-tracker-${s.id}`}
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
              {isCurrent && <p className="text-[10px] text-sky-500 mt-0.5">In progress</p>}
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
  const [quickAssign, setQuickAssign] = useState<Record<string, string>>({});

  const activeFormations = MANAGER_CLIENTS.filter(c => c.stage < 7).length;
  // truly unassigned = no assignedTo team member set (sales role), stage not Converted
  const unassignedLeads = MANAGER_ALL_LEADS.filter(l => l.stage !== "Converted" && l.assignedTo === "sales").length;
  const tasksDueToday = MANAGER_CLIENTS.flatMap(c => c.tasks).filter(t => !t.done && t.due <= TODAY).length;
  const openTickets = MANAGER_CLIENTS.flatMap(c => c.tickets).filter(t => t.status !== "resolved").length;

  const actionNeeded = MANAGER_CLIENTS.filter(c => {
    const stalled = c.daysInStage > 7 && c.stage < 7;
    const overdueTasks = c.tasks.some(t => !t.done && t.due <= TODAY);
    return stalled || overdueTasks;
  });

  const leadsNeedingAssign = MANAGER_ALL_LEADS.filter(l => l.stage !== "Converted" && l.assignedTo === "sales").slice(0, 5);

  const recentActivity = MANAGER_CLIENTS
    .flatMap(c => c.activityLog.map(a => ({ ...a, company: c.companyName, clientId: c.id })))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-manager-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Manager Portal</p>
          <h1 className="text-2xl font-bold" data-testid="text-manager-title">Good morning, Vikas</h1>
          <p className="text-sky-200 text-sm mt-1">Here's your client journey overview for today</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Formations", value: activeFormations, icon: Building2, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Leads to Assign", value: unassignedLeads, icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Tasks Due Today", value: tasksDueToday, icon: CheckSquare, color: "text-amber-500", bg: "bg-amber-50", urgent: tasksDueToday > 0 },
          { label: "Open Tickets", value: openTickets, icon: Ticket, color: "text-red-500", bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg, urgent }) => (
          <Card key={label} className={`border-0 shadow-sm ${urgent ? "ring-1 ring-amber-300" : ""}`}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${urgent ? "text-amber-600" : ""}`}>{value}</p>
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
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Action Needed
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate("/portal-ln/manager/clients")} data-testid="btn-view-all-clients">
                All Clients <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {actionNeeded.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> All clients on track!
              </p>
            ) : actionNeeded.map((c) => {
              const stalled = c.daysInStage > 7 && c.stage < 7;
              const overdueTasks = c.tasks.filter(t => !t.done && t.due <= TODAY);
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 cursor-pointer hover:bg-amber-50 transition-colors"
                  onClick={() => navigate(`/portal-ln/manager/client/${c.id}`)}
                  data-testid={`action-client-${c.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">{c.clientName} · Stage {c.stage}/7</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {stalled && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50">
                          <Clock className="w-3 h-3 mr-1" />{c.daysInStage}d stalled
                        </Badge>
                      )}
                      {overdueTasks.length > 0 && (
                        <Badge variant="outline" className="text-[10px] border-red-300 text-red-700 bg-red-50">
                          <AlertCircle className="w-3 h-3 mr-1" />{overdueTasks.length} overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-500" /> Leads Awaiting Assignment
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate("/portal-ln/manager/leads")} data-testid="btn-view-all-leads">
                Full Inbox <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {leadsNeedingAssign.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No unassigned leads.</p>
            ) : leadsNeedingAssign.map((lead) => (
              <div key={lead.id} className="p-2.5 rounded-xl bg-muted/30 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.company} · ${lead.value.toLocaleString()}</p>
                </div>
                <Select
                  value={quickAssign[lead.id] ?? ""}
                  onValueChange={v => setQuickAssign(prev => ({ ...prev, [lead.id]: v }))}
                >
                  <SelectTrigger className="h-7 text-xs w-32" data-testid={`quick-assign-${lead.id}`}>
                    <SelectValue placeholder="Assign…" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGER_TEAM.map(m => (
                      <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                ${entry.type === "stage" ? "bg-green-100" : entry.type === "document" ? "bg-sky-100" : "bg-purple-100"}`}>
                {entry.type === "stage" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> :
                 entry.type === "document" ? <FileText className="w-3.5 h-3.5 text-sky-600" /> :
                 <Activity className="w-3.5 h-3.5 text-purple-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{entry.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <button className="text-xs text-sky-600 hover:underline" onClick={() => navigate(`/portal-ln/manager/client/${entry.clientId}`)}>
                    {entry.company}
                  </button>
                  <span className="text-xs text-muted-foreground">{entry.by} · {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
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
  const [converted, setConverted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unassigned" | "assigned" | "converted">("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");

  const sources = [...new Set(MANAGER_ALL_LEADS.map(l => l.source))];
  const packages = ["Basic", "Standard", "Premium"];

  // Derive package from value
  const getPackage = (value: number) => value <= 399 ? "Basic" : value <= 799 ? "Standard" : "Premium";

  const getAssignStatus = (lead: typeof MANAGER_ALL_LEADS[number]): "unassigned" | "assigned" | "converted" => {
    if (lead.stage === "Converted" || converted.has(lead.id)) return "converted";
    if (assignedTo[lead.id] || lead.assignedTo === "manager") return "assigned";
    return "unassigned";
  };

  const filtered = MANAGER_ALL_LEADS.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                        lead.company.toLowerCase().includes(search.toLowerCase());
    const assignStatus = getAssignStatus(lead);
    const matchStatus = statusFilter === "all" || assignStatus === statusFilter;
    const matchSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchPackage = packageFilter === "all" || getPackage(lead.value) === packageFilter;
    return matchSearch && matchStatus && matchSource && matchPackage;
  });

  const counts = {
    all: MANAGER_ALL_LEADS.length,
    unassigned: MANAGER_ALL_LEADS.filter(l => getAssignStatus(l) === "unassigned").length,
    assigned: MANAGER_ALL_LEADS.filter(l => getAssignStatus(l) === "assigned").length,
    converted: MANAGER_ALL_LEADS.filter(l => getAssignStatus(l) === "converted").length,
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-leads">
      <div>
        <h1 className="text-xl font-bold">Lead Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign leads to team members and track conversion status</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unassigned", "assigned", "converted"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${statusFilter === s ? "bg-sky-50 text-sky-700 border border-sky-200" : "text-muted-foreground hover:bg-muted/40"}`}
            data-testid={`filter-${s}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} <span className="text-xs ml-1 opacity-70">({counts[s]})</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="h-8 text-xs w-32" data-testid="select-package-filter">
              <SelectValue placeholder="Package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packages</SelectItem>
              {packages.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 text-xs w-32" data-testid="select-source-filter">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-8 text-xs w-40" data-testid="input-lead-search" />
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Lead</th>
                  <th className="text-left px-4 py-3 font-medium">Company & State</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Package</th>
                  <th className="text-left px-4 py-3 font-medium">Follow Up</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const assignStatus = getAssignStatus(lead);
                  const pkg = getPackage(lead.value);
                  return (
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
                      <td className="px-4 py-3 text-muted-foreground">
                        <p>{lead.company}</p>
                        <p className="text-xs">{lead.state}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${pkg === "Premium" ? "border-purple-300 text-purple-700 bg-purple-50" : pkg === "Standard" ? "border-sky-300 text-sky-700 bg-sky-50" : "border-gray-200 text-gray-500"}`}>
                          {pkg} · ${lead.value.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${lead.followUp === "Today" ? "text-red-600 font-medium" : lead.followUp === "Tomorrow" ? "text-amber-600" : "text-muted-foreground"}`}>
                          {lead.followUp}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${
                          assignStatus === "converted" ? "border-green-300 text-green-700 bg-green-50" :
                          assignStatus === "assigned" ? "border-sky-300 text-sky-700 bg-sky-50" :
                          "border-gray-200 text-gray-500"
                        }`}>
                          {assignStatus === "converted" ? "Converted" : assignStatus === "assigned" ? "Assigned" : "Unassigned"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {assignStatus !== "converted" ? (
                          <Select
                            value={assignedTo[lead.id] ?? (lead.assignedTo === "manager" ? "Neha Gupta" : "")}
                            onValueChange={v => setAssignedTo(prev => ({ ...prev, [lead.id]: v }))}
                          >
                            <SelectTrigger className="h-7 text-xs w-36" data-testid={`select-assign-${lead.id}`}>
                              <SelectValue placeholder="Assign to…" />
                            </SelectTrigger>
                            <SelectContent>
                              {MANAGER_TEAM.map(m => (
                                <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {assignStatus !== "converted" && (
                          <Button
                            size="sm" variant="outline"
                            className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setConverted(prev => new Set([...prev, lead.id]))}
                            data-testid={`btn-convert-${lead.id}`}
                          >
                            Convert
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No leads match the current filters.</td></tr>
                )}
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
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" className="pl-9" data-testid="input-clients-search" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48 h-9" data-testid="select-stage-filter">
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
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/portal-ln/manager/client/${c.id}`)} data-testid={`client-row-${c.id}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">{c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.state}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${c.package === "Premium" ? "border-purple-300 text-purple-700 bg-purple-50" : c.package === "Standard" ? "border-sky-300 text-sky-700 bg-sky-50" : "border-gray-200 text-gray-500"}`}>{c.package}</Badge>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <Progress value={(c.stage / 7) * 100} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{c.stageName}</span>
                      </div>
                      {c.daysInStage > 7 && c.stage < 7 && (
                        <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{c.daysInStage}d in stage</p>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={`text-sm font-bold ${HEALTH_COLOR(c.healthScore)}`}>{c.healthScore}%</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">{c.assignedToInitials}</div>
                        <span className="text-xs text-muted-foreground">{c.assignedTo.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><ArrowRight className="w-4 h-4 text-muted-foreground" /></td>
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

interface TicketReply { id: string; from: string; content: string; time: string; isManager: boolean; }

export function LnManagerClientDetail() {
  const [, params] = useRoute("/portal-ln/manager/client/:id");
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ClientTabId>("overview");
  const [clientStage, setClientStage] = useState<number | null>(null);

  const clientId = params?.id;
  const clientBase = MANAGER_CLIENTS.find(c => c.id === clientId);

  const [docStates, setDocStates] = useState<Record<string, ManagerClientDoc["status"]>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [rejectInputs, setRejectInputs] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, ManagerTicket["status"]>>({});
  const [ticketAssignees, setTicketAssignees] = useState<Record<string, string>>({});
  const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [extraDocs, setExtraDocs] = useState<ManagerClientDoc[]>([]);
  const [reqDocName, setReqDocName] = useState("");
  const [showReqDoc, setShowReqDoc] = useState(false);

  const [articleState, setArticleState] = useState<string | undefined>(undefined);
  const [oaState, setOaState] = useState<string | undefined>(undefined);
  const [articlesConfirmed, setArticlesConfirmed] = useState(false);

  const [einMethodSel, setEinMethodSel] = useState("");
  const [einDateSel, setEinDateSel] = useState("");
  const [einNumberInput, setEinNumberInput] = useState("");
  const [einRecordedDateInput, setEinRecordedDateInput] = useState("");
  const [einStateSel, setEinStateSel] = useState<string | undefined>(undefined);

  const [boiStatus, setBoiStatus] = useState<string | undefined>(undefined);
  const [boiFiledDate, setBoiFiledDate] = useState("");
  const [boiConfirmNum, setBoiConfirmNum] = useState("");
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState({ name: "", ownership: "", dob: "", address: "", passportNum: "" });
  const [extraOwners, setExtraOwners] = useState<ManagerBOIOwner[]>([]);

  const [mercuryStatus, setMercuryStatus] = useState<string | undefined>(undefined);
  const [stripeStatus, setStripeStatus] = useState<string | undefined>(undefined);
  const [mercuryAccountNum, setMercuryAccountNum] = useState("");
  const [mercuryApprovedDate, setMercuryApprovedDate] = useState("");
  const [stripeAccountId, setStripeAccountId] = useState("");
  const [stripeApprovedDate, setStripeApprovedDate] = useState("");
  const [stageGuardError, setStageGuardError] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [extraTasks, setExtraTasks] = useState<ManagerTask[]>([]);
  const [notes, setNotes] = useState("");

  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTicketNotes, setNewTicketNotes] = useState("");
  const [newTicketAssignee, setNewTicketAssignee] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [extraTickets, setExtraTickets] = useState<ManagerTicket[]>([]);

  if (!clientBase) {
    return (
      <div className="px-16 lg:px-24 py-12 text-center">
        <p className="text-muted-foreground">Client not found.</p>
        <Button className="mt-4" onClick={() => navigate("/portal-ln/manager/clients")} data-testid="btn-back-to-clients">Back to Clients</Button>
      </div>
    );
  }

  const client = clientBase;
  const currentStage = clientStage ?? client.stage;

  const getDocStatus = (doc: ManagerClientDoc) => docStates[doc.id] ?? doc.status;
  const getTaskDone = (task: ManagerTask) => taskStates[task.id] ?? task.done;
  const getTicketStatus = (ticket: ManagerTicket) => ticketStatuses[ticket.id] ?? ticket.status;

  const allDocs = [...client.kycDocs, ...extraDocs];
  const allTasks = [...client.tasks, ...extraTasks];
  const allTickets = [...client.tickets, ...extraTickets];

  const effectiveArticleState = articleState ?? client.articlesState;
  const effectiveOaState = oaState ?? client.operatingAgreement;
  const effectiveEinStatus = einStateSel ?? client.einStatus;
  const effectiveBoiStatus = boiStatus ?? client.boiStatus;
  const effectiveMercuryStatus = mercuryStatus ?? client.mercuryStatus;
  const effectiveStripeStatus = stripeStatus ?? client.stripeStatus;
  const allOwners = [...client.boiOwners, ...extraOwners];

  const effectiveMercuryAccountNum = mercuryAccountNum || client.mercuryAccountNum || "";
  const effectiveStripeAccountId = stripeAccountId || client.stripeAccountId || "";
  const effectiveBoiConfirmNum = boiConfirmNum || client.boiConfirmationNum || "";
  const effectiveBoiFiledDate = boiFiledDate || client.boiFiledDate || "";
  const effectiveEinNumber = einNumberInput || client.einNumber || "";

  const stageRequirements: Record<number, Array<{ label: string; met: boolean }>> = {
    1: [
      { label: "Payment confirmed", met: client.paymentStatus === "paid" },
    ],
    2: [
      { label: "All KYC documents approved", met: allDocs.length > 0 && allDocs.every(d => (docStates[d.id] ?? d.status) === "approved") },
    ],
    3: [
      { label: "Articles approved by state", met: effectiveArticleState === "approved" },
      { label: "Operating Agreement signed", met: effectiveOaState === "signed" },
    ],
    4: [
      { label: "EIN received from IRS", met: effectiveEinStatus === "received" },
      { label: "EIN number on record", met: !!effectiveEinNumber },
    ],
    5: [
      { label: "BOI filed with FinCEN", met: effectiveBoiStatus === "filed" },
      { label: "FinCEN confirmation number recorded", met: !!effectiveBoiConfirmNum },
    ],
    6: [
      { label: "Mercury account approved", met: effectiveMercuryStatus === "approved" },
      { label: "Mercury account number recorded", met: !!effectiveMercuryAccountNum },
      { label: "Stripe account approved", met: effectiveStripeStatus === "approved" },
      { label: "Stripe Account ID recorded", met: !!effectiveStripeAccountId },
    ],
    7: [
      { label: "Mercury & Stripe banking active", met: effectiveMercuryStatus === "approved" && effectiveStripeStatus === "approved" },
    ],
  };

  const STAGE_COMPLETE_LABELS: Record<number, string> = {
    1: "Mark Package Received & Payment Confirmed",
    2: "Mark KYC Complete",
    3: "Mark Articles Filed & Approved",
    4: "Mark EIN Received",
    5: "Mark BOI Filed with FinCEN",
    6: "Mark Banking Setup Complete",
    7: "Mark Handover Complete",
  };

  const advanceStage = () => {
    const reqs = stageRequirements[currentStage] ?? [];
    const unmet = reqs.filter(r => !r.met);
    if (unmet.length > 0) {
      setStageGuardError(`Complete before advancing: ${unmet.map(r => r.label).join(", ")}`);
      setTimeout(() => setStageGuardError(null), 4000);
      return;
    }
    setStageGuardError(null);
    if (currentStage < 7) setClientStage(currentStage + 1);
  };

  function StageCompleteBar({ stageNum }: { stageNum: number }) {
    if (currentStage !== stageNum) return null;
    const reqs = stageRequirements[stageNum] ?? [];
    const allMet = reqs.every(r => r.met);
    return (
      <div className={`p-3 rounded-xl border mb-4 space-y-2 ${allMet ? "border-green-200 bg-green-50/60" : "border-amber-200 bg-amber-50/60"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            {reqs.map(r => (
              <div key={r.label} className="flex items-center gap-1.5 text-xs">
                {r.met ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                <span className={r.met ? "text-green-700" : "text-amber-700"}>{r.label}</span>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className={`h-8 flex-shrink-0 gap-1.5 text-white ${allMet ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600"}`}
            onClick={advanceStage}
            data-testid={`btn-mark-stage-complete-${stageNum}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {STAGE_COMPLETE_LABELS[stageNum] ?? "Mark Stage Complete"}
          </Button>
        </div>
        {stageGuardError && (
          <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{stageGuardError}</p>
        )}
      </div>
    );
  }

  function renderOverview() {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Client Info</p>
              {[["Company", client.companyName], ["Entity", client.entityType], ["Client", client.clientName], ["Email", client.email], ["Phone", client.phone], ["State", client.state], ["Package", client.package], ["Started", client.startedAt]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Formation Status</p>
              {[
                ["Stage", `${currentStage}/7 — ${FORMATION_STAGES[currentStage - 1]?.shortName ?? client.stageName}`],
                ["Health Score", `${client.healthScore}%`],
                ["Assigned To", client.assignedTo],
                ["Payment", client.paymentStatus === "paid" ? `Paid — $${client.packageAmount.toLocaleString()}` : "Pending"],
                ["KYC", client.kycStatus],
                ["EIN", effectiveEinStatus],
                ["BOI", effectiveBoiStatus],
                ["Mercury", effectiveMercuryStatus],
                ["Stripe", effectiveStripeStatus],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="border shadow-none">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Activity Log</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {client.activityLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${entry.type === "stage" ? "bg-green-500" : entry.type === "document" ? "bg-sky-500" : "bg-purple-400"}`} />
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
    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={2} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{allDocs.length} document(s) on file</p>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowReqDoc(v => !v)} data-testid="btn-request-doc">
            <Plus className="w-3.5 h-3.5" /> Request Document
          </Button>
        </div>
        {showReqDoc && (
          <div className="flex items-center gap-2 p-3 rounded-xl border bg-muted/20">
            <Input value={reqDocName} onChange={e => setReqDocName(e.target.value)} placeholder="Document name…" className="flex-1 h-8 text-sm" data-testid="input-req-doc-name" />
            <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => {
              if (!reqDocName.trim()) return;
              setExtraDocs(prev => [...prev, { id: `rd-${Date.now()}`, name: reqDocName.trim(), category: "identity", status: "pending-upload" }]);
              setReqDocName(""); setShowReqDoc(false);
            }} data-testid="btn-confirm-req-doc">Send Request</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowReqDoc(false)}><X className="w-4 h-4" /></Button>
          </div>
        )}
        <div className="space-y-2">
          {allDocs.map(doc => {
            const status = getDocStatus(doc);
            const showingRejectInput = showRejectInput[doc.id];
            return (
              <div key={doc.id} className="rounded-xl border bg-card" data-testid={`doc-${doc.id}`}>
                <div className="p-3 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{doc.name}</p>
                    {doc.uploadedAt && <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</p>}
                    {rejectReasons[doc.id] && <p className="text-xs text-red-600 mt-0.5">Rejected: {rejectReasons[doc.id]}</p>}
                    {doc.notes && !rejectReasons[doc.id] && <p className="text-xs text-amber-600 mt-0.5">{doc.notes}</p>}
                  </div>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${DOC_STATUS_COLORS[status]}`}>
                    {status.replace(/-/g, " ")}
                  </Badge>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {status !== "approved" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => {
                        setDocStates(p => ({ ...p, [doc.id]: "approved" }));
                        setShowRejectInput(p => ({ ...p, [doc.id]: false }));
                      }} data-testid={`btn-approve-doc-${doc.id}`} title="Approve">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    {status !== "rejected" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setShowRejectInput(p => ({ ...p, [doc.id]: true }))} data-testid={`btn-reject-doc-${doc.id}`} title="Reject">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {status === "rejected" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50" onClick={() => {
                        setDocStates(p => ({ ...p, [doc.id]: "pending-upload" }));
                        setRejectReasons(p => { const n = { ...p }; delete n[doc.id]; return n; });
                      }} title="Re-request">
                        <RefreshCcw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View" data-testid={`btn-view-doc-${doc.id}`}>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                {showingRejectInput && (
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <Input value={rejectInputs[doc.id] ?? ""} onChange={e => setRejectInputs(p => ({ ...p, [doc.id]: e.target.value }))} placeholder="Reason for rejection…" className="flex-1 h-7 text-xs" data-testid={`input-reject-reason-${doc.id}`} />
                    <Button size="sm" className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => {
                      setDocStates(p => ({ ...p, [doc.id]: "rejected" }));
                      setRejectReasons(p => ({ ...p, [doc.id]: rejectInputs[doc.id] || "Document rejected" }));
                      setShowRejectInput(p => ({ ...p, [doc.id]: false }));
                    }} data-testid={`btn-confirm-reject-${doc.id}`}>Reject</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowRejectInput(p => ({ ...p, [doc.id]: false }))}>Cancel</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {client.kycNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="font-medium">KYC Notes: </span><span className="text-muted-foreground">{client.kycNotes}</span></div>
        )}
      </div>
    );
  }

  function renderLLC() {
    const articlesStages: Array<ManagerClient["articlesState"]> = ["not-started", "in-progress", "submitted", "approved"];
    const oaStages: Array<ManagerClient["operatingAgreement"]> = ["pending", "generated", "signed"];
    const isComplete = effectiveArticleState === "approved" && effectiveOaState === "signed";
    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={3} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Articles of Organization / Incorporation</p>
              <div className="flex items-center gap-2 flex-wrap">
                {articlesStages.map(s => (
                  <button key={s} onClick={() => setArticleState(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${effectiveArticleState === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground hover:border-gray-300"}`} data-testid={`articles-state-${s}`}>
                    {s.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
              {client.articlesFiledDate && <p className="text-xs text-muted-foreground">Filed: {client.articlesFiledDate}</p>}
              {effectiveArticleState === "submitted" && !articlesConfirmed && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-700">Awaiting state acceptance — stamped copy pending</p>
                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => { setArticleState("approved"); setArticlesConfirmed(true); }} data-testid="btn-confirm-articles">Mark Accepted</Button>
                </div>
              )}
              {effectiveArticleState === "approved" && (
                <div className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="w-4 h-4" /> Articles accepted — stamped copy in vault</div>
              )}
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operating Agreement</p>
              <div className="flex items-center gap-2 flex-wrap">
                {oaStages.map(s => (
                  <button key={s} onClick={() => setOaState(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${effectiveOaState === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground hover:border-gray-300"}`} data-testid={`oa-state-${s}`}>
                    {s}
                  </button>
                ))}
              </div>
              {effectiveOaState === "generated" && (
                <div className="text-xs text-amber-600">Sent to client for review and signature</div>
              )}
              {effectiveOaState === "signed" && (
                <div className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="w-4 h-4" /> Operating Agreement signed & delivered</div>
              )}
            </CardContent>
          </Card>
        </div>
        {isComplete && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> LLC stage complete — Articles approved, Operating Agreement signed.
          </div>
        )}
        {client.llcNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{client.llcNotes}</span></div>
        )}
      </div>
    );
  }

  function renderEIN() {
    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={4} />
        <Card className="border shadow-none">
          <CardContent className="p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EIN Application Status</p>
            <div className="flex items-center gap-2 flex-wrap">
              {(["not-started", "submitted-fax", "submitted-online", "received"] as const).map(s => (
                <button key={s} onClick={() => setEinStateSel(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${effectiveEinStatus === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground hover:border-gray-300"}`} data-testid={`ein-state-${s}`}>
                  {s.replace(/-/g, " ")}
                </button>
              ))}
            </div>

            {effectiveEinStatus === "not-started" && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-sm font-medium">Submit SS-4 Form</p>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>IRS fax line for international applicants: <strong>(267) 941-1099</strong>. Allow 4–6 weeks for EIN assignment.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Method</label>
                    <Select value={einMethodSel} onValueChange={setEinMethodSel}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-ein-method"><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fax">Fax — International (+1 267-941-1099)</SelectItem>
                        <SelectItem value="Online">Online SS-4 Direct</SelectItem>
                        <SelectItem value="Mail">Mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Submission Date</label>
                    <Input type="date" value={einDateSel} onChange={e => setEinDateSel(e.target.value)} className="h-8 text-xs" data-testid="input-ein-date" />
                  </div>
                </div>
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" onClick={() => {
                  if (einMethodSel) setEinStateSel(einMethodSel === "Fax" ? "submitted-fax" : "submitted-online");
                }} data-testid="btn-submit-ein">
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Mark SS-4 Submitted
                </Button>
              </div>
            )}

            {(effectiveEinStatus === "submitted-fax" || effectiveEinStatus === "submitted-online") && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                    {effectiveEinStatus === "submitted-fax" ? "Fax" : "Online"} — Submitted {einDateSel || client.einSubmittedDate || "—"}
                  </Badge>
                  <span className="text-muted-foreground">Awaiting IRS response (4–6 weeks via fax)</span>
                </div>
                <p className="text-sm font-medium">Record EIN When Received</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">EIN Number</label>
                    <Input value={einNumberInput} onChange={e => setEinNumberInput(e.target.value)} placeholder="e.g. 88-1234567" className="h-8 text-xs" data-testid="input-ein-number" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Date Received</label>
                    <Input type="date" value={einRecordedDateInput} onChange={e => setEinRecordedDateInput(e.target.value)} className="h-8 text-xs" data-testid="input-ein-received-date" />
                  </div>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => { if (einNumberInput) setEinStateSel("received"); }} data-testid="btn-record-ein">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Record EIN
                </Button>
              </div>
            )}

            {effectiveEinStatus === "received" && (
              <div className="border-t pt-3 space-y-2">
                {[
                  ["EIN Number", einNumberInput || client.einNumber || "—"],
                  ["Method", einMethodSel || client.einMethod],
                  ["Submitted", einDateSel || client.einSubmittedDate || "—"],
                  ["Received", einRecordedDateInput || client.einReceivedDate || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2"><CheckCircle2 className="w-4 h-4" /> EIN confirmed and on record</div>
              </div>
            )}
          </CardContent>
        </Card>
        {client.einNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{client.einNotes}</span></div>
        )}
      </div>
    );
  }

  function renderBOI() {
    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={5} />
        <div className="flex items-center gap-2 flex-wrap">
          {(["not-started", "pending-kyc", "in-progress", "draft-ready", "filed"] as const).map(s => (
            <button key={s} onClick={() => setBoiStatus(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${effectiveBoiStatus === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground hover:border-gray-300"}`} data-testid={`boi-state-${s}`}>
              {s.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Beneficial Owners ({allOwners.length})</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowAddOwner(v => !v)} data-testid="btn-add-owner">
                <Plus className="w-3 h-3" /> Add Owner
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {showAddOwner && (
              <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input value={ownerDraft.name} onChange={e => setOwnerDraft(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className="h-8 text-xs" data-testid="input-owner-name" />
                  <Input value={ownerDraft.ownership} onChange={e => setOwnerDraft(p => ({ ...p, ownership: e.target.value }))} placeholder="Ownership % *" className="h-8 text-xs" data-testid="input-owner-ownership" />
                  <Input value={ownerDraft.dob} onChange={e => setOwnerDraft(p => ({ ...p, dob: e.target.value }))} placeholder="Date of Birth (YYYY-MM-DD)" className="h-8 text-xs" data-testid="input-owner-dob" />
                  <Input value={ownerDraft.passportNum} onChange={e => setOwnerDraft(p => ({ ...p, passportNum: e.target.value }))} placeholder="Passport / ID Number" className="h-8 text-xs" data-testid="input-owner-passport" />
                  <Input value={ownerDraft.address} onChange={e => setOwnerDraft(p => ({ ...p, address: e.target.value }))} placeholder="Address" className="h-8 text-xs col-span-2" data-testid="input-owner-address" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 bg-sky-500 hover:bg-sky-600 text-white text-xs" onClick={() => {
                    if (!ownerDraft.name || !ownerDraft.ownership) return;
                    setExtraOwners(prev => [...prev, { id: `o-${Date.now()}`, ...ownerDraft }]);
                    setOwnerDraft({ name: "", ownership: "", dob: "", address: "", passportNum: "" });
                    setShowAddOwner(false);
                  }} data-testid="btn-save-owner">Add Owner</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddOwner(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {allOwners.map(owner => (
              <div key={owner.id} className="p-3 rounded-xl bg-muted/30 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{owner.name}</p>
                  <Badge variant="outline" className="text-[10px] border-sky-300 text-sky-700 bg-sky-50">{owner.ownership}</Badge>
                </div>
                {owner.dob && <p className="text-muted-foreground text-xs">DOB: {owner.dob}</p>}
                {owner.address && <p className="text-muted-foreground text-xs">{owner.address}</p>}
                {owner.passportNum && <p className="text-muted-foreground text-xs">ID: {owner.passportNum}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {effectiveBoiStatus === "draft-ready" && (
          <div className="p-3 rounded-xl border bg-sky-50/50 space-y-3">
            <p className="text-sm font-medium text-sky-700">Ready to file with FinCEN BOIR system</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">FinCEN Filing Date</label>
                <Input type="date" value={boiFiledDate} onChange={e => setBoiFiledDate(e.target.value)} className="h-7 text-xs mt-0.5" data-testid="input-boi-filed-date" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirmation Number</label>
                <Input value={boiConfirmNum} onChange={e => setBoiConfirmNum(e.target.value)} placeholder="BOIR-XXXXXXX" className="h-7 text-xs mt-0.5" data-testid="input-boi-confirm-num" />
              </div>
            </div>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8" onClick={() => { setBoiStatus("filed"); }} data-testid="btn-file-boi">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Mark as Filed with FinCEN
            </Button>
          </div>
        )}

        {effectiveBoiStatus === "filed" && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 space-y-1">
            <div className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="w-4 h-4" /> BOI filed with FinCEN — Compliant</div>
            {effectiveBoiFiledDate && <p className="text-xs text-muted-foreground ml-6">Filed: {effectiveBoiFiledDate}</p>}
            {effectiveBoiConfirmNum && <p className="text-xs text-green-700 font-medium ml-6">FinCEN Confirmation: {effectiveBoiConfirmNum}</p>}
          </div>
        )}

        {client.boiNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{client.boiNotes}</span></div>
        )}
      </div>
    );
  }

  function renderBanking() {
    const allDone = effectiveMercuryStatus === "approved" && effectiveStripeStatus === "approved";
    const mercurySteps = [
      { label: "Gather docs: passport, EIN letter, articles", done: currentStage >= 4 },
      { label: "Submit Mercury online application", done: effectiveMercuryStatus === "applied" || effectiveMercuryStatus === "approved" },
      { label: "Account approved & account number received", done: effectiveMercuryStatus === "approved" },
      { label: "Record account details", done: effectiveMercuryStatus === "approved" && !!effectiveMercuryAccountNum },
    ];
    const stripeSteps = [
      { label: "EIN received & business documents ready", done: effectiveEinStatus === "received" },
      { label: "Submit Stripe business account application", done: effectiveStripeStatus === "applied" || effectiveStripeStatus === "approved" },
      { label: "Stripe account verified & active", done: effectiveStripeStatus === "approved" },
      { label: "Record Stripe Account ID", done: effectiveStripeStatus === "approved" && !!effectiveStripeAccountId },
    ];

    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={6} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Mercury Bank</p>
                <div className="flex gap-1 flex-wrap">
                  {(["not-started", "applied", "approved", "rejected"] as const).map(s => (
                    <button key={s} onClick={() => setMercuryStatus(s)} className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${effectiveMercuryStatus === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground"}`} data-testid={`mercury-state-${s}`}>{s.replace(/-/g, " ")}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {mercurySteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.done ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                    <span className={step.done ? "text-foreground" : "text-muted-foreground text-xs"}>{step.label}</span>
                  </div>
                ))}
              </div>
              {effectiveMercuryStatus === "approved" && (
                <div className="space-y-2 border-t pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Account Number</label>
                    <Input value={mercuryAccountNum || client.mercuryAccountNum || ""} onChange={e => setMercuryAccountNum(e.target.value)} placeholder="e.g. 1234567890" className="h-7 text-xs mt-0.5" data-testid="input-mercury-account" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Approved Date</label>
                    <Input type="date" value={mercuryApprovedDate || client.mercuryApprovedDate || ""} onChange={e => setMercuryApprovedDate(e.target.value)} className="h-7 text-xs mt-0.5" data-testid="input-mercury-date" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Stripe Payments</p>
                <div className="flex gap-1 flex-wrap">
                  {(["not-started", "applied", "approved", "rejected"] as const).map(s => (
                    <button key={s} onClick={() => setStripeStatus(s)} className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${effectiveStripeStatus === s ? "bg-sky-50 border-sky-300 text-sky-700" : "border-gray-200 text-muted-foreground"}`} data-testid={`stripe-state-${s}`}>{s.replace(/-/g, " ")}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {stripeSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.done ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                    <span className={step.done ? "text-foreground" : "text-muted-foreground text-xs"}>{step.label}</span>
                  </div>
                ))}
              </div>
              {effectiveStripeStatus === "approved" && (
                <div className="space-y-2 border-t pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Stripe Account ID</label>
                    <Input value={stripeAccountId || client.stripeAccountId || ""} onChange={e => setStripeAccountId(e.target.value)} placeholder="acct_XXXXXXXX" className="h-7 text-xs mt-0.5" data-testid="input-stripe-account" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Approved Date</label>
                    <Input type="date" value={stripeApprovedDate || client.stripeApprovedDate || ""} onChange={e => setStripeApprovedDate(e.target.value)} className="h-7 text-xs mt-0.5" data-testid="input-stripe-date" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {allDone && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Banking stage complete — Mercury {effectiveMercuryAccountNum ? `(${effectiveMercuryAccountNum})` : "approved"}, Stripe {effectiveStripeAccountId ? `(${effectiveStripeAccountId})` : "active"}
          </div>
        )}
        {client.bankingNotes && (
          <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="font-medium">Notes: </span><span className="text-muted-foreground">{client.bankingNotes}</span></div>
        )}
      </div>
    );
  }

  function renderTasks() {
    const openTasks = allTasks.filter(t => !getTaskDone(t));
    const doneTasks = allTasks.filter(t => getTaskDone(t));
    return (
      <div className="space-y-4">
        <StageCompleteBar stageNum={7} />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Task</p>
          <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
            <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title…" className="h-8 text-sm" data-testid="input-task-title" />
            <div className="grid grid-cols-3 gap-2">
              <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-task-assignee"><SelectValue placeholder="Assignee" /></SelectTrigger>
                <SelectContent>
                  {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="h-8 text-xs" data-testid="input-task-due" />
              <Select value={newTaskPriority} onValueChange={v => setNewTaskPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-task-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => {
              if (!newTaskTitle.trim()) return;
              setExtraTasks(prev => [...prev, { id: `et-${Date.now()}`, title: newTaskTitle.trim(), assignedTo: newTaskAssignee || "Priya Sharma", due: newTaskDue || "2026-04-30", done: false, priority: newTaskPriority }]);
              setNewTaskTitle(""); setNewTaskAssignee(""); setNewTaskDue("");
            }} data-testid="btn-add-task">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Task
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Tasks ({openTasks.length})</p>
          {openTasks.map(task => (
            <div key={task.id} className="p-3 rounded-xl border bg-card flex items-start gap-3" data-testid={`task-${task.id}`}>
              <button className="w-5 h-5 rounded border border-gray-300 hover:border-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5" onClick={() => setTaskStates(p => ({ ...p, [task.id]: true }))} data-testid={`btn-toggle-task-${task.id}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.assignedTo} · Due {task.due}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
            </div>
          ))}
          {openTasks.length === 0 && <p className="text-sm text-muted-foreground py-2 text-center">No open tasks.</p>}
        </div>

        {doneTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Done ({doneTasks.length})</p>
            {doneTasks.map(task => (
              <div key={task.id} className="p-3 rounded-xl bg-muted/20 flex items-center gap-3 opacity-60" data-testid={`done-task-${task.id}`}>
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground hover:text-foreground" onClick={() => setTaskStates(p => ({ ...p, [task.id]: false }))} data-testid={`btn-reopen-task-${task.id}`}>Reopen</Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5" /> Internal Notes</p>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add internal notes about this client…" className="text-sm min-h-[100px]" data-testid="textarea-notes" />
        </div>
      </div>
    );
  }

  function renderTickets() {
    return (
      <div className="space-y-4">
        <div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowNewTicket(v => !v)} data-testid="btn-raise-ticket">
            <Plus className="w-3.5 h-3.5" /> Raise New Ticket
          </Button>
        </div>
        {showNewTicket && (
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <p className="text-sm font-medium">New Ticket</p>
            <Input value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} placeholder="Subject *…" className="h-8 text-sm" data-testid="input-ticket-subject" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newTicketPriority} onValueChange={v => setNewTicketPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-new-ticket-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTicketAssignee} onValueChange={setNewTicketAssignee}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-ticket-assignee"><SelectValue placeholder="Assign to…" /></SelectTrigger>
                <SelectContent>
                  {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea value={newTicketNotes} onChange={e => setNewTicketNotes(e.target.value)} placeholder="Description…" className="text-sm min-h-[60px]" data-testid="textarea-ticket-notes" />
            <div className="flex gap-2">
              <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => {
                if (!newTicketSubject.trim()) return;
                const id = `nt-${Date.now()}`;
                setExtraTickets(prev => [...prev, { id, subject: newTicketSubject.trim(), priority: newTicketPriority, status: "open", created: TODAY, lastUpdate: TODAY, notes: newTicketNotes }]);
                if (newTicketAssignee) setTicketAssignees(p => ({ ...p, [id]: newTicketAssignee }));
                setNewTicketSubject(""); setNewTicketNotes(""); setNewTicketAssignee(""); setShowNewTicket(false);
              }} data-testid="btn-submit-ticket">Submit Ticket</Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowNewTicket(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {allTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tickets for this client.</p>
        ) : allTickets.map(ticket => {
          const status = getTicketStatus(ticket);
          const assignee = ticketAssignees[ticket.id];
          const replies = ticketReplies[ticket.id] ?? [];
          const isOpen = openTicketId === ticket.id;
          const replyText = replyInputs[ticket.id] ?? "";
          return (
            <div key={ticket.id} className="rounded-xl border bg-card" data-testid={`ticket-${ticket.id}`}>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <button className="text-sm font-medium hover:text-sky-600 transition-colors text-left" onClick={() => setOpenTicketId(isOpen ? null : ticket.id)} data-testid={`btn-expand-ticket-${ticket.id}`}>
                      {ticket.subject}
                    </button>
                    {ticket.notes && <p className="text-xs text-muted-foreground mt-0.5">{ticket.notes}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">Created {ticket.created}</p>
                      {assignee && <span className="text-xs text-sky-600 flex items-center gap-1"><User className="w-3 h-3" />{assignee.split(" ")[0]}</span>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" />{replies.length} replies</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${TICKET_STATUS_COLORS[status]}`}>{status.replace("-", " ")}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Select value={status} onValueChange={v => setTicketStatuses(p => ({ ...p, [ticket.id]: v as ManagerTicket["status"] }))}>
                    <SelectTrigger className="h-6 text-xs w-32" data-testid={`select-ticket-status-${ticket.id}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={assignee ?? ""} onValueChange={v => setTicketAssignees(p => ({ ...p, [ticket.id]: v }))}>
                    <SelectTrigger className="h-6 text-xs w-36" data-testid={`select-ticket-assignee-${ticket.id}`}><SelectValue placeholder="Assign to…" /></SelectTrigger>
                    <SelectContent>
                      {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setOpenTicketId(isOpen ? null : ticket.id)} data-testid={`btn-thread-${ticket.id}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> {isOpen ? "Hide" : "View"} Thread
                  </Button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t px-3 pb-3 space-y-3 pt-3">
                  {replies.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No replies yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {replies.map(reply => (
                        <div key={reply.id} className={`flex gap-2 ${reply.isManager ? "flex-row-reverse" : ""}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${reply.isManager ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}>
                            {reply.from.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </div>
                          <div className={`max-w-[80%] ${reply.isManager ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                            <p className="text-[10px] text-muted-foreground">{reply.from} · {reply.time}</p>
                            <div className={`px-3 py-2 rounded-xl text-sm ${reply.isManager ? "bg-sky-500 text-white" : "bg-muted/50"}`}>{reply.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input value={replyText} onChange={e => setReplyInputs(p => ({ ...p, [ticket.id]: e.target.value }))} placeholder="Type a reply…" className="flex-1 h-8 text-xs" data-testid={`input-ticket-reply-${ticket.id}`} />
                    <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white px-3" onClick={() => {
                      if (!replyText.trim()) return;
                      const newReply: TicketReply = { id: `r-${Date.now()}`, from: "Vikas (Manager)", content: replyText.trim(), time: "Just now", isManager: true };
                      setTicketReplies(p => ({ ...p, [ticket.id]: [...(p[ticket.id] ?? []), newReply] }));
                      setReplyInputs(p => ({ ...p, [ticket.id]: "" }));
                    }} data-testid={`btn-send-reply-${ticket.id}`}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const TAB_CONTENT: Record<ClientTabId, () => JSX.Element> = {
    overview: renderOverview, documents: renderDocuments, llc: renderLLC, ein: renderEIN, boi: renderBOI, banking: renderBanking, tasks: renderTasks, tickets: renderTickets,
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
              <Progress value={(currentStage / 7) * 100} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground">{currentStage}/7</span>
            </div>
            <div className={`mt-1.5 text-xs font-bold ${HEALTH_COLOR(client.healthScore)}`}>Health: {client.healthScore}%</div>
          </div>
          <StageTracker stage={currentStage} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-5 border-b pb-2 overflow-x-auto">
            {CLIENT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-sky-50 text-sky-700 border border-sky-200" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`} data-testid={`tab-${tab.id}`}>
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
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [extraTasks, setExtraTasks] = useState<Array<ManagerTask & { company: string; clientId: string }>>([]);

  const baseTasks = MANAGER_CLIENTS.flatMap(c => c.tasks.map(t => ({ ...t, company: c.companyName, clientId: c.id })));
  const allTasks = [...baseTasks, ...extraTasks];

  const isTaskDone = (t: typeof allTasks[number]) => taskStates[t.id] ?? t.done;

  const filtered = allTasks.filter(t => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && t.assignedTo !== assigneeFilter) return false;
    if (clientFilter !== "all" && t.clientId !== clientFilter) return false;
    if (statusFilter === "open" && isTaskDone(t)) return false;
    if (statusFilter === "done" && !isTaskDone(t)) return false;
    if (dueDateFilter && t.due > dueDateFilter) return false;
    return true;
  });

  const open = filtered.filter(t => !isTaskDone(t));
  const done = filtered.filter(t => isTaskDone(t));
  const assignees = [...new Set(allTasks.map(t => t.assignedTo))];

  const totalOpen = allTasks.filter(t => !isTaskDone(t)).length;
  const totalDone = allTasks.filter(t => isTaskDone(t)).length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-tasks">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalOpen} open · {totalDone} done</p>
        </div>
        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8 gap-1.5" onClick={() => setShowCreate(v => !v)} data-testid="btn-create-task">
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {showCreate && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
          <p className="text-sm font-semibold">Create Task</p>
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title *" className="h-8 text-sm" data-testid="input-new-task-title" />
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={newClientId} onValueChange={setNewClientId}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-task-client"><SelectValue placeholder="Client *" /></SelectTrigger>
              <SelectContent>
                {MANAGER_CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-new-task-assignee"><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className="h-8 text-xs" data-testid="input-new-task-due" />
            <Select value={newPriority} onValueChange={v => setNewPriority(v as "high" | "medium" | "low")}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-new-task-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => {
              if (!newTitle.trim() || !newClientId) return;
              const co = MANAGER_CLIENTS.find(c => c.id === newClientId);
              setExtraTasks(prev => [...prev, { id: `nt-${Date.now()}`, title: newTitle.trim(), assignedTo: newAssignee || "Priya Sharma", due: newDue || "2026-04-30", done: false, priority: newPriority, company: co?.companyName ?? "", clientId: newClientId }]);
              setNewTitle(""); setNewClientId(""); setNewAssignee(""); setNewDue(""); setShowCreate(false);
            }} data-testid="btn-save-new-task">Create Task</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-32" data-testid="select-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">To Do / Open</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 text-xs w-32" data-testid="select-priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="h-8 text-xs w-40" data-testid="select-assignee-filter"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map(a => <SelectItem key={a} value={a}>{a.split(" ")[0]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="h-8 text-xs w-44" data-testid="select-client-filter"><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {MANAGER_CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Due by</label>
          <Input type="date" value={dueDateFilter} onChange={e => setDueDateFilter(e.target.value)} className="h-8 text-xs w-36" data-testid="input-due-date-filter" />
          {dueDateFilter && <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDueDateFilter("")}><X className="w-3.5 h-3.5" /></Button>}
        </div>
      </div>

      <div className="space-y-2">
        {open.map(task => (
          <div key={task.id} className="p-3 rounded-xl border bg-card flex items-start gap-3" data-testid={`task-row-${task.id}`}>
            <button className="w-5 h-5 rounded border border-gray-300 hover:border-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5" onClick={() => setTaskStates(p => ({ ...p, [task.id]: true }))} data-testid={`btn-complete-task-${task.id}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{task.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <button className="text-xs text-sky-600 hover:underline" onClick={() => navigate(`/portal-ln/manager/client/${task.clientId}`)} data-testid={`link-client-${task.clientId}`}>{task.company}</button>
                <span className="text-xs text-muted-foreground">{task.assignedTo} · Due {task.due}</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
          </div>
        ))}
        {open.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No open tasks match the filters.</p>}
      </div>

      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completed ({done.length})</p>
          <div className="space-y-1.5">
            {done.map(task => (
              <div key={task.id} className="p-3 rounded-xl bg-muted/20 flex items-center gap-3" data-testid={`done-task-row-${task.id}`}>
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.company}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setTaskStates(p => ({ ...p, [task.id]: false }))} data-testid={`btn-reopen-task-${task.id}`}>Reopen</Button>
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
  const [ticketAssignees, setTicketAssignees] = useState<Record<string, string>>({});
  const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newNotes, setNewNotes] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [extraTickets, setExtraTickets] = useState<Array<ManagerTicket & { company: string; clientId: string }>>([]);

  const allTickets = [
    ...MANAGER_CLIENTS.flatMap(c => c.tickets.map(t => ({ ...t, company: c.companyName, clientId: c.id }))),
    ...extraTickets,
  ];

  const getStatus = (t: typeof allTickets[number]) => ticketStates[t.id] ?? t.status;

  const filtered = allTickets.filter(t => {
    const status = getStatus(t);
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (clientFilter !== "all" && t.clientId !== clientFilter) return false;
    return true;
  });

  const openCount = allTickets.filter(t => getStatus(t) !== "resolved").length;
  const resolvedCount = allTickets.filter(t => getStatus(t) === "resolved").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="ln-manager-tickets">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{openCount} open · {resolvedCount} resolved</p>
        </div>
        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white h-8 gap-1.5" onClick={() => setShowNewTicket(v => !v)} data-testid="btn-new-ticket">
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </Button>
      </div>

      {showNewTicket && (
        <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
          <p className="text-sm font-semibold">Create Ticket</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject *" className="h-8 text-sm col-span-2" data-testid="input-new-ticket-subject" />
            <Select value={newClientId} onValueChange={setNewClientId}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-ticket-client"><SelectValue placeholder="Client *" /></SelectTrigger>
              <SelectContent>
                {MANAGER_CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-ticket-assignee-new"><SelectValue placeholder="Assign to…" /></SelectTrigger>
              <SelectContent>
                {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newPriority} onValueChange={v => setNewPriority(v as "high" | "medium" | "low")}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-new-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes / description…" className="text-sm min-h-[60px]" data-testid="textarea-new-ticket-notes" />
          <div className="flex gap-2">
            <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => {
              if (!newSubject.trim() || !newClientId) return;
              const co = MANAGER_CLIENTS.find(c => c.id === newClientId);
              const id = `nt-${Date.now()}`;
              setExtraTickets(prev => [...prev, { id, subject: newSubject.trim(), priority: newPriority, status: "open", created: TODAY, lastUpdate: TODAY, notes: newNotes, company: co?.companyName ?? "", clientId: newClientId }]);
              if (newAssignee) setTicketAssignees(p => ({ ...p, [id]: newAssignee }));
              setNewSubject(""); setNewNotes(""); setNewClientId(""); setNewAssignee(""); setShowNewTicket(false);
            }} data-testid="btn-submit-new-ticket">Create Ticket</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowNewTicket(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 text-xs w-32" data-testid="select-ticket-priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-36" data-testid="select-ticket-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="h-8 text-xs w-44" data-testid="select-ticket-client-filter"><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {MANAGER_CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No tickets match the current filters.</p>
        ) : filtered.map(ticket => {
          const status = getStatus(ticket);
          const assignee = ticketAssignees[ticket.id];
          const replies = ticketReplies[ticket.id] ?? [];
          const isOpen = openTicketId === ticket.id;
          const replyText = replyInputs[ticket.id] ?? "";
          return (
            <Card key={ticket.id} className="border-0 shadow-sm" data-testid={`ticket-row-${ticket.id}`}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <button className="text-sm font-medium text-left hover:text-sky-600 transition-colors" onClick={() => setOpenTicketId(isOpen ? null : ticket.id)} data-testid={`btn-expand-ticket-${ticket.id}`}>
                        {ticket.subject}
                      </button>
                      <div className="flex items-center gap-3 mt-1">
                        <button className="text-xs text-sky-600 hover:underline" onClick={() => navigate(`/portal-ln/manager/client/${ticket.clientId}`)} data-testid={`link-ticket-client-${ticket.clientId}`}>{ticket.company}</button>
                        <span className="text-xs text-muted-foreground">Created {ticket.created}</span>
                        {assignee && <span className="text-xs text-sky-600 flex items-center gap-1"><User className="w-3 h-3" />{assignee.split(" ")[0]}</span>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" />{replies.length}</span>
                      </div>
                      {ticket.notes && <p className="text-xs text-muted-foreground mt-1">{ticket.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${TICKET_STATUS_COLORS[status]}`}>{status.replace("-", " ")}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Select value={status} onValueChange={v => setTicketStates(p => ({ ...p, [ticket.id]: v as ManagerTicket["status"] }))}>
                      <SelectTrigger className="h-7 text-xs w-32" data-testid={`select-ticket-${ticket.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={assignee ?? ""} onValueChange={v => setTicketAssignees(p => ({ ...p, [ticket.id]: v }))}>
                      <SelectTrigger className="h-7 text-xs w-36" data-testid={`select-ticket-assign-${ticket.id}`}><SelectValue placeholder="Assign to…" /></SelectTrigger>
                      <SelectContent>
                        {MANAGER_TEAM.map(m => <SelectItem key={m.name} value={m.name}>{m.name.split(" ")[0]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setOpenTicketId(isOpen ? null : ticket.id)}>
                      <MessageSquare className="w-3.5 h-3.5" /> {isOpen ? "Hide" : "Thread"} ({replies.length})
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t px-4 pb-4 space-y-3 pt-3">
                    {replies.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No replies yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {replies.map(reply => (
                          <div key={reply.id} className={`flex gap-2 ${reply.isManager ? "flex-row-reverse" : ""}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${reply.isManager ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}>
                              {reply.from.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                            </div>
                            <div className={`max-w-[80%] flex flex-col gap-0.5 ${reply.isManager ? "items-end" : "items-start"}`}>
                              <p className="text-[10px] text-muted-foreground">{reply.from} · {reply.time}</p>
                              <div className={`px-3 py-2 rounded-xl text-sm ${reply.isManager ? "bg-sky-500 text-white" : "bg-muted/50"}`}>{reply.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input value={replyText} onChange={e => setReplyInputs(p => ({ ...p, [ticket.id]: e.target.value }))} placeholder="Type a reply…" className="flex-1 h-8 text-xs" data-testid={`input-ticket-reply-${ticket.id}`} />
                      <Button size="sm" className="h-8 bg-sky-500 hover:bg-sky-600 text-white px-3" onClick={() => {
                        if (!replyText.trim()) return;
                        const newReply: TicketReply = { id: `r-${Date.now()}`, from: "Vikas (Manager)", content: replyText.trim(), time: "Just now", isManager: true };
                        setTicketReplies(p => ({ ...p, [ticket.id]: [...(p[ticket.id] ?? []), newReply] }));
                        setReplyInputs(p => ({ ...p, [ticket.id]: "" }));
                      }} data-testid={`btn-send-reply-${ticket.id}`}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
