import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leads as initialLeads, pipelineStages, type Lead } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/animated";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const stageVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  new: "neutral",
  qualified: "info",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "error",
};

const priorityVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

export default function LeadsPage() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<Lead[]>(initialLeads);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Website",
    stage: "new",
    value: "",
    priority: "medium" as Lead["priority"],
    assignedTo: "",
  });

  const stageLabel = (stage: string) => {
    const found = pipelineStages.find((s) => s.id === stage);
    return found ? found.label : stage;
  };

  const columns: Column<Lead>[] = [
    {
      key: "id",
      header: "Lead ID",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">{item.id}</span>
      ),
    },
    {
      key: "name",
      header: "Contact",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.name, 28)} alt={item.name} className="size-7 shrink-0 rounded-full" />
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (item) => <span className="text-sm">{item.source}</span>,
    },
    {
      key: "stage",
      header: "Stage",
      render: (item) => (
        <StatusBadge status={stageLabel(item.stage)} variant={stageVariantMap[item.stage]} />
      ),
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium" data-testid={`text-value-${item.id}`}>
          {formatCurrency(item.value)}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge
          status={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          variant={priorityVariantMap[item.priority]}
        />
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (item) => (
        <div className="flex items-center gap-2">
          <img src={getPersonAvatar(item.assignedTo, 24)} alt={item.assignedTo} className="size-6 rounded-full" />
          <span className="text-sm">{item.assignedTo}</span>
        </div>
      ),
    },
    {
      key: "lastContact",
      header: "Last Contact",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.lastContact}</span>,
    },
  ];

  const sources = Array.from(new Set(data.map((l) => l.source)));

  const openCreateDialog = () => {
    setFormState({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "Website",
      stage: "new",
      value: "",
      priority: "medium",
      assignedTo: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.name || !formState.company || !formState.email) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }
    const newLead: Lead = {
      id: `L-${String(data.length + 1).padStart(3, "0")}`,
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      company: formState.company,
      source: formState.source,
      stage: formState.stage,
      value: Number(formState.value) || 0,
      priority: formState.priority,
      assignedTo: formState.assignedTo || "Unassigned",
      createdDate: new Date().toISOString().split("T")[0],
      lastContact: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newLead, ...prev]);
    setDialogOpen(false);
    showSuccess("Lead Added", `${formState.name} has been added.`);
  };

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner
          title="Lead Management"
          iconSrc="/3d-icons/candidates.webp"
        />
        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search leads..."
            filters={[
              { label: "Stage", key: "stage", options: pipelineStages.map((s) => s.id) },
              { label: "Priority", key: "priority", options: ["high", "medium", "low"] },
              { label: "Source", key: "source", options: sources },
            ]}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-add-lead">
                <Plus className="mr-1.5 size-3.5" />
                Add Lead
              </Button>
            }
          />
        )}
      </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add New Lead"
        onSubmit={handleSubmit}
        submitLabel="Add Lead"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Contact Name *</Label>
            <Input
              value={formState.name}
              onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Full name"
              className="h-8 text-sm"
              data-testid="input-lead-name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Company *</Label>
            <Input
              value={formState.company}
              onChange={(e) => setFormState((s) => ({ ...s, company: e.target.value }))}
              placeholder="Company name"
              className="h-8 text-sm"
              data-testid="input-lead-company"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Email *</Label>
          <Input
            type="email"
            value={formState.email}
            onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
            placeholder="email@company.com"
            className="h-8 text-sm"
            data-testid="input-lead-email"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Phone</Label>
            <Input
              value={formState.phone}
              onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="h-8 text-sm"
              data-testid="input-lead-phone"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Value</Label>
            <Input
              type="number"
              value={formState.value}
              onChange={(e) => setFormState((s) => ({ ...s, value: e.target.value }))}
              placeholder="Deal value"
              className="h-8 text-sm"
              data-testid="input-lead-value"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Source</Label>
            <Select value={formState.source} onValueChange={(v) => setFormState((s) => ({ ...s, source: v }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-lead-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sources.map((src) => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={formState.priority} onValueChange={(v) => setFormState((s) => ({ ...s, priority: v as Lead["priority"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-lead-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Assigned To</Label>
          <Input
            value={formState.assignedTo}
            onChange={(e) => setFormState((s) => ({ ...s, assignedTo: e.target.value }))}
            placeholder="Sales rep name"
            className="h-8 text-sm"
            data-testid="input-lead-assigned"
          />
        </div>
      </FormDialog>
    </div>
  );
}
