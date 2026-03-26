import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tag, CreditCard, CheckSquare, Upload, AlertTriangle, Search,
  Edit2, ChevronRight, ChevronDown, Plus, Trash2,
  ArrowUpDown, ArrowLeft, ShieldAlert, ShieldCheck, ShieldX, XCircle,
} from "lucide-react";
import {
  CATALOG_PRODUCTS, CATALOG_ZONE_TREE, getCatalogStats, SOURCE_LABELS,
  SOURCE_COLORS, ALL_PRODUCT_TAGS,
  type CatalogProduct, type ProductSource, type ProductComplianceStatus,
  type ProductLabelStatus, type ProductTag, type CatalogZone,
} from "@/lib/mock-data-product-catalog";
import { calculateEtsPrices, ETS_CATEGORY_DUTY_RATES } from "@/lib/mock-data-ets";

const ZONE_NAME: Record<string, string> = {};
const CAT_NAME: Record<string, string> = {};
const SUBCAT_NAME: Record<string, string> = {};
for (const z of CATALOG_ZONE_TREE) {
  ZONE_NAME[z.id] = z.name;
  for (const c of z.categories) {
    CAT_NAME[c.id] = c.name;
    for (const sc of c.subcategories) {
      SUBCAT_NAME[sc.id] = sc.name;
    }
  }
}

function ComplianceBadge({ status }: { status?: ProductComplianceStatus }) {
  if (!status) return <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">Unset</Badge>;
  if (status === "safe") return <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Safe</Badge>;
  if (status === "restricted") return <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Restricted</Badge>;
  return <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Banned</Badge>;
}

