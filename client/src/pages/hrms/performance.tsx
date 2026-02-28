import { useState } from "react";
import { Award, Star } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { performanceReviews } from "@/lib/mock-data-hrms";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  submitted: "bg-sky-100 text-sky-700",
  acknowledged: "bg-emerald-100 text-emerald-700",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`size-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

export default function HrmsPerformance() {
  const isLoading = useSimulatedLoading(700);
  const [cycleFilter, setCycleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleDialog, setCycleDialog] = useState(false);

  const pending = performanceReviews.filter(r => r.status === "pending").length;
  const submitted = performanceReviews.filter(r => r.status === "submitted").length;
  const acknowledged = performanceReviews.filter(r => r.status === "acknowledged").length;
  const avgRating = (performanceReviews.filter(r => r.rating > 0).reduce((s, r) => s + r.rating, 0) / performanceReviews.filter(r => r.rating > 0).length).toFixed(1);

  const cycles = [...new Set(performanceReviews.map(r => r.reviewCycle))];

  const filtered = performanceReviews.filter(r => {
    const matchCycle = cycleFilter === "all" || r.reviewCycle === cycleFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchCycle && matchStatus;
  });

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
            <h1 className="text-2xl font-bold">Performance Reviews</h1>
            <p className="text-sm text-muted-foreground">Track and manage employee performance evaluations</p>
          </div>
          <Button onClick={() => setCycleDialog(true)} className="bg-sky-600 hover:bg-sky-700" data-testid="start-review-btn">
            <Award className="size-4 mr-2" /> Start Review Cycle
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{pending}</p><p className="text-xs text-muted-foreground mt-0.5">Pending Reviews</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-sky-600">{submitted}</p><p className="text-xs text-muted-foreground mt-0.5">Submitted</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{acknowledged}</p><p className="text-xs text-muted-foreground mt-0.5">Acknowledged</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-violet-600">{avgRating}</p><p className="text-xs text-muted-foreground mt-0.5">Avg Rating</p></CardContent></Card>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <Select value={cycleFilter} onValueChange={setCycleFilter}>
            <SelectTrigger className="w-36" data-testid="cycle-filter"><SelectValue placeholder="All Cycles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              {cycles.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Review Cycle</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Rating</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reviewer</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20" data-testid={`review-row-${r.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{r.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.reviewCycle}</td>
                    <td className="px-4 py-3">{r.rating > 0 ? <StarRating rating={r.rating} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.reviewer}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.completedDate || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No reviews found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={cycleDialog} onOpenChange={setCycleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start New Review Cycle</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Cycle Name</label><Input placeholder="e.g. Q1 2026" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium">Start Date</label><Input type="date" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">End Date</label><Input type="date" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Department</label>
              <Select><SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCycleDialog(false)}>Cancel</Button>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setCycleDialog(false)} data-testid="confirm-cycle">Create Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
