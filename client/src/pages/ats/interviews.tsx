import { useState } from "react";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { FormDialog } from "@/components/hr/form-dialog";
import { interviews, candidates, jobOpenings } from "@/lib/mock-data-ats";

const statusColors: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

const typeColors: Record<string, string> = {
  phone: "bg-slate-100 text-slate-700",
  video: "bg-sky-100 text-sky-700",
  onsite: "bg-emerald-100 text-emerald-700",
  technical: "bg-violet-100 text-violet-700",
  panel: "bg-amber-100 text-amber-700",
};

const today = "2026-02-28";
const thisWeekEnd = "2026-03-06";

export default function AtsInterviews() {
  const isLoading = useSimulatedLoading(700);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const scheduledToday = interviews.filter(i => i.scheduledDate === today).length;
  const thisWeek = interviews.filter(i => i.scheduledDate >= today && i.scheduledDate <= thisWeekEnd).length;
  const completed = interviews.filter(i => i.status === "completed").length;
  const cancelled = interviews.filter(i => i.status === "cancelled").length;

  const allInterviewers = [...new Set(interviews.flatMap(i => i.interviewers))];

  const filtered = interviews.filter(i => {
    const matchType = typeFilter === "all" || i.type === typeFilter;
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchType && matchStatus;
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interview Schedule</h1>
            <p className="text-sm text-muted-foreground">{interviews.length} interviews tracked</p>
          </div>
          <Button onClick={() => setScheduleOpen(true)} className="bg-violet-600 hover:bg-violet-700" data-testid="schedule-interview-btn">
            <CalendarPlus className="size-4 mr-2" /> Schedule Interview
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Scheduled Today", value: scheduledToday, color: "text-violet-600" },
            { label: "This Week", value: thisWeek, color: "text-sky-600" },
            { label: "Completed", value: completed, color: "text-emerald-600" },
            { label: "Cancelled", value: cancelled, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground mt-0.5">{s.label}</p></CardContent></Card>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36" data-testid="type-filter"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="panel">Panel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Fade>

      <Fade>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Candidate</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewers</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Meet</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(iv => (
                  <tr key={iv.id} className="hover:bg-muted/20" data-testid={`interview-row-${iv.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{iv.candidateName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{iv.jobTitle}</td>
                    <td className="px-4 py-3 text-sm">{iv.scheduledDate} {iv.scheduledTime}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[iv.type]}`}>{iv.type}</span></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px] truncate" title={iv.interviewers.join(", ")}>{iv.interviewers.join(", ")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{iv.duration}m</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[iv.status]}`}>{iv.status}</span></td>
                    <td className="px-4 py-3">
                      {iv.meetLink && (
                        <a href={iv.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline" data-testid={`meet-link-${iv.id}`}>
                          Join <ExternalLink className="size-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No interviews found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <FormDialog title="Schedule Interview" description="Set up a new interview for a candidate" open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Candidate</label>
            <Select><SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
              <SelectContent>{candidates.slice(0, 10).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Job Opening</label>
            <Select><SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
              <SelectContent>{jobOpenings.filter(j => j.status === "active").map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Interview Type</label>
            <Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Screen</SelectItem>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="panel">Panel</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Duration (mins)</label>
            <Select><SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Date</label><Input type="date" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Time</label><Input type="time" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Interviewers</label><Input placeholder="e.g. Rohan Mehta, Priya Sharma" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Meet Link</label><Input placeholder="https://meet.google.com/..." /></div>
        </div>
        <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700" data-testid="submit-interview">Schedule Interview</Button>
      </FormDialog>
    </PageTransition>
  );
}