function SourceBadge({ source }: { source: ProductSource }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${SOURCE_COLORS[source]}`}>
      {SOURCE_LABELS[source].split(" ")[0]}
    </Badge>
  );
}

export default function EtsProductPortal() {
  const stats = useMemo(() => getCatalogStats(), []);

  const sourceRows = Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="product-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-pink-200 mb-1">Product Team</p>
          <h1 className="text-2xl font-bold" data-testid="text-product-title">Catalog Health</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-pink-100">
            <span><strong className="text-white">{stats.total}</strong> Total SKUs</span>
            <span><strong className="text-white">{stats.compliance.safe}</strong> Safe</span>
            <span><strong className="text-amber-300">{stats.compliance.restricted}</strong> Restricted</span>
            <span><strong className="text-red-300">{stats.compliance.banned}</strong> Banned</span>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm" data-testid="kpi-total">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        {stats.compliance.banned > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500" data-testid="kpi-banned">
            <CardContent className="p-5">
              <div className="flex items-center gap-1.5 text-red-600 mb-1">
                <ShieldX className="w-4 h-4" />
                <p className="text-sm font-semibold">Banned Products</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.compliance.banned}</p>
              <p className="text-xs text-muted-foreground mt-1">Must be removed from catalog</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm" data-testid="kpi-restricted">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <p className="text-sm font-medium">Restricted</p>
            </div>
            <p className="text-3xl font-bold">{stats.compliance.restricted}</p>
            <p className="text-xs text-muted-foreground mt-1">Need certification</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" data-testid="kpi-safe">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 text-green-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-sm font-medium">Safe</p>
            </div>
            <p className="text-3xl font-bold">{stats.compliance.safe}</p>
            <p className="text-xs text-muted-foreground mt-1">Ready to list</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Products by Source</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {sourceRows.map(([src, count]) => (
              <div key={src} className="flex items-center gap-3" data-testid={`source-row-${src}`}>
                <div className="w-32 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${SOURCE_COLORS[src as ProductSource]}`}>
                    {SOURCE_LABELS[src as ProductSource]}
                  </Badge>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full transition-all"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Avg Margin by Origin</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex justify-between items-center" data-testid="margin-china">
                <span className="text-sm">China Products</span>
                <span className="font-bold text-pink-600">{stats.avgMarginChina}%</span>
              </div>
              <div className="flex justify-between items-center" data-testid="margin-india">
                <span className="text-sm">India Products</span>
                <span className="font-bold text-pink-600">{stats.avgMarginIndia}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { label: "No MRP assigned", count: stats.missingMrp },
                { label: "No barcode", count: stats.missingBarcode },
                { label: "No category", count: stats.missingCategory },
                { label: "No compliance", count: stats.missingCompliance },
              ].map(({ label, count }) => (
                <div key={label} className="flex justify-between items-center text-sm" data-testid={`missing-${label.replace(/\s+/g, "-").toLowerCase()}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant="outline" className={count > 0 ? "border-amber-300 text-amber-700" : "border-green-300 text-green-700"}>
                    {count > 0 ? count : "✓"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type SortKey = "name" | "zoneId" | "source" | "exwPriceYuan" | "landedCostInr" | "partnerPriceInr" | "suggestedMrp" | "marginPercent" | "complianceStatus" | "labelStatus" | "barcode";

function sortProducts(list: CatalogProduct[], key: SortKey, dir: "asc" | "desc"): CatalogProduct[] {
  return [...list].sort((a, b) => {
    let av: string | number | undefined;
    let bv: string | number | undefined;
    if (key === "exwPriceYuan") {
      av = a.exwPriceYuan ?? a.wholesalePriceInr ?? 0;
      bv = b.exwPriceYuan ?? b.wholesalePriceInr ?? 0;
    } else {
      av = a[key] as string | number | undefined;
      bv = b[key] as string | number | undefined;
    }
    av = av ?? (typeof av === "string" ? "" : 0);
    bv = bv ?? (typeof bv === "string" ? "" : 0);
    const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
    return dir === "asc" ? cmp : -cmp;
  });
}

export function EtsProductList() {
  const [products, setProducts] = useState<CatalogProduct[]>(CATALOG_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");
  const [filterMissing, setFilterMissing] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const categoryOptions = useMemo(() => {
    if (filterZone !== "all") {
      const zone = CATALOG_ZONE_TREE.find(z => z.id === filterZone);
      return zone ? zone.categories.map(c => ({ id: c.id, name: c.name, zoneName: zone.name })) : [];
    }
    return CATALOG_ZONE_TREE.flatMap(z => z.categories.map(c => ({ id: c.id, name: c.name, zoneName: z.name })));
  }, [filterZone]);

  function handleSaveProduct(saved: CatalogProduct) {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditingProduct(null);
  }

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode || "").includes(q) ||
          (p.id || "").toLowerCase().includes(q) ||
          (p.zoneId ? ZONE_NAME[p.zoneId] ?? "" : "").toLowerCase().includes(q) ||
          (p.categoryId ? CAT_NAME[p.categoryId] ?? "" : "").toLowerCase().includes(q) ||
          (p.subcategoryId ? SUBCAT_NAME[p.subcategoryId] ?? "" : "").toLowerCase().includes(q)
      );
    }
    if (filterSource !== "all") list = list.filter((p) => p.source === filterSource);
    if (filterZone !== "all") list = list.filter((p) => p.zoneId === filterZone);
    if (filterCategory !== "all") list = list.filter((p) => p.categoryId === filterCategory);
    if (filterCompliance !== "all") {
      if (filterCompliance === "unset") list = list.filter((p) => !p.complianceStatus);
      else list = list.filter((p) => p.complianceStatus === filterCompliance);
    }
    if (filterMissing === "no-mrp") list = list.filter((p) => !p.suggestedMrp);
    if (filterMissing === "no-barcode") list = list.filter((p) => !p.barcode);
    if (filterMissing === "no-category") list = list.filter((p) => !p.zoneId);
    if (filterMissing === "no-compliance") list = list.filter((p) => !p.complianceStatus);

    return sortProducts(list, sortKey, sortDir);
  }, [products, search, filterSource, filterZone, filterCategory, filterCompliance, filterMissing, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  if (showForm) {
    return (
      <EtsProductFormPage
        product={editingProduct}
        onBack={() => { setShowForm(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
      />
    );
  }

  const cols: { label: string; key: SortKey | null }[] = [
    { label: "Product", key: "name" },
    { label: "Zone / Category", key: "zoneId" },
    { label: "Source", key: "source" },
    { label: "EXW / Wholesale", key: "exwPriceYuan" },
    { label: "Landed ₹", key: "landedCostInr" },
    { label: "Partner ₹", key: "partnerPriceInr" },
    { label: "MRP", key: "suggestedMrp" },
    { label: "Margin", key: "marginPercent" },
    { label: "Compliance", key: "complianceStatus" },
    { label: "Label", key: "labelStatus" },
    { label: "Barcode", key: "barcode" },
    { label: "", key: null },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="product-list-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Product List</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {CATALOG_PRODUCTS.length} products</p>
        </div>
        <Button
          className="bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          data-testid="button-add-product"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, barcode, ID, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-product-search"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-44" data-testid="filter-source">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {(Object.keys(SOURCE_LABELS) as ProductSource[]).map((s) => (
              <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterZone} onValueChange={v => { setFilterZone(v); setFilterCategory("all"); }}>
          <SelectTrigger className="w-44" data-testid="filter-zone">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {CATALOG_ZONE_TREE.map(z => (
              <SelectItem key={z.id} value={z.id}>{z.icon} {z.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48" data-testid="filter-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <span className="text-xs text-muted-foreground mr-1">{c.zoneName.split(" ")[0]}</span>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCompliance} onValueChange={setFilterCompliance}>
          <SelectTrigger className="w-40" data-testid="filter-compliance">
            <SelectValue placeholder="All Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Compliance</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="unset">Unset</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMissing} onValueChange={setFilterMissing}>
          <SelectTrigger className="w-40" data-testid="filter-missing">
            <SelectValue placeholder="Missing Fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="no-mrp">Missing MRP</SelectItem>
            <SelectItem value="no-barcode">Missing Barcode</SelectItem>
            <SelectItem value="no-category">Missing Category</SelectItem>
            <SelectItem value="no-compliance">Missing Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50/80">
            <tr>
              {cols.map(({ label, key }) => (
                <th
                  key={label || "actions"}
                  className={`px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap ${key ? "cursor-pointer hover:text-foreground select-none" : ""} ${sortKey === key ? "text-foreground" : ""}`}
                  onClick={() => key && toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {key && <ArrowUpDown className={`w-3 h-3 ${sortKey === key ? "opacity-100 text-pink-500" : "opacity-40"}`} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={`hover:bg-gray-50/60 ${p.complianceStatus === "banned" ? "bg-red-50/40" : ""}`}
                data-testid={`product-row-${p.id}`}
              >
                <td className="px-3 py-2.5 max-w-48">
                  <p className="font-medium text-sm truncate" title={p.name}>{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.id}</p>
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                  {p.zoneId ? (
                    <div>
                      <p className="text-muted-foreground">{ZONE_NAME[p.zoneId] ?? p.zoneId}</p>
                      {p.categoryId && <p className="font-medium text-foreground">{CAT_NAME[p.categoryId]}</p>}
                      {p.subcategoryId && <p className="text-[10px] text-muted-foreground/70">{SUBCAT_NAME[p.subcategoryId]}</p>}
                    </div>
                  ) : <span className="text-amber-500">—</span>}
                </td>
                <td className="px-3 py-2.5"><SourceBadge source={p.source} /></td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {p.exwPriceYuan != null ? `¥${p.exwPriceYuan}` : p.wholesalePriceInr != null ? `₹${p.wholesalePriceInr}` : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs">{p.landedCostInr != null ? `₹${p.landedCostInr}` : <span className="text-amber-500">—</span>}</td>
                <td className="px-3 py-2.5 text-xs">{p.partnerPriceInr != null ? `₹${p.partnerPriceInr}` : "—"}</td>
                <td className="px-3 py-2.5 text-xs font-semibold">{p.suggestedMrp != null ? `₹${p.suggestedMrp}` : <span className="text-amber-500">Missing</span>}</td>
                <td className="px-3 py-2.5 text-xs">
                  {p.marginPercent != null ? (
                    <span className={p.marginPercent < 30 ? "text-red-600" : "text-green-600"}>{p.marginPercent}%</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5"><ComplianceBadge status={p.complianceStatus} /></td>
                <td className="px-3 py-2.5">
                  <Badge variant="outline" className={`text-[10px] ${p.labelStatus === "english" ? "border-green-200 text-green-700" : p.labelStatus === "chinese" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"}`}>
                    {p.labelStatus === "needs_relabel" ? "Relabel" : p.labelStatus === "chinese" ? "Chinese" : "English"}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{p.barcode ?? <span className="text-amber-500">Missing</span>}</td>
                <td className="px-3 py-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => { setEditingProduct(p); setShowForm(true); }}
                    data-testid={`edit-product-${p.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No products match the current filters</div>
        )}
      </div>
    </div>
  );
}

function EtsProductFormPage({ product, onBack, onSave }: { product: CatalogProduct | null; onBack: () => void; onSave: (p: CatalogProduct) => void }) {
  const isNew = product === null;
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    zoneId: product?.zoneId ?? "",
    categoryId: product?.categoryId ?? "",
    subcategoryId: product?.subcategoryId ?? "",
    barcode: product?.barcode ?? "",
    imageUrl: product?.imageUrl ?? "",
    tags: product?.tags ?? [] as ProductTag[],
    source: product?.source ?? ("china_haoduobao" as ProductSource),
    supplierName: product?.supplierName ?? "",
    exwPriceYuan: product?.exwPriceYuan ?? 0,
    wholesalePriceInr: product?.wholesalePriceInr ?? 0,
    moq: product?.moq ?? 6,
    unitsPerCarton: product?.unitsPerCarton ?? 12,
    cartonLengthCm: product?.cartonLengthCm ?? 40,
    cartonWidthCm: product?.cartonWidthCm ?? 30,
    cartonHeightCm: product?.cartonHeightCm ?? 30,
    mrpOverride: product?.suggestedMrp ?? undefined as number | undefined,
    complianceStatus: product?.complianceStatus ?? ("safe" as ProductComplianceStatus),
    bisRequired: product?.bisRequired ?? false,
    complianceNotes: product?.complianceNotes ?? "",
    labelStatus: product?.labelStatus ?? ("english" as ProductLabelStatus),
  });

  const isChina = formData.source.startsWith("china_");

  const pricing = useMemo(() => {
    if (!isChina || !formData.exwPriceYuan) return null;
    const dutyKey = Object.keys(ETS_CATEGORY_DUTY_RATES).find(k =>
      formData.categoryId?.includes(k) || formData.zoneId?.includes(k)
    );
    const rates = dutyKey ? ETS_CATEGORY_DUTY_RATES[dutyKey as keyof typeof ETS_CATEGORY_DUTY_RATES] : { duty: 15, igst: 18 };
    return calculateEtsPrices({
      exwPriceYuan: formData.exwPriceYuan,
      unitsPerCarton: formData.unitsPerCarton,
      cartonLengthCm: formData.cartonLengthCm,
      cartonWidthCm: formData.cartonWidthCm,
      cartonHeightCm: formData.cartonHeightCm,
      categoryDutyPercent: rates.duty,
      categoryIgstPercent: rates.igst,
      exchangeRate: 12.0,
      sourcingCommission: formData.source === "china_haoduobao" ? 3 : 5,
      freightPerCbm: 8000,
      insurancePercent: 0.5,
      swSurchargePercent: 10,
      ourMarkupPercent: 25,
      targetStoreMargin: 35,
    });
  }, [formData.exwPriceYuan, formData.source, formData.unitsPerCarton, formData.cartonLengthCm, formData.cartonWidthCm, formData.cartonHeightCm, formData.categoryId, formData.zoneId, isChina]);

  const selectedZone = CATALOG_ZONE_TREE.find(z => z.id === formData.zoneId);
  const selectedCat = selectedZone?.categories.find(c => c.id === formData.categoryId);

  function updateField<K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    const saved: CatalogProduct = {
      id: product?.id ?? `PRD-NEW-${Date.now()}`,
      name: formData.name || "Untitled Product",
      description: formData.description,
      zoneId: formData.zoneId || undefined,
      categoryId: formData.categoryId || undefined,
      subcategoryId: formData.subcategoryId || undefined,
      barcode: formData.barcode || undefined,
      imageUrl: formData.imageUrl || undefined,
      tags: formData.tags,
      source: formData.source,
      supplierName: formData.supplierName,
      exwPriceYuan: isChina ? (formData.exwPriceYuan || undefined) : undefined,
      wholesalePriceInr: !isChina ? (formData.wholesalePriceInr || undefined) : undefined,
      moq: formData.moq,
      unitsPerCarton: formData.unitsPerCarton,
      cartonLengthCm: formData.cartonLengthCm,
      cartonWidthCm: formData.cartonWidthCm,
      cartonHeightCm: formData.cartonHeightCm,
      landedCostInr: pricing ? pricing.totalLandedCost : (!isChina && formData.wholesalePriceInr ? Math.round(formData.wholesalePriceInr * 1.2) : undefined),
      partnerPriceInr: pricing ? pricing.storeLandingPrice : (!isChina && formData.wholesalePriceInr ? Math.round(formData.wholesalePriceInr * 1.2 * 1.25) : undefined),
      suggestedMrp: formData.mrpOverride ?? (pricing ? pricing.suggestedMrp : undefined),
      marginPercent: pricing ? pricing.storeMarginPercent : undefined,
      complianceStatus: formData.complianceStatus,
      bisRequired: formData.bisRequired,
      complianceNotes: formData.complianceNotes || undefined,
      labelStatus: formData.labelStatus,
    };
    onSave(saved);
  }

  function toggleTag(tag: ProductTag) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="product-form-page">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-product">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isNew ? "Add New Product" : "Edit Product"}</h1>
          {product && <p className="text-sm text-muted-foreground">{product.id}</p>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="basic" data-testid="tab-basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="sourcing" data-testid="tab-sourcing">Sourcing</TabsTrigger>
          <TabsTrigger value="pricing" data-testid="tab-pricing">Pricing</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g. Non-Stick Granite Frying Pan 26cm" data-testid="input-product-name" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => updateField("description", e.target.value)} rows={3} placeholder="Product description..." data-testid="input-product-description" />
              </div>
              <div className="space-y-1.5">
                <Label>Zone *</Label>
                <Select value={formData.zoneId} onValueChange={v => { updateField("zoneId", v); updateField("categoryId", ""); updateField("subcategoryId", ""); }}>
                  <SelectTrigger data-testid="select-zone">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATALOG_ZONE_TREE.map(z => (
                      <SelectItem key={z.id} value={z.id}>{z.icon} {z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={formData.categoryId} onValueChange={v => { updateField("categoryId", v); updateField("subcategoryId", ""); }} disabled={!formData.zoneId}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedZone?.categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subcategory</Label>
                <Select value={formData.subcategoryId} onValueChange={v => updateField("subcategoryId", v)} disabled={!formData.categoryId}>
                  <SelectTrigger data-testid="select-subcategory">
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCat?.subcategories.map(sc => (
                      <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Barcode (EAN-13)</Label>
                <Input id="barcode" value={formData.barcode} onChange={e => updateField("barcode", e.target.value)} placeholder="8901234567890" data-testid="input-barcode" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={e => updateField("imageUrl", e.target.value)} placeholder="https://..." data-testid="input-image-url" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PRODUCT_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${formData.tags.includes(tag) ? "bg-pink-100 border-pink-300 text-pink-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("sourcing")} data-testid="button-next-sourcing">Next: Sourcing →</Button>
          </div>
        </TabsContent>

        <TabsContent value="sourcing" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Source *</Label>
                <Select value={formData.source} onValueChange={v => updateField("source", v as ProductSource)}>
                  <SelectTrigger data-testid="select-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SOURCE_LABELS) as ProductSource[]).map(s => (
                      <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input id="supplier" value={formData.supplierName} onChange={e => updateField("supplierName", e.target.value)} placeholder="e.g. Haoduobao Industrial" data-testid="input-supplier" />
              </div>
              {isChina ? (
                <div className="space-y-1.5">
                  <Label htmlFor="exw">EXW Price (¥ Yuan) *</Label>
                  <Input id="exw" type="number" value={formData.exwPriceYuan} onChange={e => updateField("exwPriceYuan", Number(e.target.value))} placeholder="18.50" data-testid="input-exw-yuan" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="wholesale">Wholesale Price (₹ INR) *</Label>
                  <Input id="wholesale" type="number" value={formData.wholesalePriceInr} onChange={e => updateField("wholesalePriceInr", Number(e.target.value))} placeholder="180" data-testid="input-wholesale-inr" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="moq">Minimum Order Qty (MOQ)</Label>
                <Input id="moq" type="number" value={formData.moq} onChange={e => updateField("moq", Number(e.target.value))} data-testid="input-moq" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upc">Units per Carton</Label>
                <Input id="upc" type="number" value={formData.unitsPerCarton} onChange={e => updateField("unitsPerCarton", Number(e.target.value))} data-testid="input-units-per-carton" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Carton Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Length", key: "cartonLengthCm" as const, testId: "input-carton-length" },
                    { label: "Width", key: "cartonWidthCm" as const, testId: "input-carton-width" },
                    { label: "Height", key: "cartonHeightCm" as const, testId: "input-carton-height" },
                  ].map(({ label, key, testId }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input type="number" value={formData[key]} onChange={e => updateField(key, Number(e.target.value))} data-testid={testId} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("basic")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("pricing")} data-testid="button-next-pricing">Next: Pricing →</Button>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {isChina && pricing ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">Auto-calculated from EXW price using global price engine settings.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "FOB Price (¥)", value: `¥${pricing.fobPriceYuan}` },
                      { label: "FOB Price (₹)", value: `₹${pricing.fobPriceInr}` },
                      { label: "Freight per Unit", value: `₹${pricing.freightPerUnit}` },
                      { label: "CIF Price (₹)", value: `₹${pricing.cifPriceInr}` },
                      { label: "Customs Duty", value: `₹${pricing.customsDuty}` },
                      { label: "IGST", value: `₹${pricing.igst}` },
                      { label: "Total Landed Cost", value: `₹${pricing.totalLandedCost}`, highlight: true },
                      { label: "Partner Price (with markup)", value: `₹${pricing.storeLandingPrice}`, highlight: true },
                      { label: "Suggested MRP", value: `₹${pricing.suggestedMrp}`, highlight: true },
                      { label: "Partner Margin", value: `${pricing.storeMarginPercent}%`, highlight: pricing.marginWarning },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className={`flex justify-between items-center py-2 border-b last:border-0 ${highlight ? "font-semibold" : ""}`} data-testid={`pricing-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className={`text-sm ${highlight ? "" : "text-muted-foreground"}`}>{label}</span>
                        <span className={highlight ? "text-pink-600" : ""}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label htmlFor="mrp-override">Override Suggested MRP (₹)</Label>
                    <Input
                      id="mrp-override"
                      type="number"
                      value={formData.mrpOverride ?? ""}
                      onChange={e => updateField("mrpOverride", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder={`Suggested: ₹${pricing.suggestedMrp}`}
                      data-testid="input-mrp-override"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use the suggested MRP above</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isChina ? "Enter EXW price in the Sourcing tab to see auto-calculated pricing." : "For India-sourced products, pricing is based on the wholesale price plus your markup."}
                  </p>
                  {!isChina && formData.wholesalePriceInr > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Wholesale Price", value: `₹${formData.wholesalePriceInr}` },
                        { label: "Landed Cost (est.)", value: `₹${Math.round(formData.wholesalePriceInr * 1.2)}` },
                        { label: "Partner Price (+25% markup)", value: `₹${Math.round(formData.wholesalePriceInr * 1.2 * 1.25)}`, highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className={`flex justify-between items-center py-2 border-b last:border-0 ${highlight ? "font-semibold" : ""}`}>
                          <span className={`text-sm ${highlight ? "" : "text-muted-foreground"}`}>{label}</span>
                          <span className={highlight ? "text-pink-600" : ""}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="mrp-manual">Suggested MRP (₹)</Label>
                    <Input id="mrp-manual" type="number" value={formData.mrpOverride ?? ""} onChange={e => updateField("mrpOverride", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 299" data-testid="input-mrp-manual" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("sourcing")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setActiveTab("compliance")} data-testid="button-next-compliance">Next: Compliance →</Button>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              {formData.complianceStatus === "banned" && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200" data-testid="banned-warning">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">This product is marked as BANNED</p>
                    <p className="text-xs text-red-600 mt-1">Banned products cannot appear in the partner catalog. Remove or resolve the compliance issue before listing.</p>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Compliance Status *</Label>
                <Select value={formData.complianceStatus} onValueChange={v => updateField("complianceStatus", v as ProductComplianceStatus)}>
                  <SelectTrigger data-testid="select-compliance-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">✅ Safe — can be listed</SelectItem>
                    <SelectItem value="restricted">⚠️ Restricted — needs certification</SelectItem>
                    <SelectItem value="banned">🚫 Banned — must not be listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bis"
                  checked={formData.bisRequired}
                  onCheckedChange={v => updateField("bisRequired", Boolean(v))}
                  data-testid="checkbox-bis"
                />
                <Label htmlFor="bis">BIS Certification Required</Label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compliance-notes">Compliance Notes</Label>
                <Textarea
                  id="compliance-notes"
                  value={formData.complianceNotes}
                  onChange={e => updateField("complianceNotes", e.target.value)}
                  rows={3}
                  placeholder="e.g. BIS certification mandatory for toys, do not list until certified"
                  data-testid="input-compliance-notes"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label Status</Label>
                <Select value={formData.labelStatus} onValueChange={v => updateField("labelStatus", v as ProductLabelStatus)}>
                  <SelectTrigger data-testid="select-label-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English — ready</SelectItem>
                    <SelectItem value="chinese">Chinese — needs English label</SelectItem>
                    <SelectItem value="needs_relabel">Needs Relabelling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setActiveTab("pricing")}>← Back</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSave} data-testid="button-save-product">
              {isNew ? "Add Product" : "Save Changes"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type TreeNodeState = Record<string, boolean>;

export function EtsProductCategories() {
  const [expanded, setExpanded] = useState<TreeNodeState>({});
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [zones, setZones] = useState<CatalogZone[]>(CATALOG_ZONE_TREE);

  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddCatFor, setShowAddCatFor] = useState<string | null>(null);
  const [showAddSubcatFor, setShowAddSubcatFor] = useState<string | null>(null);
  const [addInput, setAddInput] = useState("");

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;
  const selectedCat = selectedZone?.categories.find(c => c.id === selectedCatId) ?? null;

  const totalProducts = CATALOG_PRODUCTS.length;
  function zoneCount(zoneId: string) { return CATALOG_PRODUCTS.filter(p => p.zoneId === zoneId).length; }
  function catCount(zoneId: string, catId: string) { return CATALOG_PRODUCTS.filter(p => p.zoneId === zoneId && p.categoryId === catId).length; }
  function subcatCount(scId: string) { return CATALOG_PRODUCTS.filter(p => p.subcategoryId === scId).length; }

  function handleAddZone() {
    if (!addInput.trim()) return;
    const id = `zone_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => [...prev, { id, name: addInput.trim(), icon: "📦", description: "", categories: [] }]);
    setShowAddZone(false);
    setAddInput("");
  }

  function handleAddCategory() {
    if (!addInput.trim() || !showAddCatFor) return;
    const zoneId = showAddCatFor;
    const id = `${zoneId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => prev.map(z => z.id === zoneId
      ? { ...z, categories: [...z.categories, { id, name: addInput.trim(), subcategories: [] }] }
      : z
    ));
    setShowAddCatFor(null);
    setAddInput("");
  }

  function handleAddSubcategory() {
    if (!addInput.trim() || !showAddSubcatFor) return;
    const catId = showAddSubcatFor;
    const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] }
        : c
      ),
    })));
    setShowAddSubcatFor(null);
    setAddInput("");
  }

  function handleSaveSubcatEdit(catId: string) {
    if (!editInput.trim() || !editingSubcatId) return;
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: c.subcategories.map(sc => sc.id === editingSubcatId ? { ...sc, name: editInput.trim() } : sc) }
        : c
      ),
    })));
    setEditingSubcatId(null);
    setEditInput("");
  }

  function handleSaveZoneEdit() {
    if (!editInput.trim() || !editingZoneId) return;
    setZones(prev => prev.map(z => z.id === editingZoneId ? { ...z, name: editInput.trim() } : z));
    setEditingZoneId(null);
    setEditInput("");
  }

  function handleSaveCatEdit() {
    if (!editInput.trim() || !editingCatId || !selectedZone) return;
    setZones(prev => prev.map(z => z.id === selectedZone.id
      ? { ...z, categories: z.categories.map(c => c.id === editingCatId ? { ...c, name: editInput.trim() } : c) }
      : z
    ));
    setEditingCatId(null);
    setEditInput("");
  }

  function handleDeleteZone(zoneId: string) {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    if (selectedZoneId === zoneId) { setSelectedZoneId(null); setSelectedCatId(null); }
  }

  function handleDeleteCategory(zoneId: string, catId: string) {
    setZones(prev => prev.map(z => z.id === zoneId
      ? { ...z, categories: z.categories.filter(c => c.id !== catId) }
      : z
    ));
    if (selectedCatId === catId) setSelectedCatId(null);
  }

  function handleDeleteSubcategory(catId: string, scId: string) {
    setZones(prev => prev.map(z => ({
      ...z,
      categories: z.categories.map(c => c.id === catId
        ? { ...c, subcategories: c.subcategories.filter(sc => sc.id !== scId) }
        : c
      ),
    })));
  }

  function startEditZone(zone: CatalogZone) {
    setEditingZoneId(zone.id);
    setEditingCatId(null);
    setEditInput(zone.name);
  }

  function startEditCat(cat: { id: string; name: string }) {
    setEditingCatId(cat.id);
    setEditingZoneId(null);
    setEditInput(cat.name);
  }

  return (
    <div className="px-16 lg:px-24 py-6" data-testid="categories-page">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Category Manager</h1>
          <p className="text-sm text-muted-foreground">{totalProducts} products across {zones.length} zones</p>
        </div>
        <Button
          className="bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => { setShowAddZone(true); setShowAddCatFor(null); setShowAddSubcatFor(null); setAddInput(""); }}
          data-testid="button-add-zone"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Zone
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-1" data-testid="category-tree">
          {zones.map(zone => (
            <div key={zone.id}>
              <button
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedZoneId === zone.id && !selectedCatId ? "bg-pink-50 text-pink-700" : "hover:bg-gray-50"}`}
                onClick={() => { toggleExpand(zone.id); setSelectedZoneId(zone.id); setSelectedCatId(null); }}
                data-testid={`zone-${zone.id}`}
              >
                {expanded[zone.id] ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                <span>{zone.icon}</span>
                <span className="flex-1 text-left truncate">{zone.name}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{zoneCount(zone.id)}</Badge>
              </button>
              {expanded[zone.id] && (
                <div className="ml-5 space-y-0.5 mt-0.5">
                  {zone.categories.map(cat => (
                    <div key={cat.id}>
                      <button
                        type="button"
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCatId === cat.id ? "bg-pink-50 text-pink-700 font-medium" : "hover:bg-gray-50 text-muted-foreground"}`}
                        onClick={() => { setSelectedZoneId(zone.id); setSelectedCatId(cat.id); setExpanded(prev => ({ ...prev, [`cat-${cat.id}`]: !prev[`cat-${cat.id}`] })); }}
                        data-testid={`cat-${cat.id}`}
                      >
                        {expanded[`cat-${cat.id}`] ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 text-left truncate">{cat.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{catCount(zone.id, cat.id)}</Badge>
                      </button>
                      {expanded[`cat-${cat.id}`] && (
                        <div className="ml-5 space-y-0.5 mt-0.5">
                          {cat.subcategories.map(sc => (
                            <div key={sc.id} className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground rounded-lg hover:bg-gray-50" data-testid={`subcat-${sc.id}`}>
                              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                              <span className="flex-1">{sc.name}</span>
                              <span className="text-[10px]">{subcatCount(sc.id)}</span>
                            </div>
                          ))}
                          {showAddSubcatFor === cat.id ? (
                            <div className="p-2 rounded-lg border border-pink-200 bg-pink-50/50 space-y-1.5" data-testid={`add-subcat-form-${cat.id}`}>
                              <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Subcategory name..." className="h-7 text-xs" data-testid="input-subcat-name"
                                onKeyDown={e => { if (e.key === "Enter") handleAddSubcategory(); if (e.key === "Escape") { setShowAddSubcatFor(null); setAddInput(""); } }} />
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 text-xs bg-pink-500 hover:bg-pink-600 text-white px-2" onClick={handleAddSubcategory} data-testid="button-save-subcat">Add</Button>
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => { setShowAddSubcatFor(null); setAddInput(""); }}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <button type="button" className="flex items-center gap-1.5 px-3 py-1 text-xs text-pink-600 hover:bg-pink-50 rounded-lg w-full"
                              onClick={() => { setShowAddSubcatFor(cat.id); setShowAddCatFor(null); setShowAddZone(false); setAddInput(""); }}
                              data-testid={`add-subcat-${cat.id}`}>
                              <Plus className="w-3 h-3" /> Add subcategory
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {showAddCatFor === zone.id ? (
                    <div className="p-2 rounded-lg border border-pink-200 bg-pink-50/50 space-y-1.5" data-testid={`add-cat-form-${zone.id}`}>
                      <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Category name..." className="h-7 text-xs" data-testid="input-cat-name"
                        onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") { setShowAddCatFor(null); setAddInput(""); } }} />
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-xs bg-pink-500 hover:bg-pink-600 text-white px-2" onClick={handleAddCategory} data-testid="button-save-cat">Add</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => { setShowAddCatFor(null); setAddInput(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-pink-600 hover:bg-pink-50 rounded-lg w-full"
                      onClick={() => { setShowAddCatFor(zone.id); setShowAddSubcatFor(null); setShowAddZone(false); setAddInput(""); }}
                      data-testid={`add-cat-${zone.id}`}>
                      <Plus className="w-3 h-3" /> Add category
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {showAddZone && (
            <div className="p-3 rounded-xl border border-pink-200 bg-pink-50/50 space-y-2 mt-2" data-testid="add-zone-form">
              <Label className="text-xs font-medium">New Zone Name</Label>
              <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="e.g. Sports Zone" className="h-8 text-sm" data-testid="input-zone-name"
                onKeyDown={e => { if (e.key === "Enter") handleAddZone(); if (e.key === "Escape") { setShowAddZone(false); setAddInput(""); } }} />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={handleAddZone} data-testid="button-save-zone">Add Zone</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowAddZone(false); setAddInput(""); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedCat && selectedZone ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{selectedZone.name}</p>
                    {editingCatId === selectedCat.id ? (
                      <div className="flex gap-2 mt-1">
                        <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-8 text-base font-bold" data-testid="input-edit-cat-name"
                          onKeyDown={e => { if (e.key === "Enter") handleSaveCatEdit(); if (e.key === "Escape") { setEditingCatId(null); setEditInput(""); } }} />
                        <Button size="sm" className="h-8 bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveCatEdit} data-testid="button-save-cat-edit">Save</Button>
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditingCatId(null); setEditInput(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <CardTitle className="text-lg">{selectedCat.name}</CardTitle>
                    )}
                  </div>
                  {editingCatId !== selectedCat.id && (
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => startEditCat(selectedCat)} data-testid="button-edit-category">
                        <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200"
                        onClick={() => handleDeleteCategory(selectedZone.id, selectedCat.id)}
                        data-testid="button-delete-category">
                        <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Products in Category</p>
                    <p className="text-2xl font-bold">{catCount(selectedZone.id, selectedCat.id)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Subcategories</p>
                    <p className="text-2xl font-bold">{selectedCat.subcategories.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Subcategories</p>
                  <div className="space-y-1.5">
                    {selectedCat.subcategories.map(sc => (
                      <div key={sc.id} className="p-2.5 rounded-lg border" data-testid={`detail-subcat-${sc.id}`}>
                        {editingSubcatId === sc.id ? (
                          <div className="flex gap-2">
                            <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-7 text-sm flex-1"
                              data-testid={`input-edit-subcat-${sc.id}`}
                              onKeyDown={e => { if (e.key === "Enter") handleSaveSubcatEdit(selectedCat.id); if (e.key === "Escape") { setEditingSubcatId(null); setEditInput(""); } }} />
                            <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={() => handleSaveSubcatEdit(selectedCat.id)} data-testid={`save-subcat-edit-${sc.id}`}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingSubcatId(null); setEditInput(""); }}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{sc.name}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{subcatCount(sc.id)} products</Badge>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => { setEditingSubcatId(sc.id); setEditInput(sc.name); setEditingZoneId(null); setEditingCatId(null); }}
                                data-testid={`edit-subcat-${sc.id}`}>
                                <Edit2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => handleDeleteSubcategory(selectedCat.id, sc.id)}
                                data-testid={`delete-subcat-${sc.id}`}>
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {showAddSubcatFor === `detail-${selectedCat.id}` ? (
                      <div className="flex gap-2 p-2 rounded-lg border border-pink-200 bg-pink-50/50" data-testid="add-subcat-detail-form">
                        <Input autoFocus value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="New subcategory..." className="h-7 text-sm"
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              const catId = selectedCat.id;
                              const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
                              setZones(prev => prev.map(z => ({ ...z, categories: z.categories.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] } : c) })));
                              setShowAddSubcatFor(null); setAddInput("");
                            }
                            if (e.key === "Escape") { setShowAddSubcatFor(null); setAddInput(""); }
                          }} />
                        <Button size="sm" className="h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs" onClick={() => {
                          const catId = selectedCat.id;
                          if (!addInput.trim()) return;
                          const id = `${catId}_${addInput.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
                          setZones(prev => prev.map(z => ({ ...z, categories: z.categories.map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id, name: addInput.trim() }] } : c) })));
                          setShowAddSubcatFor(null); setAddInput("");
                        }} data-testid="button-save-detail-subcat">Add</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowAddSubcatFor(null); setAddInput(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <button type="button" className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 py-1"
                        onClick={() => { setShowAddSubcatFor(`detail-${selectedCat.id}`); setAddInput(""); }}
                        data-testid="button-add-subcat-detail">
                        <Plus className="w-4 h-4" /> Add Subcategory
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedZone && !selectedCatId ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingZoneId === selectedZone.id ? (
                      <div className="flex gap-2">
                        <Input autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="h-8 text-base font-bold" data-testid="input-edit-zone-name"
                          onKeyDown={e => { if (e.key === "Enter") handleSaveZoneEdit(); if (e.key === "Escape") { setEditingZoneId(null); setEditInput(""); } }} />
                        <Button size="sm" className="h-8 bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveZoneEdit} data-testid="button-save-zone-edit">Save</Button>
                        <Button size="sm" variant="ghost" className="h-8" onClick={() => { setEditingZoneId(null); setEditInput(""); }}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg">{selectedZone.icon} {selectedZone.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{selectedZone.description}</p>
                      </>
                    )}
                  </div>
                  {editingZoneId !== selectedZone.id && (
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => startEditZone(selectedZone)} data-testid="button-edit-zone">
                        <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200"
                        onClick={() => handleDeleteZone(selectedZone.id)}
                        data-testid="button-delete-zone">
                        <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{zoneCount(selectedZone.id)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{selectedZone.categories.length}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {selectedZone.categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCatId(cat.id)} data-testid={`zone-cat-${cat.id}`}>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Badge variant="outline" className="text-[10px]">{catCount(selectedZone.id, cat.id)} products</Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteCategory(selectedZone.id, cat.id)} data-testid={`delete-cat-${cat.id}`}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground" data-testid="category-empty-state">
              <Tag className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Select a zone or category from the tree to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EtsProductPricing() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="pricing-stub">
      <h1 className="text-xl font-bold">Price Engine Settings</h1>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Price Engine Settings coming soon</p>
          <p className="text-xs mt-1">Configure exchange rate, sourcing commissions, freight costs, duty rates, and markup percentages.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function EtsProductCompliance() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const q = search.toLowerCase();
    return CATALOG_PRODUCTS.filter(p =>
      p.complianceStatus !== "safe" &&
      (p.name.toLowerCase().includes(q) || (p.complianceStatus ?? "").includes(q))
    );
  }, [search]);

  return (
    <div className="px-16 lg:px-24 py-6 space-y-5" data-testid="compliance-page">
      <div>
        <h1 className="text-xl font-bold">Compliance Flags</h1>
        <p className="text-sm text-muted-foreground">Products requiring attention — restricted or banned items</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="input-compliance-search" />
      </div>
      <div className="space-y-2">
        {items.map(p => (
          <div
            key={p.id}
            className={`flex items-start gap-4 p-4 rounded-xl border ${p.complianceStatus === "banned" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/30"}`}
            data-testid={`compliance-row-${p.id}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${p.complianceStatus === "banned" ? "bg-red-100" : "bg-amber-100"}`}>
              {p.complianceStatus === "banned"
                ? <ShieldX className="w-4 h-4 text-red-600" />
                : <ShieldAlert className="w-4 h-4 text-amber-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium text-sm">{p.name}</p>
                <ComplianceBadge status={p.complianceStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{p.id} · <SourceBadge source={p.source} /></div>
              {p.complianceNotes && (
                <p className="text-xs mt-1.5 text-muted-foreground bg-white/60 rounded-lg px-2 py-1">{p.complianceNotes}</p>
              )}
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-xs h-8" data-testid={`edit-compliance-${p.id}`}><Edit2 className="w-3.5 h-3.5 mr-1" />Edit</Button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p>No flagged products matching the filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function EtsProductBulkUpload() {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="bulk-upload-page">
      <div>
        <h1 className="text-xl font-bold">Bulk Upload</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV to add or update products in bulk</p>
      </div>
      <Card
        className={`border-2 border-dashed ${dragging ? "border-pink-400 bg-pink-50" : "border-gray-200"} rounded-2xl shadow-none`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        data-testid="drop-zone"
      >
        <CardContent className="p-12 text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragging ? "text-pink-500" : "text-gray-300"}`} />
          <p className="text-sm font-medium mb-2">Drag & drop your CSV file here</p>
          <p className="text-xs text-muted-foreground mb-4">Bulk import/update up to 10,000+ products at once</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="text-xs" data-testid="button-download-template">Download Template</Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" data-testid="button-choose-file">Choose File</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">CSV Template Columns</p>
          <div className="flex flex-wrap gap-2">
            {["name", "description", "zone", "category", "source", "barcode", "exw_price_yuan", "wholesale_price_inr", "units_per_carton", "carton_length_cm", "carton_width_cm", "carton_height_cm", "compliance_status", "label_status", "suggested_mrp"].map((col) => (
              <Badge key={col} variant="outline" className="text-xs font-mono" data-testid={`col-${col}`}>{col}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
