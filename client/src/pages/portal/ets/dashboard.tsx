import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  CheckCircle2, Clock, Package, IndianRupee, ArrowRight,
  Store, MessageSquare, Truck, ListChecks, TrendingUp,
  DollarSign, ShoppingCart, Calendar, MapPin, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  PageShell, HeroBanner, StatGrid, StatCard, SectionGrid, SectionCard,
} from "@/components/layout";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DESCRIPTIONS,
  ETS_STAGE_DISPLAY_LABELS,
  ETS_ORDER_STAGE_LABELS,
  ETS_ORDER_STAGES,
} from "@/lib/mock-data-portal-ets";

const PIPELINE_STAGES = [
  "new-lead", "qualified", "token-paid", "store-design",
  "inventory-ordered", "in-transit", "launched", "reordering",
];

function formatCurrency(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

function StageJourneyStepper({ currentStage }: { currentStage: string }) {
  const currentIdx = PIPELINE_STAGES.indexOf(currentStage);

  return (
    <SectionCard title="Your Store Journey">
      <div className="space-y-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={stage} className="flex items-center gap-1" data-testid={`journey-stage-${stage}`}>
                {i > 0 && (
                  <div className={cn(
                    "h-0.5 w-4 lg:w-8 shrink-0",
                    isDone ? "bg-orange-500" : isCurrent ? "bg-orange-400" : "bg-muted"
                  )} />
                )}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                    isDone && "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                    isCurrent && "bg-orange-500 text-white ring-4 ring-orange-200/50 dark:ring-orange-800/50 shadow-lg",
                    !isDone && !isCurrent && "bg-muted text-muted-foreground"
                  )}>
                    {isDone ? <CheckCircle2 className="size-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[9px] text-center leading-tight font-medium hidden lg:block max-w-[72px]",
                    isDone && "text-orange-700 dark:text-orange-300",
                    isCurrent && "text-orange-600 dark:text-orange-400 font-bold",
                    !isDone && !isCurrent && "text-muted-foreground"
                  )}>
                    {ETS_STAGE_DISPLAY_LABELS[stage] || stage}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Progress
            value={((currentIdx + 1) / PIPELINE_STAGES.length) * 100}
            className="flex-1 h-2"
          />
          <span className="text-sm font-bold" style={{ color: ETS_PORTAL_COLOR }}>
            {Math.round(((currentIdx + 1) / PIPELINE_STAGES.length) * 100)}%
          </span>
        </div>

        <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.15)" }}>
          <div className="flex items-center gap-2">
            <Clock className="size-4 animate-pulse" style={{ color: ETS_PORTAL_COLOR }} />
            <span className="text-sm font-semibold" style={{ color: ETS_PORTAL_COLOR }}>
              Current Stage: {ETS_STAGE_DISPLAY_LABELS[currentStage] || currentStage}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {ETS_STAGE_DESCRIPTIONS[currentStage] || "Your journey is progressing. Check back for updates."}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function OrderTrackingStepper({ order }: { order: any }) {
  const statusIdx = ETS_ORDER_STAGES.indexOf(order.status);

  return (
    <div className="rounded-lg border p-4 space-y-3" data-testid={`order-tracking-${order.id}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold">Order #{order.id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order.itemCount} items &middot; INR {order.valueInr?.toLocaleString("en-IN")}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            statusIdx >= 5 && "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
            statusIdx < 5 && statusIdx >= 2 && "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
            statusIdx < 2 && "border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
          )}
        >
          {ETS_ORDER_STAGE_LABELS[order.status] || order.status}
        </Badge>
      </div>

      <div className="flex items-center gap-0.5">
        {ETS_ORDER_STAGES.map((stage, i) => {
          const isDone = i <= statusIdx;
          return (
            <div key={stage} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "h-1.5 w-full rounded-full",
                isDone ? "bg-orange-500" : "bg-muted"
              )} />
              <span className="text-[8px] text-muted-foreground hidden sm:block">
                {ETS_ORDER_STAGE_LABELS[stage]?.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          );
        })}
      </div>

      {order.etaDays != null && order.etaDays > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="size-3.5" />
          <span>ETA: ~{order.etaDays} days remaining</span>
          <Progress value={Math.max(5, 100 - (order.etaDays * 2))} className="flex-1 h-1.5" />
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </PageShell>
  );
}

const activityIconMap: Record<string, typeof CheckCircle2> = {
  stage: TrendingUp,
  payment: DollarSign,
  order: ShoppingCart,
  checklist: ListChecks,
};

const activityColorMap: Record<string, string> = {
  stage: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
  payment: "bg-green-100 text-green-600 dark:bg-green-900/30",
  order: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
  checklist: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
};

export default function EtsPortalDashboard() {
  const [, navigate] = useLocation();
  const clientId = portalEtsClient.id;

  const { data: clientData, isLoading: clientLoading } = useQuery<{ client: any }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'orders'],
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'payments'],
  });

  const { data: checklistData, isLoading: checklistLoading } = useQuery<{ checklist: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'checklist'],
  });

  const isLoading = clientLoading || ordersLoading || paymentsLoading || checklistLoading;

  if (isLoading) return <DashboardSkeleton />;

  const client = clientData?.client;
  const orders = ordersData?.orders || [];
  const payments = paymentsData?.payments || [];
  const checklist = checklistData?.checklist || [];

  if (!client) {
    return (
      <PageShell>
        <div className="py-20 text-center text-sm text-muted-foreground" data-testid="text-no-client">
          Unable to load client data. Please try again.
        </div>
      </PageShell>
    );
  }

  const totalPaid = client.totalPaid || 0;
  const pendingDues = client.pendingDues || 0;
  const totalInvestment = totalPaid + pendingDues;
  const checklistDone = checklist.filter((c: any) => c.completed).length;
  const checklistTotal = checklist.length;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  const activeOrders = orders.filter((o: any) => o.status !== "dispatched");
  const completedOrders = orders.filter((o: any) => o.status === "dispatched").length;
  const pendingPayments = payments.filter((p: any) => p.status === "pending" || p.status === "overdue");

  const recentActivity = buildRecentActivity(client, orders, payments);

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`Welcome back, ${client.name}`}
        headline="Your EazyToSell Journey"
        tagline={`${client.city} Store — ${ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage} Stage`}
        color="#F97316"
        colorDark="#C2410C"
        metrics={[
          { label: "Package", value: client.packageTier || "Standard" },
          { label: "Store Score", value: client.score || 0 },
          { label: "Days Active", value: client.daysInStage || 0 },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Total Invested"
          value={`INR ${formatCurrency(totalPaid)}`}
          icon={IndianRupee}
          iconBg="#fed7aa"
          iconColor="#c2410c"
          trend={totalInvestment > 0 ? `${Math.round((totalPaid / totalInvestment) * 100)}% of total` : "No payments yet"}
        />
        <StatCard
          label="Pending Dues"
          value={`INR ${formatCurrency(pendingDues)}`}
          icon={DollarSign}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend={pendingPayments.length > 0 ? `${pendingPayments.length} pending payment(s)` : "All clear"}
        />
        <StatCard
          label="Order Status"
          value={`${completedOrders}/${orders.length}`}
          icon={Package}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          trend={activeOrders.length > 0 ? `${activeOrders.length} in progress` : "No active orders"}
        />
        <StatCard
          label="Checklist Progress"
          value={`${checklistPercent}%`}
          icon={ListChecks}
          iconBg="#d1fae5"
          iconColor="#059669"
          trend={`${checklistDone}/${checklistTotal} items completed`}
        />
      </StatGrid>

      <StageJourneyStepper currentStage={client.stage} />

      {activeOrders.length > 0 && (
        <SectionCard
          title="Active Orders"
          viewAllLabel="View All Orders"
          onViewAll={() => navigate("/portal-ets/orders")}
        >
          <div className="space-y-4">
            {activeOrders.slice(0, 3).map((order: any) => (
              <OrderTrackingStepper key={order.id} order={order} />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionGrid cols={3}>
        <SectionCard title="My Store" onViewAll={() => navigate("/portal-ets/store")} viewAllLabel="View">
          <div className="space-y-2" data-testid="quickaction-store">
            <Store className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
            <p className="text-xs text-muted-foreground">View your store journey, checklist progress, and package details</p>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </SectionCard>
        <SectionCard title="My Orders" onViewAll={() => navigate("/portal-ets/orders")} viewAllLabel="View">
          <div className="space-y-2" data-testid="quickaction-orders">
            <Package className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
            <p className="text-xs text-muted-foreground">Track your product orders, shipments, and delivery status</p>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </SectionCard>
        <SectionCard title="Messages" onViewAll={() => navigate("/portal-ets/messages")} viewAllLabel="View">
          <div className="space-y-2" data-testid="quickaction-messages">
            <MessageSquare className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
            <p className="text-xs text-muted-foreground">Chat with your EazyToSell account manager and support team</p>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </SectionCard>
      </SectionGrid>

      {recentActivity.length > 0 && (
        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {recentActivity.map((act) => {
              const Icon = activityIconMap[act.type] || Clock;
              const color = activityColorMap[act.type] || "bg-slate-100 text-slate-500";
              return (
                <div key={act.id} className="flex items-start gap-3" data-testid={`activity-${act.id}`}>
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{act.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {act.date}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}

interface ActivityEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

function buildRecentActivity(client: any, orders: any[], payments: any[]): ActivityEntry[] {
  const activities: ActivityEntry[] = [];

  activities.push({
    id: "stage-current",
    type: "stage",
    title: `Stage: ${ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}`,
    description: ETS_STAGE_DESCRIPTIONS[client.stage]?.split(".")[0] + "." || "Journey in progress.",
    date: client.createdDate || "Recently",
  });

  payments.slice(-3).reverse().forEach((p: any, i: number) => {
    activities.push({
      id: `payment-${p.id}`,
      type: "payment",
      title: `Payment ${p.status === "received" ? "Received" : p.status === "pending" ? "Pending" : p.status}`,
      description: `INR ${p.amount?.toLocaleString("en-IN")} — ${p.type || "General"}`,
      date: p.date || "Recently",
    });
  });

  orders.slice(-2).reverse().forEach((o: any) => {
    activities.push({
      id: `order-${o.id}`,
      type: "order",
      title: `Order #${o.id} — ${ETS_ORDER_STAGE_LABELS[o.status] || o.status}`,
      description: `${o.itemCount} items, INR ${o.valueInr?.toLocaleString("en-IN")}`,
      date: o.createdDate || "Recently",
    });
  });

  return activities.slice(0, 6);
}
