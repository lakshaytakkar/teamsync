import { DollarSign, TrendingUp, Target, Award } from "lucide-react";
import { PageBanner } from "@/components/hr/page-banner";
import { StatsCard } from "@/components/hr/stats-card";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { salesReps, leads, revenueByMonth } from "@/lib/mock-data-sales";
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

export default function PerformancePage() {
  const loading = useSimulatedLoading();

  const totalRevenue = salesReps.reduce((s, r) => s + r.revenue, 0);
  const totalDeals = salesReps.reduce((s, r) => s + r.closedDeals, 0);
  const avgConversion = Math.round(salesReps.reduce((s, r) => s + r.conversionRate, 0) / salesReps.length);
  const activePipeline = leads.filter((l) => !["won", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  const sortedReps = [...salesReps].sort((a, b) => b.revenue - a.revenue);

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return "bg-emerald-500";
    if (pct >= 70) return "bg-blue-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner
          title="Team Performance"
          iconSrc="/3d-icons/employees.webp"
        />

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
                title="Closed Deals"
                value={totalDeals}
                change={`${salesReps.length} active reps`}
                changeType="neutral"
                icon={<Award className="size-5" />}
                sparkline={{ values: [8, 10, 12, 11, 14, 15], color: "#6366f1" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Avg Conversion"
                value={`${avgConversion}%`}
                change="+3% improvement"
                changeType="positive"
                icon={<TrendingUp className="size-5" />}
                sparkline={{ values: [22, 25, 24, 28, 27, 29], color: "#f59e0b" }}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Active Pipeline"
                value={formatShortCurrency(activePipeline)}
                change={`${leads.filter((l) => !["won", "lost"].includes(l.stage)).length} active deals`}
                changeType="neutral"
                icon={<Target className="size-5" />}
                sparkline={{ values: [3.2, 3.8, 4.1, 4.5, 4.9, 5.2], color: "#3b82f6" }}
              />
            </StaggerItem>
          </Stagger>
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
          <Fade direction="up" delay={0.15} className="mt-6">
            <div className="rounded-lg border bg-background" data-testid="section-leaderboard">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold font-heading">Sales Leaderboard</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by revenue performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-leaderboard">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">Rank</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deals Closed</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversion</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[200px]">Progress to Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReps.map((rep, index) => {
                      const progress = Math.round((rep.revenue / rep.target) * 100);
                      return (
                        <tr
                          key={rep.id}
                          className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                          data-testid={`row-leaderboard-${rep.id}`}
                        >
                          <td className="px-5 py-3">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <img src={getPersonAvatar(rep.name, 32)} alt={rep.name} className="size-8 rounded-full" />
                              <div>
                                <p className="text-sm font-medium">{rep.name}</p>
                                <p className="text-xs text-muted-foreground">{rep.leadsAssigned} leads assigned</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-medium">{rep.closedDeals}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm font-semibold" data-testid={`text-revenue-${rep.id}`}>
                              {formatCurrency(rep.revenue)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm">{rep.conversionRate}%</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground w-10 text-right">{progress}%</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatShortCurrency(rep.revenue)} / {formatShortCurrency(rep.target)}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
