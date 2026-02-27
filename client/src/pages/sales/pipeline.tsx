import { PageBanner } from "@/components/hr/page-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { leads, pipelineStages } from "@/lib/mock-data-sales";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, PageTransition } from "@/components/ui/animated";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export default function PipelinePage() {
  const loading = useSimulatedLoading();

  const leadsByStage = pipelineStages.map((stage) => ({
    ...stage,
    leads: leads.filter((l) => l.stage === stage.id),
  }));

  return (
    <div className="px-8 py-6 lg:px-12">
      <PageTransition>
        <PageBanner
          title="Sales Pipeline"
          iconSrc="/3d-icons/departments.webp"
        />

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[260px] rounded-lg border bg-background p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-20 w-full rounded-md" />
                  <Skeleton className="h-20 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Fade direction="up" delay={0.1}>
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              data-testid="pipeline-board"
            >
              {leadsByStage.map((stage) => (
                <div
                  key={stage.id}
                  className="min-w-[260px] max-w-[280px] flex-1 rounded-lg border bg-background"
                  data-testid={`pipeline-column-${stage.id}`}
                >
                  <div
                    className="rounded-t-lg border-b px-4 py-3"
                    style={{ borderTopWidth: 3, borderTopColor: stage.color }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{stage.label}</h3>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {stage.leads.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    {stage.leads.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No leads</p>
                    ) : (
                      stage.leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="rounded-md border bg-background p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          data-testid={`pipeline-card-${lead.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                            </div>
                            <div className={`size-2 shrink-0 rounded-full mt-1.5 ${priorityColors[lead.priority]}`} />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-2.5">
                            <span className="text-xs font-semibold" data-testid={`text-pipeline-value-${lead.id}`}>
                              {formatCurrency(lead.value)}
                            </span>
                            <img
                              src={getPersonAvatar(lead.assignedTo, 20)}
                              alt={lead.assignedTo}
                              className="size-5 rounded-full"
                              title={lead.assignedTo}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        )}
      </PageTransition>
    </div>
  );
}
