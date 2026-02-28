import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Search } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { FormDialog } from "@/components/hr/form-dialog";
import { jobOpenings } from "@/lib/mock-data-ats";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-700",
  draft: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-muted text-muted-foreground",
};

const typeColors: Record<string, string> = {
  "full-time": "bg-sky-100 text-sky-700",
  contract: "bg-violet-100 text-violet-700",
  internship: "bg-orange-100 text-orange-700",
};

export default function AtsJobs() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const depts = [...new Set(jobOpenings.map(j => j.department))];

  const filtered = jobOpenings.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.hiringManager.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || j.department === deptFilter;
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    const matchPriority = priorityFilter === "all" || j.priority === priorityFilter;
    return matchSearch && matchDept && matchStatus && matchPriority;
  });

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Job Openings</h1>
            <p className="text-sm text-muted-foreground">{jobOpenings.filter(j => j.status === "active").length} active openings · {jobOpenings.reduce((s, j) => s + j.openings - j.filled, 0)} positions to fill</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-violet-600 hover:bg-violet-700" data-testid="create-job-btn">
            <Plus className="size-4 mr-2" /> Create Job Opening
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search by title or hiring manager..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="job-search" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40" data-testid="dept-filter"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Departments</SelectItem>{depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32" data-testid="status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32" data-testid="priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Openings</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Hiring Manager</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Target Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setLocation(`/ats/jobs/${job.id}`)} data-testid={`job-row-${job.id}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.department}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[job.type]}`}>{job.type}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>{job.status}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[job.priority]}`}>{job.priority}</span></td>
                    <td className="px-4 py-3 text-sm font-medium">{job.filled}/{job.openings}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.hiringManager}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.targetDate}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No job openings found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <FormDialog title="Create Job Opening" description="Post a new job opening for the team" open={addOpen} onOpenChange={setAddOpen}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Job Title</label><Input placeholder="e.g. Senior Backend Engineer" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Department</label>
            <Select><SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
              <SelectContent><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="sales">Sales</SelectItem><SelectItem value="operations">Operations</SelectItem><SelectItem value="hr">HR</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Location</label><Input placeholder="e.g. Bengaluru / Remote" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Type</label>
            <Select><SelectTrigger><SelectValue placeholder="Employment type" /></SelectTrigger>
              <SelectContent><SelectItem value="full-time">Full Time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Priority</label>
            <Select><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Number of Openings</label><Input type="number" placeholder="e.g. 2" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Hiring Manager</label><Input placeholder="e.g. Rohan Mehta" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Min Salary (₹)</label><Input type="number" placeholder="e.g. 1200000" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Max Salary (₹)</label><Input type="number" placeholder="e.g. 2000000" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Target Date</label><Input type="date" /></div>
        </div>
        <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700" data-testid="submit-job">Create Job Opening</Button>
      </FormDialog>
    </PageTransition>
  );
}
