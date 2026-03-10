import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle2, Circle, FileText, Store, Package,
  Users, ShieldCheck, Megaphone, ListChecks,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/layout";
import { cn } from "@/lib/utils";
import { portalEtsClient, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";

interface ChecklistItem {
  id: number;
  itemId: number;
  clientId: number;
  completed: boolean;
  label: string;
  sortOrder: number;
}

const CATEGORY_DEFINITIONS = [
  { key: "documentation", label: "Documentation & Legal", icon: FileText, sortRange: [0, 4] },
  { key: "store-setup", label: "Store Setup", icon: Store, sortRange: [5, 9] },
  { key: "inventory", label: "Inventory & Products", icon: Package, sortRange: [10, 14] },
  { key: "team", label: "Team & Training", icon: Users, sortRange: [15, 19] },
  { key: "compliance", label: "Compliance & Approvals", icon: ShieldCheck, sortRange: [20, 24] },
  { key: "marketing", label: "Marketing & Launch", icon: Megaphone, sortRange: [25, 99] },
];

function categorizeItems(items: ChecklistItem[]) {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const perCategory = Math.max(1, Math.ceil(sorted.length / CATEGORY_DEFINITIONS.length));

  return CATEGORY_DEFINITIONS.map((cat, catIdx) => {
    const start = catIdx * perCategory;
    const end = start + perCategory;
    const categoryItems = sorted.slice(start, end);
    const completed = categoryItems.filter((i) => i.completed).length;

    return {
      ...cat,
      items: categoryItems,
      completed,
      total: categoryItems.length,
    };
  }).filter((cat) => cat.items.length > 0);
}

function progressColor(percent: number): string {
  if (percent >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function progressBadgeVariant(percent: number): { bg: string; text: string } {
  if (percent >= 75) return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" };
  if (percent >= 40) return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" };
  return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" };
}

export default function EtsPortalChecklistPage() {
  const qc = useQueryClient();
  const clientId = portalEtsClient.id;

  const { data: checklistData, isLoading } = useQuery<{ checklist: ChecklistItem[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "checklist"],
  });

  const toggleChecklist = useMutation({
    mutationFn: async ({ statusId, completed }: { statusId: number; completed: boolean }) => {
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/checklist/${statusId}`, { completed });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId, "checklist"] });
    },
  });

  const checklist = checklistData?.checklist || [];
  const totalCompleted = checklist.filter((c) => c.completed).length;
  const totalItems = checklist.length;
  const overallPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const categories = useMemo(() => categorizeItems(checklist), [checklist]);

  const badgeStyle = progressBadgeVariant(overallPercent);

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap" data-testid="checklist-header">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="text-checklist-title">
              Store Readiness Checklist
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete all items to get your store launch-ready
            </p>
          </div>
          <Badge
            className={cn("text-sm border-0", badgeStyle.bg, badgeStyle.text)}
            data-testid="badge-overall-progress"
          >
            {overallPercent}% Ready
          </Badge>
        </div>

        <Card data-testid="card-overall-progress">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Overall Progress</h3>
              </div>
              <span className="text-xs text-muted-foreground" data-testid="text-overall-count">
                {totalCompleted} of {totalItems} items completed
              </span>
            </div>
            <Progress value={overallPercent} className="h-3" data-testid="progress-overall" />
            <p className={cn("text-xs font-medium mt-2", progressColor(overallPercent))} data-testid="text-overall-percent">
              {overallPercent}% complete
            </p>
          </CardContent>
        </Card>

        {checklist.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground" data-testid="text-empty-checklist">
            No checklist items available yet. Your account manager will set these up soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="checklist-categories-grid">
            {categories.map((category) => {
              const catPercent = category.total > 0
                ? Math.round((category.completed / category.total) * 100)
                : 0;
              const CatIcon = category.icon;
              const isComplete = catPercent === 100;

              return (
                <Card key={category.key} data-testid={`card-category-${category.key}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md",
                            isComplete
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-muted"
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <CatIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold" data-testid={`text-category-name-${category.key}`}>
                            {category.label}
                          </h3>
                          <p className="text-[10px] text-muted-foreground" data-testid={`text-category-progress-${category.key}`}>
                            {category.completed}/{category.total} completed
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          isComplete && "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                        )}
                        data-testid={`badge-category-${category.key}`}
                      >
                        {catPercent}%
                      </Badge>
                    </div>

                    <Progress value={catPercent} className="h-1.5 mb-3" data-testid={`progress-category-${category.key}`} />

                    <div className="space-y-1" data-testid={`checklist-items-${category.key}`}>
                      {category.items.map((item) => (
                        <label
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors",
                            item.completed
                              ? "bg-green-50/60 dark:bg-green-900/10"
                              : "hover-elevate"
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
                          <span
                            className={cn(
                              "text-sm",
                              item.completed && "line-through text-muted-foreground"
                            )}
                            data-testid={`text-checklist-label-${item.id}`}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
