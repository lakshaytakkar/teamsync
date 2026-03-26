import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Truck, CheckSquare, Tag, AlertTriangle, Printer } from "lucide-react";

const ORDERS = [
  { id: "ORD-2401", client: "Meena Singh", city: "Lucknow", items: 48, status: "QC Pending", value: 125000, china: false },
  { id: "ORD-2402", client: "Anita Sharma", city: "Agra", items: 32, status: "Packed", value: 88000, china: true },
  { id: "ORD-2403", client: "Kiran Patel", city: "Vadodara", items: 60, status: "Dispatched", value: 164000, china: false },
  { id: "ORD-2404", client: "Prashant Yadav", city: "Kanpur", items: 25, status: "QC Passed", value: 72000, china: false },
  { id: "ORD-2405", client: "New Partner", city: "Bhopal", items: 55, status: "QC Pending", value: 145000, china: true },
];

const CHINA_BATCHES = [
  { id: "BATCH-C041", products: 12, units: 480, eta: "Apr 12", status: "In Transit", port: "Nhava Sheva" },
  { id: "BATCH-C042", products: 8, units: 320, eta: "Apr 19", status: "At Port", port: "JNPT" },
  { id: "BATCH-C043", products: 15, units: 600, eta: "May 3", status: "Production", port: "TBD" },
];

const STATUS_COLORS: Record<string, string> = {
  "QC Pending": "bg-amber-100 text-amber-700",
  "QC Passed": "bg-blue-100 text-blue-700",
  "Packed": "bg-purple-100 text-purple-700",
  "Dispatched": "bg-green-100 text-green-700",
};

const QC_ITEMS = [
  "All items match PO quantity",
  "MRP stickers applied on all units",
  "Damaged items removed & documented",
  "Packaging is intact",
  "Product codes verified",
  "Batch number recorded",
];

export default function EtsFulfillmentPortal() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="fulfillment-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-amber-200 mb-1">Fulfillment Center</p>
          <h1 className="text-2xl font-bold" data-testid="text-fulfillment-title">Order Queue & Dispatch</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-amber-200">
            <span><strong className="text-white">{ORDERS.length}</strong> Active Orders</span>
            <span><strong className="text-white">{ORDERS.filter(o => o.status === "QC Pending").length}</strong> QC Pending</span>
            <span><strong className="text-white">{CHINA_BATCHES.length}</strong> China Batches</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" /> Order Queue
              </CardTitle>
              <Badge variant="outline" className="text-xs">{ORDERS.length} orders</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {ORDERS.map((order) => (
              <div
                key={order.id}
                className={`p-3 rounded-xl border ${order.status === "QC Pending" ? "border-amber-200 bg-amber-50/40" : "border-transparent bg-muted/30"}`}
                data-testid={`order-row-${order.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                      {order.china && <Badge variant="outline" className="text-[9px] border-red-200 text-red-600">China Import</Badge>}
                    </div>
                    <p className="text-sm font-medium">{order.client} — {order.city}</p>
                  </div>
                  <Badge className={`text-[10px] ${STATUS_COLORS[order.status]}`} variant="outline">{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{order.items} items · ₹{order.value.toLocaleString("en-IN")}</span>
                  {order.status === "QC Pending" && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" data-testid={`start-qc-${order.id}`}>
                      <CheckSquare className="w-3 h-3" /> Start QC
                    </Button>
                  )}
                  {order.status === "QC Passed" && (
                    <Button size="sm" className="h-6 text-[10px] gap-1 bg-amber-500 hover:bg-amber-600 text-white" data-testid={`dispatch-${order.id}`}>
                      <Truck className="w-3 h-3" /> Dispatch
                    </Button>
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
                <Tag className="w-4 h-4 text-amber-500" /> MRP Sticker Print
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {ORDERS.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between" data-testid={`sticker-${order.id}`}>
                  <div>
                    <p className="text-sm font-medium">{order.client}</p>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" data-testid={`print-stickers-${order.id}`}>
                    <Printer className="w-3 h-3" /> Print
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" /> China Batches
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {CHINA_BATCHES.map((batch) => (
                <div key={batch.id} className="p-2.5 rounded-lg bg-muted/40" data-testid={`batch-${batch.id}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold">{batch.id}</span>
                    <Badge variant="outline" className={`text-[10px] ${batch.status === "In Transit" ? "border-blue-200 text-blue-700" : batch.status === "At Port" ? "border-green-200 text-green-700" : "border-gray-200 text-gray-500"}`}>
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{batch.products} products · {batch.units} units · ETA {batch.eta}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function EtsFulfillmentQC() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">QC Checklist</h1>
      {ORDERS.filter(o => o.status === "QC Pending" || o.status === "QC Passed").map((order) => (
        <Card key={order.id} className="border-0 shadow-sm" data-testid={`qc-card-${order.id}`}>
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-sm">{order.id} — {order.client}</CardTitle>
                <p className="text-xs text-muted-foreground">{order.city} · {order.items} items</p>
              </div>
              <Badge className={STATUS_COLORS[order.status] || ""} variant="outline">{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {QC_ITEMS.map((item, i) => {
                const key = `${order.id}-${i}`;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Checkbox
                      checked={!!checked[key]}
                      onCheckedChange={(v) => setChecked(prev => ({ ...prev, [key]: !!v }))}
                      data-testid={`qc-item-${order.id}-${i}`}
                    />
                    <span className={`text-sm ${checked[key] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                  </div>
                );
              })}
            </div>
            <Button
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white"
              disabled={QC_ITEMS.some((_, i) => !checked[`${order.id}-${i}`])}
              data-testid={`mark-qc-done-${order.id}`}
            >
              Mark QC Complete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EtsFulfillmentDispatch() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Dispatch Log</h1>
      <div className="space-y-3">
        {ORDERS.map((order) => (
          <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white" data-testid={`dispatch-row-${order.id}`}>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{order.id} — {order.client}</p>
              <p className="text-sm text-muted-foreground">{order.items} items · ₹{order.value.toLocaleString("en-IN")} · {order.city}</p>
            </div>
            <Badge className={STATUS_COLORS[order.status] || ""} variant="outline">{order.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EtsFulfillmentStickers() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">MRP Sticker Printing</h1>
        <p className="text-sm text-muted-foreground">Generate and print MRP stickers for all packed orders</p>
      </div>
      <div className="space-y-3">
        {ORDERS.map((order) => (
          <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white" data-testid={`sticker-row-${order.id}`}>
            <Tag className="w-8 h-8 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">{order.client} ({order.id})</p>
              <p className="text-sm text-muted-foreground">{order.items} labels needed · {order.city}</p>
            </div>
            <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 text-white" data-testid={`print-${order.id}`}>
              <Printer className="w-3.5 h-3.5" /> Print Labels
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EtsFulfillmentBatches() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">China Batch Consolidation</h1>
      <div className="space-y-4">
        {CHINA_BATCHES.map((batch) => (
          <Card key={batch.id} className="border-0 shadow-sm" data-testid={`batch-card-${batch.id}`}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold font-mono">{batch.id}</p>
                  <p className="text-sm text-muted-foreground">Port: {batch.port}</p>
                </div>
                <Badge variant="outline" className={`${batch.status === "In Transit" ? "border-blue-200 text-blue-700 bg-blue-50" : batch.status === "At Port" ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}`}>
                  {batch.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xl font-bold">{batch.products}</p>
                  <p className="text-xs text-muted-foreground">SKUs</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xl font-bold">{batch.units}</p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xl font-bold">{batch.eta}</p>
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
