import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { FormDialog } from "@/components/hr/form-dialog";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { bookings, tourPackages, type Booking } from "@/lib/mock-data-goyo";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Fade } from "@/components/ui/animated";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const paymentConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" }> = {
  full: { variant: "success" },
  partial: { variant: "warning" },
  pending: { variant: "error" },
  refunded: { variant: "neutral" },
};

const bookingStatusConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" | "info" }> = {
  confirmed: { variant: "success" },
  pending: { variant: "warning" },
  cancelled: { variant: "error" },
};

const visaConfig: Record<string, { variant: "success" | "warning" | "error" | "neutral" }> = {
  pending: { variant: "warning" },
  applied: { variant: "info" as any },
  approved: { variant: "success" },
  rejected: { variant: "error" },
};

export default function EventsBookings() {
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading(650);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.booking_status !== statusFilter) return false;
    if (paymentFilter !== "all" && b.payment_status !== paymentFilter) return false;
    return true;
  });

  const totalCollected = bookings.reduce((s, b) => s + b.advance_paid, 0);
  const balanceDue = bookings.reduce((s, b) => s + b.balance_due, 0);
  const thisMonth = bookings.filter((b) => b.booking_date.startsWith("2026-02")).length;
  const totalPax = bookings.reduce((s, b) => s + b.passengers, 0);

  const columns: Column<Booking>[] = [
    { key: "id", header: "Booking ID", sortable: true },
    {
      key: "client_name",
      header: "Client",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium" data-testid={`text-client-${item.id}`}>{item.client_name}</p>
          <p className="text-xs text-muted-foreground">{item.client_phone}</p>
        </div>
      ),
    },
    {
      key: "package_name",
      header: "Package",
      render: (item) => <span className="text-xs line-clamp-2 max-w-[180px]">{item.package_name}</span>,
    },
    { key: "passengers", header: "Pax", sortable: true },
    {
      key: "total_amount",
      header: "Total",
      sortable: true,
      render: (item) => <span data-testid={`text-total-${item.id}`}>{formatCurrency(item.total_amount)}</span>,
    },
    {
      key: "advance_paid",
      header: "Advance",
      sortable: true,
      render: (item) => <span className="text-green-600 font-medium">{formatCurrency(item.advance_paid)}</span>,
    },
    {
      key: "balance_due",
      header: "Balance",
      sortable: true,
      render: (item) => (
        <span className={item.balance_due > 0 ? "text-amber-600 font-medium" : "text-green-600"} data-testid={`text-balance-${item.id}`}>
          {formatCurrency(item.balance_due)}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (item) => <StatusBadge status={item.payment_status} variant={paymentConfig[item.payment_status].variant} />,
    },
    {
      key: "visa_status",
      header: "Visa",
      render: (item) => <StatusBadge status={item.visa_status} variant={visaConfig[item.visa_status]?.variant || "neutral"} />,
    },
    {
      key: "travel_date",
      header: "Travel Date",
      sortable: true,
      render: (item) => <span data-testid={`text-travel-${item.id}`}>{new Date(item.travel_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>,
    },
  ];

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <Fade direction="up" delay={0}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="bookings-title">Bookings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{bookings.length} total bookings</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 text-white"
              style={{ backgroundColor: "#E91E63" }}
              data-testid="button-new-booking"
            >
              <Plus className="size-4" />
              New Booking
            </Button>
          </div>
        </Fade>

        {loading ? (
          <div className="mb-5 grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <Fade direction="up" delay={0.05} className="mb-5 grid grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-collected">
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-balance-due">
              <p className="text-xl font-bold text-amber-500">{formatCurrency(balanceDue)}</p>
              <p className="text-xs text-muted-foreground">Balance Pending</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-this-month">
              <p className="text-xl font-bold" style={{ color: "#E91E63" }}>{thisMonth}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center" data-testid="stat-total-pax">
              <p className="text-xl font-bold text-foreground">{totalPax}</p>
              <p className="text-xs text-muted-foreground">Total Passengers</p>
            </div>
          </Fade>
        )}

        <Fade direction="up" delay={0.08} className="mb-4 flex flex-wrap gap-3">
          <div className="flex gap-1.5">
            {["all", "confirmed", "pending", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                data-testid={`filter-status-${s}`}
              >
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {["all", "full", "partial", "pending"].map((p) => (
              <button
                key={p}
                onClick={() => setPaymentFilter(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${paymentFilter === p ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                data-testid={`filter-payment-${p}`}
              >
                {p === "all" ? "All Payments" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </Fade>

        {loading ? (
          <TableSkeleton rows={8} columns={9} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Search by client name..."
            searchKey="client_name"
            onRowClick={(item) => navigate(`/events/bookings/${item.id}`)}
            rowActions={[
              {
                label: "Record Payment",
                onClick: () => {
                  setPaymentDialogOpen(true);
                },
              },
              {
                label: "View Details",
                onClick: (item) => navigate(`/events/bookings/${item.id}`),
              },
            ]}
          />
        )}

        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="New Booking"
          description="Create a new tour booking for a client."
          onSubmit={() => {
            setDialogOpen(false);
            toast({ title: "Booking created", description: "New booking added successfully." });
          }}
          submitLabel="Create Booking"
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="b-package">Tour Package</Label>
              <Select>
                <SelectTrigger id="b-package" data-testid="input-booking-package">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {tourPackages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name.substring(0, 50)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="b-name">Client Name</Label>
                <Input id="b-name" placeholder="Full name" data-testid="input-booking-name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="b-phone">Phone</Label>
                <Input id="b-phone" placeholder="+91 98xxx xxxxx" data-testid="input-booking-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="b-email">Email</Label>
                <Input id="b-email" type="email" placeholder="client@email.com" data-testid="input-booking-email" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="b-city">City</Label>
                <Input id="b-city" placeholder="Client city" data-testid="input-booking-city" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="b-pax">No. of Passengers</Label>
                <Input id="b-pax" type="number" min="1" placeholder="1" data-testid="input-booking-pax" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="b-payment">Payment Type</Label>
                <Select>
                  <SelectTrigger id="b-payment" data-testid="input-booking-payment">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">Advance (₹30,000)</SelectItem>
                    <SelectItem value="full">Full Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="b-requests">Special Requests</Label>
              <Input id="b-requests" placeholder="Dietary needs, room preferences, etc." data-testid="input-booking-requests" />
            </div>
          </div>
        </FormDialog>

        <FormDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          title="Record Payment"
          description="Record a payment received for this booking."
          onSubmit={() => {
            setPaymentDialogOpen(false);
            toast({ title: "Payment recorded", description: "Payment has been added to the booking." });
          }}
          submitLabel="Record Payment"
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="p-amount">Amount (₹)</Label>
                <Input id="p-amount" type="number" placeholder="e.g. 30000" data-testid="input-payment-amount" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-mode">Payment Mode</Label>
                <Select>
                  <SelectTrigger id="p-mode" data-testid="input-payment-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-ref">Reference / UTR Number</Label>
              <Input id="p-ref" placeholder="Transaction reference" data-testid="input-payment-ref" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-note">Note</Label>
              <Input id="p-note" placeholder="e.g. Final balance payment" data-testid="input-payment-note" />
            </div>
          </div>
        </FormDialog>
      </PageTransition>
    </div>
  );
}
