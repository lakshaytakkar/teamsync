import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { MiniStageStepper } from "@/components/hr/stage-stepper";
import { FormDialog } from "@/components/hr/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formationClients, teamMembers } from "@/lib/mock-data";
import { stageDefinitions } from "@shared/schema";
import type { FormationClient } from "@shared/schema";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const riskVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "on-track": "success",
  "delayed": "warning",
  "at-risk": "error",
};

const priorityVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

export default function ClientsPage() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const [data] = useState<FormationClient[]>(formationClients);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: Column<FormationClient>[] = [
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium" data-testid={`text-company-${item.id}`}>{item.companyName}</p>
          <p className="text-xs text-muted-foreground">{item.clientName}</p>
        </div>
      ),
    },
    {
      key: "state",
      header: "State",
      sortable: true,
      render: (item) => <span className="text-sm">{item.state}</span>,
    },
    {
      key: "packageType",
      header: "Package",
      render: (item) => (
        <StatusBadge
          status={item.packageType}
          variant={item.packageType === "Premium" ? "info" : item.packageType === "Standard" ? "neutral" : "neutral"}
        />
      ),
    },
    {
      key: "assignedManager",
      header: "Manager",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.assignedManager}</span>,
    },
    {
      key: "currentStage",
      header: "Stage",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <MiniStageStepper currentStage={item.currentStage} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {stageDefinitions[item.currentStage]?.name}
          </span>
        </div>
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
      key: "riskFlag",
      header: "Risk",
      render: (item) => (
        <StatusBadge
          status={item.riskFlag === "on-track" ? "On Track" : item.riskFlag === "at-risk" ? "At Risk" : "Delayed"}
          variant={riskVariantMap[item.riskFlag]}
        />
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.startDate}</span>,
    },
  ];

  const stageOptions = stageDefinitions.map((s) => `${s.number}`);
  const managerOptions = Array.from(new Set(formationClients.map((c) => c.assignedManager)));

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search clients..."
            onRowClick={(item) => navigate(`/hr/clients/${item.id}`)}
            filters={[
              { label: "Stage", key: "currentStage", options: stageOptions },
              { label: "Package", key: "packageType", options: ["Basic", "Standard", "Premium"] },
              { label: "Risk", key: "riskFlag", options: ["on-track", "delayed", "at-risk"] },
              { label: "Manager", key: "assignedManager", options: managerOptions },
            ]}
            headerActions={
              <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-client">
                <Plus className="mr-1.5 size-3.5" />
                Add Client
              </Button>
            }
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add New Client"
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Create Client"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" placeholder="John Doe" data-testid="input-client-name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Acme LLC" data-testid="input-company-name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyType">Company Type</Label>
              <Select>
                <SelectTrigger data-testid="select-company-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="Corp">Corp</SelectItem>
                  <SelectItem value="S-Corp">S-Corp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Delaware" data-testid="input-state" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="packageType">Package</Label>
              <Select>
                <SelectTrigger data-testid="select-package">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manager">Assigned Manager</Label>
              <Select>
                <SelectTrigger data-testid="select-manager">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.filter((m) => m.role !== "admin").map((m) => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="client@example.com" data-testid="input-email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" data-testid="input-phone" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
