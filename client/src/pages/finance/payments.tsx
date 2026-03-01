import { useState } from "react";
import { RefreshCw, CheckCircle2, Clock, XCircle, Check } from "lucide-react";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, gatewayTransactions, type GatewayTransaction } from "@/lib/mock-data-finance";

const BRAND = "#B45309";

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id)!;
}

function fmtAmt(amount: number, currency: string) {
  const sym = currency === "USD" ? "$" : "₹";
  return `${sym}${amount.toLocaleString("en-IN")}`;
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

const STATUS_STYLES: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  captured: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  paid: { cls: "bg-sky-100 text-sky-700", icon: CheckCircle2 },
  failed: { cls: "bg-red-100 text-red-700", icon: XCircle },
  pending: { cls: "bg-amber-100 text-amber-700", icon: Clock },
};

const TYPE_STYLES: Record<string, string> = {
  payment: "bg-emerald-100 text-emerald-700",
  payout: "bg-sky-100 text-sky-700",
  refund: "bg-orange-100 text-orange-700",
  fee: "bg-slate-100 text-slate-600",
};

export default function FinancePayments() {
  const isLoading = useSimulatedLoading(600);
  const [gatewayFilter, setGatewayFilter] = useState<"all" | "razorpay" | "stripe">("all");
  const [showUnreconciled, setShowUnreconciled] = useState(false);

  const rzpTx = gatewayTransactions.filter(t => t.gateway === "razorpay");
  const stripeTx = gatewayTransactions.filter(t => t.gateway === "stripe");

  const rzpTotal = rzpTx.filter(t => t.status === "captured" || t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const stripeTotal = stripeTx.filter(t => t.status === "captured" || t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const rzpPending = rzpTx.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const stripePending = stripeTx.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);

  const filtered = gatewayTransactions.filter(t => {
    if (gatewayFilter !== "all" && t.gateway !== gatewayFilter) return false;
    if (showUnreconciled && t.reconciledToLedger) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const reconciled = filtered.filter(t => t.reconciledToLedger).length;
  const unreconciled = filtered.filter(t => !t.reconciledToLedger).length;

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-5 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 bg-muted rounded-xl" />
          <div className="h-36 bg-muted rounded-xl" />
        </div>
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Gateways</h1>
            <p className="text-sm text-muted-foreground">Razorpay (INR) + Stripe (USD) transaction log & reconciliation</p>
          </div>
          <Button style={{ backgroundColor: BRAND }} className="text-white" data-testid="btn-sync">
            <RefreshCw className="h-4 w-4 mr-1" />Sync Now
          </Button>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StaggerItem>
          <Card className="border-orange-200" data-testid="card-razorpay">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">R</div>
                  <CardTitle className="text-base text-orange-700">Razorpay</CardTitle>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200" variant="outline">INR</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground">Total Captured</p><p className="text-xl font-bold text-orange-700">{fmtINR(rzpTotal)}</p></div>
                <div><p className="text-xs text-muted-foreground">Pending Payouts</p><p className="text-xl font-bold text-amber-600">{fmtINR(rzpPending)}</p></div>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                {[{ id: "startupsquad" }, { id: "lumbee" }].map(({ id }) => {
                  const co = getCompany(id);
                  const coTx = rzpTx.filter(t => t.companyId === id);
                  const total = coTx.filter(t => t.status !== "failed").reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span>
                      <span className="font-medium">{fmtINR(total)}</span>
                    </div>
                  );
                })}
                <p className="text-muted-foreground/60 text-xs mt-1">Last sync: Today, 11:30 AM</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-violet-200" data-testid="card-stripe">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <CardTitle className="text-base text-violet-700">Stripe</CardTitle>
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200" variant="outline">USD</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground">Total Captured</p><p className="text-xl font-bold text-violet-700">${stripeTotal.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Pending Payouts</p><p className="text-xl font-bold text-amber-600">${stripePending.toLocaleString()}</p></div>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                {[{ id: "neom" }, { id: "cloudnest" }].map(({ id }) => {
                  const co = getCompany(id);
                  const coTx = stripeTx.filter(t => t.companyId === id);
                  const total = coTx.filter(t => t.status !== "failed").reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${co.badgeBg} ${co.badgeText}`}>{co.shortName}</span>
                      <span className="font-medium">${total.toLocaleString()}</span>
                    </div>
                  );
                })}
                <p className="text-muted-foreground/60 text-xs mt-1">Last sync: Today, 11:30 AM</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>

      <Fade>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1">
            {[{ id: "all", label: "All" }, { id: "razorpay", label: "Razorpay" }, { id: "stripe", label: "Stripe" }].map(g => (
              <button
                key={g.id}
                onClick={() => setGatewayFilter(g.id as "all" | "razorpay" | "stripe")}
                data-testid={`pill-gateway-${g.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${gatewayFilter === g.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
                style={gatewayFilter === g.id ? { backgroundColor: BRAND } : undefined}
              >{g.label}</button>
            ))}
          </div>
          <button
            onClick={() => setShowUnreconciled(v => !v)}
            data-testid="toggle-unreconciled"
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${showUnreconciled ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground"}`}
            style={showUnreconciled ? { backgroundColor: BRAND } : undefined}
          >Unreconciled only</button>
        </div>
      </Fade>

      <Fade>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Gateway</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Transaction ID</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Order Ref</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Type</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Entity</th>
                  <th className="px-4 py-2 text-muted-foreground font-medium">Rec.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const company = getCompany(tx.companyId);
                  const StatusIcon = STATUS_STYLES[tx.status]?.icon ?? Clock;
                  return (
                    <tr key={tx.id} data-testid={`gw-tx-${tx.id}`} className={`border-b last:border-0 hover:bg-muted/20 ${!tx.reconciledToLedger ? "bg-yellow-50" : ""}`}>
                      <td className="px-4 py-2.5">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${tx.gateway === "razorpay" ? "bg-orange-100 text-orange-700" : "bg-violet-100 text-violet-700"}`}>
                          {tx.gateway === "razorpay" ? "RZP" : "STRP"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{tx.transactionId.substring(0, 20)}…</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tx.date}</td>
                      <td className="px-4 py-2.5 max-w-32 truncate">{tx.customerName}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground/70">{tx.orderId}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{fmtAmt(tx.amount, tx.currency)}</td>
                      <td className="px-4 py-2.5"><span className={`px-1.5 py-0.5 rounded font-semibold ${TYPE_STYLES[tx.type]}`}>{tx.type}</span></td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold w-fit ${STATUS_STYLES[tx.status]?.cls}`}>
                          <StatusIcon className="h-3 w-3" />{tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {tx.reconciledToLedger
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                          : <button className="text-amber-600 hover:text-amber-800" title="Mark Reconciled" data-testid={`btn-reconcile-${tx.id}`}><Check className="h-3.5 w-3.5" /></button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{reconciled} of {filtered.length} reconciled</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${filtered.length ? (reconciled / filtered.length) * 100 : 0}%` }} />
              </div>
              {unreconciled > 0 && <span className="text-amber-700 font-semibold">{unreconciled} need attention</span>}
            </div>
          </div>
        </Card>
      </Fade>
    </PageTransition>
  );
}
