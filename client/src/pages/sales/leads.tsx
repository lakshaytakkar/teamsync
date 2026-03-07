import { useState } from "react";
import { Mail, Plus } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { Button } from "@/components/ui/button";
import { leads, type Lead } from "@/lib/mock-data-sales";
import { PersonCell } from "@/components/ui/avatar-cells";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  PageShell,
  PageHeader,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";
import { verticals } from "@/lib/verticals-config";

const statusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  new: "neutral",
  contacted: "info",
  qualified: "warning",
  converted: "success",
  lost: "error",
};

const sourceVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  website: "info",
  referral: "success",
  ad: "warning",
  organic: "neutral",
};

export default function LeadsPage() {
  const loading = useSimulatedLoading();
  const [data] = useState<Lead[]>(leads);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const vertical = verticals.find((v) => v.id === "sales")!;

  const filtered = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: "all", label: "All Leads" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "converted", label: "Converted" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Leads"
        subtitle="Manage and track your sales pipeline"
        actions={
          <Button
            className="gap-2"
            style={{ backgroundColor: vertical.color }}
            data-testid="button-add-lead"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <IndexToolbar
        search={search}
        onSearch={setSearch}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        color={vertical.color}
        placeholder="Search leads..."
      />

      {loading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Contact</DataTH>
                <DataTH>Source</DataTH>
                <DataTH>Status</DataTH>
                <DataTH>Assigned To</DataTH>
                <DataTH>Created</DataTH>
                <DataTH align="right">Actions</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <DataTR key={item.id}>
                  <DataTD>
                    <PersonCell name={item.name} subtitle={item.email} size="sm" />
                  </DataTD>
                  <DataTD>
                    <StatusBadge
                      status={item.source.charAt(0).toUpperCase() + item.source.slice(1)}
                      variant={sourceVariantMap[item.source]}
                    />
                  </DataTD>
                  <DataTD>
                    <StatusBadge
                      status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      variant={statusVariantMap[item.status]}
                    />
                  </DataTD>
                  <DataTD>
                    <PersonCell name={item.assignedTo} size="sm" />
                  </DataTD>
                  <DataTD>
                    <span className="text-sm text-muted-foreground">{item.createdDate}</span>
                  </DataTD>
                  <DataTD align="right">
                    <a href={`mailto:${item.email}`} data-testid={`btn-email-${item.id}`}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Mail className="size-4" />
                      </Button>
                    </a>
                  </DataTD>
                </DataTR>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}
    </PageShell>
  );
}
