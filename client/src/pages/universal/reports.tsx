import { useState, useMemo } from "react";
import {
  FileText, User, Users, Crown, ChevronDown,
  Clock, CheckCircle2, AlertCircle, TrendingUp, Eye,
  Plus, Calendar, File, Search,
} from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import {
  verticalReportConfig,
  type ReportTemplate,
  type SubmittedReport,
  type ReportScope,
  type ReportFrequency,
  type ReportStatus,
} from "@/lib/mock-data-reports";

const scopeConfig: Record<ReportScope, { label: string; icon: typeof User; border: string; badge: string; iconBg: string }> = {
  employee: {
    label: "Employee",
    icon: User,
    border: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  department: {
    label: "Department",
    icon: Users,
    border: "border-l-purple-400",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  executive: {
    label: "Executive",
    icon: Crown,
    border: "border-l-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

const statusConfig: Record<ReportStatus, { label: string; className: string; dot: string }> = {
  submitted: {
    label: "Submitted",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-400 animate-pulse",
  },
  late: {
    label: "Late",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const freqConfig: Record<ReportFrequency, string> = {
  daily: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  weekly: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function dateGroupHeader(period: string, periodLabel: string): string {
  if (period === todayStr()) return "Today";
  if (period === yesterdayStr()) return "Yesterday";
  return periodLabel;
}

let idCounter = 1000;
function newId() { return `r-${++idCounter}`; }

interface SubmitDialogProps {
  open: boolean;
  template: ReportTemplate;
  color: string;
  onSubmit: (data: Record<string, string | number>) => void;
  onClose: () => void;
}

function SubmitDialog({ open, template, color, onSubmit, onClose }: SubmitDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const set = (id: string, val: string) => setValues((p) => ({ ...p, [id]: val }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const parsed: Record<string, string | number> = {};
      template.fields.forEach((f) => {
        const v = values[f.id] ?? "";
        parsed[f.id] = f.type === "number" ? (parseFloat(v) || 0) : v;
      });
      onSubmit(parsed);
      setValues({});
      setSubmitting(false);
    }, 400);
  };

  const canSubmit = template.fields.filter((f) => f.required).every((f) => (values[f.id] ?? "").trim() !== "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{template.name}</DialogTitle>
          <DialogDescription className="text-xs mt-0.5">{template.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {template.fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
                {field.unit && <span className="ml-1 text-xs font-normal text-muted-foreground">({field.unit})</span>}
              </Label>
              {field.type === "textarea" && (
                <Textarea rows={3} placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
                  value={values[field.id] ?? ""} onChange={(e) => set(field.id, e.target.value)}
                  data-testid={`input-${field.id}`} />
              )}
              {field.type === "number" && (
                <Input type="number" placeholder={field.placeholder ?? "0"}
                  value={values[field.id] ?? ""} onChange={(e) => set(field.id, e.target.value)}
                  data-testid={`input-${field.id}`} />
              )}
              {field.type === "text" && (
                <Input type="text" placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
                  value={values[field.id] ?? ""} onChange={(e) => set(field.id, e.target.value)}
                  data-testid={`input-${field.id}`} />
              )}
              {field.type === "select" && field.options && (
                <Select value={values[field.id] ?? ""} onValueChange={(v) => set(field.id, v)}>
                  <SelectTrigger data-testid={`select-${field.id}`}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}
            style={{ backgroundColor: color, color: "#fff" }} data-testid="button-submit-report">
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ViewDialogProps {
  open: boolean;
  report: SubmittedReport;
  template: ReportTemplate | undefined;
  onClose: () => void;
}

function ViewDialog({ open, report, template, onClose }: ViewDialogProps) {
  const sc = scopeConfig[report.scope];
  const st = statusConfig[report.status];
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{report.templateName}</DialogTitle>
          <DialogDescription className="sr-only">View submitted report details</DialogDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", sc.badge)}>{report.scope}</span>
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", freqConfig[report.frequency])}>{report.frequency}</span>
            <span className={cn("inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium", st.className)}>
              <span className={cn("size-1.5 rounded-full", st.dot)} />{st.label}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
            <div><span className="font-medium">Period:</span> {report.periodLabel}</div>
            <div><span className="font-medium">Submitted by:</span> {report.submittedBy} · {report.submittedByRole}</div>
            {report.submittedAt && (
              <div><span className="font-medium">Submitted at:</span> {new Date(report.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
            )}
          </div>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          {template?.fields.map((field) => {
            const val = report.data[field.id];
            if (val === undefined || val === null || val === "") return null;
            const displayVal = field.unit ? `${val} ${field.unit}` : String(val);
            return (
              <div key={field.id} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                {field.type === "textarea"
                  ? <div className="rounded-md bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap">{displayVal}</div>
                  : <p className="text-sm font-medium">{displayVal}</p>}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close-view">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReportRowProps {
  report: SubmittedReport;
  onView: () => void;
  onSubmitNow: () => void;
}

function ReportRow({ report, onView, onSubmitNow }: ReportRowProps) {
  const sc = scopeConfig[report.scope];
  const st = statusConfig[report.status];
  const ScopeIcon = sc.icon;
  const isPending = report.status === "pending" || report.status === "late";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-l-4 bg-card px-5 py-3.5 transition-all duration-200 hover:shadow-sm",
        sc.border,
        isPending ? "opacity-60 border-dashed" : "hover:-translate-y-0.5"
      )}
      data-testid={`row-report-${report.id}`}
    >
      <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0", sc.iconBg)}>
        <ScopeIcon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{report.templateName}</p>
        <p className="text-xs text-muted-foreground truncate">{report.submittedBy} · {report.submittedByRole}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium capitalize", freqConfig[report.frequency])}>
          {report.frequency}
        </span>
        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", sc.badge)}>
          {sc.label}
        </span>
      </div>

      <p className="hidden md:block text-xs text-muted-foreground shrink-0 w-28 text-right">{report.periodLabel}</p>

      <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0", st.className)}>
        <span className={cn("size-1.5 rounded-full", st.dot)} />
        {st.label}
      </span>

      <div className="shrink-0">
        {!isPending ? (
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs gap-1.5"
            onClick={onView} data-testid={`button-view-${report.id}`}>
            <Eye className="size-3.5" />View
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5"
            onClick={onSubmitNow} data-testid={`button-submit-now-${report.id}`}>
            <Plus className="size-3.5" />Submit
          </Button>
        )}
      </div>
    </div>
  );
}

type FilterType = "all" | "daily" | "weekly" | "employee" | "department" | "executive" | "pending";

export default function UniversalReports() {
  const [location] = useLocation();
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(600);
  const vertical = detectVerticalFromUrl(location);
  const color = vertical?.color ?? "#6B7280";

  const config = useMemo(() => verticalReportConfig[vertical?.id ?? ""], [vertical?.id]);
  const templates = config?.templates ?? [];

  const [reports, setReports] = useState<SubmittedReport[]>(() => config?.submittedReports ?? []);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewReport, setViewReport] = useState<SubmittedReport | null>(null);
  const [submitDialog, setSubmitDialog] = useState<{ open: boolean; template: ReportTemplate | null; replacingId?: string }>({ open: false, template: null });

  const today = todayStr();

  const filtered = useMemo(() => reports.filter((r) => {
    const matchesFilter = (() => {
      if (filter === "all") return true;
      if (filter === "daily") return r.frequency === "daily";
      if (filter === "weekly") return r.frequency === "weekly";
      if (filter === "employee") return r.scope === "employee";
      if (filter === "department") return r.scope === "department";
      if (filter === "executive") return r.scope === "executive";
      if (filter === "pending") return r.status === "pending" || r.status === "late";
      return true;
    })();
    if (!matchesFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.templateName.toLowerCase().includes(q) || r.submittedBy.toLowerCase().includes(q);
    }
    return true;
  }), [reports, filter, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, SubmittedReport[]>();
    [...filtered].sort((a, b) => b.period.localeCompare(a.period)).forEach((r) => {
      if (!map.has(r.period)) map.set(r.period, []);
      map.get(r.period)!.push(r);
    });
    return map;
  }, [filtered]);

  const submitted = reports.filter((r) => r.status === "submitted").length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const lateCount = reports.filter((r) => r.status === "late").length;
  const completion = reports.length > 0 ? Math.round((submitted / reports.length) * 100) : 0;

  const openSubmit = (template: ReportTemplate, replacingId?: string) =>
    setSubmitDialog({ open: true, template, replacingId });

  const handleSubmit = (data: Record<string, string | number>) => {
    if (!submitDialog.template) return;
    const tmpl = submitDialog.template;
    const now = new Date().toISOString();
    const periodLabel = tmpl.frequency === "daily"
      ? new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : `Week of ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;

    const newReport: SubmittedReport = {
      id: newId(), templateId: tmpl.id, templateName: tmpl.name,
      submittedBy: "You", submittedByRole: tmpl.assignedRole,
      scope: tmpl.scope, frequency: tmpl.frequency,
      period: today, periodLabel, submittedAt: now, status: "submitted", data,
    };

    setReports((prev) => {
      const next = submitDialog.replacingId ? prev.filter((r) => r.id !== submitDialog.replacingId) : prev;
      return [newReport, ...next];
    });
    setSubmitDialog({ open: false, template: null });
    toast({ title: "Report submitted", description: `${tmpl.name} for ${periodLabel}` });
  };

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "employee", label: "Employee" },
    { key: "department", label: "Department" },
    { key: "pending", label: "Pending" },
  ];

  if (!vertical) return null;

  return (
    <PageTransition className="flex flex-col gap-6 px-16 py-6 lg:px-24 overflow-y-auto h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Reports</h1>
          <p className="text-muted-foreground">Daily and weekly reports for {vertical.name}.</p>
        </div>
        {templates.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 shrink-0" style={{ backgroundColor: color, color: "#fff" }}
                data-testid="button-submit-report-dropdown">
                <Calendar className="size-4" />
                Submit Report
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {templates.map((tmpl) => (
                <DropdownMenuItem key={tmpl.id} onClick={() => openSubmit(tmpl)}
                  data-testid={`menu-template-${tmpl.id}`} className="flex flex-col items-start gap-0.5 py-2.5">
                  <span className="text-sm font-medium">{tmpl.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{tmpl.frequency} · {tmpl.scope}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-reports"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors shrink-0 cursor-pointer",
                filter === key ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={filter === key ? { backgroundColor: color } : {}}
              onClick={() => setFilter(key)}
              data-testid={`filter-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline stat summary */}
      {!isLoading && (
        <Fade>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">{submitted}</span> Submitted
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-amber-500" />
              <span className="font-medium text-foreground">{pendingCount}</span> Pending
            </span>
            {lateCount > 0 && (
              <>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-red-500" />
                  <span className="font-medium text-foreground">{lateCount}</span> Overdue
                </span>
              </>
            )}
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-blue-500" />
              <span className="font-medium text-foreground">{completion}%</span> Completion
            </span>
          </div>
        </Fade>
      )}

      {/* Report list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse h-16 bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <File className="size-7" />
          </div>
          <h3 className="font-semibold">No reports found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different filter or submit a new report.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(grouped.entries()).map(([period, periodReports]) => {
            const first = periodReports[0];
            const header = dateGroupHeader(period, first.periodLabel);
            return (
              <div key={period} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">{header}</p>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground shrink-0">{periodReports.length} report{periodReports.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {periodReports.map((report) => (
                    <ReportRow
                      key={report.id}
                      report={report}
                      onView={() => setViewReport(report)}
                      onSubmitNow={() => {
                        const tmpl = templates.find((t) => t.id === report.templateId);
                        if (tmpl) openSubmit(tmpl, report.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewReport && (
        <ViewDialog open={!!viewReport} report={viewReport}
          template={templates.find((t) => t.id === viewReport.templateId)}
          onClose={() => setViewReport(null)} />
      )}

      {submitDialog.open && submitDialog.template && (
        <SubmitDialog open={submitDialog.open} template={submitDialog.template} color={color}
          onSubmit={handleSubmit} onClose={() => setSubmitDialog({ open: false, template: null })} />
      )}
    </PageTransition>
  );
}
