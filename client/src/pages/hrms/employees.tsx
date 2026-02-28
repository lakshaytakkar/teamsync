import { useState } from "react";
import { useLocation } from "wouter";
import { UserPlus, Mail, Search } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { FormDialog } from "@/components/hr/form-dialog";
import { employees, hrmsDepartments } from "@/lib/mock-data-hrms";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  "on-leave": "bg-amber-100 text-amber-700",
  terminated: "bg-red-100 text-red-700",
};

const typeColors: Record<string, string> = {
  "full-time": "bg-sky-100 text-sky-700",
  "part-time": "bg-violet-100 text-violet-700",
  contract: "bg-orange-100 text-orange-700",
};

export default function HrmsEmployees() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchType = typeFilter === "all" || e.employmentType === typeFilter;
    return matchSearch && matchDept && matchStatus && matchType;
  });

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-sm text-muted-foreground">{employees.length} total employees across {hrmsDepartments.length} departments</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-sky-600 hover:bg-sky-700" data-testid="add-employee-btn">
            <UserPlus className="size-4 mr-2" /> Add Employee
          </Button>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search by name or designation..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="employee-search" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40" data-testid="dept-filter"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {hrmsDepartments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36" data-testid="type-filter"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Designation</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/hrms/employees/${emp.id}`)}
                    data-testid={`employee-row-${emp.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={getPersonAvatar(emp.name, 32)} alt={emp.name} />
                          <AvatarFallback className="text-xs">{emp.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="px-4 py-3 text-sm">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[emp.employmentType]}`}>{emp.employmentType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[emp.status]}`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.location}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${emp.email}`; }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        data-testid={`email-emp-${emp.id}`}
                        title={emp.email}
                      >
                        <Mail className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No employees found</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>

      <FormDialog title="Add Employee" description="Add a new team member to the organization" open={addOpen} onOpenChange={setAddOpen}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Full Name</label><Input placeholder="e.g. Aarav Sharma" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><Input type="email" placeholder="aarav@teamsync.io" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><Input placeholder="+91 98765 43210" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Department</label>
            <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{hrmsDepartments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Designation</label><Input placeholder="e.g. Backend Engineer" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Employment Type</label>
            <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Joining Date</label><Input type="date" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Location</label><Input placeholder="e.g. Mumbai" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-sm font-medium">Reporting Manager</label>
            <Select><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent>{employees.filter(e => e.designation.includes("Manager") || e.designation.includes("Lead") || e.designation.includes("CEO")).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700" data-testid="submit-add-employee">Add Employee</Button>
      </FormDialog>
    </PageTransition>
  );
}
