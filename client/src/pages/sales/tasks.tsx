import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
import { salesTasks as initialTasks, type SalesTask } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/animated";

const statusLabelMap: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  pending: "warning",
  "in-progress": "info",
  completed: "success",
};

const priorityVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

export default function TasksPage() {
  const loading = useSimulatedLoading();
  const [data, setData] = useState<SalesTask[]>(initialTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium" as SalesTask["priority"],
    status: "pending" as SalesTask["status"],
    relatedLead: "",
  });

  const columns: Column<SalesTask>[] = [
    {
      key: "id",
      header: "Task ID",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-muted-foreground">{item.id}</span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
        </div>
      ),
    },
    {
      key: "relatedLead",
      header: "Related Lead",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.relatedLead || "—"}</span>
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
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.dueDate}</span>,
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
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={statusLabelMap[item.status]}
          variant={statusVariantMap[item.status]}
        />
      ),
    },
  ];

  const openCreateDialog = () => {
    setFormState({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      status: "pending",
      relatedLead: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formState.title || !formState.assignedTo) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }
    const newTask: SalesTask = {
      id: `ST-${String(data.length + 1).padStart(3, "0")}`,
      ...formState,
      relatedLead: formState.relatedLead || undefined,
    };
    setData((prev) => [newTask, ...prev]);
    setDialogOpen(false);
    showSuccess("Task Added", `"${formState.title}" has been added.`);
  };

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchPlaceholder="Search tasks..."
            filters={[
              { label: "Status", key: "status", options: ["pending", "in-progress", "completed"] },
              { label: "Priority", key: "priority", options: ["high", "medium", "low"] },
            ]}
            headerActions={
              <Button size="sm" onClick={openCreateDialog} data-testid="button-add-task">
                <Plus className="mr-1.5 size-3.5" />
                Add Task
              </Button>
            }
          />
        )}
      </PageTransition>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add New Task"
        onSubmit={handleSubmit}
        submitLabel="Add Task"
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Title *</Label>
          <Input
            value={formState.title}
            onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
            placeholder="Task title"
            className="h-8 text-sm"
            data-testid="input-task-title"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Description</Label>
          <Input
            value={formState.description}
            onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
            placeholder="Task description"
            className="h-8 text-sm"
            data-testid="input-task-description"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Assigned To *</Label>
            <Input
              value={formState.assignedTo}
              onChange={(e) => setFormState((s) => ({ ...s, assignedTo: e.target.value }))}
              placeholder="Sales rep name"
              className="h-8 text-sm"
              data-testid="input-task-assigned"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Due Date</Label>
            <Input
              type="date"
              value={formState.dueDate}
              onChange={(e) => setFormState((s) => ({ ...s, dueDate: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-task-due-date"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={formState.priority} onValueChange={(v) => setFormState((s) => ({ ...s, priority: v as SalesTask["priority"] }))}>
              <SelectTrigger className="h-8 text-sm" data-testid="select-task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Related Lead</Label>
            <Input
              value={formState.relatedLead}
              onChange={(e) => setFormState((s) => ({ ...s, relatedLead: e.target.value }))}
              placeholder="e.g. L-001"
              className="h-8 text-sm"
              data-testid="input-task-lead"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
