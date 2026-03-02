import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package, Truck, CheckCircle, MapPin, Clock, ExternalLink,
  ChevronDown, ChevronUp, Edit3, Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Fade } from "@/components/ui/animated";
import { DualCurrencyInline } from "@/lib/faire-currency";
import { faireQuotations } from "@/lib/mock-data-faire-ops";

const BRAND_COLOR = "#7C3AED";

const FULFILLER_ID_TO_NAME: Record<string, string> = {
  "fulf-001": "ShipFast Logistics",
  "fulf-002": "GlobalPack Co",
  "fulf-003": "QuickFulfill EU",
  "fulf-004": "AsiaDirect Supply",
};
const NAME_TO_FULFILLER_ID = Object.fromEntries(
  Object.entries(FULFILLER_ID_TO_NAME).map(([k, v]) => [v, k])
);

type PipelineStage = "PROCESSING" | "PACKED" | "SHIPPED" | "DELIVERED";

interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  stage: PipelineStage;
  notes: string;
}

const PIPELINE_STAGES: { key: PipelineStage; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "PROCESSING", label: "Processing",  icon: <Clock className="h-4 w-4" />,       color: "#2563EB" },
  { key: "PACKED",     label: "Packed",      icon: <Package className="h-4 w-4" />,     color: "#D97706" },
  { key: "SHIPPED",    label: "Shipped",     icon: <Truck className="h-4 w-4" />,       color: "#7C3AED" },
  { key: "DELIVERED",  label: "Delivered",   icon: <CheckCircle className="h-4 w-4" />, color: "#059669" },
];

const CARRIERS = ["FedEx", "UPS", "DHL Express", "USPS", "Aramex", "Blue Dart", "Delhivery", "ePacket", "Other"];

