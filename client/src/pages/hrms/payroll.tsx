import { useState } from "react";
import { DollarSign, Play } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { payrollEntries } from "@/lib/mock-data-hrms";

const statusColors: Record<string, string> = {
  processed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  "on-hold": "bg-red-100 text-red-700",
};

export default function HrmsPayroll() {
  const isLoading = useSimulatedLoading(700);
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [runDialog, setRunDialog] = useState(false);

  const totalThisMonth = payrollEntries.filter(p => p.month === "Feb 2026").reduce((sum, p) => sum + p.netSalary, 0);
  const processed = payrollEntries.filter(p => p.status === "processed").length;
  const pending = payrollEntries.filter(p => p.status === "pending").length;
  const onHold = payrollEntries.filter(p => p.status === "on-hold").length;

  const months = [...new Set(payrollEntries.map(p => p.month))];

  const filtered = payrollEntries.filter(p => {
    const matchMonth = monthFilter === "all" || p.month === monthFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchMonth && matchStatus;
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
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-sm text-muted-foreground">Manage monthly payroll processing and disbursements</p>
          </div>
          <Button onClick={() => setRunDialog(true)} className="bg-sky-600 hover:bg-sky-700" data-testid="run-payroll-btn">
            <Play className="size-4 mr-2" /> Run Payroll
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xl font-bold text-sky-600">₹{(totalThisMonth / 100000).toFixed(2)}L</p><p className="text-xs text-muted-foreground mt-0.5">Total Payroll (Feb)</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{processed}</p><p className="text-xs text-muted-foreground mt-0.5">Processed</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{pending}</p><p className="text-xs text-muted-foreground mt-0.5">Pending</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{onHold}</p><p className="text-xs text-muted-foreground mt-0.5">On Hold</p></CardContent></Card>
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-3">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-36" data-testid="month-filter"><SelectValue placeholder="All Months" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Month</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Gross Salary</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Deductions</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Net Salary</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Pay Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20" data-testid={`payroll-row-${p.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{p.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.month}</td>
                    <td className="px-4 py-3 text-sm">₹{p.grossSalary.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm text-red-600">-₹{p.deductions.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600">₹{p.netSalary.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.payDate}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No payroll records found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <Dialog open={runDialog} onOpenChange={setRunDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run Payroll — Feb 2026</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">This will process payroll for all <strong>{pending}</strong> pending employees for <strong>February 2026</strong>.</p>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-700 dark:text-amber-300 text-xs">
              Total payout: <strong>₹{(totalThisMonth / 100000).toFixed(2)} Lakhs</strong>. Ensure bank balance is sufficient before proceeding.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunDialog(false)} data-testid="cancel-run-payroll">Cancel</Button>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setRunDialog(false)} data-testid="confirm-run-payroll">Confirm & Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
