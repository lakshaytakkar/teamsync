import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell, TrendingUp, Package, Users, AlertTriangle } from "lucide-react";
import { Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type OrderState = "NEW" | "PROCESSING" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "PENDING_RETAILER_CONFIRMATION" | "BACKORDERED" | "CANCELED";

const BRAND_COLOR = "#1A6B45";

const stateConfig: Record<OrderState, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#2563EB", bg: "#EFF6FF" },
  PROCESSING: { label: "Processing", color: "#7C3AED", bg: "#F5F3FF" },
  PRE_TRANSIT: { label: "Pre-Transit", color: "#9333EA", bg: "#FAF5FF" },
  IN_TRANSIT: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  DELIVERED: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  PENDING_RETAILER_CONFIRMATION: { label: "Pending", color: "#EA580C", bg: "#FFF7ED" },
  BACKORDERED: { label: "Backordered", color: "#DC4A26", bg: "#FFF1EE" },
  CANCELED: { label: "Canceled", color: "#6B7280", bg: "#F9FAFB" },
};

const ORDER_STATES: OrderState[] = ["NEW", "PROCESSING", "PRE_TRANSIT", "IN_TRANSIT", "DELIVERED"];

export default function FaireDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState("all");

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
  });

  const { data: productsData } = useQuery<{ products: any[] }>({
    queryKey: ["/api/faire/products"],
  });

  const isLoading = storesLoading || ordersLoading;

  const stores = storesData?.stores ?? [];
  const orders = ordersData?.orders ?? [];
  const products = productsData?.products ?? [];

  const filteredOrders = selectedStore === "all" ? orders : orders.filter((o: any) => o._storeId === selectedStore);

  const totalRevenueMTD = orders.reduce((sum: number, order: any) => {
    const orderTotal = (order.items ?? []).reduce((s: number, item: any) => s + (item.price_cents ?? 0) * (item.quantity ?? 0), 0);
    return sum + orderTotal;
  }, 0);

  const newOrdersToday = orders.filter((o: any) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.created_at?.startsWith(today);
  }).length;

  const pendingFulfillment = orders.filter((o: any) => o.state === "NEW" || o.state === "PROCESSING").length;

  const activeRetailers = new Set(orders.map((o: any) => o.retailer_id)).size;

  const recentOrders = [...orders]
    .sort((a: any, b: any) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 6);

  const topProducts = [...products]
    .sort((a: any, b: any) => (b.variants?.length ?? 0) - (a.variants?.length ?? 0))
    .slice(0, 5);

  const ordersByStore = orders.reduce((acc: Record<string, any[]>, order: any) => {
    const sid = order._storeId;
    if (sid) {
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(order);
    }
    return acc;
  }, {});

  const handleSync = () => {
    toast({ title: "Syncing Orders", description: "Fetching latest orders from Faire API..." });
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="h-12 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </div>
    );
  }

  return (
    <PageShell>
      <HeroBanner
        eyebrow="Faire Marketplace"
        headline="Faire Marketplace"
        tagline={`Managing ${stores.length} brand storefronts`}
        color={BRAND_COLOR}
        colorDark="#2D8A60"
        actions={
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 backdrop-blur-sm outline-none"
            data-testid="select-store"
          >
            <option value="all" className="text-foreground">All Stores</option>
            {stores.map((s: any) => <option key={s.id} value={s.id} className="text-foreground">{s.name}</option>)}
          </select>
        }
      />

      {pendingFulfillment > 0 && (
        <Fade>
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4" data-testid="urgent-actions-widget">
            <div className="size-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <button onClick={() => setLocation("/faire/fulfillment")} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 hover:underline" data-testid="link-fulfillment">
                <span className="font-semibold">{pendingFulfillment} orders need fulfillment</span>
                <span className="text-amber-600">&rarr;</span>
              </button>
            </div>
            <Button size="sm" className="bg-amber-500 text-white shrink-0" onClick={() => setLocation("/faire/fulfillment")} data-testid="btn-urgent-action">
              Take Action
            </Button>
          </div>
        </Fade>
      )}

      <Stagger>
        <StatGrid>
          <StaggerItem>
            <StatCard
              label="Total Revenue MTD"
              value={`$${(totalRevenueMTD / 100000).toFixed(0)}K`}
              icon={TrendingUp}
              iconBg="rgba(5, 150, 105, 0.1)"
              iconColor="#059669"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="New Orders Today"
              value={newOrdersToday}
              icon={Package}
              iconBg="rgba(37, 99, 235, 0.1)"
              iconColor="#2563EB"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Pending Fulfillment"
              value={pendingFulfillment}
              icon={Bell}
              iconBg={pendingFulfillment > 0 ? "rgba(217, 119, 6, 0.1)" : "rgba(13, 148, 136, 0.1)"}
              iconColor={pendingFulfillment > 0 ? "#D97706" : "#0D9488"}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Active Retailers"
              value={activeRetailers}
              icon={Users}
              iconBg="rgba(124, 58, 237, 0.1)"
              iconColor="#7C3AED"
            />
          </StaggerItem>
        </StatGrid>
      </Stagger>

      <Fade>
        <SectionCard
          title="Store Health"
          viewAllLabel="Sync Now"
          onViewAll={handleSync}
        >
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {stores.map((store: any) => {
              const storeOrders = ordersByStore[store.id] ?? [];
              const todayStr = new Date().toISOString().slice(0, 10);
              const todayOrders = storeOrders.filter((o: any) => o.created_at?.startsWith(todayStr)).length;
              const storeRevenue = storeOrders.reduce((sum: number, o: any) => {
                return sum + (o.items ?? []).reduce((s: number, item: any) => s + (item.price_cents ?? 0) * (item.quantity ?? 0), 0);
              }, 0);
              return (
                <div
                  key={store.id}
                  className="min-w-[160px] shrink-0 rounded-xl border bg-card p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setLocation("/faire/stores")}
                  data-testid={`store-mini-card-${store.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`size-2 rounded-full ${store.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                    <p className="text-xs font-semibold truncate">{store.name}</p>
                  </div>
                  <p className="text-base font-bold">{todayOrders} <span className="text-[10px] text-muted-foreground font-normal">orders today</span></p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">${(storeRevenue / 100000).toFixed(0)}K <span className="text-muted-foreground font-normal">MTD</span></p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </Fade>

      <Fade>
        <div className="flex gap-2 flex-wrap">
          {ORDER_STATES.map(state => {
            const cfg = stateConfig[state];
            const count = filteredOrders.filter((o: any) => o.state === state).length;
            return (
              <div key={state} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }} data-testid={`state-chip-${state}`}>
                <span className="text-base font-bold">{count}</span>
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </Fade>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Fade>
          <SectionCard title="Recent Orders" noPadding>
            <div className="space-y-1 p-2">
              {recentOrders.map((order: any) => {
                const store = stores.find((s: any) => s.id === order._storeId);
                const cfg = stateConfig[order.state as OrderState] ?? stateConfig.NEW;
                const itemsTotal = (order.items ?? []).reduce((s: number, i: any) => s + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/faire/orders/${order.id}`)}
                    data-testid={`recent-order-${order.id}`}
                  >
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{order.display_id}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{order.address?.company_name ?? order.retailer_id}</p>
                      <p className="text-[10px] text-muted-foreground">{order.address?.city}{order.address?.state ? `, ${order.address.state}` : ""}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] shrink-0" style={{ color: BRAND_COLOR, borderColor: `${BRAND_COLOR}40` }}>{store?.name?.split(" ")[0] ?? "Store"}</Badge>
                    <p className="text-xs font-semibold shrink-0">${(itemsTotal / 100).toFixed(0)}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </Fade>

        <Fade>
          <SectionCard title="Top Products This Month" noPadding>
            <div className="space-y-1 p-2">
              {topProducts.map((product: any, i: number) => {
                const store = stores.find((s: any) => s.id === product._storeId);
                return (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setLocation(`/faire/products/${product.id}`)} data-testid={`top-product-${product.id}`}>
                    <div className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND_COLOR }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[9px]">{store?.name?.split(" ")[0] ?? "Store"}</Badge>
                        <span className="text-[10px] text-muted-foreground">{product.variants?.length ?? 0} variants</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{product.variants?.length ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">variants</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </Fade>
      </div>
    </PageShell>
  );
}