function StageProgress({ stage }: { stage: PipelineStage }) {
  const idx = PIPELINE_STAGES.findIndex(s => s.key === stage);
  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STAGES.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold"
                style={{
                  background: done ? s.color : "var(--muted)",
                  borderColor: done ? s.color : "var(--border)",
                  color: done ? "#fff" : "var(--muted-foreground)",
                }}
              >
                {done && i < idx ? "✓" : active ? s.icon : i + 1}
              </div>
              <span className="text-xs mt-1 font-medium whitespace-nowrap" style={{ color: done ? s.color : "var(--muted-foreground)" }}>
                {s.label}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-6 transition-all" style={{ background: i < idx ? BRAND_COLOR : "var(--border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PipelineCard({
  quotation, orders, tracking, onUpdateTracking,
}: {
  quotation: typeof faireQuotations[0];
  orders: any[];
  tracking: TrackingInfo;
  onUpdateTracking: (id: string, info: Partial<TrackingInfo>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localTracking, setLocalTracking] = useState(tracking);
  const { toast } = useToast();

  const quotationIndex = faireQuotations.findIndex(q => q.id === quotation.id);
  const order = orders.find((o: any) => o.id === quotation.order_id)
    ?? (orders.length > 0 ? orders[quotationIndex >= 0 && quotationIndex < orders.length ? quotationIndex : 0] : null);

  const orderValue = order
    ? order.items.reduce((s: number, i: any) => s + i.price_cents * i.quantity, 0)
    : 0;

  function handleSave() {
    onUpdateTracking(quotation.id, localTracking);
    setEditing(false);
    toast({ title: "Tracking updated", description: `Order pipeline updated to ${localTracking.stage}` });
  }

  const currentStageConfig = PIPELINE_STAGES.find(s => s.key === tracking.stage);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden" data-testid={`pipeline-card-${quotation.id}`}>
      <div className="p-5 border-b">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold">{quotation.id}</span>
              {order && (
                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                  #{order.display_id}
                </span>
              )}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                style={{ background: currentStageConfig?.color + "20", color: currentStageConfig?.color }}
              >
                {currentStageConfig?.icon}{currentStageConfig?.label}
              </span>
            </div>
            {order && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {order.address?.name}, {order.address?.city}, {order.address?.state_code}
              </div>
            )}
            {tracking.carrier && tracking.trackingNumber && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Truck className="h-3.5 w-3.5 shrink-0" />
                {tracking.carrier} · <span className="font-mono font-medium">{tracking.trackingNumber}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(e => !e)} data-testid={`button-expand-${quotation.id}`}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          <StageProgress stage={tracking.stage} />

          {/* Order items */}
          {order && (
            <div>
              <div className="text-sm font-semibold mb-3">Order Items</div>
              <div className="space-y-2">
                {order.items.map((oi: any) => (
                  <div key={oi.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    {oi.product_images?.[0] ? (
                      <img src={oi.product_images[0]} alt={oi.product_name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{oi.product_name}</div>
                      {oi.variant_name && <div className="text-xs text-muted-foreground">{oi.variant_name}</div>}
                    </div>
                    <div className="text-sm text-right shrink-0">
                      <div className="font-semibold">×{oi.quantity}</div>
                      <div className="text-muted-foreground text-xs"><DualCurrencyInline cents={oi.price_cents} /></div>
                    </div>
                  </div>
                ))}
              </div>
              {orderValue > 0 && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm">
                  <span className="text-muted-foreground">Order Value</span>
                  <span className="font-bold"><DualCurrencyInline cents={orderValue} /></span>
                </div>
              )}
            </div>
          )}

          {/* Tracking update */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Update Tracking</div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid={`button-edit-tracking-${quotation.id}`}>
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
              ) : (
                <Button size="sm" style={{ background: BRAND_COLOR }} className="text-white" onClick={handleSave} data-testid={`button-save-tracking-${quotation.id}`}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Stage</Label>
                <Select
                  value={localTracking.stage}
                  onValueChange={v => setLocalTracking(t => ({ ...t, stage: v as PipelineStage }))}
                  disabled={!editing}
                >
                  <SelectTrigger className="mt-1 h-9" data-testid={`select-stage-${quotation.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => (
                      <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Carrier</Label>
                <Select
                  value={localTracking.carrier}
                  onValueChange={v => setLocalTracking(t => ({ ...t, carrier: v }))}
                  disabled={!editing}
                >
                  <SelectTrigger className="mt-1 h-9" data-testid={`select-carrier-${quotation.id}`}>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Tracking Number</Label>
                <Input
                  value={localTracking.trackingNumber}
                  onChange={e => setLocalTracking(t => ({ ...t, trackingNumber: e.target.value }))}
                  placeholder="e.g. 1Z999AA10123456784"
                  disabled={!editing}
                  className="mt-1 h-9 font-mono"
                  data-testid={`input-tracking-${quotation.id}`}
                />
              </div>
            </div>

            {localTracking.trackingNumber && localTracking.carrier && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{localTracking.carrier}</span>
                <span className="font-mono font-medium">{localTracking.trackingNumber}</span>
                <a
                  href={`https://www.google.com/search?q=${localTracking.carrier}+tracking+${localTracking.trackingNumber}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-0.5"
                  data-testid={`link-track-${quotation.id}`}
                >
                  Track <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorPipeline() {
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "all">("all");
  const [trackingMap, setTrackingMap] = useState<Record<string, TrackingInfo>>({});

  const { data: vendorsData } = useQuery<{ vendors: any[] }>({ queryKey: ["/api/faire/vendors"] });
  const allVendors: any[] = vendorsData?.vendors ?? [];

  const { data: ordersData } = useQuery<{ orders: any[] }>({ queryKey: ["/api/faire/orders"] });
  const allOrders: any[] = ordersData?.orders ?? [];

  useEffect(() => {
    if (allVendors.length > 0 && !selectedVendorId) {
      const stored = localStorage.getItem("vp_vendor_id");
      const match = allVendors.find(v => v.id === stored);
      setSelectedVendorId(match ? stored! : allVendors[0].id);
    }
  }, [allVendors, selectedVendorId]);

  function handleVendorChange(id: string) {
    setSelectedVendorId(id);
    localStorage.setItem("vp_vendor_id", id);
  }

  const vendor = allVendors.find(v => v.id === selectedVendorId);
  const vendorName = vendor?.name ?? "";
  const fulfillerKey = NAME_TO_FULFILLER_ID[vendorName] ?? "";

  const activeQuotations = faireQuotations.filter(
    q => q.fulfiller_id === fulfillerKey && ["ACCEPTED"].includes(q.status)
  );

  function getTracking(id: string): TrackingInfo {
    return trackingMap[id] ?? { carrier: "", trackingNumber: "", stage: "PROCESSING", notes: "" };
  }

  function handleUpdateTracking(id: string, info: Partial<TrackingInfo>) {
    setTrackingMap(prev => ({ ...prev, [id]: { ...getTracking(id), ...info } }));
  }

  const displayed = stageFilter === "all"
    ? activeQuotations
    : activeQuotations.filter(q => getTracking(q.id).stage === stageFilter);

  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => ({
    ...acc,
    [s.key]: activeQuotations.filter(q => getTracking(q.id).stage === s.key).length,
  }), {} as Record<PipelineStage, number>);

  return (
    <div className="py-8 px-6 max-w-screen-xl mx-auto space-y-6">
      <Fade>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">Track active orders and update shipment details</p>
          </div>
          <div className="w-64">
            <Select value={selectedVendorId} onValueChange={handleVendorChange}>
              <SelectTrigger data-testid="select-vendor-pipeline">
                <SelectValue placeholder="Select your company…" />
              </SelectTrigger>
              <SelectContent>
                {allVendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fade>

      <Fade>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PIPELINE_STAGES.map(s => (
            <div key={s.key} className="rounded-xl border bg-card p-4 text-center shadow-sm">
              <div className="text-2xl font-bold font-heading" style={{ color: s.color }}>{stageCounts[s.key]}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <span style={{ color: s.color }}>{s.icon}</span>{s.label}
              </div>
            </div>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl w-fit border flex-wrap">
          <button
            onClick={() => setStageFilter("all")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={stageFilter === "all" ? { background: BRAND_COLOR, color: "#fff" } : { color: "var(--muted-foreground)" }}
            data-testid="filter-all"
          >
            All ({activeQuotations.length})
          </button>
          {PIPELINE_STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => setStageFilter(s.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={stageFilter === s.key ? { background: s.color, color: "#fff" } : { color: "var(--muted-foreground)" }}
              data-testid={`filter-${s.key.toLowerCase()}`}
            >
              {s.label} ({stageCounts[s.key]})
            </button>
          ))}
        </div>
      </Fade>

      <Fade>
        <div className="space-y-4">
          {displayed.length === 0 ? (
            <div className="p-12 text-center border rounded-xl bg-card">
              <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <div className="font-medium text-muted-foreground">No active orders</div>
              <div className="text-sm text-muted-foreground mt-1">Accepted quotations will appear here for tracking.</div>
            </div>
          ) : displayed.map(q => (
            <PipelineCard
              key={q.id}
              quotation={q}
              orders={allOrders}
              tracking={getTracking(q.id)}
              onUpdateTracking={handleUpdateTracking}
            />
          ))}
        </div>
      </Fade>
    </div>
  );
}
