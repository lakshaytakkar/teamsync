import { PageTransition, Fade } from "@/components/ui/animated";
import { useState, useMemo, Fragment } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { omsOrders } from "@/lib/mock-data-oms";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  picking: "bg-amber-100 text-amber-700",
  packed: "bg-cyan-100 text-cyan-700",
  dispatched: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  "on-hold": "bg-orange-100 text-orange-700",
};

const TYPE_COLORS: Record<string, string> = {
  b2b: "bg-blue-100 text-blue-700",
  b2c: "bg-emerald-100 text-emerald-700",
  dropship: "bg-violet-100 text-violet-700",
};

const CHANNEL_COLORS: Record<string, string> = {
  shopify: "bg-green-100 text-green-700",
  faire: "bg-teal-100 text-teal-700",
  manual: "bg-slate-100 text-slate-600",
  whatsapp: "bg-emerald-100 text-emerald-700",
  website: "bg-sky-100 text-sky-700",
};

const PAY_COLORS: Record<string, string> = {
  cod: "bg-orange-100 text-orange-700",
  prepaid: "bg-emerald-100 text-emerald-700",
  credit: "bg-blue-100 text-blue-700",
};

const STATUS_TIMELINE = ["pending", "confirmed", "picking", "packed", "dispatched", "delivered"];

export default function OmsOrders() {
  const loading = useSimulatedLoading(600);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...omsOrders].sort((a, b) => b.orderDate.localeCompare(a.orderDate));
    if (typeFilter !== "all") list = list.filter(o => o.type === typeFilter);
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (channelFilter !== "all") list = list.filter(o => o.channel === channelFilter);
    if (search) list = list.filter(o =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [typeFilter, statusFilter, channelFilter, search]);

  const totalValue = filtered.reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = filtered.filter(o => o.status === "pending").length;
  const dispatchedCount = filtered.filter(o => ["dispatched", "delivered"].includes(o.status)).length;

  if (loading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-12 w-64 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-xl" />
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" data-testid="orders-heading">Orders</h1>
                <span className="text-sm bg-cyan-100 text-cyan-700 font-semibold px-2.5 py-0.5 rounded-full">{omsOrders.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{omsOrders.length} orders across B2B, B2C and dropship channels</p>
            </div>
            <Button style={{ backgroundColor: "#0891B2" }} className="text-white hover:opacity-90" data-testid="btn-new-order">
              + New Order
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(["all", "b2b", "b2c", "dropship"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                data-testid={`filter-type-${t}`}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  typeFilter === t ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {t === "all" ? "All Types" : t.toUpperCase()}
              </button>
            ))}
            <div className="flex-1" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["pending","confirmed","picking","packed","dispatched","delivered","cancelled","on-hold"].map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-36 h-9" data-testid="select-channel">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {["shopify","faire","manual","whatsapp","website"].map(c => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8 h-9 w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-orders" />
            </div>
          </div>
        </Fade>

        <div className="border border-border rounded-xl overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-6 py-3 px-2" />
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Order #</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Channel</th>
                <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground">Items</th>
                <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <Fragment key={order.id}>
                  <tr
                    className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    data-testid={`row-order-${order.id}`}
                  >
                    <td className="py-3 px-2 text-center">
                      {expanded === order.id
                        ? <ChevronDown className="size-3.5 text-muted-foreground" />
                        : <ChevronRight className="size-3.5 text-muted-foreground" />}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-cyan-700">{order.orderNumber}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{order.orderDate}</td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-xs leading-tight">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{order.city}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase", TYPE_COLORS[order.type])}>{order.type}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", CHANNEL_COLORS[order.channel])}>{order.channel}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-medium">{order.lines.length}</td>
                    <td className="py-3 px-3 text-right font-semibold text-xs">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase", PAY_COLORS[order.paymentMode])}>{order.paymentMode}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[order.status])}>{order.status}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{order.assignedTo || "—"}</td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-muted/10">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">LINE ITEMS</p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left pb-1.5 font-medium text-muted-foreground">SKU</th>
                                  <th className="text-left pb-1.5 font-medium text-muted-foreground">Product</th>
                                  <th className="text-right pb-1.5 font-medium text-muted-foreground">Qty</th>
                                  <th className="text-right pb-1.5 font-medium text-muted-foreground">Unit Price</th>
                                  <th className="text-right pb-1.5 font-medium text-muted-foreground">Total</th>
                                  <th className="text-center pb-1.5 font-medium text-muted-foreground">Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.lines.map((line, idx) => (
                                  <tr key={idx} className="border-b border-border/30">
                                    <td className="py-1.5 font-mono text-[10px]">{line.sku}</td>
                                    <td className="py-1.5">{line.productName}</td>
                                    <td className="py-1.5 text-right">{line.qty}</td>
                                    <td className="py-1.5 text-right">₹{line.unitPrice}</td>
                                    <td className="py-1.5 text-right font-semibold">₹{line.lineTotal.toLocaleString()}</td>
                                    <td className="py-1.5 text-center">
                                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                                        line.fulfillmentType === "dropship" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700"
                                      )}>{line.fulfillmentType}</span>
                                    </td>
                                  </tr>
                                ))}
                                <tr className="font-semibold text-xs">
                                  <td colSpan={4} className="pt-2 text-right">Total</td>
                                  <td className="pt-2 text-right">₹{order.totalAmount.toLocaleString()}</td>
                                  <td />
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">SHIP TO</p>
                              <p className="text-xs leading-relaxed">{order.shippingAddress}, {order.city}, {order.state} — {order.pincode}</p>
                              <p className="text-xs text-muted-foreground mt-1">{order.customerPhone}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5">PAYMENT</p>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase", PAY_COLORS[order.paymentMode])}>{order.paymentMode}</span>
                                <span className={cn("text-[10px] font-medium capitalize", order.paymentStatus === "paid" ? "text-emerald-600" : order.paymentStatus === "failed" ? "text-red-600" : "text-amber-600")}>{order.paymentStatus}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS TIMELINE</p>
                              <div className="flex items-center gap-1 flex-wrap">
                                {STATUS_TIMELINE.map((s, i) => {
                                  const idx = STATUS_TIMELINE.indexOf(order.status as string);
                                  const isPast = i <= idx;
                                  return (
                                    <div key={s} className="flex items-center gap-1">
                                      <div className={cn("w-2 h-2 rounded-full", isPast ? "bg-cyan-500" : "bg-muted-foreground/30")} />
                                      <span className={cn("text-[9px]", isPast ? "text-cyan-700 font-semibold" : "text-muted-foreground")}>{s}</span>
                                      {i < STATUS_TIMELINE.length - 1 && <span className="text-muted-foreground/30 text-[8px]">›</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {omsOrders.length} orders
            </p>
            <p className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">₹{totalValue.toLocaleString()}</span>
              {" · "}Pending: <span className="font-semibold text-amber-600">{pendingCount}</span>
              {" · "}Dispatched/Delivered: <span className="font-semibold text-emerald-600">{dispatchedCount}</span>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
