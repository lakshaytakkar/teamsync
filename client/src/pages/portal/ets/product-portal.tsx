import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Tag, CreditCard, CheckSquare, Upload, AlertTriangle, Search, Edit2 } from "lucide-react";

const PRODUCTS = [
  { id: "SKU-001", name: "Premium Face Wash 100ml", category: "Skincare", price: 149, mrp: 199, margin: 25, compliance: "OK", stock: 240 },
  { id: "SKU-002", name: "Hand Cream Rose Extract", category: "Skincare", price: 89, mrp: 120, margin: 26, compliance: "Flag", stock: 180 },
  { id: "SKU-003", name: "Lip Balm SPF30 Tinted", category: "Makeup", price: 59, mrp: 79, margin: 25, compliance: "OK", stock: 420 },
  { id: "SKU-004", name: "Hair Serum Argan Oil 50ml", category: "Haircare", price: 199, mrp: 299, margin: 33, compliance: "Pending", stock: 95 },
  { id: "SKU-005", name: "Body Lotion Shea Butter", category: "Bodycare", price: 129, mrp: 179, margin: 28, compliance: "OK", stock: 310 },
  { id: "SKU-006", name: "Nail Polish Set 12pc", category: "Makeup", price: 299, mrp: 449, margin: 33, compliance: "Flag", stock: 60 },
];

const CATEGORIES = [
  { name: "Skincare", products: 48, active: true },
  { name: "Makeup", products: 35, active: true },
  { name: "Haircare", products: 22, active: true },
  { name: "Bodycare", products: 18, active: true },
  { name: "Wellness", products: 12, active: false },
  { name: "Accessories", products: 9, active: true },
];

export default function EtsProductPortal() {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="product-portal-dashboard">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm text-pink-200 mb-1">Product Management</p>
          <h1 className="text-2xl font-bold" data-testid="text-product-title">Product Catalog</h1>
          <div className="flex items-center gap-6 mt-3 text-sm text-pink-200">
            <span><strong className="text-white">{PRODUCTS.length}</strong> Active SKUs</span>
            <span><strong className="text-white">{PRODUCTS.filter(p => p.compliance === "Flag").length}</strong> Compliance Flags</span>
            <span><strong className="text-white">{CATEGORIES.length}</strong> Categories</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-product-search"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${product.compliance === "Flag" ? "border-red-200 bg-red-50/40" : "bg-white"}`}
              data-testid={`product-row-${product.id}`}
            >
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  {product.compliance === "Flag" && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{product.id} · {product.category} · {product.stock} units</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">₹{product.mrp}</p>
                <p className="text-xs text-green-600">{product.margin}% margin</p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`edit-product-${product.id}`}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between" data-testid={`category-${cat.name.toLowerCase()}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cat.active ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{cat.products}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Compliance Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {PRODUCTS.filter(p => p.compliance !== "OK").map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-red-50/60 border border-red-100" data-testid={`compliance-${p.id}`}>
                  <p className="text-xs font-medium">{p.name}</p>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${p.compliance === "Flag" ? "border-red-200 text-red-700" : "border-amber-200 text-amber-700"}`}>
                    {p.compliance === "Flag" ? "Needs Review" : "Pending Docs"}
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

export function EtsProductCategories() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Category Manager</h1>
        <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">+ Add Category</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <Card key={cat.name} className="border-0 shadow-sm" data-testid={`cat-card-${cat.name.toLowerCase()}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Tag className="w-5 h-5 text-pink-500" />
                <Badge variant="outline" className={`text-[10px] ${cat.active ? "border-green-300 text-green-700" : "border-gray-200 text-gray-500"}`}>
                  {cat.active ? "Active" : "Hidden"}
                </Badge>
              </div>
              <p className="font-semibold">{cat.name}</p>
              <p className="text-sm text-muted-foreground">{cat.products} products</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EtsProductPricing() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Pricing Rules</h1>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { rule: "Minimum Franchise Margin", value: "25%", type: "Global" },
              { rule: "China Import MRP Multiplier", value: "3.2x", type: "Import" },
              { rule: "Domestic Product Markup", value: "40%", type: "Domestic" },
              { rule: "Bundle Discount Cap", value: "15%", type: "Bundle" },
              { rule: "Seasonal Promotion Limit", value: "20%", type: "Promo" },
            ].map((rule) => (
              <div key={rule.rule} className="flex items-center justify-between py-3 border-b last:border-0" data-testid={`pricing-rule-${rule.type.toLowerCase()}`}>
                <div>
                  <p className="font-medium">{rule.rule}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{rule.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-pink-600">{rule.value}</span>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EtsProductCompliance() {
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
      <h1 className="text-xl font-bold">Compliance Flags</h1>
      <div className="space-y-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${product.compliance === "Flag" ? "border-red-200 bg-red-50/50" : product.compliance === "Pending" ? "border-amber-200 bg-amber-50/50" : "border-green-100 bg-green-50/30"}`}
            data-testid={`compliance-row-${product.id}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${product.compliance === "Flag" ? "bg-red-100" : product.compliance === "Pending" ? "bg-amber-100" : "bg-green-100"}`}>
              {product.compliance === "OK"
                ? <CheckSquare className="w-4 h-4 text-green-600" />
                : <AlertTriangle className={`w-4 h-4 ${product.compliance === "Flag" ? "text-red-600" : "text-amber-600"}`} />
              }
            </div>
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.id} · {product.category}</p>
            </div>
            <Badge
              variant="outline"
              className={product.compliance === "OK" ? "border-green-300 text-green-700" : product.compliance === "Flag" ? "border-red-300 text-red-700" : "border-amber-300 text-amber-700"}
            >
              {product.compliance === "OK" ? "Compliant" : product.compliance === "Flag" ? "Needs Review" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EtsProductBulkUpload() {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="px-6 lg:px-10 py-6 space-y-6">
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
          <p className="text-xs text-muted-foreground mb-4">Supported: .csv, .xlsx (Max 10MB)</p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" data-testid="button-choose-file">
            Choose File
          </Button>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">CSV Template Columns</p>
          <div className="flex flex-wrap gap-2">
            {["SKU ID", "Product Name", "Category", "MRP", "Cost Price", "HSN Code", "Compliance Notes", "Stock Qty"].map((col) => (
              <Badge key={col} variant="outline" className="text-xs" data-testid={`col-${col.toLowerCase().replace(/\s+/g, "-")}`}>{col}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
