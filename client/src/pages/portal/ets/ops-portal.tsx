import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, AlertTriangle, Phone, Clock, ChevronRight } from "lucide-react";

const CLIENTS = [
  { id: "C001", name: "Meena Singh", city: "Lucknow", stage: "In Transit", milestone: "Delivery Confirmed", progress: 70, manager: "Aditya", daysInStage: 4 },
  { id: "C002", name: "Prashant Yadav", city: "Kanpur", stage: "Token Paid", milestone: "Store Design Sent", progress: 35, manager: "Aditya", daysInStage: 9 },
  { id: "C003", name: "Anita Sharma", city: "Agra", stage: "Store Design", milestone: "3D Layout Approved", progress: 52, manager: "Aditya", daysInStage: 6 },
  { id: "C004", name: "Sonal Gupta", city: "Ahmedabad", stage: "Qualified", milestone: "Profile Completed", progress: 20, manager: "Aditya", daysInStage: 2 },
  { id: "C005", name: "Kiran Patel", city: "Vadodara", stage: "Inventory Ordered", milestone: "PO Raised", progress: 60, manager: "Aditya", daysInStage: 7 },
];

const OPEN_TICKETS = [
  { id: "T001", client: "Meena Singh", issue: "Shipment tracking link not working", priority: "High", opened: "2 days ago" },
  { id: "T002", client: "Prashant Yadav", issue: "Store design revision requested", priority: "Medium", opened: "4 days ago" },
  { id: "T003", client: "Kiran Patel", issue: "Product pricing query on imported items", priority: "Low", opened: "1 day ago" },
];

const STAGE_COLORS: Record<string, string> = {
  "In Transit": "bg-blue-100 text-blue-700",
  "Token Paid": "bg-green-100 text-green-700",
  "Store Design": "bg-purple-100 text-purple-700",
  "Qualified": "bg-gray-100 text-gray-600",
  "Inventory Ordered": "bg-amber-100 text-amber-700",
};

export default function EtsOpsPortal() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ops-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-emerald-200 mb-1">Operations Center</p>
          <h1 className="text-2xl font-bold" data-testid="text-ops-title">Client Stage Management</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-emerald-200">
            <span><strong className="text-white">{CLIENTS.length}</strong> Active Clients</span>
            <span><strong className="text-white">{OPEN_TICKETS.length}</strong> Open Tickets</span>
            <span><strong className="text-white">{CLIENTS.filter(c => c.daysInStage > 5).length}</strong> Overdue</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Client Stages</CardTitle>
              <Badge variant="outline" className="text-xs">{CLIENTS.length} clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {CLIENTS.map((client) => (
              <div
                key={client.id}
                className={`p-3 rounded-xl border ${client.daysInStage > 7 ? "border-amber-200 bg-amber-50/40" : "bg-muted/30 border-transparent"}`}
                data-testid={`client-stage-${client.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">{client.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-[10px] ${STAGE_COLORS[client.stage] || ""}`} variant="outline">{client.stage}</Badge>
                    {client.daysInStage > 7 && (
                      <p className="text-[10px] text-amber-600 mt-0.5">⚠ {client.daysInStage}d in stage</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={client.progress} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{client.progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Milestone: {client.milestone}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {OPEN_TICKETS.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-xl bg-muted/40 space-y-1"
                  data-testid={`ticket-${ticket.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{ticket.client}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${ticket.priority === "High" ? "border-red-300 text-red-700 bg-red-50" : ticket.priority === "Medium" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500"}`}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.issue}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.opened}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" /> Readiness Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {CLIENTS.slice(0, 3).map((client) => (
                <div key={client.id} className="flex items-center justify-between" data-testid={`readiness-${client.id}`}>
                  <div>
                    <p className="text-xs font-medium">{client.name}</p>
                    <p className="text-[10px] text-muted-foreground">{client.stage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={client.progress} className="w-20 h-1.5" />
                    <span className="text-xs text-muted-foreground">{client.progress}%</span>
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

export function EtsOpsStages() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Client Stage Tracker</h1>
      <div className="space-y-3">
        {CLIENTS.map((client) => (
          <Card key={client.id} className="border-0 shadow-sm" data-testid={`stage-card-${client.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">{client.name[0]}</div>
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.city}</p>
                  </div>
                </div>
                <Badge className={STAGE_COLORS[client.stage] || ""} variant="outline">{client.stage}</Badge>
              </div>
              <Progress value={client.progress} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Milestone: {client.milestone}</span>
                <span>{client.progress}% complete</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsOpsMilestones() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Milestone Tracker</h1>
      <div className="space-y-4">
        {CLIENTS.map((client) => (
          <Card key={client.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{client.name} — {client.city}</p>
                  <Badge className={STAGE_COLORS[client.stage] || ""} variant="outline">{client.stage}</Badge>
                </div>
                <span className="text-sm font-bold text-emerald-600">{client.progress}%</span>
              </div>
              <div className="space-y-1.5">
                {["Profile Setup", "Token Payment", "Store Design", "Inventory Order", "Launch Readiness"].map((ms, i) => (
                  <div key={ms} className="flex items-center gap-2 text-sm">
                    <CheckSquare className={`w-4 h-4 ${client.progress > (i * 20) ? "text-emerald-500" : "text-gray-200"}`} />
                    <span className={client.progress > (i * 20) ? "text-foreground" : "text-muted-foreground"}>{ms}</span>
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

export function EtsOpsTickets() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Support Tickets</h1>
      <div className="space-y-3">
        {OPEN_TICKETS.map((ticket) => (
          <Card key={ticket.id} className="border-0 shadow-sm" data-testid={`ops-ticket-${ticket.id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${ticket.priority === "High" ? "border-red-300 text-red-700" : ticket.priority === "Medium" ? "border-amber-300 text-amber-700" : "border-gray-200 text-gray-500"}`}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="font-medium">{ticket.issue}</p>
                <p className="text-sm text-muted-foreground">Client: {ticket.client} · {ticket.opened}</p>
              </div>
              <Button size="sm" variant="outline">Resolve</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsOpsReadiness() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Store Readiness Checklist</h1>
      <div className="space-y-4">
        {CLIENTS.map((client) => (
          <Card key={client.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.city} · {client.stage}</p>
                </div>
                <Progress value={client.progress} className="w-24 h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Store Profile Complete", "3D Design Approved", "Inventory Ordered", "Staff Hired", "POS Installed", "Ready to Launch"].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded-full border-2 ${client.progress > (i * 16.66) ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`} />
                    <span className={client.progress > (i * 16.66) ? "text-foreground" : "text-muted-foreground"}>{item}</span>
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
