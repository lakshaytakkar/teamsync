import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Calendar, ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, StatGrid, StatCard, SectionCard, SectionGrid } from "@/components/layout";
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

interface PortalClient {
  totalPaid: number;
  pendingDues: number;
}

function formatCurrency(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

function formatFullCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
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

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function EtsPortalPayments() {
  const clientId = portalEtsClient.id;

  const { data: paymentsData, isLoading: loadingPayments } = useQuery<{ payments: PortalPayment[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'payments'],
  });

  const { data: clientData, isLoading: loadingClient } = useQuery<{ client: PortalClient }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  const payments = paymentsData?.payments || [];
  const client = clientData?.client;
  const isLoading = loadingPayments || loadingClient;

  const totalPaid = payments.filter((p) => p.status === "received").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const totalDue = (client?.totalPaid || 0) + (client?.pendingDues || 0);
  const paidPct = totalDue > 0 ? Math.round(((client?.totalPaid || totalPaid) / totalDue) * 100) : 0;

  if (isLoading) {
    return (
      <PageShell>
        <PaymentsSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="My Payments"
        subtitle="View your payment history and upcoming dues"
      />

      <StatGrid>
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle2}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10B981"
          trend="INR"
        />
        <StatCard
          label="Pending"
          value={formatCurrency(totalPending)}
          icon={Clock}
          iconBg="rgba(245,158,11,0.12)"
          iconColor="#F59E0B"
          trend="INR"
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(totalOverdue)}
          icon={AlertTriangle}
          iconBg="rgba(239,68,68,0.12)"
          iconColor="#EF4444"
          trend={totalOverdue > 0 ? "Action needed" : "All clear"}
        />
        <StatCard
          label="Payments Made"
          value={payments.filter((p) => p.status === "received").length}
          icon={IndianRupee}
          iconBg="rgba(249,115,22,0.12)"
          iconColor={ETS_PORTAL_COLOR}
          trend={`of ${payments.length} total`}
        />
      </StatGrid>

      <SectionGrid cols={2}>
        <SectionCard title="Payment Progress">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Total Investment</span>
              <span className="font-semibold" data-testid="text-total-investment">{formatFullCurrency(totalDue)}</span>
            </div>
            <Progress value={paidPct} className="h-3" />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span data-testid="text-paid-amount">{formatFullCurrency(client?.totalPaid || totalPaid)} paid</span>
              <span data-testid="text-remaining-amount">{formatFullCurrency(client?.pendingDues || totalPending + totalOverdue)} remaining</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-green-500" />
                  <span className="text-sm">Received</span>
                </div>
                <span className="text-sm font-medium" data-testid="text-summary-received">{formatFullCurrency(totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium" data-testid="text-summary-pending">{formatFullCurrency(totalPending)}</span>
              </div>
              {totalOverdue > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-500" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400" data-testid="text-summary-overdue">{formatFullCurrency(totalOverdue)}</span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payment Schedule">
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-schedule">
                No payments scheduled yet
              </p>
            ) : (
              payments
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((p, i) => {
                  const cfg = statusConfig[p.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3"
                      data-testid={`schedule-item-${p.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusIcon className={cn("size-4 shrink-0", cfg.color)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{typeLabels[p.type] || p.type}</p>
                          <p className="text-xs text-muted-foreground">{p.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <span className="text-sm font-semibold">{formatFullCurrency(p.amount)}</span>
                        <Badge variant={cfg.variant} className="text-[10px]">
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </SectionCard>
      </SectionGrid>

      <SectionCard title="Payment History">
        {payments.length === 0 ? (
          <Card data-testid="payments-empty-state">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <IndianRupee className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold" data-testid="text-no-payments">No Payments Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Your payment history will appear here once transactions are recorded.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="divide-y" data-testid="payments-list">
            {payments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((payment) => {
                const cfg = statusConfig[payment.status];
                const StatusIcon = cfg.icon;
                const isReceived = payment.status === "received";

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 py-3"
                    data-testid={`payment-row-${payment.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "flex items-center justify-center size-9 rounded-full shrink-0",
                        isReceived ? "bg-green-50 dark:bg-green-900/20" : payment.status === "overdue" ? "bg-red-50 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/20",
                      )}>
                        {isReceived ? (
                          <ArrowDownRight className="size-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className={cn("size-4", cfg.color)} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium" data-testid={`payment-type-${payment.id}`}>
                            {typeLabels[payment.type] || payment.type}
                          </p>
                          <Badge variant={cfg.variant} className="text-[10px]" data-testid={`payment-status-${payment.id}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-semibold", isReceived && "text-green-600 dark:text-green-400")} data-testid={`payment-amount-${payment.id}`}>
                        {isReceived ? "+" : ""}{formatFullCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`payment-date-${payment.id}`}>
                        <Calendar className="size-3 inline mr-1" />
                        {payment.date}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
