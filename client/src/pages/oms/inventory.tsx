import { PageTransition, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Package, AlertTriangle, TrendingDown, ArrowUpCircle, Layers } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { omsInventory, omsLocations, omsProducts } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { badge: string; row: string }> = {
  critical: { badge: "bg-red-100 text-red-700", row: "bg-red-50/60" },
  low: { badge: "bg-amber-100 text-amber-700", row: "bg-amber-50/40" },
  ok: { badge: "bg-emerald-100 text-emerald-700", row: "" },
  overstock: { badge: "bg-blue-100 text-blue-700", row: "bg-blue-50/30" },
};

const CATEGORIES = ["Fashion", "Electronics", "Homeware", "Stationery", "Personal Care", "Food"];

export default function OmsInventory() {
  const loading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "location">("table");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...omsInventory];
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter(i => {
      const p = omsProducts.find(pr => pr.id === i.productId);
      return p?.category === categoryFilter;
    });
    if (locationFilter !== "all") list = list.filter(i => i.locationId === locationFilter);
    if (search) list = list.filter(i =>
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.productName.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [statusFilter, categoryFilter, locationFilter, search]);

  const summary = useMemo(() => ({
    total: omsInventory.length,
    units: omsInventory.reduce((s, i) => s + i.qtyOnHand, 0),
    critical: omsInventory.filter(i => i.status === "critical").length,
    low: omsInventory.filter(i => i.status === "low").length,
    overstock: omsInventory.filter(i => i.status === "overstock").length,
  }), []);

  const zones = useMemo(() => {
    const z: Record<string, typeof omsInventory> = {};
    for (const loc of omsLocations) {
      const inv = omsInventory.filter(i => i.locationId === loc.id);
      if (inv.length) z[loc.zone] = [...(z[loc.zone] || []), ...inv];
    }
    return z;
  }, []);

  if (loading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-14 w-72 bg-muted rounded-lg" />
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="px-16 py-6 lg:px-24 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" data-testid="inventory-heading">Inventory</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{omsInventory.length} SKUs · live stock levels and reorder alerts</p>
            </div>
            <Button variant="outline" data-testid="btn-stock-adjustment">Stock Adjustment</Button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Total SKUs", value: summary.total, icon: Package, bg: "bg-cyan-50", color: "text-cyan-600", valueColor: "" },
              { label: "Total Units", value: summary.units.toLocaleString(), icon: Layers, bg: "bg-blue-50", color: "text-blue-600", valueColor: "" },
              { label: "Critical", value: summary.critical, icon: AlertTriangle, bg: "bg-red-50", color: "text-red-600", valueColor: "text-red-600" },
              { label: "Low Stock", value: summary.low, icon: TrendingDown, bg: "bg-amber-50", color: "text-amber-600", valueColor: "text-amber-600" },
              { label: "Overstock", value: summary.overstock, icon: ArrowUpCircle, bg: "bg-violet-50", color: "text-violet-600", valueColor: "text-blue-600" },
            ].map((s, i) => (
              <div key={i} className="border border-border rounded-xl p-4 bg-background">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                  <s.icon className={cn("size-4", s.color)} />
                </div>
                <p className={cn("text-2xl font-bold", s.valueColor)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(["all", "critical", "low", "ok", "overstock"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                data-testid={`filter-inv-${s}`}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  statusFilter === s ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 h-9" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-44 h-9" data-testid="select-location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {omsLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-44" placeholder="Search SKU..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-inventory" />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setViewMode("table")} data-testid="btn-view-table" className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "table" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground hover:bg-muted")}>Table</button>
              <button onClick={() => setViewMode("location")} data-testid="btn-view-location" className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "location" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground hover:bg-muted")}>By Location</button>
            </div>
          </div>
        </Fade>

        {viewMode === "table" ? (
          <div className="border border-border rounded-xl overflow-hidden bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">On Hand</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Reserved</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Available</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Reorder Pt.</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Updated</th>
                  <th className="py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className={cn("border-b border-border/50", STATUS_STYLES[inv.status].row)} data-testid={`row-inv-${inv.id}`}>
                    <td className="py-2.5 px-4 font-mono text-xs">{inv.sku}</td>
                    <td className="py-2.5 px-4 text-xs max-w-[180px] truncate">{inv.productName}</td>
                    <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{inv.locationCode}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-xs">{inv.qtyOnHand}</td>
                    <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">{inv.qtyReserved}</td>
                    <td className="py-2.5 px-4 text-right text-xs font-medium">{inv.qtyAvailable}</td>
                    <td className="py-2.5 px-4 text-right text-xs text-muted-foreground">{inv.reorderPoint}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize", STATUS_STYLES[inv.status].badge)}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{inv.lastUpdated}</td>
                    <td className="py-2.5 px-3">
                      <Button variant="outline" className="h-6 text-[10px] px-2" data-testid={`btn-reorder-${inv.id}`}>Reorder</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(zones).map(([zone, items]) => (
              <div key={zone} className="border border-border rounded-xl overflow-hidden bg-background">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/20"
                  onClick={() => setExpandedZone(expandedZone === zone ? null : zone)}
                  data-testid={`zone-${zone}`}
                >
                  <div className="flex items-center gap-3">
                    {expandedZone === zone ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    <span className="font-semibold text-sm">{zone}</span>
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{items.length} SKUs</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{items.reduce((s, i) => s + i.qtyOnHand, 0)} total units</span>
                </button>
                {expandedZone === zone && (
                  <table className="w-full text-sm border-t border-border">
                    <thead>
                      <tr className="bg-muted/20 border-b border-border">
                        <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">SKU</th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Bin/Shelf</th>
                        <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">On Hand</th>
                        <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Available</th>
                        <th className="text-center py-2 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(inv => (
                        <tr key={inv.id} className={cn("border-b border-border/40", STATUS_STYLES[inv.status].row)}>
                          <td className="py-2 px-4 font-mono text-xs">{inv.sku}</td>
                          <td className="py-2 px-4 text-xs">{inv.productName}</td>
                          <td className="py-2 px-4 text-xs font-mono text-muted-foreground">{inv.locationCode}</td>
                          <td className="py-2 px-4 text-right font-semibold text-xs">{inv.qtyOnHand}</td>
                          <td className="py-2 px-4 text-right text-xs">{inv.qtyAvailable}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize", STATUS_STYLES[inv.status].badge)}>{inv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
