import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import { Topbar } from "@/components/layout/topbar";
import { DataTable, type Column, type RowAction } from "@/components/hr/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { StatsCard } from "@/components/hr/stats-card";
import { StatusBadge } from "@/components/hr/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { useToast } from "@/hooks/use-toast";
import { getPersonAvatar } from "@/lib/avatars";
import { projects, projectTasks } from "@/lib/mock-data";
import type { ProjectTask } from "@shared/schema";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, ListTodo, CircleDot, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const KANBAN_COLUMNS: { status: ProjectTask["status"]; label: string; color: string }[] = [
  { status: "To Do", label: "To Do", color: "bg-slate-400" },
  { status: "In Progress", label: "In Progress", color: "bg-blue-500" },
  { status: "Review", label: "Review", color: "bg-amber-500" },
  { status: "Done", label: "Done", color: "bg-emerald-500" },
];

const priorityDot: Record<string, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-slate-400",
};

export default function ProjectDetail() {
  const loading = useSimulatedLoading();
  const [, params] = useRoute("/projects/:id");
  const { showSuccess } = useToast();
  const projectId = params?.id;

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const tasks = useMemo(() => projectTasks.filter((t) => t.projectId === projectId), [projectId]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const overdue = tasks.filter((t) => {
      if (t.status === "Done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    return { total, completed, inProgress, overdue };
  }, [tasks]);

  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Project Not Found" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-not-found">This project does not exist.</p>
            <Link href="/projects">
              <Button variant="outline" size="sm" data-testid="link-back-projects">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const columns: Column<ProjectTask>[] = [
    {
      key: "title",
      header: "Task",
      sortable: true,
      render: (item) => <span className="text-sm font-medium">{item.title}</span>,
    },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <img src={getPersonAvatar(item.assignee, 24)} alt="" className="size-6 rounded-full shrink-0" />
          <span className="text-sm">{item.assignee}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${priorityDot[item.priority]}`} />
          <span className="text-sm">{item.priority}</span>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.dueDate}</span>,
    },
  ];

  const rowActions: RowAction<ProjectTask>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        showSuccess("Task Details", `Viewing "${item.title}"`);
      },
    },
    {
      label: "Edit",
      onClick: (item) => {
        showSuccess("Edit Task", `Editing "${item.title}"`);
      },
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title={project.name} subtitle="Project Details" />
      <div className="flex-1 overflow-auto p-6">
        <PageTransition>
          <div className="mb-5">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="mb-3 -ml-2" data-testid="link-back-projects">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Projects
              </Button>
            </Link>

            <Fade direction="down" distance={10} duration={0.3}>
              <div className="rounded-xl bg-primary/90 px-5 py-4 mb-5" data-testid="project-detail-banner">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold font-heading text-white" data-testid="text-project-name">{project.name}</h2>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-white/75 max-w-2xl" data-testid="text-project-description">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-white/70 text-xs">
                        <Calendar className="size-3" />
                        <span>{project.startDate} - {project.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/70 text-xs">
                        <StatusBadge status={project.priority} />
                      </div>
                    </div>
                    <div className="mt-3 max-w-xs">
                      <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5 bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </div>

          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6" staggerInterval={0.06}>
            <StaggerItem>
              <StatsCard
                title="Total Tasks"
                value={stats.total}
                icon={<ListTodo className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Completed"
                value={stats.completed}
                icon={<CheckCircle2 className="size-5" />}
                change={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% done` : undefined}
                changeType="positive"
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="In Progress"
                value={stats.inProgress}
                icon={<Clock className="size-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <StatsCard
                title="Overdue"
                value={stats.overdue}
                icon={<AlertTriangle className="size-5" />}
                change={stats.overdue > 0 ? "Needs attention" : "On track"}
                changeType={stats.overdue > 0 ? "negative" : "positive"}
              />
            </StaggerItem>
          </Stagger>

          <Fade direction="up" distance={10} delay={0.2}>
            <Tabs defaultValue="kanban" data-testid="tabs-project-view">
              <TabsList data-testid="tabs-list-project-view">
                <TabsTrigger value="kanban" data-testid="tab-kanban">Kanban</TabsTrigger>
                <TabsTrigger value="table" data-testid="tab-table">Table</TabsTrigger>
              </TabsList>

              <TabsContent value="kanban">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-2" data-testid="kanban-board">
                  {KANBAN_COLUMNS.map((col) => {
                    const columnTasks = tasks.filter((t) => t.status === col.status);
                    return (
                      <div key={col.status} className="flex flex-col" data-testid={`kanban-column-${col.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span className={`size-2 rounded-full ${col.color}`} />
                          <span className="text-sm font-medium">{col.label}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{columnTasks.length}</span>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {columnTasks.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-4 text-center">
                              <p className="text-xs text-muted-foreground">No tasks</p>
                            </div>
                          ) : (
                            columnTasks.map((task) => (
                              <Card
                                key={task.id}
                                className="p-3.5 hover-elevate"
                                data-testid={`card-task-${task.id}`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm font-medium leading-snug" data-testid={`text-task-title-${task.id}`}>{task.title}</p>
                                  <span className={`size-2 rounded-full shrink-0 mt-1.5 ${priorityDot[task.priority]}`} title={task.priority} />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <img src={getPersonAvatar(task.assignee, 20)} alt="" className="size-5 rounded-full" />
                                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{task.dueDate}</span>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="table">
                {loading ? (
                  <TableSkeleton rows={6} columns={5} />
                ) : (
                  <DataTable
                    data={tasks}
                    columns={columns}
                    searchPlaceholder="Search tasks..."
                    rowActions={rowActions}
                    filters={[
                      { label: "Status", key: "status", options: ["To Do", "In Progress", "Review", "Done"] },
                      { label: "Priority", key: "priority", options: ["High", "Medium", "Low"] },
                    ]}
                    emptyTitle="No tasks found"
                    emptyDescription="This project has no tasks yet."
                  />
                )}
              </TabsContent>
            </Tabs>
          </Fade>
        </PageTransition>
      </div>
    </div>
  );
}
