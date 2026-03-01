import { PageTransition, Fade } from "@/components/ui/animated";
import { useState, useMemo, Fragment } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { omsReturns } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-slate-100 text-slate-700",
  picked_up: "bg-blue-100 text-blue-700",
  received: "bg-cyan-100 text-cyan-700",
  "qc-pass": "bg-emerald-100 text-emerald-700",
  "qc-fail": "bg-red-100 text-red-700",
  restocked: "bg-teal-100 text-teal-700",
  refunded: "bg-violet-100 text-violet-700",
};

const RESOLUTION_STYLES: Record<string, string> = {
  refund: "bg-red-100 text-red-700",
  replacement: "bg-blue-100 text-blue-700",
  "restock-only": "bg-emerald-100 text-emerald-700",
};

function QcBadge({ status }: { status: string }) {
  if (status === "qc-pass" || status === "restocked") return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Pass</span>;
  if (status === "qc-fail") return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Fail</span>;
  if (["received", "picked_up", "requested"].includes(status)) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Pending</span>;
  if (status === "refunded") return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Done</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">—</span>;
}

export default function OmsReturns() {
  const loading = useSimulatedLoading(600);
  const [statusFilter, setStatusFilter] = useState("all");
  const [resolutionFilter, setResolutionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const summary = useMemo(() => ({
    requested: omsReturns.filter(r => r.status === "requested").length,
    pickedUp: omsReturns.filter(r => r.status === "picked_up").length,
    qcPending: omsReturns.filter(r => r.status === "received").length,
    resolved: omsReturns.filter(r => ["qc-pass", "qc-fail", "restocked", "refunded"].includes(r.status)).length,
  }), []);

  const filtered = useMemo(() => {
    let list = [...omsReturns].sort((a, b) => b.requestedDate.localeCompare(a.requestedDate));
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    if (resolutionFilter !== "all") list = list.filter(r => r.resolutionType === resolutionFilter);
    if (search) list = list.filter(r =>
      r.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [statusFilter, resolutionFilter, search]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-5">
        <Fade>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold" data-testid="returns-heading">Returns & RMA</h1>
            <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-log-return">
              + Log Return
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Requested", value: summary.requested, color: "text-slate-700", bg: "bg-slate-50" },
              { label: "Picked Up", value: summary.pickedUp, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "QC Pending", value: summary.qcPending, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Resolved", value: summary.resolved, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s, i) => (
              <div key={i} className={cn("rounded-xl p-3 text-center border border-border", s.bg)}>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(["all", "requested", "picked_up", "received", "qc-pass", "qc-fail", "restocked", "refunded"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                data-testid={`filter-return-${s}`}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {s === "all" ? "All" : s === "picked_up" ? "Picked Up" : s === "qc-pass" ? "QC Pass" : s === "qc-fail" ? "QC Fail" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
            <Select value={resolutionFilter} onValueChange={setResolutionFilter}>
              <SelectTrigger className="w-44 h-9" data-testid="select-resolution">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resolutions</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
                <SelectItem value="restock-only">Restock Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-44" placeholder="Search returns..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-returns" />
            </div>
          </div>
        </Fade>

        <div className="border border-border rounded-xl overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-6 py-3 px-2" />
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Return #</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Order #</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Reason</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Requested</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">QC</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Resolution</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Handled By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => (
                <Fragment key={ret.id}>
                  <tr
                    key={ret.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-muted/20 cursor-pointer",
                      ret.status === "qc-fail" && "bg-red-50"
                    )}
                    onClick={() => setExpanded(expanded === ret.id ? null : ret.id)}
                    data-testid={`row-return-${ret.id}`}
                  >
                    <td className="py-3 px-2 text-center">
                      {expanded === ret.id ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-cyan-700">{ret.returnNumber}</td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{ret.orderNumber}</td>
                    <td className="py-3 px-3 text-xs font-medium">{ret.customerName}</td>
                    <td className="py-3 px-3 text-right text-xs font-semibold">{ret.items.length}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground max-w-[140px] truncate">{ret.reason}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_STYLES[ret.status])}>
                        {ret.status === "picked_up" ? "Picked Up" : ret.status === "qc-pass" ? "QC Pass" : ret.status === "qc-fail" ? "QC Fail" : ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{ret.requestedDate}</td>
                    <td className="py-3 px-3 text-center"><QcBadge status={ret.status} /></td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", RESOLUTION_STYLES[ret.resolutionType])}>
                        {ret.resolutionType === "restock-only" ? "Restock" : ret.resolutionType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{ret.handledBy}</td>
                  </tr>
                  {expanded === ret.id && (
                    <tr key={`${ret.id}-detail`} className={cn("bg-muted/10", ret.status === "qc-fail" && "bg-red-50/40")}>
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">RETURNED ITEMS</p>
                            <div className="space-y-2">
                              {ret.items.map((item, idx) => (
                                <div key={idx} className="border border-border rounded-lg p-2.5">
                                  <p className="font-mono text-[10px] text-muted-foreground">{item.sku}</p>
                                  <p className="text-xs font-medium">{item.productName}</p>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-xs text-muted-foreground">Qty: {item.qty}</span>
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.condition}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">QC NOTES</p>
                            <div className="border border-border rounded-lg p-3 min-h-[60px]">
                              {ret.qcNotes ? (
                                <p className="text-xs leading-relaxed">{ret.qcNotes}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">QC not yet performed</p>
                              )}
                            </div>
                            {ret.status === "qc-fail" && (
                              <div className="mt-2 p-2 bg-red-100 rounded-lg">
                                <p className="text-xs text-red-700 font-medium">⚠ Write-off required — units cannot be restocked</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">RESOLUTION</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{ret.resolutionType}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Handled By</span><span className="font-medium">{ret.handledBy}</span></div>
                              {ret.pickedDate && <div className="flex justify-between"><span className="text-muted-foreground">Picked Up</span><span className="font-medium">{ret.pickedDate}</span></div>}
                              {ret.receivedDate && <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span className="font-medium">{ret.receivedDate}</span></div>}
                            </div>
                            {ret.status === "qc-pass" && (
                              <Button className="mt-3 w-full text-xs" style={{ backgroundColor: "#059669" }} data-testid={`btn-restock-${ret.id}`}>
                                Restock to Inventory
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">Showing {filtered.length} of {omsReturns.length} returns</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
