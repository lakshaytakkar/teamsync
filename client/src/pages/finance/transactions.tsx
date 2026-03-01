import { useState } from "react";
import { Plus, Search, List, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { ALL_FINANCE_COMPANIES, financeTransactions, type FinanceTransaction } from "@/lib/mock-data-finance";

const BRAND = "#B45309";

function fmtAmt(tx: FinanceTransaction) {
  const sym = tx.currency === "USD" ? "$" : "₹";
  const v = tx.amount >= 1000 && tx.currency === "INR" ? `${(tx.amount / 1000).toFixed(0)}K` : tx.amount.toLocaleString("en-IN");
  return `${sym}${v}`;
}

const GW_LABELS: Record<string, { label: string; cls: string }> = {
  razorpay: { label: "RZP", cls: "bg-orange-100 text-orange-700" },
  stripe: { label: "STRP", cls: "bg-violet-100 text-violet-700" },
  bank: { label: "BANK", cls: "bg-slate-100 text-slate-600" },
  cash: { label: "CASH", cls: "bg-emerald-100 text-emerald-700" },
};

function getCompany(id: string) {
  return ALL_FINANCE_COMPANIES.find(c => c.id === id);
}

function groupByDate(txs: FinanceTransaction[]) {
  const map: Record<string, FinanceTransaction[]> = {};
  txs.forEach(tx => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

function dayNet(txs: FinanceTransaction[]) {
  let inTotal = 0, outTotal = 0;
  txs.forEach(tx => {
    const inr = tx.currency === "USD" ? tx.amount * 83.2 : tx.amount;
    if (tx.type === "income" || tx.type === "cash-in") inTotal += inr;
    else if (tx.type === "expense" || tx.type === "cash-out") outTotal += inr;
  });
  return { inTotal, outTotal, net: inTotal - outTotal };
}

function fmtINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

export default function FinanceTransactions() {
  const isLoading = useSimulatedLoading(500);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list");

  const filtered = financeTransactions.filter(tx => {
    if (companyFilter !== "all" && tx.companyId !== companyFilter) return false;
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (gatewayFilter !== "all") {
      if (gatewayFilter === "none" && tx.gateway !== null) return false;
      if (gatewayFilter !== "none" && tx.gateway !== gatewayFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!tx.description.toLowerCase().includes(q) && !tx.reference.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalIn = filtered.filter(t => t.type === "income" || t.type === "cash-in").reduce((s, t) => s + (t.currency === "USD" ? t.amount * 83.2 : t.amount), 0);
  const totalOut = filtered.filter(t => t.type === "expense" || t.type === "cash-out").reduce((s, t) => s + (t.currency === "USD" ? t.amount * 83.2 : t.amount), 0);

  const TxRow = ({ tx }: { tx: FinanceTransaction }) => {
    const company = getCompany(tx.companyId);
    const isIncome = tx.type === "income" || tx.type === "cash-in";
    const gw = tx.gateway ? GW_LABELS[tx.gateway] : null;
    return (
      <tr key={tx.id} data-testid={`tx-row-${tx.id}`} className="border-b hover:bg-muted/20 last:border-0">
        <td className="px-4 py-2.5 text-xs text-muted-foreground">{tx.date}</td>
        <td className="px-4 py-2.5 max-w-xs">
          <p className="text-xs font-medium truncate">{tx.description}</p>
          <p className="text-xs text-muted-foreground/60">{tx.reference}</p>
        </td>
        <td className="px-4 py-2.5">
          {company && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>}
        </td>
        <td className="px-4 py-2.5">
          <Badge variant="outline" className="text-xs">{tx.category}</Badge>
        </td>
        <td className="px-4 py-2.5">
          {gw && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${gw.cls}`}>{gw.label}</span>}
        </td>
        <td className={`px-4 py-2.5 text-right text-xs font-semibold ${isIncome ? "text-emerald-700" : "text-red-600"}`}>
          {isIncome ? "+" : "-"}{fmtAmt(tx)}
        </td>
        <td className="px-4 py-2.5">
          {tx.reconciledStatus === "reconciled"
            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            : <Clock className="h-3.5 w-3.5 text-amber-400" />}
        </td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground">{tx.enteredBy.split(" ")[0]}</td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="h-10 bg-muted rounded" />
        {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} of {financeTransactions.length} entries</p>
          </div>
          <Button style={{ backgroundColor: BRAND }} className="text-white" data-testid="btn-new-entry">
            <Plus className="h-4 w-4 mr-1" />New Entry
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {[{ id: "all", label: "All" }, ...ALL_FINANCE_COMPANIES.map(c => ({ id: c.id, label: c.shortName }))].map(c => (
              <button
                key={c.id}
                onClick={() => setCompanyFilter(c.id)}
                data-testid={`pill-company-${c.id}`}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${companyFilter === c.id ? "text-white border-transparent" : "bg-background border-muted-foreground/20 text-muted-foreground hover:border-amber-400"}`}
                style={companyFilter === c.id ? { backgroundColor: BRAND, borderColor: BRAND } : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="select-type">
            <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="cash-in">Cash In</SelectItem>
              <SelectItem value="cash-out">Cash Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gatewayFilter} onValueChange={setGatewayFilter} data-testid="select-gateway">
            <SelectTrigger className="w-36"><SelectValue placeholder="Gateway" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input className="pl-8 h-8 w-48 text-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search" />
          </div>
          <div className="flex gap-1 ml-auto">
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} data-testid="btn-view-list"><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === "grouped" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grouped")} data-testid="btn-view-grouped"><CalendarDays className="h-4 w-4" /></Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <Card>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Entity</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Category</th>
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Gateway</th>
                    <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
                    <th className="px-4 py-2 text-muted-foreground font-medium">Rec.</th>
                    <th className="px-4 py-2 text-muted-foreground font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No transactions match your filters</td></tr>
                  )}
                  {filtered.map(tx => <TxRow key={tx.id} tx={tx} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y">
              {groupByDate(filtered).map(([date, txs]) => {
                const { inTotal, outTotal, net } = dayNet(txs);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                      <span className="text-xs font-semibold text-muted-foreground">{date}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-700 font-medium">In: {fmtINR(inTotal)}</span>
                        <span className="text-red-600 font-medium">Out: {fmtINR(outTotal)}</span>
                        <span className={`font-semibold ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}>Net: {fmtINR(Math.abs(net))}</span>
                      </div>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </Fade>

      <Fade>
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2">
          <span>Showing {filtered.length} of {financeTransactions.length} transactions</span>
          <div className="flex gap-6">
            <span className="text-emerald-700 font-medium">Total In: {fmtINR(totalIn)}</span>
            <span className="text-red-600 font-medium">Total Out: {fmtINR(totalOut)}</span>
            <span className={`font-semibold ${totalIn - totalOut >= 0 ? "text-emerald-700" : "text-red-600"}`}>Net: {fmtINR(Math.abs(totalIn - totalOut))}</span>
          </div>
        </div>
      </Fade>
    </PageTransition>
  );
}
