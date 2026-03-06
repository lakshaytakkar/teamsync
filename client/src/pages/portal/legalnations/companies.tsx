import { useState } from "react";
import { CheckCircle2, Clock, Building2, MapPin, Package, Calendar, Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { portalCompanies, type PortalCompany } from "@/lib/mock-data-portal-legalnations";

function CompanyCard({ company }: { company: PortalCompany }) {
  const [expanded, setExpanded] = useState(false);
  const completedStages = company.stages.filter(s => s.status === "completed").length;
  const progress = Math.round((completedStages / company.stages.length) * 100);

  const statusStyle = company.status === "completed"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
    : company.status === "in-progress"
    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
    : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <Card className="overflow-hidden" data-testid={`company-${company.id}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-12 rounded-xl flex items-center justify-center",
              company.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100 dark:bg-blue-900/30"
            )}>
              <Building2 className={cn("size-6", company.status === "completed" ? "text-emerald-600" : "text-blue-600")} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{company.name}</h3>
              <p className="text-sm text-muted-foreground">{company.entityType}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusStyle}>
            {company.status === "completed" ? "Completed" : company.status === "in-progress" ? "In Progress" : "Pending"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>{company.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="size-3.5 text-muted-foreground" />
            <span>{company.package}</span>
          </div>
          {company.einNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="size-3.5 text-muted-foreground" />
              <span>EIN: {company.einNumber}</span>
            </div>
          )}
          {company.filedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Filed {new Date(company.filedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm font-semibold">{progress}%</span>
        </div>
        <p className="text-xs text-muted-foreground">{completedStages} of {company.stages.length} stages completed</p>

        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="mt-3 text-xs" data-testid={`toggle-stages-${company.id}`}>
          {expanded ? "Hide Stages" : "View All Stages"}
        </Button>
      </div>

      {expanded && (
        <>
          <Separator />
          <div className="p-6 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {company.stages.map((stage) => (
              <div key={stage.id} className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0",
                  stage.status === "completed" ? "bg-emerald-100" :
                  stage.status === "in-progress" ? "bg-blue-100 ring-2 ring-blue-400" :
                  "bg-slate-200"
                )}>
                  {stage.status === "completed" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : stage.status === "in-progress" ? (
                    <Clock className="size-3.5 text-blue-600 animate-pulse" />
                  ) : (
                    <span className="size-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    stage.status === "completed" ? "text-emerald-700" :
                    stage.status === "in-progress" ? "text-blue-700 font-semibold" :
                    "text-slate-400"
                  )}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                  {stage.completedAt && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(stage.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default function PortalCompanies() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">Track the formation and compliance status of your businesses</p>
      </div>

      <div className="space-y-6">
        {portalCompanies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
