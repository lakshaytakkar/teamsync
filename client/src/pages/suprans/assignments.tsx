import { useState } from "react";
import { PageTransition } from "@/components/ui/animated";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Phone, Mail, User2, CheckCircle2, CalendarDays,
} from "lucide-react";
import {
  supransLeads as initialLeads,
  VERTICAL_REP_MAP,
  type SupransLead,
} from "@/lib/mock-data-suprans";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BRAND = "#3730A3";

const SERVICE_LABELS: Record<string, string> = {
  "company-formation": "Company Formation",
  "tour-booking": "Tour Booking",
  "ecommerce-setup": "E-Commerce Setup",
  "event-management": "Event Management",
  "hr-consulting": "HR Consulting",
  "franchise": "Franchise",
};

const VERTICAL_OPTIONS = [
  { value: "hr", label: "LegalNations", color: "#225AEA" },
  { value: "events", label: "GoyoTours", color: "#E91E63" },
  { value: "sales", label: "USDrop AI", color: "#F34147" },
  { value: "eventhub", label: "EventHub", color: "#7C3AED" },
  { value: "hrms", label: "HRMS", color: "#0EA5E9" },
  { value: "ets", label: "EazyToSell", color: "#F97316" },
];

const VERTICAL_META: Record<string, { label: string; color: string }> = Object.fromEntries(
  VERTICAL_OPTIONS.map(v => [v.value, { label: v.label, color: v.color }])
);

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function SupransAssignments() {
  const { toast } = useToast();
  const [pendingLeads, setPendingLeads] = useState<SupransLead[]>(
    initialLeads.filter(l => l.status === "enriched")
  );
  const [assignedLeads] = useState<SupransLead[]>(
    initialLeads.filter(l => l.status === "assigned")
  );
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<SupransLead | null>(null);
  const [assignVertical, setAssignVertical] = useState("");
  const [assignRep, setAssignRep] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const filteredPending = pendingLeads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    SERVICE_LABELS[l.service]?.toLowerCase().includes(search.toLowerCase())
  );

  function openAssign(lead: SupransLead) {
    setSelectedLead(lead);
    setAssignVertical(lead.assignedVertical || "");
    setAssignRep("");
    setFollowUpDate("");
    setAssignNotes("");
  }

  function handleAssign() {
    if (!selectedLead || !assignVertical || !assignRep) return;
    setPendingLeads(prev => prev.filter(l => l.id !== selectedLead.id));
    toast({ title: "Lead assigned", description: `${selectedLead.name} assigned to ${assignRep} (${VERTICAL_META[assignVertical]?.label}).` });
    setSelectedLead(null);
  }

  const availableReps = assignVertical ? (VERTICAL_REP_MAP[assignVertical] || []) : [];

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Assignments</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Assign enriched leads to business vertical reps</p>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search enriched leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-search-assignments"
        />
      </div>

      {filteredPending.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Ready to Assign <span className="text-muted-foreground font-normal">({filteredPending.length})</span></h2>
          </div>
          <div className="divide-y">
            {filteredPending.map(lead => {
              const vertMeta = lead.assignedVertical ? VERTICAL_META[lead.assignedVertical] : null;
              return (
                <div key={lead.id} className="p-4 flex items-center gap-4" data-testid={`row-pending-${lead.id}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#EEF2FF" }}>
                    <span className="font-bold text-sm" style={{ color: BRAND }}>{lead.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{lead.name}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_COLORS[lead.priority])}>
                        {lead.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                      <span>{SERVICE_LABELS[lead.service]}</span>
                      {vertMeta && (
                        <span className="flex items-center gap-1">
                          → <span style={{ color: vertMeta.color }} className="font-medium">{vertMeta.label}</span>
                        </span>
                      )}
                    </div>
                    {lead.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate max-w-sm">{lead.notes}</p>}
                  </div>
                  <button
                    onClick={() => openAssign(lead)}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium shrink-0"
                    style={{ backgroundColor: BRAND }}
                    data-testid={`button-assign-${lead.id}`}
                  >
                    Assign Rep
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredPending.length === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground text-sm">
          All enriched leads have been assigned.
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold text-sm">Recently Assigned <span className="text-muted-foreground font-normal">({assignedLeads.length})</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Lead</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Service</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Vertical</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Assigned Rep</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignedLeads.map(lead => {
                const vertMeta = lead.assignedVertical ? VERTICAL_META[lead.assignedVertical] : null;
                return (
                  <tr key={lead.id} data-testid={`row-assigned-${lead.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{SERVICE_LABELS[lead.service]}</td>
                    <td className="px-4 py-3">
                      {vertMeta && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: vertMeta.color }}>
                          {vertMeta.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <User2 className="w-3 h-3 text-muted-foreground" />
                        {lead.assignedRep || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lead.assignedAt ? format(new Date(lead.assignedAt), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">assigned</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedLead} onOpenChange={o => !o && setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <div className="font-medium text-base">{selectedLead.name}</div>
                <div className="text-muted-foreground">{SERVICE_LABELS[selectedLead.service]}</div>
                {selectedLead.notes && <p className="text-muted-foreground italic text-xs">{selectedLead.notes}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Business Vertical</Label>
                <Select value={assignVertical} onValueChange={v => { setAssignVertical(v); setAssignRep(""); }}>
                  <SelectTrigger data-testid="select-assign-vertical">
                    <SelectValue placeholder="Select vertical..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VERTICAL_OPTIONS.map(v => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Assign to Rep</Label>
                <Select value={assignRep} onValueChange={setAssignRep} disabled={!assignVertical}>
                  <SelectTrigger data-testid="select-assign-rep">
                    <SelectValue placeholder={assignVertical ? "Select rep..." : "Choose vertical first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReps.map(rep => (
                      <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Follow-up Date</Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  data-testid="input-followup-date"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Notes for Rep</Label>
                <Textarea
                  placeholder="Briefing notes for the assigned rep..."
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  rows={2}
                  data-testid="textarea-assign-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setSelectedLead(null)}
              className="px-4 py-2 rounded-lg bg-muted text-sm font-medium"
              data-testid="button-cancel-assign"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!assignVertical || !assignRep}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
              data-testid="button-confirm-assign"
            >
              <CheckCircle2 className="w-4 h-4" />
              Assign Lead
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
