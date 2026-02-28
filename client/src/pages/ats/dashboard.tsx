import { useLocation } from "wouter";
import { Briefcase, Users, CalendarCheck, FileSignature } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { jobOpenings, candidates, interviews, offers } from "@/lib/mock-data-ats";

const BRAND_COLOR = "#8B5CF6";

const funnelStages = [
  { label: "Applied", count: 25, color: "bg-slate-400" },
  { label: "Screening", count: 14, color: "bg-sky-400" },
  { label: "Interview", count: 8, color: "bg-violet-400" },
  { label: "Evaluation", count: 5, color: "bg-amber-400" },
  { label: "Offer", count: 3, color: "bg-orange-400" },
  { label: "Hired", count: 1, color: "bg-emerald-500" },
];

const stageColors: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  screening: "bg-sky-100 text-sky-700",
  interview: "bg-violet-100 text-violet-700",
  evaluation: "bg-amber-100 text-amber-700",
  offer: "bg-orange-100 text-orange-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AtsDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  const openJobs = jobOpenings.filter(j => j.status === "active").length;
  const interviewsThisWeek = interviews.filter(i => i.scheduledDate >= "2026-02-28" && i.scheduledDate <= "2026-03-06").length;
  const offersExtended = offers.filter(o => o.status === "sent" || o.status === "accepted").length;

  const activeJobs = jobOpenings.filter(j => j.status === "active").slice(0, 5);
  const latestCandidates = [...candidates].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).slice(0, 5);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-6"><div className="h-64 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{ background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #a78bfa 60%, #c4b5fd 100%)` }}
        >
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">ATS · Recruitment</p>
            <h1 className="text-3xl font-bold text-white mb-2">Recruitment Dashboard</h1>
            <p className="text-white/70 text-sm max-w-lg">
              <span className="text-white font-semibold">{interviewsThisWeek} interviews</span> scheduled this week and <span className="text-white font-semibold">{offersExtended} offers</span> awaiting response.
            </p>
          </div>
          <div className="absolute right-8 top-6 opacity-10"><Briefcase className="size-32" color="white" /></div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Positions", value: openJobs, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Total Candidates", value: candidates.length, icon: Users, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Interviews This Week", value: interviewsThisWeek, icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Offers Extended", value: offersExtended, icon: FileSignature, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}><stat.icon className={`size-5 ${stat.color}`} /></div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Fade>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Recruitment Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {funnelStages.map((stage, idx) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 text-right">{stage.label}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                    style={{ width: `${(stage.count / funnelStages[0].count) * 100}%` }}
                  >
                    <span className="text-white text-[10px] font-bold">{stage.count}</span>
                  </div>
                </div>
                {idx > 0 && (
                  <span className="text-xs text-muted-foreground w-10 shrink-0">
                    {Math.round((stage.count / funnelStages[idx - 1].count) * 100)}%
                  </span>
                )}
                {idx === 0 && <span className="w-10" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </Fade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Job Openings</CardTitle>
              <button onClick={() => setLocation("/ats/jobs")} className="text-xs text-violet-600 hover:underline">View all</button>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0" data-testid={`job-item-${job.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.department} · {job.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{job.filled}/{job.openings} filled</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${job.priority === "high" ? "bg-red-100 text-red-700" : job.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{job.priority}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Latest Candidates</CardTitle>
              <button onClick={() => setLocation("/ats/candidates")} className="text-xs text-violet-600 hover:underline">View all</button>
            </CardHeader>
            <CardContent className="space-y-2">
              {latestCandidates.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-1.5 border-b last:border-0 cursor-pointer hover:bg-muted/30 rounded-lg px-1 -mx-1 transition-colors" onClick={() => setLocation(`/ats/candidates/${c.id}`)} data-testid={`candidate-item-${c.id}`}>
                  <Avatar className="size-7">
                    <AvatarImage src={getPersonAvatar(c.name, 28)} alt={c.name} />
                    <AvatarFallback className="text-[9px]">{c.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.currentRole} · {c.currentCompany}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${stageColors[c.stage]}`}>{c.stage}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>
    </PageTransition>
  );
}
