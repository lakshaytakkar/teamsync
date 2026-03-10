import { useQuery } from "@tanstack/react-query";
import {
  Package, Truck, Factory, Ship, Building2,
  Warehouse, CheckCircle2, Clock, FileText, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, StatGrid, StatCard } from "@/components/layout";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_ORDER_STAGE_LABELS,
  ETS_ORDER_STAGES,
} from "@/lib/mock-data-portal-ets";

interface PortalOrder {
  id: string;
  clientId: string;
  clientName: string;
  status: string;
  etaDays: number;
  valueInr: number;
  itemCount: number;
  createdDate: string;
  documents: { name: string; type: string }[];
  isFlagged: boolean;
}

function formatCurrency(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

const stageIcons: Record<string, typeof Package> = {
  ordered: Package,
  "factory-ready": Factory,
  shipped: Ship,
  customs: Building2,
  warehouse: Warehouse,
  dispatched: Truck,
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ordered: "outline",
  "factory-ready": "secondary",
  shipped: "default",
  customs: "outline",
  warehouse: "secondary",
  dispatched: "default",
};

function OrderStepper({ status }: { status: string }) {
  const currentIdx = ETS_ORDER_STAGES.indexOf(status as any);

  return (
    <div className="flex items-center w-full" data-testid="order-stepper">
      {ETS_ORDER_STAGES.map((stage, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = stageIcons[stage] || Package;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                  isDone && "border-green-500 bg-green-50 dark:bg-green-900/20",
                  isCurrent && "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
                  !isDone && !isCurrent && "border-muted bg-muted/30",
                )}
                data-testid={`order-step-${stage}`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Icon className={cn("size-3.5", isCurrent ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground")} />
                )}
              </div>
              <span className={cn(
                "text-[10px] text-center leading-tight max-w-[60px]",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                isDone && "text-green-700 dark:text-green-400",
              )}>
                {ETS_ORDER_STAGE_LABELS[stage] || stage}
              </span>
            </div>
            {i < ETS_ORDER_STAGES.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 mt-[-18px]",
                i < currentIdx ? "bg-green-400" : "bg-muted",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: PortalOrder }) {
  const currentIdx = ETS_ORDER_STAGES.indexOf(order.status as any);
  const progressPct = Math.round(((currentIdx + 1) / ETS_ORDER_STAGES.length) * 100);
  const etaMax = 90;
  const etaPct = Math.max(0, Math.min(100, Math.round(((etaMax - order.etaDays) / etaMax) * 100)));

  return (
    <Card className="overflow-visible" data-testid={`order-card-${order.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base" data-testid={`order-id-${order.id}`}>Order #{order.id}</CardTitle>
            <Badge variant={statusBadgeVariant[order.status] || "outline"} data-testid={`order-status-${order.id}`}>
              {ETS_ORDER_STAGE_LABELS[order.status] || order.status}
            </Badge>
            {order.isFlagged && (
              <Badge variant="destructive" className="text-[10px]" data-testid={`order-flagged-${order.id}`}>
                <AlertTriangle className="size-3 mr-1" />
                Flagged
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1" data-testid={`order-date-${order.id}`}>
            Placed on {order.createdDate}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold" data-testid={`order-value-${order.id}`}>
            <span className="text-xs font-normal text-muted-foreground mr-0.5">INR</span>
            {formatCurrency(order.valueInr)}
          </p>
          <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <OrderStepper status={order.status} />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Estimated arrival</span>
            </div>
            <span className="font-medium" data-testid={`order-eta-${order.id}`}>
              {order.etaDays > 0 ? `${order.etaDays} days` : "Delivered"}
            </span>
          </div>
          <Progress value={etaPct} className="h-2" />
        </div>

        {order.documents.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Documents</p>
            <div className="flex flex-wrap gap-2">
              {order.documents.map((doc: any, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] gap-1"
                  data-testid={`order-doc-${order.id}-${i}`}
                >
                  <FileText className="size-3" />
                  {doc.name || doc}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

export default function EtsPortalOrders() {
  const clientId = portalEtsClient.id;

  const { data, isLoading } = useQuery<{ orders: PortalOrder[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'orders'],
  });

  const orders = data?.orders || [];

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status !== "dispatched").length;
  const totalValue = orders.reduce((s, o) => s + o.valueInr, 0);
  const avgEta = activeOrders > 0
    ? Math.round(orders.filter((o) => o.status !== "dispatched").reduce((s, o) => s + o.etaDays, 0) / activeOrders)
    : 0;

  if (isLoading) {
    return (
      <PageShell>
        <OrdersSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="My Orders"
        subtitle="Track your inventory shipments and delivery progress"
      />

      <StatGrid>
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={Package}
          iconBg="rgba(249,115,22,0.12)"
          iconColor={ETS_PORTAL_COLOR}
        />
        <StatCard
          label="Active Shipments"
          value={activeOrders}
          icon={Truck}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
        />
        <StatCard
          label="Total Value"
          value={`${formatCurrency(totalValue)}`}
          icon={Package}
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10B981"
          trend="INR"
        />
        <StatCard
          label="Avg. ETA"
          value={avgEta > 0 ? `${avgEta}d` : "--"}
          icon={Clock}
          iconBg="rgba(139,92,246,0.12)"
          iconColor="#8B5CF6"
        />
      </StatGrid>

      {orders.length === 0 ? (
        <Card data-testid="orders-empty-state">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Package className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold" data-testid="text-no-orders">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Your inventory orders will appear here once they are placed. Your account manager will coordinate the order process with you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
