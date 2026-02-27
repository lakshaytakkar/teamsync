import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { TopNavigation } from "@/components/layout/top-navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Candidates from "@/pages/candidates";
import Departments from "@/pages/departments";
import JobPostings from "@/pages/job-postings";
import LeaveManagement from "@/pages/leave-management";
import Attendance from "@/pages/attendance";
import Documents from "@/pages/documents";
import Payroll from "@/pages/payroll";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import StyleGuide from "@/pages/style-guide";
import ComponentsGuide from "@/pages/components-guide";
import IconsGuide from "@/pages/icons-guide";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/departments" component={Departments} />
      <Route path="/job-postings" component={JobPostings} />
      <Route path="/leave" component={LeaveManagement} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/documents" component={Documents} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/projects" component={Projects} />
      <Route path="/dev/style-guide" component={StyleGuide} />
      <Route path="/dev/components" component={ComponentsGuide} />
      <Route path="/dev/icons" component={IconsGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen w-full flex-col">
          <AnnouncementBanner />
          <TopNavigation />
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
