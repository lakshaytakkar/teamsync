import { useState } from "react";
import { Building2, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Landmark, CreditCard, BarChart3 } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  ALL_FINANCE_COMPANIES, financeTransactions, interCompanyBalances, complianceFilings, exchangeRates,
  type FinanceCompany,
} from "@/lib/mock-data-finance";

const BRAND = "#B45309";
const CURRENT_RATE = exchangeRates[0].rate;

function toINR(amount: number, currency: "INR" | "USD") {
  return currency === "USD" ? amount * CURRENT_RATE : amount;
}

function fmtINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
}

function fmtNative(amount: number, currency: "INR" | "USD") {
  if (currency === "USD") return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return fmtINR(amount);
}

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date("2026-03-01");
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysPillClass(days: number) {
  if (days < 0) return "bg-red-100 text-red-700";
  if (days <= 7) return "bg-orange-100 text-orange-700";
  if (days <= 30) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

const getCompany = (id: string) => ALL_FINANCE_COMPANIES.find(c => c.id === id)!;

const txByCompany = (id: string) => financeTransactions.filter(t => t.companyId === id);
const income = (txs: typeof financeTransactions) => txs.filter(t => t.type === "income" || t.type === "cash-in").reduce((s, t) => s + toINR(t.amount, t.currency), 0);
const expense = (txs: typeof financeTransactions) => txs.filter(t => t.type === "expense" || t.type === "cash-out").reduce((s, t) => s + toINR(t.amount, t.currency), 0);

const complianceByCompany = (id: string) => {
  const items = complianceFilings.filter(f => f.companyId === id);
  const overdue = items.filter(f => f.status === "overdue").length;
  const pending = items.filter(f => f.status === "pending").length;
  if (overdue > 0) return "red";
  if (pending > 0) {
    const soonDue = items.filter(f => f.status === "pending" && daysUntil(f.dueDate) <= 14);
    return soonDue.length > 0 ? "amber" : "green";
  }
  return "green";
};

const totalCashINR = ALL_FINANCE_COMPANIES.reduce((s, c) => {
  const txs = txByCompany(c.id);
  return s + income(txs) - expense(txs);
}, 0);

const openIC = interCompanyBalances.filter(b => b.status !== "settled");
const totalICOutstanding = openIC.reduce((s, b) => s + b.inrEquivalent, 0);
const overdueCompliance = complianceFilings.filter(f => f.status === "overdue").length;
const allTx = financeTransactions;
const currentMonthTx = allTx.filter(t => t.date.startsWith("2026-02"));

const upcomingFilings = [...complianceFilings]
  .filter(f => f.status === "pending" || f.status === "overdue")
  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  .slice(0, 5);

const recentTx = [...financeTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

function CompanyHealthDot({ companyId }: { companyId: string }) {
  const color = complianceByCompany(companyId);
  const cls = color === "red" ? "bg-red-500" : color === "amber" ? "bg-amber-400" : "bg-emerald-500";
  const title = color === "red" ? "Overdue filing" : color === "amber" ? "Filing due soon" : "Compliant";
  return <span title={title} className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}

export default function FinanceDashboard() {
  const isLoading = useSimulatedLoading(700);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #92400E 0%, #B45309 60%, #D97706 100%)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="h-5 w-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Finance & Accounts</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Multi-Entity Finance Hub</h1>
            <p className="text-white/70 text-sm">
              4 entities · 2 countries · INR + USD · <strong className="text-white">GST + IRS Compliant</strong>
            </p>
            <div className="flex gap-6 mt-4 text-sm">
              <div><span className="opacity-70">Total Cash (INR Equiv)</span><div className="text-xl font-bold">{fmtINR(totalCashINR)}</div></div>
              <div><span className="opacity-70">IC Outstanding</span><div className="text-xl font-bold">{fmtINR(totalICOutstanding)}</div></div>
              <div><span className="opacity-70">Overdue Filings</span><div className="text-xl font-bold text-red-300">{overdueCompliance}</div></div>
            </div>
          </div>
          <div className="absolute right-8 top-8 opacity-10">
            <BarChart3 className="h-32 w-32" />
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_FINANCE_COMPANIES.map(company => {
          const txs = txByCompany(company.id);
          const inc = income(txs);
          const exp = expense(txs);
          const cashBalance = inc - exp;
          return (
            <StaggerItem key={company.id}>
              <Card data-testid={`card-company-${company.id}`} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                        <CompanyHealthDot companyId={company.id} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{company.jurisdiction}</p>
                    </div>
                    <span className="text-lg">{company.country === "IN" ? "🇮🇳" : "🇺🇸"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Net Cash (approx)</p>
                  <p className="text-xl font-bold" style={{ color: company.color }}>{fmtNative(cashBalance / (company.currency === "USD" ? CURRENT_RATE : 1), company.currency)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{company.type === "llc" ? "Multi-member LLC" : "Private Limited"}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Cash (INR)", value: fmtINR(totalCashINR), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Receivables", value: "₹3.45L", icon: ArrowUpRight, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Payables", value: "₹1.82L", icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50" },
          { label: "IC Outstanding", value: fmtINR(totalICOutstanding), icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Tx This Month", value: `${currentMonthTx.length}`, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Overdue Filings", value: `${overdueCompliance}`, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map(stat => (
          <StaggerItem key={stat.label}>
            <Card data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`} className="border">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Monthly P&L Snapshot – Feb 2026</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALL_FINANCE_COMPANIES.map(company => {
                const txs = financeTransactions.filter(t => t.companyId === company.id && t.date.startsWith("2026-02"));
                const inc = income(txs);
                const exp = expense(txs);
                const max = Math.max(inc, exp, 1);
                return (
                  <div key={company.id} data-testid={`pl-row-${company.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                      <span className="text-xs text-muted-foreground">Net: <span className={inc - exp >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{fmtINR(Math.abs(inc - exp))}</span></span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground w-8">In</span>
                          <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(inc / max) * 100}%` }} /></div>
                          <span className="text-xs font-medium text-emerald-700 w-14 text-right">{fmtINR(inc)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground w-8">Out</span>
                          <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-red-400 h-2 rounded-full" style={{ width: `${(exp / max) * 100}%` }} /></div>
                          <span className="text-xs font-medium text-red-600 w-14 text-right">{fmtINR(exp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Upcoming Compliance Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingFilings.map(f => {
                const company = getCompany(f.companyId);
                const days = daysUntil(f.dueDate);
                return (
                  <div key={f.id} data-testid={`compliance-row-${f.id}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.filingPeriod}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysPillClass(days)}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Inter-Company Open Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {openIC.slice(0, 6).map(b => {
                  const from = getCompany(b.fromCompany);
                  const to = getCompany(b.toCompany);
                  return (
                    <div key={b.id} data-testid={`ic-row-${b.id}`} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${from.badgeBg} ${from.badgeText}`}>{from.shortName}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded ${to.badgeBg} ${to.badgeText}`}>{to.shortName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{fmtINR(b.inrEquivalent)}</span>
                        <Badge variant="outline" className={`text-xs ${b.status === "open" ? "border-amber-300 text-amber-700" : "border-sky-300 text-sky-700"}`}>{b.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTx.slice(0, 8).map(tx => {
                const company = getCompany(tx.companyId);
                const isIncome = tx.type === "income" || tx.type === "cash-in";
                const gwColors: Record<string, string> = { razorpay: "bg-orange-100 text-orange-700", stripe: "bg-violet-100 text-violet-700", bank: "bg-slate-100 text-slate-600", cash: "bg-emerald-100 text-emerald-700" };
                return (
                  <div key={tx.id} data-testid={`recent-tx-${tx.id}`} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${company.badgeBg} ${company.badgeText}`}>{company.shortName}</span>
                      <p className="text-xs truncate text-muted-foreground">{tx.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {tx.gateway && <span className={`text-xs px-1.5 py-0.5 rounded ${gwColors[tx.gateway] || "bg-slate-100 text-slate-600"}`}>{tx.gateway === "razorpay" ? "RZP" : tx.gateway === "stripe" ? "STRP" : tx.gateway.toUpperCase()}</span>}
                      <span className={`text-xs font-semibold ${isIncome ? "text-emerald-700" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"}{tx.currency === "USD" ? `$${tx.amount}` : fmtINR(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Fade>
      </div>
    </PageTransition>
  );
}
