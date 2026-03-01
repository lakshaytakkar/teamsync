import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useMemo } from "react";
import { Package, Truck, RotateCcw, AlertTriangle, TrendingUp, ArrowRight, ShoppingBag } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { omsOrders, omsShipments, omsInventory } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";

const BRAND = "#0891B2";

const PIPELINE_STAGES: Array<{ key: string; label: string; color: string }> = [
  { key: "pending", label: "Pending", color: "bg-slate-100 text-slate-700" },
  { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { key: "picking", label: "Picking", color: "bg-amber-100 text-amber-700" },
  { key: "packed", label: "Packed", color: "bg-cyan-100 text-cyan-700" },
  { key: "dispatched", label: "Dispatched", color: "bg-violet-100 text-violet-700" },
];

export default function OmsDashboard() {
  const loading = useSimulatedLoading(700);

  const stats = useMemo(() => {
    const activeOrders = omsOrders.filter(o => !["delivered", "cancelled"].includes(o.status));
    const pendingDispatch = omsOrders.filter(o => ["packed", "confirmed", "picking"].includes(o.status));
    const inTransit = omsShipments.filter(s => ["in-transit", "out-for-delivery", "picked_up"].includes(s.status));
    const lowCritical = omsInventory.filter(i => ["low", "critical"].includes(i.status));
    const delivered = omsOrders.filter(o => o.status === "delivered");
    const fulfillmentRate = Math.round((delivered.length / omsOrders.length) * 100);
    const totalRevenue = omsOrders.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = Math.round(totalRevenue / omsOrders.length);
    return { activeOrders: activeOrders.length, pendingDispatch: pendingDispatch.length, inTransit: inTransit.length, lowCritical: lowCritical.length, fulfillmentRate, totalRevenue, avgOrderValue };
  }, []);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of PIPELINE_STAGES) {
      counts[s.key] = omsOrders.filter(o => o.status === s.key).length;
    }
    return counts;
  }, []);

  const alertInventory = useMemo(() =>
    omsInventory.filter(i => ["critical", "low"].includes(i.status)).slice(0, 8),
  []);

  const recentShipments = useMemo(() =>
    [...omsShipments].sort((a, b) => b.shippedDate.localeCompare(a.shippedDate)).slice(0, 10),
  []);

  const customerMap = useMemo(() =>
    omsOrders.reduce<Record<string, string>>((acc, o) => { acc[o.id] = o.customerName; return acc; }, {}),
  []);

  const orderTypeSummary = useMemo(() => {
    const types = ["b2b", "b2c", "dropship"] as const;
    return types.map(t => ({
      type: t,
      count: omsOrders.filter(o => o.type === t).length,
      value: omsOrders.filter(o => o.type === t).reduce((s, o) => s + o.totalAmount, 0),
    }));
  }, []);

  const courierBadgeColors: Record<string, string> = {
    Delhivery: "bg-blue-100 text-blue-700",
    Shiprocket: "bg-orange-100 text-orange-700",
    DTDC: "bg-red-100 text-red-700",
    BlueDart: "bg-indigo-100 text-indigo-700",
    Ekart: "bg-amber-100 text-amber-700",
    Self: "bg-slate-100 text-slate-600",
  };

  const shipStatusColor: Record<string, string> = {
    created: "bg-slate-100 text-slate-600",
    picked_up: "bg-amber-100 text-amber-700",
    "in-transit": "bg-blue-100 text-blue-700",
    "out-for-delivery": "bg-cyan-100 text-cyan-700",
    delivered: "bg-emerald-100 text-emerald-700",
    rto: "bg-orange-100 text-orange-700",
    lost: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted" />)}
        </div>
        <div className="h-20 rounded-xl bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #0E7490 0%, ${BRAND} 60%, #06B6D4 100%)` }}
        >
          <div className="relative z-10">
            <p className="text-cyan-200 text-sm font-medium mb-1">Welcome back, Sneha</p>
            <h1 className="text-3xl font-bold mb-1">Order & Fulfillment</h1>
            <p className="text-cyan-100 text-sm">B2B · B2C · Dropship · India Operations</p>
            <div className="flex gap-8 mt-5 pt-4 border-t border-white/20 text-sm">
              <div>
                <p className="text-cyan-200 text-xs">Total Orders</p>
                <p className="font-bold text-lg">{omsOrders.length}</p>
              </div>
              <div>
                <p className="text-cyan-200 text-xs">Total Revenue</p>
                <p className="font-bold text-lg">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-cyan-200 text-xs">Avg Order Value</p>
                <p className="font-bold text-lg">₹{stats.avgOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="absolute right-8 top-6 opacity-10">
            <Package className="size-32 text-white" />
          </div>
        </div>
      </Fade>

      <Stagger>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Active Orders", value: stats.activeOrders, icon: ShoppingBag, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Pending Dispatch", value: stats.pendingDispatch, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "In-Transit", value: stats.inTransit, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Low / Critical Stock", value: stats.lowCritical, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Fulfillment Rate", value: `${stats.fulfillmentRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <div className="border border-border rounded-xl p-4 bg-background">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                  <s.icon className={cn("size-4", s.color)} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <Fade>
        <div className="border border-border rounded-xl p-5 bg-background">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Order Pipeline</h2>
          <div className="flex items-center gap-2">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={stage.key} className="flex items-center gap-2 flex-1">
                <div className={cn("flex-1 rounded-lg p-3 text-center", stage.color)}>
                  <p className="text-lg font-bold">{pipelineCounts[stage.key]}</p>
                  <p className="text-xs font-medium">{stage.label}</p>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-3 gap-4">
        <Fade className="col-span-2">
          <div className="border border-border rounded-xl bg-background overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold">Inventory Alerts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">SKUs requiring immediate reorder</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Product</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">On Hand</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Reorder Pt.</th>
                  <th className="text-center py-2 px-4 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {alertInventory.map((inv) => (
                  <tr key={inv.id} className={cn("border-b border-border/50", inv.status === "critical" ? "bg-red-50" : "bg-amber-50/40")}>
                    <td className="py-2 px-4 font-mono text-xs">{inv.sku}</td>
                    <td className="py-2 px-4 text-xs truncate max-w-[160px]">{inv.productName}</td>
                    <td className="py-2 px-4 text-right font-semibold text-xs">{inv.qtyOnHand}</td>
                    <td className="py-2 px-4 text-right text-xs text-muted-foreground">{inv.reorderPoint}</td>
                    <td className="py-2 px-4 text-center">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        inv.status === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {inv.status === "critical" ? "Critical" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fade>

        <Fade>
          <div className="border border-border rounded-xl bg-background overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold">Order Type — Feb 2026</h2>
            </div>
            <div className="p-4 space-y-3">
              {orderTypeSummary.map(({ type, count, value }) => {
                const config = {
                  b2b: { label: "B2B", color: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
                  b2c: { label: "B2C", color: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
                  dropship: { label: "Dropship", color: "bg-violet-500", bg: "bg-violet-50 text-violet-700" },
                }[type];
                const pct = Math.round((count / omsOrders.length) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", config.bg)}>{config.label}</span>
                      <span className="text-xs text-muted-foreground">{count} · ₹{(value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", config.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Fade>
      </div>

      <Fade>
        <div className="border border-border rounded-xl bg-background overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold">Today's Dispatches</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 10 shipments by dispatch date</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">AWB #</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Courier</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">City</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Expected Delivery</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((shp) => (
                <tr key={shp.id} className="border-b border-border/50 hover:bg-muted/10">
                  <td className="py-2.5 px-4 font-mono text-xs text-cyan-700">{shp.awbNumber}</td>
                  <td className="py-2.5 px-4">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", courierBadgeColors[shp.courier])}>
                      {shp.courier}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs font-medium truncate max-w-[140px]">{customerMap[shp.orderId] || "—"}</td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{shp.city}</td>
                  <td className="py-2.5 px-4">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", shipStatusColor[shp.status])}>
                      {shp.status.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{shp.expectedDelivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Fade>
    </PageTransition>
  );
}
