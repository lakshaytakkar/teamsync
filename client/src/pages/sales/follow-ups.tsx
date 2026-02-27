import { Phone, Mail, Users } from "lucide-react";

import { DataTable, type Column } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { followUps, type FollowUp } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="size-3.5" />,
  email: <Mail className="size-3.5" />,
  meeting: <Users className="size-3.5" />,
};

const typeLabels: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
};

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  scheduled: "info",
  completed: "success",
  missed: "error",
};

export default function FollowUpsPage() {
  const loading = useSimulatedLoading();

  const columns: Column<FollowUp>[] = [
    {
      key: "leadName",
      header: "Lead Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <img src={getPersonAvatar(item.leadName, 28)} alt={item.leadName} className="size-7 shrink-0 rounded-full" />
          <span className="text-sm font-medium">{item.leadName}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{typeIcons[item.type]}</span>
          <span className="text-sm">{typeLabels[item.type]}</span>
        </div>
      ),
    },
    {
      key: "scheduledDate",
      header: "Scheduled Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.scheduledDate}</span>,
    },
    {
      key: "notes",
      header: "Notes",
      render: (item) => (
        <span className="text-sm text-muted-foreground truncate max-w-[220px] block">{item.notes}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={statusVariantMap[item.status]}
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
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <DataTable
            data={followUps}
            columns={columns}
            searchPlaceholder="Search follow-ups..."
            filters={[
              { label: "Type", key: "type", options: ["call", "email", "meeting"] },
              { label: "Status", key: "status", options: ["scheduled", "completed", "missed"] },
            ]}
          />
        )}
      </PageTransition>
    </div>
  );
}
