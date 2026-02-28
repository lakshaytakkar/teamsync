import { useState, useMemo } from "react";
import { Plus, LayoutList, KanbanSquare, Calendar, AlertCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { leads, tourPackages, type Lead, type LeadStatus } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const sourceConfig: Record<string, { label: string; color: string }> = {
  website: { label: "Website", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  referral: { label: "Referral", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  social: { label: "Social", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  walk_in: { label: "Walk-in", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  phone: { label: "Phone", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

const kanbanColumns: { key: LeadStatus; label: string; headerColor: string }[] = [
  { key: "new", label: "New", headerColor: "border-b-2 border-blue-400" },
  { key: "contacted", label: "Contacted", headerColor: "border-b-2 border-purple-400" },
  { key: "interested", label: "Interested", headerColor: "border-b-2 border-amber-400" },
  { key: "booked", label: "Booked", headerColor: "border-b-2 border-green-400" },
  { key: "cold", label: "Cold", headerColor: "border-b-2 border-slate-400" },
  { key: "lost", label: "Lost", headerColor: "border-b-2 border-red-300" },
];

const statusVariantMap: Record<string, "success" | "info" | "warning" | "neutral" | "error"> = {
  new: "info",
  contacted: "neutral",
  interested: "warning",
  booked: "success",
  cold: "neutral",
  lost: "error",
};

const tableColumns: Column<Lead>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "phone", header: "Phone" },
  { key: "city", header: "City", sortable: true },
  { key: "business_type", header: "Business Type" },
  {
    key: "interested_package_id",
    header: "Package",
    render: (item) => {
      const pkg = tourPackages.find((p) => p.id === item.interested_package_id);
      return <span className="text-xs text-muted-foreground">{pkg?.name.substring(0, 30)}...</span>;
    },
  },
  { key: "source", header: "Source", render: (item) => {
    const s = sourceConfig[item.source] || { label: item.source, color: "" };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
  }},
  { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} variant={statusVariantMap[item.status]} /> },
  { key: "follow_up_date", header: "Follow-up", sortable: true, render: (item) => {
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = item.follow_up_date < today && item.status !== "booked" && item.status !== "lost";
    const isToday = item.follow_up_date === today;
    return (
      <span className={`text-xs font-medium ${isOverdue ? "text-red-500" : isToday ? "text-amber-500" : "text-muted-foreground"}`} data-testid={`text-followup-${item.id}`}>
        {isOverdue && <AlertCircle className="size-3 inline mr-1" />}
        {formatDate(item.follow_up_date)}
      </span>
    );
  }},
];

function LeadKanbanCard({ lead }: { lead: Lead }) {
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = lead.follow_up_date < today && lead.status !== "booked" && lead.status !== "lost";
  const isToday = lead.follow_up_date === today;
  const pkg = tourPackages.find((p) => p.id === lead.interested_package_id);
  const src = sourceConfig[lead.source];

  return (
    <div
      className="rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-sm"
      data-testid={`card-lead-${lead.id}`}
    >
      <p className="text-sm font-semibold mb-0.5" data-testid={`text-lead-name-${lead.id}`}>{lead.name}</p>
      <p className="text-xs text-muted-foreground mb-2">{lead.business_type} · {lead.city}</p>

      {pkg && (
        <p className="text-xs bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 rounded px-1.5 py-0.5 mb-2 line-clamp-1">
          {pkg.name.substring(0, 35)}{pkg.name.length > 35 ? "…" : ""}
        </p>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        {src && <span className={`rounded-full px-1.5 py-0.5 text-xs ${src.color}`}>{src.label}</span>}
        <span
          className={`ml-auto text-xs font-medium flex items-center gap-0.5 ${isOverdue ? "text-red-500" : isToday ? "text-amber-500" : "text-muted-foreground"}`}
          data-testid={`followup-${lead.id}`}
        >
          <Calendar className="size-3" />
          {formatDate(lead.follow_up_date)}
          {isOverdue && " ⚠"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <a href={`tel:${lead.phone}`} className="text-xs text-blue-500 hover:underline" data-testid={`tel-${lead.id}`}>
          {lead.phone}
        </a>
        <a
          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          data-testid={`btn-wa-lead-${lead.id}`}
        >
          <Button variant="ghost" size="icon" className="size-7 text-green-600 hover:bg-green-50">
            <SiWhatsapp className="size-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function EventsLeads() {
  const loading = useSimulatedLoading(650);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const totalLeads = leads.length;
  const newToday = leads.filter((l) => l.created_at === today).length;
  const followUpsDue = leads.filter((l) => l.follow_up_date <= today && !["booked", "lost"].includes(l.status)).length;
  const conversionRate = Math.round((leads.filter((l) => l.status === "booked").length / leads.length) * 100);

  const getLeadsByStatus = (status: LeadStatus) => leads.filter((l) => l.status === status);

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="leads-title">Leads & Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{totalLeads} leads · {conversionRate}% conversion rate</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 ${view === "kanban" ? "bg-muted" : ""}`}
                onClick={() => setView("kanban")}
                data-testid="btn-kanban-view"
              >
                <KanbanSquare className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 ${view === "table" ? "bg-muted" : ""}`}
                onClick={() => setView("table")}
                data-testid="btn-table-view"
              >
                <LayoutList className="size-4" />
              </Button>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 text-white"
                style={{ backgroundColor: "#E91E63" }}
                data-testid="button-add-lead"
              >
                <Plus className="size-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </Fade>

        {loading ? (
          <div className="mb-5 grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <Fade direction="up" delay={0.05} className="mb-5 grid grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-total-leads">
              <p className="text-xl font-bold text-foreground">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-new-today">
              <p className="text-xl font-bold text-blue-500">{newToday}</p>
              <p className="text-xs text-muted-foreground">New Today</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-followups">
              <p className={`text-xl font-bold ${followUpsDue > 0 ? "text-amber-500" : "text-green-500"}`}>{followUpsDue}</p>
              <p className="text-xs text-muted-foreground">Follow-ups Due</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-conversion">
              <p className="text-xl font-bold text-pink-500">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
          </Fade>
        )}

        {loading ? (
          view === "kanban" ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {kanbanColumns.map((col) => (
                <div key={col.key} className="min-w-[200px] rounded-xl border bg-card p-3">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-24 w-full mb-2 rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <TableSkeleton rows={8} columns={7} />
          )
        ) : view === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1" data-testid="kanban-board">
            {kanbanColumns.map((col) => {
              const colLeads = getLeadsByStatus(col.key);
              return (
                <div key={col.key} className={`min-w-[210px] max-w-[210px] rounded-xl border border-border bg-muted/30 ${col.headerColor}`} data-testid={`kanban-col-${col.key}`}>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm font-semibold font-heading">{col.label}</span>
                    <span className="rounded-full bg-background border border-border text-xs font-bold px-2 py-0.5">{colLeads.length}</span>
                  </div>
                  <div className="flex flex-col gap-2 p-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                    {colLeads.map((lead) => (
                      <LeadKanbanCard key={lead.id} lead={lead} />
                    ))}
                    {colLeads.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">No leads</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={leads}
            searchPlaceholder="Search leads by name, city..."
            searchKey="name"
            filters={[
              { label: "Source", key: "source", options: ["website", "whatsapp", "referral", "social", "walk_in", "phone"] },
              { label: "Status", key: "status", options: ["new", "contacted", "interested", "booked", "cold", "lost"] },
            ]}
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add New Lead"
          description="Add a new lead to the sales pipeline."
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Add Lead"
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="l-name">Full Name</Label>
                <Input id="l-name" placeholder="Client full name" data-testid="input-lead-name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="l-phone">Phone</Label>
                <Input id="l-phone" placeholder="+91 98xxx xxxxx" data-testid="input-lead-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="l-email">Email</Label>
                <Input id="l-email" type="email" placeholder="client@email.com" data-testid="input-lead-email" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="l-business">Business Type</Label>
                <Input id="l-business" placeholder="e.g. Textile Importer" data-testid="input-lead-business" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="l-city">City</Label>
                <Input id="l-city" placeholder="City" data-testid="input-lead-city" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="l-state">State</Label>
                <Input id="l-state" placeholder="State" data-testid="input-lead-state" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="l-package">Interested Package</Label>
                <Select>
                  <SelectTrigger id="l-package" data-testid="input-lead-package">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {tourPackages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name.substring(0, 40)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="l-source">Source</Label>
                <Select>
                  <SelectTrigger id="l-source" data-testid="input-lead-source">
                    <SelectValue placeholder="How did they find us?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="l-followup">Follow-up Date</Label>
                <Input id="l-followup" type="date" data-testid="input-lead-followup" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="l-assigned">Assigned To</Label>
                <Select>
                  <SelectTrigger id="l-assigned" data-testid="input-lead-assigned">
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Priya Kapoor">Priya Kapoor</SelectItem>
                    <SelectItem value="Amit Verma">Amit Verma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="l-notes">Notes</Label>
              <Input id="l-notes" placeholder="Any relevant notes about this lead..." data-testid="input-lead-notes" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
