import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserPlus, CheckCircle2, TrendingUp,
  ArrowRight, Globe, Instagram, Linkedin, MessageCircle,
  Phone, Mail, MapPin, BarChart3,
} from "lucide-react";
import {
  supransLeads, supransServices, VERTICAL_SERVICE_MAP,
  type SupransLead,
} from "@/lib/mock-data-suprans";
import { formatDistanceToNow } from "date-fns";

const BRAND = "#3730A3";

const SOURCE_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  referral: Users,
  instagram: Instagram,
  linkedin: Linkedin,
  "google-ads": BarChart3,
  "walk-in": MapPin,
  whatsapp: MessageCircle,
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  validated: "bg-sky-100 text-sky-700",
  enriched: "bg-amber-100 text-amber-700",
  assigned: "bg-purple-100 text-purple-700",
  converted: "bg-emerald-100 text-emerald-700",
  dropped: "bg-red-100 text-red-700",
};

const newToday = supransLeads.filter(l => {
  const d = new Date(l.createdAt);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
}).length;

const assignedLeads = supransLeads.filter(l => l.status === "assigned" || l.status === "converted");
const convertedLeads = supransLeads.filter(l => l.status === "converted");
const conversionRate = Math.round((convertedLeads.length / supransLeads.length) * 100);

const verticalBreakdown = [
  { name: "LegalNations", id: "hr", color: "#225AEA", leads: supransLeads.filter(l => l.service === "company-formation").length, assigned: supransLeads.filter(l => l.assignedVertical === "hr").length, converted: supransLeads.filter(l => l.assignedVertical === "hr" && l.status === "converted").length },
  { name: "GoyoTours", id: "events", color: "#E91E63", leads: supransLeads.filter(l => l.service === "tour-booking").length, assigned: supransLeads.filter(l => l.assignedVertical === "events").length, converted: supransLeads.filter(l => l.assignedVertical === "events" && l.status === "converted").length },
  { name: "USDrop AI", id: "sales", color: "#F34147", leads: supransLeads.filter(l => l.service === "ecommerce-setup").length, assigned: supransLeads.filter(l => l.assignedVertical === "sales").length, converted: supransLeads.filter(l => l.assignedVertical === "sales" && l.status === "converted").length },
  { name: "EventHub", id: "eventhub", color: "#7C3AED", leads: supransLeads.filter(l => l.service === "event-management").length, assigned: supransLeads.filter(l => l.assignedVertical === "eventhub").length, converted: supransLeads.filter(l => l.assignedVertical === "eventhub" && l.status === "converted").length },
  { name: "HRMS", id: "hrms", color: "#0EA5E9", leads: supransLeads.filter(l => l.service === "hr-consulting").length, assigned: supransLeads.filter(l => l.assignedVertical === "hrms").length, converted: supransLeads.filter(l => l.assignedVertical === "hrms" && l.status === "converted").length },
  { name: "EazyToSell", id: "ets", color: "#F97316", leads: supransLeads.filter(l => l.service === "franchise").length, assigned: supransLeads.filter(l => l.assignedVertical === "ets").length, converted: supransLeads.filter(l => l.assignedVertical === "ets" && l.status === "converted").length },
];

const recentLeads = [...supransLeads]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 8);

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

export default function SupransDashboard() {
  const [, setLocation] = useLocation();

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Suprans Command Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Lead intelligence and routing for all business verticals</p>
      </div>

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: supransLeads.length, icon: Users, color: "bg-indigo-50", iconColor: "text-indigo-600" },
          { label: "New Today", value: newToday, icon: UserPlus, color: "bg-sky-50", iconColor: "text-sky-600" },
          { label: "Assigned", value: assignedLeads.length, icon: CheckCircle2, color: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "bg-amber-50", iconColor: "text-amber-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Vertical Breakdown</h2>
            <p className="text-xs text-muted-foreground">Lead distribution across business verticals</p>
          </div>
          <div className="divide-y">
            {verticalBreakdown.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-sm font-medium">{v.name}</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span><span className="text-foreground font-medium">{v.leads}</span> leads</span>
                  <span><span className="text-foreground font-medium">{v.assigned}</span> assigned</span>
                  <span><span className="text-emerald-600 font-medium">{v.converted}</span> converted</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Recent Leads</h2>
              <p className="text-xs text-muted-foreground">Last 8 leads received</p>
            </div>
            <button
              onClick={() => setLocation("/suprans/inbound")}
              className="text-xs flex items-center gap-1 font-medium"
              style={{ color: BRAND }}
              data-testid="link-view-all-inbound"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => {
              const SrcIcon = SOURCE_ICONS[lead.source] || Globe;
              return (
                <div key={lead.id} className="p-3 flex items-center justify-between gap-3" data-testid={`row-lead-${lead.id}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{SERVICE_LABELS[lead.service]}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SrcIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </span>
                    {(lead.status === "new" || lead.status === "validated") && (
                      <button
                        onClick={() => setLocation(lead.status === "new" ? "/suprans/inbound" : "/suprans/enrichment")}
                        className="text-xs px-2 py-0.5 rounded text-white font-medium"
                        style={{ backgroundColor: BRAND }}
                        data-testid={`button-quick-assign-${lead.id}`}
                      >
                        {lead.status === "new" ? "Validate" : "Enrich"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
