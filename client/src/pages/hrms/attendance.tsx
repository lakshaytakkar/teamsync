import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { attendanceRecords, employees } from "@/lib/mock-data-hrms";

const statusColor: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  "half-day": "bg-amber-100 text-amber-700",
  wfh: "bg-sky-100 text-sky-700",
};

const calendarStatusDot: Record<string, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  "half-day": "bg-amber-500",
  wfh: "bg-sky-500",
};

const todayRecords = attendanceRecords.filter((a) => a.date === "2026-02-28");
const presentToday = todayRecords.filter((a) => a.status === "present" || a.status === "wfh").length;
const absentToday = todayRecords.filter((a) => a.status === "absent").length;
const wfhToday = todayRecords.filter((a) => a.status === "wfh").length;
const onLeaveCount = 2;

const stats = [
  { label: "Present Today", value: presentToday, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { label: "Absent", value: absentToday, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
  { label: "Work From Home", value: wfhToday, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  { label: "On Leave", value: onLeaveCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const sampleDates = ["2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28"];

export default function HrmsAttendance() {
  const isLoading = useSimulatedLoading(700);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [empFilter, setEmpFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueEmps = [...new Set(attendanceRecords.map((a) => a.employeeName))];

  const filtered = attendanceRecords.filter((a) => {
    const matchEmp = empFilter === "all" || a.employeeName === empFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchEmp && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4"><div className="h-20 bg-muted rounded-xl" /><div className="h-20 bg-muted rounded-xl" /><div className="h-20 bg-muted rounded-xl" /><div className="h-20 bg-muted rounded-xl" /></div>
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance Log</h1>
            <p className="text-sm text-muted-foreground">Track daily attendance across the organization</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} data-testid="table-view-btn"><List className="size-4" /></Button>
            <Button variant={view === "calendar" ? "default" : "ghost"} size="sm" onClick={() => setView("calendar")} data-testid="calendar-view-btn"><LayoutGrid className="size-4" /></Button>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <Select value={empFilter} onValueChange={setEmpFilter}>
            <SelectTrigger className="w-48" data-testid="emp-filter"><SelectValue placeholder="All Employees" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {uniqueEmps.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="wfh">WFH</SelectItem>
              <SelectItem value="half-day">Half Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      {view === "table" ? (
        <Fade>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Employee</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Check In</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Check Out</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Hours</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((rec) => (
                    <tr key={rec.id} className="hover:bg-muted/20" data-testid={`attendance-row-${rec.id}`}>
                      <td className="px-4 py-2.5 text-sm font-medium">{rec.employeeName}</td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{rec.date}</td>
                      <td className="px-4 py-2.5 text-sm">{rec.checkIn}</td>
                      <td className="px-4 py-2.5 text-sm">{rec.checkOut}</td>
                      <td className="px-4 py-2.5 text-sm">{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : "-"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[rec.status]}`}>{rec.status}</span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No records found</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Fade>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Employee</th>
                    {weekDays.map((d, i) => (
                      <th key={d} className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">
                        <div>{d}</div>
                        <div className="text-[10px] font-normal text-muted-foreground/60">{sampleDates[i].slice(5)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uniqueEmps.slice(0, 8).map((empName) => (
                    <tr key={empName} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm font-medium">{empName}</td>
                      {sampleDates.map((date) => {
                        const rec = attendanceRecords.find((a) => a.employeeName === empName && a.date === date);
                        return (
                          <td key={date} className="px-4 py-3 text-center">
                            {rec ? (
                              <div className="flex justify-center">
                                <div className={`size-3 rounded-full ${calendarStatusDot[rec.status]}`} title={rec.status} />
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30">·</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-4 px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
                {Object.entries(calendarStatusDot).map(([s, c]) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`size-2.5 rounded-full ${c}`} />
                    <span className="capitalize">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Fade>
      )}
    </PageTransition>
  );
}
