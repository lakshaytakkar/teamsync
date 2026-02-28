import { useState } from "react";
import { useLocation } from "wouter";
import { Users, UserCheck, Clock, Briefcase, TrendingUp, CheckCircle2, AlertCircle, Gift } from "lucide-react";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import {
  employees,
  hrmsDepartments,
  leaveRequests,
  goals,
} from "@/lib/mock-data-hrms";

const BRAND_COLOR = "#0EA5E9";

export default function HrmsDashboard() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const onLeave = employees.filter((e) => e.status === "on-leave").length;
  const openPositions = 8;
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;

  const recentJoiners = [...employees]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  const upcomingBirthdays = [
    { name: "Karan Joshi", date: "Mar 3", dept: "Engineering" },
    { name: "Meera Pillai", date: "Mar 8", dept: "Operations" },
    { name: "Suresh Iyer", date: "Mar 15", dept: "Finance" },
  ];

  const stats = [
    { label: "Total Employees", value: employees.length, icon: Users, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
    { label: "Active Today", value: activeEmployees, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { label: "On Leave", value: onLeave, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
    { label: "Open Positions", value: openPositions, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  ];

  const maxHeadCount = Math.max(...hrmsDepartments.map((d) => d.headCount));

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-6 animate-pulse">
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <Fade>
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{ background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #38bdf8 60%, #7dd3fc 100%)` }}
        >
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">HRMS · People & Culture</p>
            <h1 className="text-3xl font-bold text-white mb-2">Good morning, Sneha 👋</h1>
            <p className="text-white/70 text-sm max-w-lg">
              You have <span className="text-white font-semibold">{pendingLeaves} leave requests</span> pending approval and <span className="text-white font-semibold">3 upcoming birthdays</span> this week.
            </p>
          </div>
          <div className="absolute right-8 top-6 opacity-10">
            <Users className="size-32" color="white" />
          </div>
        </div>
      </Fade>

      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-sky-500" />
                Department Headcount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hrmsDepartments.map((dept) => (
                <div key={dept.id} data-testid={`dept-bar-${dept.id}`}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.headCount} employees</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(dept.headCount / maxHeadCount) * 100}%`, background: dept.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="size-4 text-emerald-500" />
                Recent Joiners
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentJoiners.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 rounded-lg p-1.5 -mx-1.5 transition-colors"
                  onClick={() => setLocation(`/hrms/employees/${emp.id}`)}
                  data-testid={`recent-joiner-${emp.id}`}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={getPersonAvatar(emp.name, 32)} alt={emp.name} />
                    <AvatarFallback className="text-xs">{emp.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.designation} · {emp.department}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Gift className="size-4 text-pink-500" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingBirthdays.map((b, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarImage src={getPersonAvatar(b.name, 28)} alt={b.name} />
                      <AvatarFallback className="text-[10px]">{b.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.dept}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{b.date}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </Fade>

        <Fade>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" />
                Pending Leave Approvals
              </CardTitle>
              <Badge className="bg-amber-100 text-amber-700 border-0">{pendingLeaves} pending</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaveRequests.filter(l => l.status === "pending").slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{leave.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{leave.type} · {leave.days} day{leave.days > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700" data-testid={`approve-leave-${leave.id}`}>
                      <CheckCircle2 className="size-3 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => setLocation("/hrms/leaves")} data-testid="view-all-leaves">
                View all leave requests →
              </Button>
            </CardContent>
          </Card>
        </Fade>
      </div>
    </PageTransition>
  );
}
