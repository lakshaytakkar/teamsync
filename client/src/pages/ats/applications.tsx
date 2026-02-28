import { useState } from "react";
import { useLocation } from "wouter";
import { CalendarPlus, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { applications, jobOpenings, candidates } from "@/lib/mock-data-ats";

const stageColors: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  "phone-screen": "bg-sky-100 text-sky-700",
  technical: "bg-violet-100 text-violet-700",
  cultural: "bg-amber-100 text-amber-700",
  final: "bg-orange-100 text-orange-700",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const interviewers = [...new Set(applications.map(a => a.currentInterviewer).filter(Boolean))];

export default function AtsApplications() {
  const [, setLocation] = useLocation();
  const isLoading = useSimulatedLoading(700);
  const [jobFilter, setJobFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [interviewerFilter, setInterviewerFilter] = useState("all");

  const filtered = applications.filter(a => {
    const matchJob = jobFilter === "all" || a.jobId === jobFilter;
    const matchStage = stageFilter === "all" || a.stage === stageFilter;
    const matchInterviewer = interviewerFilter === "all" || a.currentInterviewer === interviewerFilter;
    return matchJob && matchStage && matchInterviewer;
  });

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl" />)}
      </div>
    );
  }

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">{applications.length} total applications across all openings</p>
        </div>
      </Fade>

      <Fade>
        <div className="flex flex-wrap gap-3">
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-52" data-testid="job-filter"><SelectValue placeholder="All Jobs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobOpenings.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40" data-testid="stage-filter"><SelectValue placeholder="All Stages" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="phone-screen">Phone Screen</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="final">Final Round</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={interviewerFilter} onValueChange={setInterviewerFilter}>
            <SelectTrigger className="w-44" data-testid="interviewer-filter"><SelectValue placeholder="All Interviewers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interviewers</SelectItem>
              {interviewers.map(i => i && <SelectItem key={i} value={i}>{i}</SelectItem>)}
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Job Title</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Applied</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Interviewer</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Last Activity</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(app => {
                  const cand = candidates.find(c => c.id === app.candidateId);
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => setLocation(`/ats/candidates/${app.candidateId}`)}
                      data-testid={`app-row-${app.id}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium">{app.candidateName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{app.appliedDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[app.stage] || "bg-muted text-muted-foreground"}`}>{app.stage}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{app.currentInterviewer || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{app.lastActivity}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); cand && window.open(`https://wa.me/${cand.phone.replace(/\D/g, "")}`, "_blank"); }}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-green-600"
                            data-testid={`whatsapp-app-${app.id}`}
                            title="WhatsApp"
                          >
                            <SiWhatsapp className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); cand && (window.location.href = `mailto:${cand.email}`); }}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                            data-testid={`email-app-${app.id}`}
                            title="Email"
                          >
                            <Mail className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-violet-600"
                            data-testid={`schedule-app-${app.id}`}
                            title="Schedule Interview"
                          >
                            <CalendarPlus className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No applications found</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Fade>
    </PageTransition>
  );
}
