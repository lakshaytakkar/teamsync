import { useState, useMemo } from "react";
import { useEtsSidebar } from "@/components/layout/ets-subnav-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3, TrendingUp, ShoppingCart, Receipt, Banknote, Smartphone,
  CreditCard, RotateCcw,
} from "lucide-react";
import { ProductImage } from "@/components/product-image";
import {
  EXPANDED_SALES, RETURN_RECORDS, POS_PRODUCTS, getProductImage,
} from "@/lib/mock-data-pos-ets";

type DateRange = "today" | "yesterday" | "week" | "month";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function getDateLabel(range: DateRange) {
  const d = new Date();
  switch (range) {
    case "today": return d.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
    case "yesterday": { d.setDate(d.getDate() - 1); return d.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }); }
    case "week": return "This Week";
    case "month": return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
}

export default function EtsDailyReport() {
  const inSidebar = useEtsSidebar();
  const [range, setRange] = useState<DateRange>("today");

  const filteredSales = useMemo(() => {
    const now = new Date();
    let start: Date;
    switch (range) {
      case "today": start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case "yesterday": start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); break;
      case "week": start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); break;
      case "month": start = new Date(now.getFullYear(), now.getMonth(), 1); break;
    }
    let end: Date;
    if (range === "yesterday") {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      end = new Date(now.getTime() + 86400000);
    }
    return EXPANDED_SALES.filter(s => {
      const t = new Date(s.timestamp);
      return t >= start && t < end;
    });
  }, [range]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, x) => s + x.totalAmount, 0);
    const txCount = filteredSales.length;
    const avgBasket = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;
    const totalItems = filteredSales.reduce((s, x) => s + x.items.reduce((a, i) => a + i.quantity, 0), 0);
    const avgItems = txCount > 0 ? (totalItems / txCount).toFixed(1) : "0";
    const cashTotal = filteredSales.filter(s => s.paymentMethod === "cash").reduce((s, x) => s + x.totalAmount, 0);
    const upiTotal = filteredSales.filter(s => s.paymentMethod === "upi").reduce((s, x) => s + x.totalAmount, 0);
    const cardTotal = filteredSales.filter(s => s.paymentMethod === "card").reduce((s, x) => s + x.totalAmount, 0);
    return { totalRevenue, txCount, avgBasket, avgItems, cashTotal, upiTotal, cardTotal };
  }, [filteredSales]);

  const topByQty = useMemo(() => {
    const map: Record<string, { productId: string; name: string; image: string | null; qty: number; revenue: number }> = {};
    filteredSales.forEach(sale => sale.items.forEach(item => {
      if (!map[item.productId]) {
        map[item.productId] = { productId: item.productId, name: item.name, image: getProductImage(item.productId), qty: 0, revenue: 0 };
      }
      map[item.productId].qty += item.quantity;
      map[item.productId].revenue += item.lineTotal;
    }));
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [filteredSales]);

  const topByRevenue = useMemo(() =>
    [...topByQty].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  , [topByQty]);

  const hourlyData = useMemo(() => {
    if (range !== "today" && range !== "yesterday") return [];
    const hours: Record<number, number> = {};
    for (let h = 8; h <= 21; h++) hours[h] = 0;
    filteredSales.forEach(s => {
      const h = new Date(s.timestamp).getHours();
      if (hours[h] !== undefined) hours[h] += s.totalAmount;
      else hours[h] = s.totalAmount;
    });
    return Object.entries(hours).map(([h, v]) => ({ hour: parseInt(h), revenue: v }));
  }, [filteredSales, range]);

  const maxHourly = Math.max(...hourlyData.map(h => h.revenue), 1);

  const todayReturns = RETURN_RECORDS.filter(r => {
    const d = new Date(r.timestamp);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d >= today;
  });

  const [topTab, setTopTab] = useState<"qty" | "revenue">("qty");

  return (
    <div className={inSidebar ? "p-5 space-y-5" : "p-4 md:p-6 space-y-5 max-w-[1200px] mx-auto"}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-report-title">Daily Sales Report</h1>
            <p className="text-xs text-muted-foreground">{getDateLabel(range)}</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["today", "yesterday", "week", "month"] as DateRange[]).map(r => (
            <Button
              key={r} variant={range === r ? "default" : "ghost"}
              size="sm" className="h-7 text-xs capitalize"
              onClick={() => setRange(r)}
              data-testid={`button-range-${r}`}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-teal-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <p className="text-[10px] text-teal-600 uppercase tracking-wider font-medium">Total Revenue</p>
            </div>
            <p className="text-xl font-bold text-teal-700" data-testid="stat-revenue">{formatINR(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Transactions</p>
            </div>
            <p className="text-xl font-bold" data-testid="stat-tx-count">{stats.txCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Avg Basket</p>
            </div>
            <p className="text-xl font-bold" data-testid="stat-avg-basket">{formatINR(stats.avgBasket)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Avg Items/Tx</p>
            </div>
            <p className="text-xl font-bold" data-testid="stat-avg-items">{stats.avgItems}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Top Sellers</h3>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <Button
                  variant={topTab === "qty" ? "default" : "ghost"}
                  size="sm" className="h-6 text-[10px] px-2"
                  onClick={() => setTopTab("qty")}
                >
                  By Qty
                </Button>
                <Button
                  variant={topTab === "revenue" ? "default" : "ghost"}
                  size="sm" className="h-6 text-[10px] px-2"
                  onClick={() => setTopTab("revenue")}
                >
                  By Revenue
                </Button>
              </div>
            </div>
            {(topTab === "qty" ? topByQty : topByRevenue).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sales data</p>
            ) : (
              <div className="space-y-1.5">
                {(topTab === "qty" ? topByQty : topByRevenue).map((item, idx) => (
                  <div key={item.productId} className="flex items-center gap-2 py-1.5">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-right">{idx + 1}.</span>
                    <ProductImage src={item.image} alt={item.name} size="md" />
                    <span className="text-sm flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.qty} sold</span>
                    <span className="text-sm font-bold w-20 text-right">{formatINR(item.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Payment Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: "Cash", value: stats.cashTotal, icon: Banknote, color: "bg-green-500", iconBg: "bg-green-100", iconColor: "text-green-600" },
                { label: "UPI", value: stats.upiTotal, icon: Smartphone, color: "bg-purple-500", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
                { label: "Card", value: stats.cardTotal, icon: CreditCard, color: "bg-blue-500", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
              ].map(pm => (
                <div key={pm.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${pm.iconBg} flex items-center justify-center shrink-0`}>
                    <pm.icon className={`w-4 h-4 ${pm.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{pm.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {stats.totalRevenue > 0 ? Math.round((pm.value / stats.totalRevenue) * 100) : 0}%
                        </span>
                        <span className="text-sm font-bold">{formatINR(pm.value)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pm.color} rounded-full transition-all`}
                        style={{ width: stats.totalRevenue > 0 ? `${(pm.value / stats.totalRevenue) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">{formatINR(stats.totalRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hourlyData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">
              {range === "today" ? "Hourly Sales" : "Yesterday's Hourly Sales"}
            </h3>
            <div className="flex items-end gap-1 h-36">
              {hourlyData.map(h => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-28">
                    {h.revenue > 0 && (
                      <span className="text-[8px] text-muted-foreground mb-0.5 truncate">
                        {formatINR(h.revenue)}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-teal-500 to-teal-400 transition-all min-h-[2px]"
                      style={{ height: `${Math.max(2, (h.revenue / maxHourly) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{h.hour > 12 ? h.hour - 12 : h.hour}{h.hour >= 12 ? "p" : "a"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {todayReturns.length > 0 && range === "today" && (
        <Card className="border-0 shadow-sm border-l-4 border-l-rose-400">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" /> Returns Today
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-rose-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-rose-600 uppercase">Count</p>
                <p className="text-lg font-bold text-rose-700">{todayReturns.length}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-rose-600 uppercase">Refund Total</p>
                <p className="text-lg font-bold text-rose-700">{formatINR(todayReturns.reduce((s, r) => s + r.totalRefund, 0))}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-rose-600 uppercase">Top Reason</p>
                <p className="text-xs font-medium text-rose-700 mt-1">{todayReturns[0]?.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
