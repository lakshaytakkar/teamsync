import { DollarSign, Users, TrendingUp, Target } from "lucide-react";

import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/hr/status-badge";
import { leads, salesReps, revenueByMonth } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const formatShortCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return formatCurrency(value);
};

export default function SalesDashboard() {
  const loading = useSimulatedLoading();

  const totalRevenue = salesReps.reduce((s, r) => s + r.revenue, 0);
  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.stage)).length;
  const avgConversion = Math.round(salesReps.reduce((s, r) => s + r.conversionRate, 0) / salesReps.length);
  const pipelineValue = leads.filter((l) => !["won", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const sortedReps = [...salesReps].sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = Math.max(...revenueByMonth.map((m) => Math.max(m.revenue, m.target)));

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <Stagger staggerInterval={0.05} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatsCard
                title="Total Revenue"
                value={formatShortCurrency(totalRevenue)}
                change="+12% from last quarter"
                changeType="positive"
                icon={<DollarSign className="size-5" />}
                sparkline={{ values: revenueByMonth.map((m) => m.revenue), color: "#10b981" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Leads"
                value={activeLeads}
                change={`${leads.length} total leads`}
                changeType="neutral"
                icon={<Users className="size-5" />}
                sparkline={{ values: [8, 10, 9, 11, 10, 12], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Conversion Rate"
                value={`${avgConversion}%`}
                change="+3% improvement"
                changeType="positive"
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: [22, 25, 24, 28, 27, 29], color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Pipeline Value"
                value={formatShortCurrency(pipelineValue)}
                change={`${activeLeads} active deals`}
                changeType="neutral"
                icon={<Target className="size-5" />}
                sparkline={{ values: [3.2, 3.8, 4.1, 4.5, 4.9, 5.2], color: "#3b82f6" }}
              />
            </StaggerItem>
          </Stagger>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
            <div className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.15} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background" data-testid="section-revenue-trend">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue vs target</p>
              </div>
              <div className="p-5">
                <svg viewBox="0 0 400 200" className="w-full h-auto" data-testid="chart-revenue">
                  {revenueByMonth.map((m, i) => {
                    const barWidth = 30;
                    const gap = (400 - revenueByMonth.length * barWidth * 2) / (revenueByMonth.length + 1);
                    const x = gap + i * (barWidth * 2 + gap);
                    const revenueHeight = (m.revenue / maxRevenue) * 150;
                    const targetHeight = (m.target / maxRevenue) * 150;
                    return (
                      <g key={m.month}>
                        <rect
                          x={x}
                          y={170 - targetHeight}
                          width={barWidth}
                          height={targetHeight}
                          rx={3}
                          className="fill-muted"
                          data-testid={`bar-target-${m.month}`}
                        />
                        <rect
                          x={x + barWidth + 2}
                          y={170 - revenueHeight}
                          width={barWidth}
                          height={revenueHeight}
                          rx={3}
                          className="fill-primary"
                          opacity={0.85}
                          data-testid={`bar-revenue-${m.month}`}
                        />
                        <text
                          x={x + barWidth}
                          y={190}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {m.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground">Target</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background" data-testid="section-top-performers">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Top Performers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Sales team leaderboard</p>
              </div>
              <div className="divide-y">
                {sortedReps.map((rep) => {
                  const progress = Math.round((rep.revenue / rep.target) * 100);
                  return (
                    <div
                      key={rep.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                      data-testid={`card-rep-${rep.id}`}
                    >
                      <img
                        src={getPersonAvatar(rep.name, 32)}
                        alt={rep.name}
                        className="size-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rep.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rep.closedDeals} deals &middot; {rep.conversionRate}% conv.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatShortCurrency(rep.revenue)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}

        {loading ? (
          <div className="mt-6 rounded-lg border bg-background p-5">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ) : (
          <Fade direction="up" delay={0.25} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-recent-leads">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Recent Leads</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest opportunities added</p>
              </div>
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/30"
                    data-testid={`card-lead-${lead.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getPersonAvatar(lead.name, 32)}
                        alt={lead.name}
                        className="size-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" data-testid={`text-lead-value-${lead.id}`}>
                        {formatCurrency(lead.value)}
                      </span>
                      <StatusBadge status={lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
