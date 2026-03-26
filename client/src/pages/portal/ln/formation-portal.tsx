import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Kanban, UserPlus, ClipboardList, Briefcase, CheckCircle2, FileText,
} from "lucide-react";
import { FORMATION_STAGES } from "@/lib/mock-data-dashboard-ln";

const FORMATION_CLIENTS = [
  { id: "FC-001", name: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", stage: 4, stageName: "EIN Application", package: "Premium", daysInStage: 12, kycStatus: "approved" as const, einStatus: "pending" as const },
  { id: "FC-002", name: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", stage: 3, stageName: "Articles Filing", package: "Premium", daysInStage: 8, kycStatus: "approved" as const, einStatus: "not-started" as const },
  { id: "FC-003", name: "SwiftPay Solutions Inc", client: "Neha Joshi", state: "NV", stage: 2, stageName: "KYC", package: "Basic", daysInStage: 3, kycStatus: "in-review" as const, einStatus: "not-started" as const },
  { id: "FC-004", name: "DataBridge Analytics LLC", client: "Vikram Rao", state: "WY", stage: 5, stageName: "BOI Filing", package: "Standard", daysInStage: 5, kycStatus: "approved" as const, einStatus: "received" as const },
  { id: "FC-005", name: "UrbanNest Realty Corp", client: "Priya Singh", state: "TX", stage: 1, stageName: "Payment", package: "Premium", daysInStage: 1, kycStatus: "not-started" as const, einStatus: "not-started" as const },
  { id: "FC-006", name: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", stage: 6, stageName: "Banking Setup", package: "Standard", daysInStage: 4, kycStatus: "approved" as const, einStatus: "received" as const },
];

const KYC_QUEUE = [
  { id: "KYC-001", client: "Neha Joshi", company: "SwiftPay Solutions Inc", submitted: "2026-03-23", docs: ["Passport", "Address Proof"], status: "in-review" as const, notes: "Utility bill is blurry — may need re-upload" },
  { id: "KYC-002", client: "Priya Singh", company: "UrbanNest Realty Corp", submitted: "2026-03-25", docs: ["Passport"], status: "incomplete" as const, notes: "Missing address proof document" },
  { id: "KYC-003", client: "Suresh Kapoor", company: "AquaFlow Systems LLC", submitted: "2026-03-20", docs: ["Passport", "Address Proof", "Selfie"], status: "approved" as const, notes: "" },
  { id: "KYC-004", client: "Meera Reddy", company: "BrightStar Consulting Corp", submitted: "2026-03-24", docs: ["Passport", "Address Proof"], status: "in-review" as const, notes: "Awaiting ITIN confirmation" },
];

const EIN_TRACKER = [
  { id: "EIN-001", company: "TechVentures LLC", client: "Rajesh Kumar", state: "DE", submittedDate: "2026-02-01", status: "pending" as const, method: "Fax", estimatedDate: "2026-03-15" },
  { id: "EIN-002", company: "DataBridge Analytics LLC", client: "Vikram Rao", state: "WY", submittedDate: "2026-01-20", status: "received" as const, method: "Online", estimatedDate: "2026-01-20", ein: "92-8765432" },
  { id: "EIN-003", company: "NovaTech AI Inc", client: "Deepak Verma", state: "DE", submittedDate: "2026-01-25", status: "received" as const, method: "Fax", estimatedDate: "2026-02-20", ein: "88-9123456" },
  { id: "EIN-004", company: "GreenLeaf Organics LLC", client: "Amit Patel", state: "DE", submittedDate: "", status: "not-started" as const, method: "-", estimatedDate: "-" },
];

const KYC_STATUS_COLORS: Record<string, string> = {
  "approved": "border-green-300 text-green-700 bg-green-50",
  "in-review": "border-amber-300 text-amber-700 bg-amber-50",
  "incomplete": "border-red-300 text-red-700 bg-red-50",
  "not-started": "border-gray-200 text-gray-500",
};

const EIN_STATUS_COLORS: Record<string, string> = {
  "received": "border-green-300 text-green-700 bg-green-50",
  "pending": "border-amber-300 text-amber-700 bg-amber-50",
  "not-started": "border-gray-200 text-gray-500",
};

export default function LnFormationPortal() {
  const inPipeline = FORMATION_CLIENTS.length;
  const kycPending = KYC_QUEUE.filter(k => k.status !== "approved").length;
  const einPending = EIN_TRACKER.filter(e => e.status === "pending").length;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ln-formation-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-sm text-sky-200 mb-1">Formation Specialist</p>
          <h1 className="text-2xl font-bold" data-testid="text-formation-title">Client Pipeline</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-sky-200">
            <span><strong className="text-white">{inPipeline}</strong> In Pipeline</span>
            <span><strong className="text-white">{kycPending}</strong> KYC Pending</span>
            <span><strong className="text-white">{einPending}</strong> EIN Pending</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Kanban className="w-4 h-4 text-sky-500" /> Active Formations
              </CardTitle>
              <Badge variant="outline" className="text-xs">{inPipeline} clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {FORMATION_CLIENTS.map((fc) => (
              <div
                key={fc.id}
                className={`p-3 rounded-xl border ${fc.daysInStage > 10 ? "border-amber-200 bg-amber-50/40" : "bg-muted/30 border-transparent"}`}
                data-testid={`formation-client-${fc.id}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium">{fc.name}</p>
                    <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · {fc.package}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{fc.stageName}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(fc.stage / 7) * 100} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">Stage {fc.stage}/7</span>
                  {fc.daysInStage > 10 && (
                    <span className="text-[10px] text-amber-600 font-medium">{fc.daysInStage}d</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-500" /> KYC Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {KYC_QUEUE.filter(k => k.status !== "approved").map((kyc) => (
                <div key={kyc.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`kyc-queue-${kyc.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{kyc.client}</span>
                    <Badge variant="outline" className={`text-[10px] ${KYC_STATUS_COLORS[kyc.status]}`}>
                      {kyc.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{kyc.company}</p>
                  {kyc.notes && <p className="text-[10px] text-amber-600 mt-1">{kyc.notes}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-sky-500" /> EIN Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {EIN_TRACKER.filter(e => e.status !== "not-started").map((ein) => (
                <div key={ein.id} className="flex items-center justify-between py-2" data-testid={`ein-status-${ein.id}`}>
                  <div>
                    <p className="text-xs font-medium">{ein.company}</p>
                    <p className="text-[10px] text-muted-foreground">Via {ein.method} · {ein.submittedDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-[10px] ${EIN_STATUS_COLORS[ein.status]}`}>
                      {ein.status === "received" ? `EIN: ${ein.ein}` : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LnFormationPipeline() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Formation Pipeline</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMATION_STAGES.slice(0, 4).map((stage) => {
          const count = FORMATION_CLIENTS.filter(c => c.stage === parseInt(stage.id.replace("s", ""))).length;
          return (
            <Card key={stage.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stage.shortName}</p>
                <p className="text-2xl font-bold mt-1 text-sky-600" data-testid={`pipeline-count-${stage.id}`}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="space-y-2">
        {FORMATION_CLIENTS.map((fc) => (
          <div key={fc.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-muted/20 transition-colors" data-testid={`pipeline-fc-${fc.id}`}>
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600 text-xs">{fc.name[0]}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{fc.name}</p>
              <p className="text-xs text-muted-foreground">{fc.client} · {fc.state} · Stage {fc.stage}/7</p>
              <Progress value={(fc.stage / 7) * 100} className="h-1 w-40 mt-1" />
            </div>
            <Badge variant="outline" className="text-xs">{fc.stageName}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LnFormationKYC() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">KYC Review Queue</h1>
        <p className="text-sm text-muted-foreground">Review client identity documents and approve KYC submissions</p>
      </div>
      <div className="space-y-3">
        {KYC_QUEUE.map((kyc) => (
          <Card key={kyc.id} className="border-0 shadow-sm" data-testid={`kyc-card-${kyc.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{kyc.client}</p>
                  <p className="text-sm text-muted-foreground">{kyc.company} · Submitted {kyc.submitted}</p>
                </div>
                <Badge variant="outline" className={KYC_STATUS_COLORS[kyc.status]}>
                  {kyc.status.replace("-", " ")}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {kyc.docs.map((doc) => (
                  <Badge key={doc} variant="outline" className="text-[10px]">
                    <FileText className="w-3 h-3 mr-1" />{doc}
                  </Badge>
                ))}
              </div>
              {kyc.notes && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3">{kyc.notes}</p>
              )}
              {kyc.status !== "approved" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white gap-1" data-testid={`approve-kyc-${kyc.id}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" data-testid={`request-reupload-${kyc.id}`}>
                    Request Re-upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnFormationEIN() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">EIN Tracker</h1>
        <p className="text-sm text-muted-foreground">Track IRS EIN applications across all formations</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{EIN_TRACKER.filter(e => e.status === "received").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{EIN_TRACKER.filter(e => e.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{EIN_TRACKER.filter(e => e.status === "not-started").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Not Started</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {EIN_TRACKER.map((ein) => (
          <Card key={ein.id} className="border-0 shadow-sm" data-testid={`ein-card-${ein.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{ein.company}</p>
                <p className="text-sm text-muted-foreground">{ein.client} · {ein.state}</p>
                {ein.submittedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {ein.submittedDate} · Method: {ein.method}
                    {ein.estimatedDate !== "-" && ` · ETA: ${ein.estimatedDate}`}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={EIN_STATUS_COLORS[ein.status]}>
                {ein.status === "received" ? ein.ein : ein.status === "pending" ? "Pending IRS" : "Not Started"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LnFormationActions() {
  const stageActions = [
    { stage: "Payment", pending: 1, actions: ["Send payment link", "Verify payment receipt", "Assign to specialist"] },
    { stage: "KYC", pending: 2, actions: ["Review uploaded documents", "Request re-uploads", "Approve KYC package"] },
    { stage: "Articles Filing", pending: 1, actions: ["Prepare Articles of Organization", "File with Secretary of State", "Upload stamped copy"] },
    { stage: "EIN Application", pending: 1, actions: ["Prepare SS-4 form", "Submit to IRS (fax/online)", "Upload CP 575 letter"] },
    { stage: "BOI Filing", pending: 1, actions: ["Prepare FinCEN BOI report", "Get client approval", "File with FinCEN"] },
    { stage: "Banking Setup", pending: 1, actions: ["Initiate Mercury application", "Setup Stripe account", "Verify bank connection"] },
  ];

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Stage Actions</h1>
        <p className="text-sm text-muted-foreground">Checklists and actions for each formation stage</p>
      </div>
      <div className="space-y-4">
        {stageActions.map((sa) => (
          <Card key={sa.stage} className="border-0 shadow-sm" data-testid={`stage-actions-${sa.stage.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold">{sa.stage}</span>
                </div>
                <Badge variant="outline" className="text-xs">{sa.pending} pending</Badge>
              </div>
              <div className="space-y-2">
                {sa.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-200" />
                    <span className="text-muted-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
