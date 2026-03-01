import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Button } from "@/components/ui/button";
import { omsSuppliers, omsPurchaseOrders } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  "partially-received": "bg-amber-100 text-amber-700",
  received: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn("size-3", i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function OmsSuppliers() {
  const loading = useSimulatedLoading(600);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const summary = useMemo(() => {
    const active = omsSuppliers.filter(s => s.isActive);
    const avgLead = Math.round(active.reduce((s, sup) => s + sup.leadTimeDays, 0) / active.length);
    const avgRating = (active.reduce((s, sup) => s + sup.rating, 0) / active.length).toFixed(1);
    const thisMonth = omsPurchaseOrders.filter(po => po.orderedDate.startsWith("2026-02")).length;
    return { active: active.length, avgLead, avgRating, thisMonth };
  }, []);

  const supplierPOs = useMemo(() => {
    if (!selectedSupplier) return [];
    return omsPurchaseOrders.filter(po => po.supplierId === selectedSupplier)
      .sort((a, b) => b.orderedDate.localeCompare(a.orderedDate));
  }, [selectedSupplier]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold" data-testid="suppliers-heading">Suppliers</h1>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={cn("px-3 py-1.5 text-xs font-medium", viewMode === "grid" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground")}>Grid</button>
                <button onClick={() => setViewMode("table")} className={cn("px-3 py-1.5 text-xs font-medium", viewMode === "table" ? "bg-cyan-600 text-white" : "bg-background text-muted-foreground")}>Table</button>
              </div>
              <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-add-supplier">
                + Add Supplier
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Suppliers", value: summary.active },
              { label: "Avg Lead Time", value: `${summary.avgLead} days` },
              { label: "Avg Rating", value: `${summary.avgRating} / 5` },
              { label: "POs This Month", value: summary.thisMonth },
            ].map((s, i) => (
              <div key={i} className="border border-border rounded-xl p-3 bg-background text-center">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Fade>

        {viewMode === "grid" ? (
          <Stagger>
            <div className="grid grid-cols-3 gap-4">
              {omsSuppliers.map(sup => {
                const poCount = omsPurchaseOrders.filter(po => po.supplierId === sup.id).length;
                const lastPO = omsPurchaseOrders.filter(po => po.supplierId === sup.id).sort((a, b) => b.orderedDate.localeCompare(a.orderedDate))[0];
                const isSelected = selectedSupplier === sup.id;
                return (
                  <StaggerItem key={sup.id}>
                    <div
                      className={cn("border border-border rounded-xl bg-background overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors", isSelected && "border-cyan-500 ring-1 ring-cyan-500")}
                      onClick={() => setSelectedSupplier(isSelected ? null : sup.id)}
                      data-testid={`card-supplier-${sup.id}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-sm leading-tight">{sup.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{sup.contactPerson}</p>
                          </div>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", sup.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                            {sup.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">{sup.city}</span>
                          <span className="text-xs text-muted-foreground">{sup.state}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {sup.categories.map(cat => (
                            <span key={cat} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{cat}</span>
                          ))}
                        </div>

                        <StarRating rating={sup.rating} />

                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium">{sup.phone}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Lead Time</span>
                            <span className="font-medium">{sup.leadTimeDays} days</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">GSTIN</span>
                            <span className="font-mono text-[10px]">****{sup.gstin.slice(-4)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Terms</span>
                            <span className="font-medium">{sup.paymentTerms}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total POs</span>
                            <span className="font-semibold text-cyan-700">{poCount}</span>
                          </div>
                        </div>

                        <button
                          className="mt-3 w-full text-xs text-center py-1.5 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-medium transition-colors"
                          data-testid={`btn-new-po-${sup.id}`}
                          onClick={e => e.stopPropagation()}
                        >
                          + New PO
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
          </Stagger>
        ) : (
          <Fade>
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">City</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Categories</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Lead Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Rating</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">POs</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {omsSuppliers.map(sup => {
                    const poCount = omsPurchaseOrders.filter(po => po.supplierId === sup.id).length;
                    const lastPO = omsPurchaseOrders.filter(po => po.supplierId === sup.id).sort((a, b) => b.orderedDate.localeCompare(a.orderedDate))[0];
                    return (
                      <tr key={sup.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedSupplier(selectedSupplier === sup.id ? null : sup.id)} data-testid={`row-supplier-${sup.id}`}>
                        <td className="py-2.5 px-4">
                          <p className="text-xs font-semibold">{sup.name}</p>
                          <p className="text-[10px] text-muted-foreground">{sup.email}</p>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">{sup.contactPerson}<br /><span className="text-[10px]">{sup.phone}</span></td>
                        <td className="py-2.5 px-4 text-xs">{sup.city}, {sup.state}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {sup.categories.map(c => <span key={c} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{c}</span>)}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs">{sup.leadTimeDays}d</td>
                        <td className="py-2.5 px-4"><StarRating rating={sup.rating} /></td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold text-cyan-700">{poCount}</td>
                        <td className="py-2.5 px-4">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", sup.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{sup.isActive ? "Active" : "Inactive"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Fade>
        )}

        {selectedSupplier && supplierPOs.length > 0 && (
          <Fade>
            <div className="border border-cyan-200 rounded-xl bg-cyan-50/30 overflow-hidden">
              <div className="p-4 border-b border-cyan-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cyan-800">
                  POs for {omsSuppliers.find(s => s.id === selectedSupplier)?.name}
                </h3>
                <span className="text-xs text-cyan-600">{supplierPOs.length} orders</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-200 bg-cyan-50/50">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">PO Number</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Ordered Date</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Expected</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Lines</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierPOs.map(po => (
                    <tr key={po.id} className="border-b border-cyan-100/50">
                      <td className="py-2 px-4 font-mono text-xs text-cyan-700">{po.poNumber}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">{po.orderedDate}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">{po.expectedDate}</td>
                      <td className="py-2 px-4 text-right text-xs">{po.lines.length}</td>
                      <td className="py-2 px-4 text-right font-semibold text-xs">₹{po.totalAmount.toLocaleString()}</td>
                      <td className="py-2 px-4">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_STYLES[po.status])}>{po.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Fade>
        )}
      </div>
    </PageTransition>
  );
}
