import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, Building2, DollarSign, Kanban, Shield,
} from "lucide-react";

const COMPANIES_ALL = [
  { name: "TechVentures LLC", client: "Rajesh Kumar", state: "Delaware", stage: "EIN Application", stageNum: 4, package: "Premium", revenue: 1499, health: 78 },
  { name: "CloudBase Corp", client: "Rajesh Kumar", state: "Wyoming", stage: "Completed", stageNum: 7, package: "Standard", revenue: 799, health: 100 },
  { name: "GreenLeaf Organics LLC", client: "Amit Patel", state: "Delaware", stage: "Articles Filing", stageNum: 3, package: "Premium", revenue: 1499, health: 55 },
  { name: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "Nevada", stage: "KYC", stageNum: 2, package: "Basic", revenue: 399, health: 30 },
  { name: "DataBridge Analytics LLC", client: "Vikram Rao", state: "Wyoming", stage: "BOI Filing", stageNum: 5, package: "Standard", revenue: 799, health: 88 },
  { name: "UrbanNest Realty Corp", client: "Priya Singh", state: "Texas", stage: "Payment", stageNum: 1, package: "Premium", revenue: 1499, health: 12 },
  { name: "NovaTech AI Inc", client: "Deepak Verma", state: "Delaware", stage: "Banking Setup", stageNum: 6, package: "Standard", revenue: 799, health: 92 },
  { name: "MediCare Solutions LLC", client: "Sunita Agarwal", state: "Florida", stage: "Completed", stageNum: 7, package: "Premium", revenue: 1499, health: 100 },
];

const PIPELINE_COUNTS: Record<string, number> = {
  "Payment": 3, "KYC": 5, "Articles Filing": 4,
  "EIN Application": 6, "BOI Filing": 3, "Banking Setup": 2, "Completed": 12,
};

const TEAM = [
  { name: "Priya Sharma", role: "Formation Specialist", status: "Active", activeClients: 14 },
  { name: "Arjun Mehta", role: "Compliance Officer", status: "Active", activeClients: 11 },
  { name: "Neha Gupta", role: "Sales/BD", status: "Active", activeClients: 8 },
  { name: "Deepak Verma", role: "Tax Specialist", status: "Active", activeClients: 9 },
];

export default function LnAdminPortal() {
  const totalRevenue = COMPANIES_ALL.reduce((sum, c) => sum + c.revenue, 0);
  const completed = COMPANIES_ALL.filter(c => c.stageNum === 7).length;
  const inPipeline = COMPANIES_ALL.length - completed;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-admin-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-sm text-violet-200 mb-1">CEO Command Center</p>
          <h1 className="text-2xl font-bold font-heading" data-testid="text-ln-admin-title">LegalNations — Overview</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-violet-200">
            <span><strong className="text-white">{COMPANIES_ALL.length}</strong> Total Formations</span>
            <span><strong className="text-white">{completed}</strong> Completed</span>
            <span><strong className="text-white">${totalRevenue.toLocaleString()}</strong> Revenue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Formations", value: COMPANIES_ALL.length, icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Completed", value: completed, icon: Shield, color: "text-green-600", bg: "bg-green-50" },
          { label: "In Pipeline", value: inPipeline, icon: Kanban, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Formations</CardTitle>
              <Badge variant="outline" className="text-xs">{COMPANIES_ALL.length} companies</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {COMPANIES_ALL.map((co, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                data-testid={`admin-company-row-${idx}`}
              >
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                  {co.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{co.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={(co.stageNum / 7) * 100} className="h-1 w-20" />
                    <span className="text-xs text-muted-foreground">{co.state} · {co.client}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${co.stageNum === 7 ? "border-green-300 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}`}
                  >
                    {co.stage}
                  </Badge>
                  <p className="text-xs font-bold mt-0.5">${co.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {Object.entries(PIPELINE_COUNTS).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between" data-testid={`admin-pipeline-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="text-xs text-muted-foreground">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(count / 15) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {TEAM.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2.5" data-testid={`admin-team-${member.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 shrink-0">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{member.activeClients} active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnAdminPipeline() {
  const stages = Object.entries(PIPELINE_COUNTS);
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pipeline Overview</h1>
        <p className="text-sm text-muted-foreground">All client formations across every stage</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map(([stage, count]) => (
          <Card key={stage} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-violet-600" data-testid={`admin-pipeline-count-${stage}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{stage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">All Formations</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMPANIES_ALL.map((co, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/40" data-testid={`admin-pipeline-co-${idx}`}>
                <div>
                  <p className="text-sm font-medium">{co.name}</p>
                  <p className="text-xs text-muted-foreground">{co.client} · {co.state}</p>
                  <Progress value={(co.stageNum / 7) * 100} className="h-1 w-32 mt-1" />
                </div>
                <Badge variant="outline">{co.stage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LnAdminTeam() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Team Management</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {TEAM.map((member, idx) => (
          <Card key={idx} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-600">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <Badge className="mt-1 text-[10px]" variant="outline">{member.activeClients} active clients</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnAdminRevenue() {
  const monthlyRevenue = [
    { month: "Oct 2025", amount: 2298, formations: 3 },
    { month: "Nov 2025", amount: 1598, formations: 2 },
    { month: "Dec 2025", amount: 3497, formations: 4 },
    { month: "Jan 2026", amount: 2697, formations: 3 },
    { month: "Feb 2026", amount: 1898, formations: 2 },
    { month: "Mar 2026", amount: 2996, formations: 3 },
  ];
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Revenue Analytics</h1>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600" data-testid="stat-total-revenue">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Revenue (6 mo)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">17</p>
            <p className="text-xs text-muted-foreground mt-1">Total Formations</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">${Math.round(totalRevenue / 6).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Monthly</p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-sm">Monthly Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="flex items-center justify-between" data-testid={`revenue-${m.month.replace(/\s+/g, "-").toLowerCase()}`}>
              <div>
                <p className="text-sm font-medium">{m.month}</p>
                <p className="text-xs text-muted-foreground">{m.formations} formations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(m.amount / 4000) * 100}%` }} />
                </div>
                <span className="text-sm font-bold w-16 text-right">${m.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LnAdminSettings() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">System Settings</h1>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {["Package Pricing & Tiers", "Formation Stage Workflow", "Team Role Permissions", "Notification Rules", "Integration Configs (Mercury, Stripe)", "Compliance Calendar Templates", "Invoice Auto-Generation Rules"].map((setting) => (
            <div key={setting} className="flex items-center justify-between py-3 border-b last:border-0">
              <p className="text-sm font-medium">{setting}</p>
              <Button size="sm" variant="outline" data-testid={`setting-${setting.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>Configure</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
