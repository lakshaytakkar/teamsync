import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  FileText, Package, TrendingUp, DollarSign, ArrowRight,
  Star, MapPin, Mail, Phone, Clock, CheckCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Fade } from "@/components/ui/animated";
import { faireQuotations } from "@/lib/mock-data-faire-ops";

const BRAND_COLOR = "#7C3AED";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: "Draft",          color: "#6B7280", bg: "#F9FAFB" },
  SENT:           { label: "Open Request",   color: "#2563EB", bg: "#EFF6FF" },
  QUOTE_RECEIVED: { label: "Quote Sent",     color: "#D97706", bg: "#FFFBEB" },
  ACCEPTED:       { label: "Accepted",       color: "#059669", bg: "#ECFDF5" },
  CHALLENGED:     { label: "Challenged",     color: "#EA580C", bg: "#FFF7ED" },
  SENT_ELSEWHERE: { label: "Sent Elsewhere", color: "#64748B", bg: "#F1F5F9" },
};

const FULFILLER_ID_TO_NAME: Record<string, string> = {
  "fulf-001": "ShipFast Logistics",
  "fulf-002": "GlobalPack Co",
  "fulf-003": "QuickFulfill EU",
  "fulf-004": "AsiaDirect Supply",
};

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, onClick }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string; iconColor: string; onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon className="h-5 w-5" style={{ color: iconColor } as React.CSSProperties} />
      </div>
      <div>
        <div className="text-2xl font-bold font-heading">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery<{ vendors: any[] }>({
    queryKey: ["/api/faire/vendors"],
  });
  const allVendors: any[] = vendorsData?.vendors ?? [];

  useEffect(() => {
    if (allVendors.length > 0 && !selectedVendorId) {
      const stored = localStorage.getItem("vp_vendor_id");
      const match = allVendors.find(v => v.id === stored);
      setSelectedVendorId(match ? stored! : allVendors[0].id);
    }
  }, [allVendors, selectedVendorId]);

  const vendor = allVendors.find(v => v.id === selectedVendorId) ?? null;
  const vendorName = vendor?.name ?? "";

  const vendorFulfillerKey = Object.entries(FULFILLER_ID_TO_NAME).find(([, n]) => n === vendorName)?.[0] ?? "";

  const myQuotations = faireQuotations.filter(q => q.fulfiller_id === vendorFulfillerKey);
  const openRequests = myQuotations.filter(q => q.status === "SENT").length;
  const submittedQuotes = myQuotations.filter(q => ["QUOTE_RECEIVED", "ACCEPTED"].includes(q.status)).length;
  const acceptedOrders = myQuotations.filter(q => q.status === "ACCEPTED").length;

  const { data: txData } = useQuery<{ transactions: any[]; total: number }>({
    queryKey: ["/api/bank-transactions", { source: "faire_payout", type: "debit" }],
    queryFn: () => fetch("/api/bank-transactions?source=faire_payout&type=debit&limit=100").then(r => r.json()),
    enabled: !!vendor,
  });
  const payments = txData?.transactions ?? [];
  const totalReceived = payments
    .filter(t => t.description?.toLowerCase().includes(vendorName.toLowerCase().split(" ")[0]))
    .reduce((s: number, t: any) => s + (t.amount_usd ?? t.amount), 0);

  function handleVendorChange(id: string) {
    setSelectedVendorId(id);
    localStorage.setItem("vp_vendor_id", id);
  }

  const recentActivity = [...myQuotations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="py-8 px-6 max-w-screen-xl mx-auto space-y-6">
      <Fade>
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Vendor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your quotes, orders, and payments in one place</p>
          </div>
          <div className="w-72">
            <Select value={selectedVendorId} onValueChange={handleVendorChange}>
              <SelectTrigger className="h-10" data-testid="select-vendor-identity">
                <SelectValue placeholder={vendorsLoading ? "Loading vendors…" : "Select your company…"} />
              </SelectTrigger>
              <SelectContent>
                {allVendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fade>

      {vendor && (
        <Fade>
          {/* Vendor identity card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-5 flex-wrap">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ background: BRAND_COLOR }}
              >
                {vendor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold font-heading">{vendor.name}</span>
                  {vendor.is_default && (
                    <Badge style={{ background: "#ECFDF5", color: "#059669" }} className="border-0">Default Fulfiller</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{vendor.country ?? "—"}</span>
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{vendor.email}</span>
                  {vendor.whatsapp && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{vendor.whatsapp}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Avg lead: {vendor.avg_lead_days ?? 10} days</span>
                </div>
                {Array.isArray(vendor.specialties) && vendor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {vendor.specialties.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3.5 w-3.5" fill={i <= Math.round(vendor.rating ?? 4.5) ? "#F59E0B" : "none"} stroke={i <= Math.round(vendor.rating ?? 4.5) ? "#F59E0B" : "#D1D5DB"} />
                  ))}
                  <span className="text-sm font-semibold ml-1">{vendor.rating ?? 4.5}</span>
                </div>
                <div className="text-sm text-muted-foreground">{vendor.completed_orders ?? 0} completed orders</div>
              </div>
            </div>
          </div>
        </Fade>
      )}

      {/* Stats */}
      <Fade>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Open Requests"
            value={String(openRequests)}
            sub="Awaiting your quote"
            icon={FileText}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            onClick={() => setLocation("/vendor/quotations")}
          />
          <StatCard
            label="Quotes Submitted"
            value={String(submittedQuotes)}
            sub="Pending review"
            icon={TrendingUp}
            iconBg="#FFFBEB"
            iconColor="#D97706"
            onClick={() => setLocation("/vendor/quotations")}
          />
          <StatCard
            label="Active Orders"
            value={String(acceptedOrders)}
            sub="In pipeline"
            icon={Package}
            iconBg="#ECFDF5"
            iconColor="#059669"
            onClick={() => setLocation("/vendor/pipeline")}
          />
          <StatCard
            label="Payments Made"
            value={totalReceived > 0 ? `$${totalReceived.toLocaleString()}` : "—"}
            sub="Supplier disbursements"
            icon={DollarSign}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            onClick={() => setLocation("/vendor/ledger")}
          />
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b flex items-center justify-between">
              <span className="font-semibold text-base">Recent Quote Requests</span>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/vendor/quotations")} data-testid="button-view-all-quotations">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            <div className="divide-y">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No quote requests yet.</p>
                </div>
              ) : recentActivity.map(q => {
                const sc = STATUS_CONFIG[q.status] ?? STATUS_CONFIG["DRAFT"];
                return (
                  <div key={q.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold">{q.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {q.items.length} item{q.items.length !== 1 ? "s" : ""} · {new Date(q.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {q.status === "SENT" && (
                      <Button size="sm" style={{ background: BRAND_COLOR }} className="text-white shrink-0" onClick={() => setLocation("/vendor/quotations")} data-testid={`button-quote-${q.id}`}>
                        Submit Quote
                      </Button>
                    )}
                    {q.status === "ACCEPTED" && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                    {q.status === "CHALLENGED" && <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b">
              <span className="font-semibold text-base">Quick Actions</span>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={() => setLocation("/vendor/quotations")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-solid transition-all hover:bg-muted/30 text-left"
                data-testid="quick-action-quotations"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Submit Pricing</div>
                  <div className="text-xs text-muted-foreground">View & price open requests</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>

              <button
                onClick={() => setLocation("/vendor/pipeline")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-solid transition-all hover:bg-muted/30 text-left"
                data-testid="quick-action-pipeline"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Update Pipeline</div>
                  <div className="text-xs text-muted-foreground">Track & update active orders</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>

              <button
                onClick={() => setLocation("/vendor/ledger")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed hover:border-solid transition-all hover:bg-muted/30 text-left"
                data-testid="quick-action-ledger"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                  <DollarSign className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">View Ledger</div>
                  <div className="text-xs text-muted-foreground">Payments & financial history</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}
