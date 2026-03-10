import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, Download, CheckCircle2, Clock, AlertTriangle,
  IndianRupee, Search, Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, StatGrid, StatCard, SectionCard } from "@/components/layout";
import { portalEtsClient, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";

interface PortalPayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: "token" | "milestone" | "final";
  status: "received" | "pending" | "overdue";
  date: string;
  notes: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2; color: string }> = {
  received: { label: "Paid", variant: "secondary", icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
  pending: { label: "Pending", variant: "outline", icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
};

const typeLabels: Record<string, string> = {
  token: "Token Payment",
  milestone: "Milestone Payment",
  final: "Final Payment",
};

function formatFullCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatCurrency(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

function generateInvoiceId(payment: PortalPayment): string {
  const dateStr = payment.date ? payment.date.replace(/-/g, "").slice(2, 8) : "000000";
  return `INV-${dateStr}-${payment.id}`;
}

function InvoicesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function EtsPortalInvoices() {
  const clientId = portalEtsClient.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: paymentsData, isLoading } = useQuery<{ payments: PortalPayment[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'payments'],
  });

  const payments = paymentsData?.payments || [];

  const paidInvoices = payments.filter((p) => p.status === "received");
  const totalAmount = paidInvoices.reduce((s, p) => s + p.amount, 0);
  const allAmount = payments.reduce((s, p) => s + p.amount, 0);
  const downloadsAvailable = paidInvoices.length;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = searchQuery === "" ||
      generateInvoiceId(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeLabels[p.type] || p.type).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <PageShell>
        <InvoicesSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        subtitle="View and download your payment invoices"
      />

      <StatGrid>
        <StatCard
          label="Total Invoices"
          value={payments.length}
          icon={FileText}
          iconBg="rgba(249,115,22,0.12)"
          iconColor={ETS_PORTAL_COLOR}
          trend={`${paidInvoices.length} paid`}
        />
        <StatCard
          label="Total Amount"
          value={formatCurrency(allAmount)}
          icon={IndianRupee}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10B981"
          trend={`${formatCurrency(totalAmount)} received`}
        />
        <StatCard
          label="Downloads Available"
          value={downloadsAvailable}
          icon={Download}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
          trend="Paid invoices"
        />
      </StatGrid>

      <SectionCard title="Invoice History">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-invoices"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                <Filter className="size-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedPayments.length === 0 ? (
            <Card data-testid="invoices-empty-state">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold" data-testid="text-no-invoices">No Invoices Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "No invoices match your current filters. Try adjusting your search."
                    : "Your invoices will appear here once payments are recorded."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto" data-testid="invoices-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((payment) => {
                    const cfg = statusConfig[payment.status];
                    const invoiceId = generateInvoiceId(payment);
                    const isPaid = payment.status === "received";

                    return (
                      <TableRow key={payment.id} data-testid={`invoice-row-${payment.id}`}>
                        <TableCell className="font-medium text-sm" data-testid={`invoice-id-${payment.id}`}>
                          {invoiceId}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`invoice-date-${payment.id}`}>
                          {payment.date}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate" data-testid={`invoice-desc-${payment.id}`}>
                          {payment.notes || typeLabels[payment.type] || payment.type}
                        </TableCell>
                        <TableCell data-testid={`invoice-type-${payment.id}`}>
                          <Badge variant="outline" className="text-[10px]">
                            {typeLabels[payment.type] || payment.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm" data-testid={`invoice-amount-${payment.id}`}>
                          {formatFullCurrency(payment.amount)}
                        </TableCell>
                        <TableCell data-testid={`invoice-status-${payment.id}`}>
                          <Badge variant={cfg.variant} className="text-[10px]">
                            <cfg.icon className={cn("size-3 mr-1", cfg.color)} />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isPaid ? "outline" : "ghost"}
                            disabled={!isPaid}
                            data-testid={`button-download-${payment.id}`}
                          >
                            <Download className="size-3.5 mr-1.5" />
                            {isPaid ? "Download" : "N/A"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {sortedPayments.length > 0 && (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 flex-wrap">
              <span data-testid="text-invoice-count">
                Showing {sortedPayments.length} of {payments.length} invoices
              </span>
              <span data-testid="text-invoice-total">
                Total: {formatFullCurrency(sortedPayments.reduce((s, p) => s + p.amount, 0))}
              </span>
            </div>
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
}
