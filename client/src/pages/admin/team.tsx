import { UserPlus } from "lucide-react";

import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { teamMembers, type TeamMember } from "@/lib/mock-data-admin";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, PageTransition } from "@/components/ui/animated";
import { PageShell } from "@/components/layout";

const statusVariantMap: Record<string, "success" | "error" | "info"> = {
  active: "success",
  inactive: "error",
  invited: "info",
};

const columns: Column<TeamMember>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (member) => (
      <div className="flex items-center gap-2.5">
        <img
          src={getPersonAvatar(member.name, 32)}
          alt={member.name}
          className="size-8 shrink-0 rounded-full"
        />
        <div>
          <p className="text-sm font-medium" data-testid={`text-member-name-${member.id}`}>{member.name}</p>
          <p className="text-xs text-muted-foreground" data-testid={`text-member-email-${member.id}`}>{member.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
  },
  {
    key: "department",
    header: "Department",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (member) => (
      <StatusBadge
        status={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        variant={statusVariantMap[member.status]}
      />
    ),
  },
  {
    key: "joinedDate",
    header: "Joined Date",
    sortable: true,
    render: (member) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-joined-${member.id}`}>
        {new Date(member.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </span>
    ),
  },
  {
    key: "lastActive",
    header: "Last Active",
    sortable: true,
    render: (member) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-last-active-${member.id}`}>
        {new Date(member.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </span>
    ),
  },
];

const departments = Array.from(new Set(teamMembers.map((m) => m.department)));
const statuses = ["active", "inactive", "invited"];

export default function AdminTeam() {
  const loading = useSimulatedLoading();

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : (
          <Fade direction="up" delay={0.1}>
            <DataTable
              data={teamMembers}
              columns={columns}
              searchPlaceholder="Search members..."
              searchKey="name"
              filters={[
                { label: "Department", key: "department", options: departments },
                { label: "Status", key: "status", options: statuses },
              ]}
              headerActions={
                <Button size="sm" data-testid="button-invite-member">
                  <UserPlus className="mr-1.5 size-3.5" />
                  Invite Member
                </Button>
              }
              rowActions={[
                { label: "Edit", onClick: () => {} },
                { label: "Deactivate", onClick: () => {}, variant: "destructive", separator: true },
              ]}
            />
          </Fade>
        )}
      </PageTransition>
    </PageShell>
  );
}
