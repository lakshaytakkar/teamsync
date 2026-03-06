import {
  CheckCircle2, Clock, AlertCircle, ArrowRight, Calendar,
  Shield, FileText, DollarSign, MessageSquare, Building2,
} from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  portalClient, portalCompanies, portalActivity, upcomingDeadlines,
  portalMessages, portalDocuments, portalInvoices,
} from "@/lib/mock-data-portal-legalnations";

const stageIcons: Record<string, string> = {
  check: "CheckCircle2",
  file: "FileText",
  dollar: "DollarSign",
  shield: "Shield",
};

function StageIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "check": return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "file": return <FileText className="size-4 text-blue-500" />;
    case "dollar": return <DollarSign className="size-4 text-green-500" />;
    case "shield": return <Shield className="size-4 text-purple-500" />;
    default: return <Clock className="size-4 text-slate-400" />;
  }
}

function priorityColor(p: string) {
  if (p === "high") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (p === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

export default function PortalDashboard() {
  const activeCompany = portalCompanies.find(c => c.status === "in-progress");
  const completedStages = activeCompany?.stages.filter(s => s.status === "completed").length ?? 0;
  const totalStages = activeCompany?.stages.length ?? 1;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  const unreadMessages = portalMessages.filter(m => !m.read).length;
  const pendingInvoices = portalInvoices.filter(i => i.status === "pending" || i.status === "overdue").length;
  const actionDocs = portalDocuments.filter(d => d.status === "pending-review" || d.status === "action-required").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 lg:p-8 text-white" data-testid="portal-welcome-banner">
        <p className="text-blue-200 text-sm">Welcome back,</p>
        <h1 className="text-2xl lg:text-3xl font-bold mt-1">{portalClient.name}</h1>
        <p className="text-blue-100 text-sm mt-2">Your company formations are on track. Here's your latest overview.</p>
        <div className="flex flex-wrap gap-6 mt-5">
          <div>
            <p className="text-2xl font-bold">{portalCompanies.length}</p>
            <p className="text-xs text-blue-200">Companies</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{portalDocuments.filter(d => d.status === "verified").length}</p>
            <p className="text-xs text-blue-200">Documents</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{unreadMessages}</p>
            <p className="text-xs text-blue-200">New Messages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Active Formations</p>
            <Building2 className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{portalCompanies.filter(c => c.status === "in-progress").length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Pending Invoices</p>
            <DollarSign className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{pendingInvoices}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Docs to Review</p>
            <FileText className="size-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{actionDocs}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Unread Messages</p>
            <MessageSquare className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold">{unreadMessages}</p>
        </Card>
      </div>

      {activeCompany && (
        <Card className="p-6" data-testid="portal-formation-progress">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">{activeCompany.name}</h2>
              <p className="text-sm text-muted-foreground">{activeCompany.entityType} · {activeCompany.state} · {activeCompany.package} Package</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
              In Progress
            </Badge>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-sm font-semibold text-blue-700">{progressPercent}%</span>
          </div>

          <div className="space-y-3">
            {activeCompany.stages.map((stage, i) => (
              <div key={stage.id} className="flex items-start gap-3" data-testid={`stage-${stage.id}`}>
                <div className={cn(
                  "mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0",
                  stage.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  stage.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400" :
                  "bg-slate-100 dark:bg-slate-800"
                )}>
                  {stage.status === "completed" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : stage.status === "in-progress" ? (
                    <Clock className="size-3.5 text-blue-600 animate-pulse" />
                  ) : (
                    <span className="size-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    stage.status === "completed" ? "text-emerald-700 dark:text-emerald-400" :
                    stage.status === "in-progress" ? "text-blue-700 dark:text-blue-400 font-semibold" :
                    "text-slate-400"
                  )}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  {stage.completedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Completed {new Date(stage.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5" data-testid="portal-recent-activity">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {portalActivity.slice(0, 5).map(act => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="mt-0.5 size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <StageIcon icon={act.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{act.title}</p>
                  <p className="text-xs text-muted-foreground">{act.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(act.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" data-testid="portal-deadlines">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Upcoming Deadlines</h3>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map(dl => (
              <div key={dl.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{dl.title}</p>
                  <p className="text-xs text-muted-foreground">{dl.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">
                    {new Date(dl.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <Badge className={cn("text-[10px] mt-1", priorityColor(dl.priority))}>
                    {dl.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/portal/legalnations/companies">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group" data-testid="link-companies">
            <Building2 className="size-5 text-blue-500 mb-3" />
            <h3 className="text-sm font-bold">My Companies</h3>
            <p className="text-xs text-muted-foreground mt-1">View all your companies and their formation status</p>
            <ArrowRight className="size-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>
        <Link href="/portal/legalnations/documents">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group" data-testid="link-documents">
            <FileText className="size-5 text-purple-500 mb-3" />
            <h3 className="text-sm font-bold">Documents</h3>
            <p className="text-xs text-muted-foreground mt-1">Access your formation documents and compliance files</p>
            <ArrowRight className="size-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>
        <Link href="/portal/legalnations/messages">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group" data-testid="link-messages">
            <MessageSquare className="size-5 text-emerald-500 mb-3" />
            <h3 className="text-sm font-bold">Messages</h3>
            <p className="text-xs text-muted-foreground mt-1">Chat with your formation specialist team</p>
            <ArrowRight className="size-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
