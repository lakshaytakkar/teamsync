import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Fade } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import {
  PageShell,
  PageHeader,
  StatGrid,
  StatCard,
  IndexToolbar,
  DataTableContainer,
  DataTH,
  DataTD,
  DataTR,
} from "@/components/layout";

const BRAND_COLOR = "#1A6B45";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface EnrichedRetailer {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  total_orders: number;
  total_spent: number;
  last_ordered: string | null;
  status: "active" | "inactive";
  storeIds: string[];
}

export default function FaireRetailers() {
  const [, setLocation] = useLocation();
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: any[] }>({
    queryKey: ["/api/faire/stores"],
    queryFn: async () => {
      const res = await fetch("/api/faire/stores", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: retailersData, isLoading: retailersLoading } = useQuery<{ retailers: any[] }>({
    queryKey: ["/api/faire/retailers"],
    queryFn: async () => {
      const res = await fetch("/api/faire/retailers", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: any[] }>({
    queryKey: ["/api/faire/orders"],
    queryFn: async () => {
      const res = await fetch("/api/faire/orders", { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const isLoading = storesLoading || retailersLoading || ordersLoading;
  const stores = storesData?.stores ?? [];
  const rawRetailers = retailersData?.retailers ?? [];
  const orders = ordersData?.orders ?? [];

  const enrichedRetailers = useMemo<EnrichedRetailer[]>(() => {
    const now = Date.now();
    const ordersByRetailer = new Map<string, any[]>();
    for (const order of orders) {
      const rid = order.retailer_id;
      if (!rid) continue;
      if (!ordersByRetailer.has(rid)) ordersByRetailer.set(rid, []);
      ordersByRetailer.get(rid)!.push(order);
    }

    return rawRetailers.map((r: any) => {
      const rOrders = ordersByRetailer.get(r.id) ?? [];
      const totalOrders = rOrders.length;
      const totalSpent = rOrders.reduce((sum: number, o: any) => {
        const orderTotal = (o.items ?? []).reduce((s: number, item: any) => s + (item.price_cents ?? 0) * (item.quantity ?? 1), 0);
        return sum + orderTotal;
      }, 0);
      const lastOrderDate = rOrders.length > 0
        ? rOrders.reduce((latest: string, o: any) => (o.created_at > latest ? o.created_at : latest), rOrders[0].created_at)
        : null;
      const isActive = lastOrderDate ? (now - new Date(lastOrderDate).getTime()) < NINETY_DAYS_MS : false;
      const storeIdSet = new Set<string>();
      for (const o of rOrders) {
        if (o._storeId) storeIdSet.add(o._storeId);
      }
      return {
        id: r.id,
        name: r.name ?? "Unknown Retailer",
        city: r.city,
        state: r.state,
        country: r.country,
        total_orders: totalOrders,
        total_spent: Math.round(totalSpent / 100),
        last_ordered: lastOrderDate,
        status: isActive ? "active" : "inactive",
        storeIds: Array.from(storeIdSet),
      } as EnrichedRetailer;
    });
  }, [rawRetailers, orders]);

  const filtered = enrichedRetailers.filter(r => {
    if (selectedStore !== "all" && !r.storeIds.includes(selectedStore)) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalRetailers = enrichedRetailers.length;
  const activeRetailers = enrichedRetailers.filter(r => r.status === "active").length;
  const avgOrderValue = totalRetailers > 0
    ? Math.round(enrichedRetailers.reduce((s, r) => s + (r.total_orders > 0 ? r.total_spent / r.total_orders : 0), 0) / totalRetailers)
    : 0;
  const repeatRetailers = enrichedRetailers.filter(r => r.total_orders > 1).length;
  const repeatRate = totalRetailers > 0 ? Math.round((repeatRetailers / totalRetailers) * 100) : 0;

  if (isLoading) {
    return (
      <PageShell>
        <div className="h-10 bg-muted rounded w-64 animate-pulse" />
        <StatGrid>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </StatGrid>
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Retailers"
          subtitle="All buyers across your Faire stores"
          actions={
            <select 
              value={selectedStore} 
              onChange={e => setSelectedStore(e.target.value)} 
              className="h-9 text-sm border rounded-lg px-3 bg-background font-medium" 
              data-testid="select-store"
            >
              <option value="all">All Stores</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          }
        />
      </Fade>

      <Fade>
        <StatGrid>
          {[
            { label: "Total Retailers", value: totalRetailers, color: BRAND_COLOR, bg: "rgba(26, 107, 69, 0.1)" },
            { label: "Active (90d)", value: activeRetailers, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Avg Order Value", value: `$${avgOrderValue}`, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Repeat Rate", value: `${repeatRate}%`, color: "#D97706", bg: "#FFFBEB" },
          ].map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={Users}
              iconBg={s.bg}
              iconColor={s.color}
            />
          ))}
        </StatGrid>
      </Fade>

      <Fade>
        <IndexToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search retailer or store..."
          color={BRAND_COLOR}
          filters={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          activeFilter={statusFilter}
          onFilter={(v) => setStatusFilter(v as any)}
        />
      </Fade>

      <Fade>
        <DataTableContainer>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <DataTH>Retailer</DataTH>
                <DataTH>Location</DataTH>
                <DataTH>Stores</DataTH>
                <DataTH align="center">Orders</DataTH>
                <DataTH>Total Spent</DataTH>
                <DataTH>Last Order</DataTH>
                <DataTH>Status</DataTH>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(retailer => (
                <DataTR key={retailer.id} onClick={() => setLocation(`/faire/retailers/${retailer.id}`)} data-testid={`retailer-row-${retailer.id}`}>
                  <DataTD>
                    <p className="font-semibold text-sm">{retailer.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{retailer.id}</p>
                  </DataTD>
                  <DataTD className="text-muted-foreground font-medium">
                    {[retailer.city, retailer.state].filter(Boolean).join(", ") || "—"}
                  </DataTD>
                  <DataTD>
                    <div className="flex flex-wrap gap-1">
                      {retailer.storeIds.map(sid => {
                        const store = stores.find((s: any) => s.id === sid);
                        return <Badge key={sid} variant="outline" className="text-[9px] font-medium">{store?.name?.split(" ")[0] ?? sid.slice(0, 8)}</Badge>;
                      })}
                      {retailer.storeIds.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </DataTD>
                  <DataTD align="center" className="font-bold">{retailer.total_orders}</DataTD>
                  <DataTD className="font-bold text-foreground/80">${retailer.total_spent.toLocaleString()}</DataTD>
                  <DataTD className="text-muted-foreground font-medium">{retailer.last_ordered ? new Date(retailer.last_ordered).toLocaleDateString() : "—"}</DataTD>
                  <DataTD>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${retailer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{retailer.status}</span>
                  </DataTD>
                </DataTR>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground font-medium">No retailers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </Fade>
    </PageShell>
  );
}
