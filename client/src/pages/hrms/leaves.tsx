import { useState } from "react";
import { CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { FormDialog } from "@/components/hr/form-dialog";
import { leaveRequests } from "@/lib/mock-data-hrms";

const statusColors: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const typeColors: Record<string, string> = {
  casual: "bg-sky-100 text-sky-700",
  sick: "bg-red-100 text-red-700",
  annual: "bg-violet-100 text-violet-700",
  maternity: "bg-pink-100 text-pink-700",
  paternity: "bg-blue-100 text-blue-700",
};

export default function HrmsLeaves() {
  const isLoading = useSimulatedLoading(700);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [leaveData, setLeaveData] = useState(leaveRequests);

  const handleApprove = (id: string) => {
    setLeaveData((prev) => prev.map((l) => l.id === id ? { ...l, status: "approved" as const } : l));
  };

  const handleReject = (id: string) => {
    setLeaveData((prev) => prev.map((l) => l.id === id ? { ...l, status: "rejected" as const } : l));
  };

  const pending = leaveData.filter((l) => l.status === "pending").length;
  const approvedThisMonth = leaveData.filter((l) => l.status === "approved" && l.startDate.startsWith("2026-02")).length;
  const rejected = leaveData.filter((l) => l.status === "rejected").length;
  const onLeave = leaveData.filter((l) => l.status === "approved" && l.startDate <= "2026-02-28" && l.endDate >= "2026-02-28").length;

  const filtered = leaveData.filter((l) => {
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchType && matchStatus;
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
            <h1 className="text-2xl font-bold">Leave Requests</h1>
            <p className="text-sm text-muted-foreground">Manage and approve team leave applications</p>
          </div>
          <Button onClick={() => setRequestOpen(true)} className="bg-sky-600 hover:bg-sky-700" data-testid="request-leave-btn">
            <CalendarDays className="size-4 mr-2" /> Request Leave
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending Approvals", value: pending, color: "text-amber-600" },
            { label: "Approved This Month", value: approvedThisMonth, color: "text-emerald-600" },
            { label: "Rejected", value: rejected, color: "text-red-600" },
            { label: "On Leave Today", value: onLeave, color: "text-sky-600" },
          ].map((s) => (
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36" data-testid="type-filter"><SelectValue placeholder="Leave Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="sick">Sick</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="maternity">Maternity</SelectItem>
              <SelectItem value="paternity">Paternity</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Dates</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reason</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((leave) => (
                  <tr key={leave.id} className="hover:bg-muted/20" data-testid={`leave-row-${leave.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{leave.employeeName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[leave.type]}`}>{leave.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{leave.days} day{leave.days > 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{leave.startDate} → {leave.endDate}</td>
                    <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[leave.status]}`}>{leave.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleApprove(leave.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors" data-testid={`approve-${leave.id}`} title="Approve">
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button onClick={() => handleReject(leave.id)} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors" data-testid={`reject-${leave.id}`} title="Reject">
                            <XCircle className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No leave requests found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <FormDialog title="Request Leave" description="Submit a leave request for approval" open={requestOpen} onOpenChange={setRequestOpen}>
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Employee</label>
            <Select><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Myself (Sneha Patel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Leave Type</label>
            <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="maternity">Maternity Leave</SelectItem>
                <SelectItem value="paternity">Paternity Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Start Date</label><Input type="date" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">End Date</label><Input type="date" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Reason</label><Input placeholder="Brief reason for leave" /></div>
        </div>
        <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700" data-testid="submit-leave">Submit Request</Button>
      </FormDialog>
    </PageTransition>
  );
}
