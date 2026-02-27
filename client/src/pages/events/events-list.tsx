import { useState } from "react";
import { Plus } from "lucide-react";
import { PageBanner } from "@/components/hr/page-banner";
import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { events, type Event } from "@/lib/mock-data-events";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const statusVariantMap: Record<string, "info" | "success" | "neutral" | "error"> = {
  upcoming: "info",
  live: "success",
  completed: "neutral",
  cancelled: "error",
};

const typeVariantMap: Record<string, "info" | "success" | "neutral" | "warning"> = {
  Seminar: "info",
  "Investor Meet": "success",
  Workshop: "warning",
  Conference: "neutral",
  "Launch Event": "info",
};

const columns: Column<Event>[] = [
  { key: "id", header: "Event ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  {
    key: "type",
    header: "Type",
    render: (item) => <StatusBadge status={item.type} variant={typeVariantMap[item.type] || "neutral"} />,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    render: (item) => (
      <span data-testid={`text-date-${item.id}`}>
        {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
  },
  { key: "venue", header: "Venue" },
  { key: "city", header: "City", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (item) => <StatusBadge status={item.status} variant={statusVariantMap[item.status]} />,
  },
  {
    key: "totalAttendees",
    header: "Attendees",
    sortable: true,
    render: (item) => <span data-testid={`text-attendees-${item.id}`}>{item.totalAttendees}</span>,
  },
  {
    key: "budget",
    header: "Budget",
    sortable: true,
    render: (item) => <span data-testid={`text-budget-${item.id}`}>{formatCurrency(item.budget)}</span>,
  },
];

const uniqueStatuses = Array.from(new Set(events.map((e) => e.status)));
const uniqueTypes = Array.from(new Set(events.map((e) => e.type)));
const uniqueCities = Array.from(new Set(events.map((e) => e.city)));

export default function EventsList() {
  const loading = useSimulatedLoading();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner title="All Events" iconSrc="/3d-icons/attendance.webp" />

        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <DataTable
            data={events}
            columns={columns}
            searchPlaceholder="Search events..."
            searchKey="name"
            filters={[
              { label: "Status", key: "status", options: uniqueStatuses },
              { label: "Type", key: "type", options: uniqueTypes },
              { label: "City", key: "city", options: uniqueCities },
            ]}
            headerActions={
              <Button
                size="sm"
                onClick={() => setDialogOpen(true)}
                data-testid="button-add-event"
              >
                <Plus className="size-3.5 mr-1.5" />
                Add Event
              </Button>
            }
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add New Event"
          onSubmit={() => setDialogOpen(false)}
          submitLabel="Create Event"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-name">Event Name</Label>
            <Input id="event-name" placeholder="Enter event name" data-testid="input-event-name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-type">Type</Label>
            <Input id="event-type" placeholder="e.g. Conference, Workshop" data-testid="input-event-type" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-date">Start Date</Label>
              <Input id="event-date" type="date" data-testid="input-event-date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-end-date">End Date</Label>
              <Input id="event-end-date" type="date" data-testid="input-event-end-date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-venue">Venue</Label>
              <Input id="event-venue" placeholder="Venue name" data-testid="input-event-venue" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-city">City</Label>
              <Input id="event-city" placeholder="City" data-testid="input-event-city" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-budget">Budget (₹)</Label>
            <Input id="event-budget" type="number" placeholder="Enter budget" data-testid="input-event-budget" />
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
