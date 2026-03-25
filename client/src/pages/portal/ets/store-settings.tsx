import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, Store, Save, Search, X, Printer, Package, Shield,
} from "lucide-react";
import {
  POS_PRODUCTS, STORE_SETTINGS,
  type StoreSettings,
} from "@/lib/mock-data-pos-ets";

export default function EtsStoreSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>({ ...STORE_SETTINGS });
  const [quickAddSearch, setQuickAddSearch] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  const quickAddProducts = POS_PRODUCTS.filter(p => settings.quickAddProductIds.includes(p.id));

  const searchResults = useMemo(() => {
    if (!quickAddSearch || quickAddSearch.length < 2) return [];
    const q = quickAddSearch.toLowerCase();
    return POS_PRODUCTS
      .filter(p => !settings.quickAddProductIds.includes(p.id))
      .filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q))
      .slice(0, 5);
  }, [quickAddSearch, settings.quickAddProductIds]);

  function addQuickAddProduct(productId: string) {
    if (settings.quickAddProductIds.length >= 12) {
      toast({ title: "Maximum reached", description: "You can add up to 12 quick-add products", variant: "destructive" });
      return;
    }
    update("quickAddProductIds", [...settings.quickAddProductIds, productId]);
    setQuickAddSearch("");
  }

  function removeQuickAddProduct(productId: string) {
    update("quickAddProductIds", settings.quickAddProductIds.filter(id => id !== productId));
  }

  function saveSettings() {
    Object.assign(STORE_SETTINGS, settings);
    navigator.vibrate?.([100, 50, 100]);
    toast({ title: "Settings Saved", description: "Your store settings have been updated" });
    setHasChanges(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-settings-title">Store Settings</h1>
            <p className="text-xs text-muted-foreground">Configure your store preferences</p>
          </div>
        </div>
        {hasChanges && (
          <Button
            className="gap-1.5 bg-orange-500 hover:bg-orange-600"
            onClick={saveSettings}
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold">Store Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Store Name</label>
              <Input
                value={settings.storeName}
                onChange={e => update("storeName", e.target.value)}
                data-testid="input-store-name"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Phone</label>
              <Input
                value={settings.phone}
                onChange={e => update("phone", e.target.value)}
                data-testid="input-phone"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Address</label>
            <Textarea
              rows={2} value={settings.address}
              onChange={e => update("address", e.target.value)}
              data-testid="input-address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 block">GSTIN</label>
              <Input
                value={settings.gstin}
                onChange={e => update("gstin", e.target.value)}
                placeholder="Not set"
                data-testid="input-gstin"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Printed on receipts. No GST calculation.</p>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1 block">Low Stock Threshold</label>
              <Input
                type="number" min="1" max="100"
                value={settings.lowStockThreshold}
                onChange={e => update("lowStockThreshold", parseInt(e.target.value) || 5)}
                data-testid="input-threshold"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Products below this count show as "Low Stock"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Quick-Add Products</h2>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {settings.quickAddProductIds.length}/12
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">These products appear as quick-tap tiles on the POS billing screen</p>

          <div className="flex flex-wrap gap-2">
            {quickAddProducts.map(p => (
              <Badge key={p.id} variant="secondary" className="text-xs gap-1.5 py-1 pl-2 pr-1">
                <span>{p.emoji}</span>
                <span>{p.name}</span>
                <button
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  onClick={() => removeQuickAddProduct(p.id)}
                  data-testid={`button-remove-quick-${p.id}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {settings.quickAddProductIds.length < 12 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search products to add..."
                value={quickAddSearch} onChange={e => setQuickAddSearch(e.target.value)}
                data-testid="input-quick-add-search"
              />
              {searchResults.length > 0 && (
                <div className="absolute w-full mt-1 border rounded-lg overflow-hidden bg-white shadow-lg z-10">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center justify-between text-sm border-b last:border-0"
                      onClick={() => addQuickAddProduct(p.id)}
                      data-testid={`button-add-quick-${p.id}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{formatINR(p.mrp)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Printer className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold">Receipt Settings</h2>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Auto-print receipt after every sale</p>
              <p className="text-xs text-muted-foreground">If off, shows receipt preview instead</p>
            </div>
            <Switch
              checked={settings.autoPrintReceipt}
              onCheckedChange={v => update("autoPrintReceipt", v)}
              data-testid="switch-auto-print"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gray-50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold">System Information</h2>
          </div>
          <p className="text-xs text-muted-foreground">Read-only information about your store</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Store ID</p>
              <p className="text-sm font-mono font-medium mt-0.5" data-testid="text-store-id">{settings.storeId}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Partner Package</p>
              <Badge className="mt-1 bg-orange-100 text-orange-700 border-0 text-xs" data-testid="text-package">
                {settings.partnerPackage}
              </Badge>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Store Status</p>
              <Badge className="mt-1 bg-green-100 text-green-700 border-0 text-xs capitalize" data-testid="text-status">
                {settings.storeStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
