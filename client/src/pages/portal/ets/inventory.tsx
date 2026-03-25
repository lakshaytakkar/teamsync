import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Package, Search, Filter, ArrowUpDown,
  ArrowDownRight, ArrowUpRight, Minus, RotateCcw, ClipboardList,
} from "lucide-react";
import {
  POS_PRODUCTS, INVENTORY,
  getStockStatus, STOCK_STATUS_CONFIG,
  getProductMovements,
  type StockStatus,
} from "@/lib/mock-data-pos-ets";

const CATEGORIES = [...new Set(POS_PRODUCTS.map(p => p.category))].sort();

function MovementIcon({ type }: { type: string }) {
  switch (type) {
    case "sale": return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />;
    case "receive": return <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />;
    case "return": return <RotateCcw className="w-3.5 h-3.5 text-blue-500" />;
    case "adjustment": return <ClipboardList className="w-3.5 h-3.5 text-amber-500" />;
    default: return <Minus className="w-3.5 h-3.5" />;
  }
}

export default function EtsInventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "value">("name");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const isOwner = true;

  const enriched = useMemo(() =>
    INVENTORY.map(inv => {
      const prod = POS_PRODUCTS.find(p => p.id === inv.productId)!;
      const status = getStockStatus(inv.currentStock, inv.reorderThreshold);
      return { ...inv, ...prod, status, stockValue: inv.currentStock * inv.costPrice };
    }), []
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.barcode.includes(q));
    }
    if (categoryFilter !== "all") list = list.filter(i => i.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === "stock") return a.currentStock - b.currentStock;
      if (sortBy === "value") return b.stockValue - a.stockValue;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [enriched, search, categoryFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const healthy = enriched.filter(i => i.status === "healthy").length;
    const low = enriched.filter(i => i.status === "low").length;
    const out = enriched.filter(i => i.status === "out").length;
    const totalValue = enriched.reduce((s, i) => s + i.stockValue, 0);
    return { total: enriched.length, healthy, low, out, totalValue };
  }, [enriched]);

  const selectedProd = selectedProduct ? POS_PRODUCTS.find(p => p.id === selectedProduct) : null;
  const selectedInv = selectedProduct ? INVENTORY.find(i => i.productId === selectedProduct) : null;
  const movements = selectedProduct ? getProductMovements(selectedProduct) : [];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-inventory-title">Inventory</h1>
          <p className="text-xs text-muted-foreground">Stock control center</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total SKUs</p>
            <p className="text-2xl font-bold mt-1" data-testid="stat-total-skus">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-3">
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Healthy</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1" data-testid="stat-healthy">{stats.healthy}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-3">
            <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-amber-700 mt-1" data-testid="stat-low">{stats.low}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="p-3">
            <p className="text-[10px] text-red-600 uppercase tracking-wider font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-red-700 mt-1" data-testid="stat-out">{stats.out}</p>
          </CardContent>
        </Card>
        {isOwner && (
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-3">
              <p className="text-[10px] text-blue-600 uppercase tracking-wider font-medium">Inventory Value</p>
              <p className="text-2xl font-bold text-blue-700 mt-1" data-testid="stat-value">₹{stats.totalValue.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or barcode..."
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-inventory-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] h-9" data-testid="select-category-filter">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StockStatus | "all")}>
          <SelectTrigger className="w-[140px] h-9" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as "name" | "stock" | "value")}>
          <SelectTrigger className="w-[130px] h-9" data-testid="select-sort">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stock">Stock (Low first)</SelectItem>
            <SelectItem value="value">Value (High first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left border-b">
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs">Product</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">Barcode</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs">Category</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs text-right">MRP</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs text-right">Stock</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs text-center">Status</th>
                {isOwner && <th className="px-4 py-2.5 font-medium text-muted-foreground text-xs text-right hidden lg:table-cell">Value</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const cfg = STOCK_STATUS_CONFIG[item.status];
                return (
                  <tr
                    key={item.productId}
                    className="border-b last:border-0 hover:bg-orange-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedProduct(item.productId)}
                    data-testid={`row-inventory-${item.productId}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs hidden md:table-cell">{item.barcode}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-[10px] font-normal">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">₹{item.mrp}</td>
                    <td className="px-4 py-2.5 text-right font-bold">{item.currentStock}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge
                        className="text-[10px] border-0 font-medium"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </Badge>
                    </td>
                    {isOwner && (
                      <td className="px-4 py-2.5 text-right text-muted-foreground hidden lg:table-cell">
                        ₹{item.stockValue.toLocaleString("en-IN")}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isOwner ? 7 : 6} className="px-4 py-12 text-center text-muted-foreground">
                    No products match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selectedProduct} onOpenChange={open => !open && setSelectedProduct(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedProd && selectedInv && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedProd.emoji}</span>
                  {selectedProd.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Stock</p>
                    <p className="text-xl font-bold mt-0.5">{selectedInv.currentStock}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge
                      className="text-[10px] border-0 font-medium mt-1"
                      style={{
                        backgroundColor: STOCK_STATUS_CONFIG[getStockStatus(selectedInv.currentStock, selectedInv.reorderThreshold)].bg,
                        color: STOCK_STATUS_CONFIG[getStockStatus(selectedInv.currentStock, selectedInv.reorderThreshold)].color,
                      }}
                    >
                      {STOCK_STATUS_CONFIG[getStockStatus(selectedInv.currentStock, selectedInv.reorderThreshold)].label}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reorder At</p>
                    <p className="text-xl font-bold mt-0.5">{selectedInv.reorderThreshold}</p>
                  </div>
                  {isOwner && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stock Value</p>
                      <p className="text-xl font-bold mt-0.5">₹{(selectedInv.currentStock * selectedInv.costPrice).toLocaleString("en-IN")}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    📜 Stock Movement History
                  </h3>
                  {movements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No movements recorded</p>
                  ) : (
                    <div className="space-y-0">
                      {movements.map(m => {
                        const date = new Date(m.timestamp);
                        const isPositive = m.quantityChange > 0;
                        return (
                          <div key={m.id} className="flex items-start gap-3 py-2.5 border-b last:border-0">
                            <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <MovementIcon type={m.movementType} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium capitalize">{m.movementType}</p>
                                <span className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                                  {isPositive ? "+" : ""}{m.quantityChange}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {m.referenceId} · {m.performedBy}
                              </p>
                              {m.reason && <p className="text-xs text-amber-600 mt-0.5">Reason: {m.reason}</p>}
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at{" "}
                                {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
