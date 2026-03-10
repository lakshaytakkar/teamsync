import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Store, MapPin, User, Ruler, Package, CalendarDays,
  CheckCircle2, Circle, IndianRupee, Megaphone,
  ListChecks, FileText, Award, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/animated";
import { cn } from "@/lib/utils";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DESCRIPTIONS,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";
import { ETS_PIPELINE_STAGES, type EtsPipelineStage } from "@/lib/mock-data-ets";

const STAGE_INDEX: Record<EtsPipelineStage, number> = {
  "new-lead": 0,
  "qualified": 1,
  "token-paid": 2,
  "store-design": 3,
  "inventory-ordered": 4,
  "in-transit": 5,
  "launched": 6,
  "reordering": 7,
};

const tierColors: Record<string, { bg: string; text: string; label: string }> = {
  lite: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", label: "Lite" },
  pro: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Pro" },
  elite: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Elite" },
};

function formatINR(val: number) {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

export default function EtsPortalStorePage() {
  const qc = useQueryClient();
  const clientId = portalEtsClient.id;

  const { data: clientData, isLoading: clientLoading } = useQuery<{ client: any }>({
    queryKey: ["/api/ets-portal/client", clientId],
  });

  const { data: checklistData, isLoading: checklistLoading } = useQuery<{ checklist: any[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "checklist"],
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: any[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "payments"],
  });

  const { data: proposalData } = useQuery<{ template: any }>({
    queryKey: ["/api/ets-portal/client", clientId, "proposal"],
  });

  const toggleChecklist = useMutation({
    mutationFn: async ({ statusId, completed }: { statusId: number; completed: boolean }) => {
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/checklist/${statusId}`, { completed });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId, "checklist"] });
    },
  });

  const client = clientData?.client;
  const checklist = checklistData?.checklist || [];
  const payments = paymentsData?.payments || [];
  const proposal = proposalData?.template;

  const currentStageIdx = client ? STAGE_INDEX[client.stage as EtsPipelineStage] ?? 0 : 0;

  const checklistCompleted = checklist.filter((c: any) => c.completed).length;
  const checklistTotal = checklist.length;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const totalPaid = client?.totalPaid || 0;
  const pendingDues = client?.pendingDues || 0;
  const totalInvestment = totalPaid + pendingDues;
  const paidPercent = totalInvestment > 0 ? Math.round((totalPaid / totalInvestment) * 100) : 0;

  const paymentsByType = useMemo(() => {
    const groups: Record<string, { total: number; received: number; pending: number; overdue: number }> = {};
    payments.forEach((p: any) => {
      if (!groups[p.type]) groups[p.type] = { total: 0, received: 0, pending: 0, overdue: 0 };
      groups[p.type].total += p.amount;
      if (p.status === "received") groups[p.type].received += p.amount;
      else if (p.status === "overdue") groups[p.type].overdue += p.amount;
      else groups[p.type].pending += p.amount;
    });
    return groups;
  }, [payments]);

  if (clientLoading) {
    return (
      <div className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const tier = tierColors[client?.packageTier] || tierColors.lite;

  return (
    <PageTransition className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap" data-testid="store-header">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="text-store-title">My Store</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your franchise journey and store details</p>
        </div>
        <Badge className={cn("text-xs", tier.bg, tier.text, "border-0")} data-testid="badge-package-tier">
          {tier.label} Package
        </Badge>
      </div>

      <Card data-testid="card-store-profile">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${ETS_PORTAL_COLOR}15`, color: ETS_PORTAL_COLOR }}
            >
              <Store className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold" data-testid="text-store-client-name">{client?.name}</h2>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <InfoChip icon={MapPin} label="City" value={client?.city || "—"} testId="chip-city" />
                <InfoChip icon={Ruler} label="Store Size" value={client?.storeSize ? `${client.storeSize} sqft` : "—"} testId="chip-store-size" />
                <InfoChip icon={Package} label="Package" value={tier.label} testId="chip-package" />
                <InfoChip icon={User} label="Account Manager" value={client?.assignedTo || "—"} testId="chip-assigned-to" />
                <InfoChip icon={Megaphone} label="Lead Source" value={client?.leadSource || "—"} testId="chip-lead-source" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-journey-stepper">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Franchise Journey</h3>
            <Badge variant="outline" className="ml-auto text-[10px]" data-testid="badge-current-stage">
              {ETS_STAGE_DISPLAY_LABELS[client?.stage] || client?.stage}
            </Badge>
          </div>

          <div className="relative" data-testid="journey-stepper">
            <div className="hidden md:block absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <div
              className="hidden md:block absolute top-4 left-4 h-0.5 transition-all duration-700"
              style={{
                backgroundColor: ETS_PORTAL_COLOR,
                width: `${(currentStageIdx / (ETS_PIPELINE_STAGES.length - 1)) * 100}%`,
                maxWidth: "calc(100% - 2rem)",
              }}
            />

            <Stagger className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-y-6 gap-x-2">
              {ETS_PIPELINE_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const isFuture = idx > currentStageIdx;

                return (
                  <StaggerItem key={stage} className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isCompleted && "border-transparent",
                        isCurrent && "border-transparent ring-2 ring-offset-2 ring-offset-background",
                        isFuture && "border-border bg-background"
                      )}
                      style={{
                        backgroundColor: isCompleted || isCurrent ? ETS_PORTAL_COLOR : undefined,
                        color: isCompleted || isCurrent ? "#fff" : undefined,
                        ringColor: isCurrent ? ETS_PORTAL_COLOR : undefined,
                        ...(isCurrent ? { "--tw-ring-color": ETS_PORTAL_COLOR } as any : {}),
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className={cn(
                      "mt-2 text-[10px] sm:text-xs font-medium leading-tight",
                      isCurrent && "font-bold",
                      isFuture && "text-muted-foreground"
                    )} style={isCurrent ? { color: ETS_PORTAL_COLOR } : undefined}>
                      {ETS_STAGE_DISPLAY_LABELS[stage] || stage}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground max-w-[120px] leading-snug">
                        {ETS_STAGE_DESCRIPTIONS[stage]}
                      </p>
                    )}
                    {isCompleted && client?.createdDate && (
                      <p className="mt-1 text-[9px] text-muted-foreground">Completed</p>
                    )}
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-launch-checklist">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Launch Checklist</h3>
              </div>
              <span className="text-xs text-muted-foreground" data-testid="text-checklist-progress">
                {checklistCompleted}/{checklistTotal} completed
              </span>
            </div>

            <Progress
              value={checklistPercent}
              className="h-2 mb-4"
              data-testid="progress-checklist"
            />

            {checklistLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No checklist items available yet.</p>
            ) : (
              <div className="space-y-1" data-testid="checklist-items">
                {checklist
                  .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((item: any) => (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors",
                        item.completed
                          ? "bg-green-50/60 dark:bg-green-900/10"
                          : "hover:bg-muted/50"
                      )}
                      data-testid={`checklist-item-${item.id}`}
                    >
                      <Checkbox
                        checked={item.completed}
                        disabled={toggleChecklist.isPending}
                        onCheckedChange={(checked) => {
                          toggleChecklist.mutate({ statusId: item.id, completed: !!checked });
                        }}
                        data-testid={`checkbox-checklist-${item.id}`}
                        className={item.completed ? "border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : ""}
                      />
                      <span className={cn(
                        "text-sm",
                        item.completed && "line-through text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </label>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-financial-summary">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Financial Summary</h3>
            </div>

            <div className="flex items-end justify-between gap-2 mb-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold" style={{ color: ETS_PORTAL_COLOR }} data-testid="text-total-paid">
                  {formatINR(totalPaid)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Investment</p>
                <p className="text-sm font-semibold" data-testid="text-total-investment">{formatINR(totalInvestment)}</p>
              </div>
            </div>

            <Progress value={paidPercent} className="h-3 mb-1" data-testid="progress-financial" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{paidPercent}% paid</span>
              <span className="text-[10px] text-muted-foreground">Pending: {formatINR(pendingDues)}</span>
            </div>

            {paymentsLoading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : Object.keys(paymentsByType).length > 0 ? (
              <div className="mt-5 space-y-3" data-testid="payment-breakdown">
                {Object.entries(paymentsByType).map(([type, data]) => (
                  <div key={type} className="rounded-md border p-3" data-testid={`payment-type-${type}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-medium capitalize">{type} Payments</span>
                      <span className="text-xs text-muted-foreground">{formatINR(data.total)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] flex-wrap">
                      {data.received > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Received: {formatINR(data.received)}
                        </span>
                      )}
                      {data.pending > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending: {formatINR(data.pending)}
                        </span>
                      )}
                      {data.overdue > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Overdue: {formatINR(data.overdue)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground text-center py-2">No payment records yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {proposal && (
        <Card data-testid="card-package-details">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Package Details — {tier.label}</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <MiniStat label="Total Investment" value={`${formatINR(proposal.total_investment || proposal.totalInvestment || 0)}`} />
              <MiniStat label="SKU Count" value={proposal.sku_count || proposal.skuCount || "—"} />
              <MiniStat label="Store Size" value={`${proposal.store_size || proposal.storeSize || "—"} sqft`} />
              <MiniStat label="Package Tier" value={tier.label} />
            </div>

            {(proposal.inclusions || []).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">WHAT'S INCLUDED</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {(proposal.inclusions as string[]).map((inc: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm" data-testid={`inclusion-${idx}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: ETS_PORTAL_COLOR }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(proposal.exclusions || []).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">NOT INCLUDED</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {(proposal.exclusions as string[]).map((exc: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`exclusion-${idx}`}>
                      <Circle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(proposal.payment_schedule || proposal.paymentSchedule || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">PAYMENT SCHEDULE</p>
                <div className="space-y-2">
                  {(proposal.payment_schedule || proposal.paymentSchedule || []).map((ps: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-sm rounded-md border px-3 py-2" data-testid={`payment-schedule-${idx}`}>
                      <span>{ps.milestone}</span>
                      <Badge variant="outline" className="text-[10px]">{ps.percent}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}

function InfoChip({ icon: Icon, label, value, testId }: { icon: any; label: string; value: string; testId: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm" data-testid={testId}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="text-xs font-medium truncate leading-snug mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3" data-testid={`ministat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
