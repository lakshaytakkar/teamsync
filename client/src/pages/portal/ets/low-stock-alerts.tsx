import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, TrendingDown, Clock, ShoppingCart, Package,
} from "lucide-react";
import {
  POS_PRODUCTS, INVENTORY, getDailySalesRate, getStockStatus,
} from "@/lib/mock-data-pos-ets";

export default function EtsLowStockAlerts() {
  const alerts = useMemo(() => {
    return INVENTORY
      .filter(inv => inv.currentStock <= inv.reorderThreshold)
      .map(inv => {
        const prod = POS_PRODUCTS.find(p => p.id === inv.productId)!;
        const status = getStockStatus(inv.currentStock, inv.reorderThreshold);
        const dailyRate = getDailySalesRate(inv.productId);
        const daysUntilOut = inv.currentStock > 0 && dailyRate > 0
          ? Math.floor(inv.currentStock / dailyRate)
          : inv.currentStock === 0 ? 0 : null;
        const suggestedReorder = dailyRate > 0 ? Math.ceil(dailyRate * 30) : 10;
        const urgency = inv.currentStock === 0 ? 0 : inv.currentStock <= 2 ? 1 : 2;
        return { ...inv, ...prod, status, dailyRate, daysUntilOut, suggestedReorder, urgency };
      })
      .sort((a, b) => a.urgency - b.urgency || a.currentStock - b.currentStock);
  }, []);

  const outCount = alerts.filter(a => a.urgency === 0).length;
  const criticalCount = alerts.filter(a => a.urgency === 1).length;
  const lowCount = alerts.filter(a => a.urgency === 2).length;

  function getUrgencyStyle(urgency: number) {
    switch (urgency) {
      case 0: return { bg: "bg-red-50", border: "border-l-red-500", badge: "bg-red-100 text-red-700", label: "OUT OF STOCK" };
      case 1: return { bg: "bg-amber-50", border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700", label: "CRITICAL" };
      default: return { bg: "bg-yellow-50", border: "border-l-yellow-400", badge: "bg-yellow-100 text-yellow-700", label: "LOW" };
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-alerts-title">Low Stock Alerts</h1>
          <p className="text-xs text-muted-foreground">Products below reorder threshold</p>
        </div>
        {alerts.length > 0 && (
          <Badge className="ml-auto bg-red-100 text-red-700 border-0 text-xs">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-red-600 uppercase tracking-wider font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-red-700 mt-1" data-testid="stat-alerts-out">{outCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Critical (1-2)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1" data-testid="stat-alerts-critical">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-yellow-50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-yellow-600 uppercase tracking-wider font-medium">Low (3-5)</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1" data-testid="stat-alerts-low">{lowCount}</p>
          </CardContent>
        </Card>
      </div>

      {alerts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-semibold text-green-700">All stocked up!</p>
            <p className="text-sm text-muted-foreground mt-1">No products are below the reorder threshold</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(item => {
            const style = getUrgencyStyle(item.urgency);
            return (
              <Card
                key={item.productId}
                className={`border-0 shadow-sm border-l-4 ${style.border} ${style.bg}`}
                data-testid={`alert-${item.productId}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <Badge className={`text-[9px] border-0 ${style.badge}`}>{style.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category} · MRP ₹{item.mrp}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stock</p>
                          <p className={`text-lg font-bold ${item.currentStock === 0 ? "text-red-600" : "text-amber-600"}`}>
                            {item.currentStock === 0 ? "OUT" : item.currentStock}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Sales</p>
                          </div>
                          <p className="text-lg font-bold">
                            {item.dailyRate > 0 ? item.dailyRate.toFixed(1) : "—"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Days Left</p>
                          </div>
                          <p className={`text-lg font-bold ${item.daysUntilOut === 0 ? "text-red-600" : item.daysUntilOut !== null && item.daysUntilOut <= 3 ? "text-amber-600" : ""}`}>
                            {item.daysUntilOut === 0 ? "OUT" : item.daysUntilOut !== null ? `~${item.daysUntilOut}d` : "—"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Suggest Order</p>
                          </div>
                          <p className="text-lg font-bold text-blue-600">{item.suggestedReorder}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
