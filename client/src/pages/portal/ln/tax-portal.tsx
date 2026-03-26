import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Calendar, ClipboardList, Receipt,
  AlertTriangle, CheckCircle2, Circle, Clock,
  Send, Printer, Eye, ChevronRight, Mail,
  Building2, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  TAX_FILINGS, TAX_STATUS_LABELS, TAX_STATUS_COLORS,
  TAX_PREP_STEPS, TAX_CALENDAR_DEADLINES,
  type TaxFilingStatus,
} from "@/lib/mock-data-dashboard-ln";

function daysUntil(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export default function LnTaxPortal() {
  const filed = TAX_FILINGS.filter(f => f.status === "filed").length;
  const inProgress = TAX_FILINGS.filter(f => !["filed", "not-started"].includes(f.status)).length;
  const notStarted = TAX_FILINGS.filter(f => f.status === "not-started").length;
  const readyToFile = TAX_FILINGS.filter(f => f.status === "ready-to-file").length;
  const nextDeadline = TAX_CALENDAR_DEADLINES.filter(d => !d.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const daysLeft = nextDeadline ? daysUntil(nextDeadline.date) : 0;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-tax-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm text-amber-200 mb-1">Tax Specialist — Deepak Verma</p>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-tax-title">Tax Season Dashboard</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-amber-200">
            <span><strong className="text-white">{TAX_FILINGS.length}</strong> Total Filings</span>
            <span><strong className="text-white">{filed}</strong> Filed</span>
            <span><strong className="text-white">{inProgress}</strong> In Progress</span>
            {daysLeft > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <strong className="text-white">{daysLeft}</strong> days to deadline
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Filed", value: filed, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "In Progress", value: inProgress, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Ready to File", value: readyToFile, color: "text-green-600", bg: "bg-green-50", icon: Send },
          { label: "Not Started", value: notStarted, color: "text-gray-500", bg: "bg-gray-50", icon: Circle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold" data-testid={`stat-tax-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Active Filings
              </CardTitle>
              <Badge variant="outline" className="text-xs">{TAX_FILINGS.length} filings</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {TAX_FILINGS.filter(f => f.status !== "not-started").slice(0, 5).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`tax-filing-row-${f.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                  {f.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.company}</p>
                  <p className="text-xs text-muted-foreground">{f.client} · {f.ein || "No EIN"} · {f.forms.join(", ")}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${TAX_STATUS_COLORS[f.status]}`}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {TAX_CALENDAR_DEADLINES.filter(d => !d.done).slice(0, 4).map((dl) => (
                <div key={dl.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`tax-deadline-${dl.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{dl.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${dl.priority === "critical" ? "border-red-300 text-red-700 bg-red-50" : dl.priority === "high" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500"}`}
                    >
                      {dl.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{dl.date}{dl.company ? ` · ${dl.company}` : ""}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">Filing Progress</span>
              </div>
              <Progress value={(filed / TAX_FILINGS.length) * 100} className="h-2 mb-2" />
              <p className="text-xs text-amber-700">{filed} of {TAX_FILINGS.length} filings complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnTaxQueue() {
  const [filter, setFilter] = useState<TaxFilingStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = TAX_FILINGS;
    if (filter !== "all") list = list.filter(f => f.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.company.toLowerCase().includes(q) || f.client.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search]);

  const statuses: (TaxFilingStatus | "all")[] = ["all", "docs-pending", "in-prep", "review", "ready-to-file", "filed", "not-started"];
  const statusLabels: Record<string, string> = { all: "All", ...TAX_STATUS_LABELS };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-queue-title">Filing Queue</h1>
        <p className="text-sm text-muted-foreground">Track all tax filings for the current season</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            className={filter === s ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
            onClick={() => setFilter(s)}
            data-testid={`filter-${s}`}
          >
            {statusLabels[s]}
            {s !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({TAX_FILINGS.filter(f => f.status === s).length})
              </span>
            )}
          </Button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search company or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-56 text-xs"
            data-testid="input-tax-search"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((f) => (
          <Card key={f.id} className="border-0 shadow-sm" data-testid={`tax-queue-card-${f.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-600 shrink-0">
                    {f.company[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{f.company}</p>
                    <p className="text-sm text-muted-foreground">{f.client} · {f.state} · {f.entityType} · TY {f.taxYear}</p>
                  </div>
                </div>
                <Badge variant="outline" className={TAX_STATUS_COLORS[f.status]}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">EIN</p>
                  <p className="font-semibold mt-0.5">{f.ein || "Pending"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Forms</p>
                  <p className="font-semibold mt-0.5">{f.forms.join(", ")}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold mt-0.5">{f.revenue > 0 ? `$${f.revenue.toLocaleString()}` : "Zero-activity"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold mt-0.5">{f.dueDate}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{f.notes}</p>
              {f.status === "ready-to-file" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" data-testid={`print-${f.id}`}>
                    <Printer className="w-3.5 h-3.5" /> Print & Mail
                  </Button>
                </div>
              )}
              {f.status === "filed" && f.trackingNumber && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Filed {f.filedDate}</p>
                    <p className="text-[10px] text-emerald-600">Tracking: {f.trackingNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No filings match your filter</div>
        )}
      </div>
    </div>
  );
}

export function LnTaxPrep() {
  const activeFilings = TAX_FILINGS.filter(f => !["not-started", "filed"].includes(f.status));

  const getStepProgress = (filing: typeof TAX_FILINGS[0]): number => {
    const statusOrder: TaxFilingStatus[] = ["docs-pending", "in-prep", "review", "client-review", "ready-to-file", "mailed"];
    const idx = statusOrder.indexOf(filing.status);
    return idx >= 0 ? Math.round(((idx + 1) / TAX_PREP_STEPS.length) * 100) : 0;
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-prep-title">Preparation Workspace</h1>
        <p className="text-sm text-muted-foreground">Step-by-step tax preparation workflow</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">SOP — Tax Filing Procedure (8 Steps)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TAX_PREP_STEPS.map((step) => (
              <div key={step.n} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors" data-testid={`sop-step-${step.n}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">{step.n}</span>
                  <span className="text-xs font-semibold">{step.title}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Active Filings Progress</h2>
        {activeFilings.map((f) => {
          const progress = getStepProgress(f);
          return (
            <Card key={f.id} className="border-0 shadow-sm" data-testid={`prep-card-${f.id}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                      {f.company[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.company}</p>
                      <p className="text-xs text-muted-foreground">{f.client} · {f.ein || "No EIN"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={TAX_STATUS_COLORS[f.status]}>
                    {TAX_STATUS_LABELS[f.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-xs font-bold text-muted-foreground">{progress}%</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TAX_PREP_STEPS.map((step) => {
                    const statusOrder: TaxFilingStatus[] = ["docs-pending", "in-prep", "review", "client-review", "ready-to-file", "mailed"];
                    const currentIdx = statusOrder.indexOf(f.status);
                    const isDone = step.n <= currentIdx + 1;
                    const isCurrent = step.n === currentIdx + 1;
                    return (
                      <span
                        key={step.n}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDone ? (isCurrent ? "bg-amber-500 text-white" : "bg-emerald-100 text-emerald-700") : "bg-muted text-muted-foreground"}`}
                      >
                        {step.n}. {step.title}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function LnTaxDetail() {
  const [selected, setSelected] = useState(TAX_FILINGS[0]);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-detail-title">Filing Detail</h1>
        <p className="text-sm text-muted-foreground">Complete filing information and history</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Select Filing</p>
          {TAX_FILINGS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${selected.id === f.id ? "bg-amber-100 border border-amber-300" : "bg-muted/40 hover:bg-muted/60"}`}
              data-testid={`select-filing-${f.id}`}
            >
              <p className="text-xs font-semibold truncate">{f.company}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className={`text-[9px] ${TAX_STATUS_COLORS[f.status]}`}>
                  {TAX_STATUS_LABELS[f.status]}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-600">
                    {selected.company[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{selected.company}</h2>
                    <p className="text-sm text-muted-foreground">{selected.client} · {selected.entityType} · {selected.state}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-sm ${TAX_STATUS_COLORS[selected.status]}`}>
                  {TAX_STATUS_LABELS[selected.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">EIN</p>
                  <p className="font-bold">{selected.ein || "Not Assigned"}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tax Year</p>
                  <p className="font-bold">{selected.taxYear}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="font-bold">{selected.dueDate}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="font-bold">{selected.revenue > 0 ? `$${selected.revenue.toLocaleString()}` : "Zero-activity"}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Forms Required</p>
                  <p className="font-bold text-sm">{selected.forms.join(", ")}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <p className="font-bold">{selected.assignedTo}</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800 mb-1">Notes</p>
                <p className="text-sm text-amber-700">{selected.notes}</p>
              </div>

              {selected.status === "filed" && selected.trackingNumber && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">Filed Successfully</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-emerald-600">Filed Date</p>
                      <p className="font-medium">{selected.filedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Tracking Number</p>
                      <p className="font-medium font-mono text-xs">{selected.trackingNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {selected.status === "docs-pending" && (
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" data-testid="button-request-docs">
                    <Send className="w-3.5 h-3.5" /> Request Documents
                  </Button>
                )}
                {selected.status === "review" && (
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white gap-1" data-testid="button-approve-review">
                    <Eye className="w-3.5 h-3.5" /> Complete Review
                  </Button>
                )}
                {selected.status === "ready-to-file" && (
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1" data-testid="button-print-file">
                    <Printer className="w-3.5 h-3.5" /> Print & File
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1" data-testid="button-view-sop">
                  <ClipboardList className="w-3.5 h-3.5" /> View SOP
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnTaxCalendar() {
  const upcoming = TAX_CALENDAR_DEADLINES.filter(d => !d.done).sort((a, b) => a.date.localeCompare(b.date));
  const completed = TAX_CALENDAR_DEADLINES.filter(d => d.done);

  const typeColors: Record<string, string> = {
    filing: "bg-red-100 text-red-700",
    extension: "bg-purple-100 text-purple-700",
    "estimated-tax": "bg-blue-100 text-blue-700",
    state: "bg-amber-100 text-amber-700",
    reminder: "bg-gray-100 text-gray-700",
  };

  const typeLabels: Record<string, string> = {
    filing: "Filing",
    extension: "Extension",
    "estimated-tax": "Est. Tax",
    state: "State",
    reminder: "Reminder",
  };

  const months = useMemo(() => {
    const map = new Map<string, typeof TAX_CALENDAR_DEADLINES>();
    upcoming.forEach(d => {
      const m = new Date(d.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(d);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-tax-calendar-title">Tax Calendar</h1>
        <p className="text-sm text-muted-foreground">All IRS and state filing deadlines</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["filing", "extension", "estimated-tax", "state"] as const).map((type) => {
          const count = TAX_CALENDAR_DEADLINES.filter(d => d.type === type && !d.done).length;
          return (
            <Card key={type} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600" data-testid={`cal-count-${type}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{typeLabels[type]} Deadlines</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        {months.map(([month, items]) => (
          <div key={month}>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> {month}
            </h2>
            <div className="space-y-2">
              {items.map((dl) => {
                const days = daysUntil(dl.date);
                return (
                  <div
                    key={dl.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${dl.priority === "critical" ? "border-red-200 bg-red-50/30" : "bg-white border-transparent shadow-sm"}`}
                    data-testid={`cal-item-${dl.id}`}
                  >
                    <div className="w-14 text-center shrink-0">
                      <p className="text-lg font-bold">{new Date(dl.date).getDate()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{new Date(dl.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{dl.title}</p>
                      {dl.company && <p className="text-xs text-muted-foreground">{dl.company}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[dl.type]}`}>
                        {typeLabels[dl.type]}
                      </span>
                      {days > 0 && days <= 30 && (
                        <span className={`text-xs font-bold ${days <= 7 ? "text-red-600" : days <= 14 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {days}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
            </h2>
            <div className="space-y-2">
              {completed.map((dl) => (
                <div key={dl.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 opacity-60" data-testid={`cal-done-${dl.id}`}>
                  <div className="w-14 text-center shrink-0">
                    <p className="text-lg font-bold">{new Date(dl.date).getDate()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{new Date(dl.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-through">{dl.title}</p>
                    {dl.company && <p className="text-xs text-muted-foreground">{dl.company}</p>}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
