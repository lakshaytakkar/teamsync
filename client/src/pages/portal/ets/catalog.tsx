import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Search, ShoppingCart, Plus, Package, Ruler, Weight,
  RotateCcw, SlidersHorizontal, Eye, X, Layers, Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout";
import { portalEtsClient, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";

interface CatalogProduct {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  exwPrice: number;
  landedCost: number;
  mrp: number;
  margin: number;
  multiplier: number;
  moq: number;
  unitsPerCarton: number;
  weight: string;
  dimensions: string;
  tags: string[];
  imageUrl?: string;
  description?: string;
  sku: string;
  inStock: boolean;
}

interface CatalogCategory {
  id: number;
  name: string;
}

const COST_RANGES = [
  { label: "All Prices", value: "all", min: 0, max: Infinity },
  { label: "Under \u20b930", value: "u30", min: 0, max: 30 },
  { label: "\u20b930 - \u20b950", value: "30-50", min: 30, max: 50 },
  { label: "\u20b950 - \u20b9100", value: "50-100", min: 50, max: 100 },
  { label: "\u20b9100 - \u20b9200", value: "100-200", min: 100, max: 200 },
  { label: "\u20b9200+", value: "200+", min: 200, max: Infinity },
];

const MRP_RANGES = [
  { label: "All MRPs", value: "all", min: 0, max: Infinity },
  { label: "Under \u20b999", value: "u99", min: 0, max: 99 },
  { label: "\u20b999 - \u20b9199", value: "99-199", min: 99, max: 199 },
  { label: "\u20b9199 - \u20b9399", value: "199-399", min: 199, max: 399 },
  { label: "\u20b9399 - \u20b9999", value: "399-999", min: 399, max: 999 },
];

const MARGIN_RANGES = [
  { label: "All Margins", value: "all", min: 0 },
  { label: "2x+ (100%+ profit)", value: "2x", min: 2 },
  { label: "2.5x+ (150%+ profit)", value: "2.5x", min: 2.5 },
  { label: "3x+ (200%+ profit)", value: "3x", min: 3 },
];

const TAG_OPTIONS = ["Bestseller", "New Arrival", "Recommended", "High Margin", "Fast Mover", "Seasonal"];

const CATEGORY_COLORS: Record<string, string> = {
  "Hair Accessories": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "Kitchen": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Storage": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Toys": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Bathroom": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Stationery": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Cleaning": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  "Decor": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "Bags": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Gifts": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getCategoryColor(catName: string) {
  return CATEGORY_COLORS[catName] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
}

function formatCurrency(val: number) {
  if (!val && val !== 0) return "\u20b90";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function formatCurrencyDecimal(val: number) {
  if (!val && val !== 0) return "\u20b90";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}

function CatalogSkeleton() {
  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </PageShell>
  );
}

export default function EtsPortalCatalog() {
  const { toast } = useToast();
  const clientId = portalEtsClient.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [costRange, setCostRange] = useState("all");
  const [mrpRange, setMrpRange] = useState("all");
  const [marginRange, setMarginRange] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("margin");

  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [kitDialogProduct, setKitDialogProduct] = useState<CatalogProduct | null>(null);
  const [kitQty, setKitQty] = useState(1);
  const [kitQtyType, setKitQtyType] = useState<"pieces" | "cartons">("pieces");

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: CatalogProduct[] }>({
    queryKey: ["/api/ets-portal/products"],
  });

  const { data: categoriesData } = useQuery<{ categories: CatalogCategory[] }>({
    queryKey: ["/api/ets-portal/categories"],
  });

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const addToKitMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("POST", `/api/ets-portal/client/${clientId}/kit-items`, { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId, "kit-items"] });
      toast({ title: "Added to Kit", description: `${kitQty} ${kitQtyType} added to your launch kit.` });
      setKitDialogProduct(null);
      setKitQty(1);
      setKitQtyType("pieces");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add item to kit. Please try again.", variant: "destructive" });
    },
  });

  const getPrice = (p: CatalogProduct) => p.landedCost || 0;
  const getMrp = (p: CatalogProduct) => p.mrp || 0;
  const getMultiplier = (p: CatalogProduct) => {
    const cost = getPrice(p);
    const mrp = getMrp(p);
    if (cost <= 0) return 0;
    return mrp / cost;
  };
  const getProfit = (p: CatalogProduct) => getMrp(p) - getPrice(p);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (costRange !== "all") count++;
    if (mrpRange !== "all") count++;
    if (marginRange !== "all") count++;
    if (selectedTags.length > 0) count++;
    if (searchQuery) count++;
    return count;
  }, [selectedCategory, costRange, mrpRange, marginRange, selectedTags, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setCostRange("all");
    setMrpRange("all");
    setMarginRange("all");
    setSelectedTags([]);
    setSearchQuery("");
    setSortBy("margin");
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === "Active" || !p.status);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (categoryMap[p.categoryId] || "").toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(p => String(p.categoryId) === selectedCategory);
    }

    const cr = COST_RANGES.find(r => r.value === costRange);
    if (cr && cr.value !== "all") {
      result = result.filter(p => {
        const price = getPrice(p);
        return price >= cr.min && price < cr.max;
      });
    }

    const mr = MRP_RANGES.find(r => r.value === mrpRange);
    if (mr && mr.value !== "all") {
      result = result.filter(p => {
        const m = getMrp(p);
        return m >= mr.min && m < mr.max;
      });
    }

    const mg = MARGIN_RANGES.find(r => r.value === marginRange);
    if (mg && mg.value !== "all") {
      result = result.filter(p => getMultiplier(p) >= mg.min);
    }

    if (selectedTags.length > 0) {
      result = result.filter(p => (p.tags || []).some(t => selectedTags.includes(t)));
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price_desc":
        result.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "margin":
        result.sort((a, b) => getMultiplier(b) - getMultiplier(a));
        break;
      case "mrp_asc":
        result.sort((a, b) => getMrp(a) - getMrp(b));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, costRange, mrpRange, marginRange, selectedTags, sortBy, categoryMap]);

  const stats = useMemo(() => {
    const avgMultiplier = filteredProducts.length > 0
      ? filteredProducts.reduce((acc, p) => acc + getMultiplier(p), 0) / filteredProducts.length
      : 0;
    return {
      total: filteredProducts.length,
      avgMultiplier: avgMultiplier.toFixed(1),
      highMarginCount: filteredProducts.filter(p => getMultiplier(p) >= 2.5).length,
    };
  }, [filteredProducts]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddToKit = (product: CatalogProduct) => {
    setKitDialogProduct(product);
    setKitQty(1);
    setKitQtyType("pieces");
  };

  const confirmAddToKit = () => {
    if (!kitDialogProduct) return;
    const totalPieces = kitQtyType === "cartons"
      ? kitQty * (kitDialogProduct.unitsPerCarton || 1)
      : kitQty;
    addToKitMutation.mutate({ productId: kitDialogProduct.id, quantity: totalPieces });
  };

  if (productsLoading) return <CatalogSkeleton />;

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-catalog-title">Product Catalog</h1>
          <p className="text-sm text-muted-foreground">Browse and select inventory for your store</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.location.href = "/portal-ets/launch-kit"}
          data-testid="button-view-kit"
        >
          <ShoppingCart className="size-4" /> View Kit
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: "rgba(249, 115, 22, 0.05)", borderColor: "rgba(249, 115, 22, 0.15)" }}>
          <span className="text-muted-foreground">Products</span>
          <span className="font-bold" data-testid="text-products-count">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <span className="text-muted-foreground">Avg. Return</span>
          <span className="font-bold text-green-700 dark:text-green-400" data-testid="text-avg-margin">{stats.avgMultiplier}x</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-50 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800">
          <span className="text-muted-foreground">2.5x+ Items</span>
          <span className="font-bold text-orange-700 dark:text-orange-400" data-testid="text-high-margin">{stats.highMarginCount}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-catalog"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px] text-sm" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={costRange} onValueChange={setCostRange}>
              <SelectTrigger className="w-[140px] text-sm" data-testid="select-cost">
                <SelectValue placeholder="Your Cost" />
              </SelectTrigger>
              <SelectContent>
                {COST_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={mrpRange} onValueChange={setMrpRange}>
              <SelectTrigger className="w-[140px] text-sm" data-testid="select-mrp">
                <SelectValue placeholder="MRP Range" />
              </SelectTrigger>
              <SelectContent>
                {MRP_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={marginRange} onValueChange={setMarginRange}>
              <SelectTrigger className="w-[170px] text-sm" data-testid="select-margin">
                <SelectValue placeholder="Profit Multiple" />
              </SelectTrigger>
              <SelectContent>
                {MARGIN_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] text-sm" data-testid="select-sort">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="margin">Highest Return</SelectItem>
                <SelectItem value="price_asc">Cost: Low to High</SelectItem>
                <SelectItem value="price_desc">Cost: High to Low</SelectItem>
                <SelectItem value="mrp_asc">MRP: Low to High</SelectItem>
                <SelectItem value="name">Name: A-Z</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={resetFilters} className="gap-1 text-muted-foreground" data-testid="button-reset-filters">
                <RotateCcw className="size-3.5" /> Reset ({activeFilterCount})
              </Button>
            )}
          </div>

          {TAG_OPTIONS.length > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t flex-wrap">
              <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
              {TAG_OPTIONS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer select-none text-xs",
                    selectedTags.includes(tag)
                      ? "border-orange-500 bg-orange-500 text-white"
                      : ""
                  )}
                  onClick={() => toggleTag(tag)}
                  data-testid={`filter-tag-${tag.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground" data-testid="text-empty-state">
          <Package className="size-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No products found matching your filters.</p>
          <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredProducts.map((product) => {
          const cost = getPrice(product);
          const mrp = getMrp(product);
          const multiplier = getMultiplier(product);
          const profit = getProfit(product);
          const catName = product.categoryName || categoryMap[product.categoryId] || "Other";

          return (
            <Card
              key={product.id}
              className="cursor-pointer hover-elevate"
              data-testid={`card-product-${product.id}`}
              onClick={() => setDetailProduct(product)}
            >
              <div className="aspect-square bg-muted relative rounded-t-lg overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={cn("w-full h-full flex flex-col items-center justify-center gap-1", getCategoryColor(catName))}>
                    <Package className="size-8 opacity-40" />
                    <span className="text-xs font-bold opacity-60">{getInitials(product.name)}</span>
                  </div>
                )}
                {multiplier >= 2.5 && (
                  <div className="absolute top-1.5 right-1.5">
                    <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0 border-0 shadow-sm">
                      {multiplier.toFixed(1)}x
                    </Badge>
                  </div>
                )}
                {(product.tags || []).length > 0 && (
                  <div className="absolute top-1.5 left-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shadow-sm">
                      {(product.tags || [])[0]}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-2.5">
                <p className="text-[11px] text-muted-foreground mb-0.5">{catName}</p>
                <h3
                  className="font-medium text-xs leading-tight line-clamp-2 mb-2 min-h-[2rem]"
                  data-testid={`text-product-name-${product.id}`}
                >
                  {product.name}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="text-[10px] text-muted-foreground">Your Cost</span>
                    <span className="text-sm font-bold" style={{ color: ETS_PORTAL_COLOR }} data-testid={`text-cost-${product.id}`}>
                      {formatCurrency(cost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="text-[10px] text-muted-foreground">Sell at MRP</span>
                    <span className="text-xs font-semibold">{formatCurrency(mrp)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t gap-1">
                    <span className="text-[10px] text-muted-foreground">Profit</span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">{formatCurrency(profit)}</span>
                      <span className="text-[10px] text-green-600 dark:text-green-500 ml-1">({multiplier.toFixed(1)}x)</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 text-xs"
                  style={{ backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR }}
                  onClick={(e) => { e.stopPropagation(); handleAddToKit(product); }}
                  disabled={addToKitMutation.isPending}
                  data-testid={`button-add-to-kit-${product.id}`}
                >
                  <Plus className="size-3 mr-1" /> Add to Kit
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!detailProduct} onOpenChange={(open) => { if (!open) setDetailProduct(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailProduct && (() => {
            const cost = getPrice(detailProduct);
            const mrp = getMrp(detailProduct);
            const multiplier = getMultiplier(detailProduct);
            const profit = getProfit(detailProduct);
            const catName = detailProduct.categoryName || categoryMap[detailProduct.categoryId] || "Other";

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg" data-testid="text-detail-product-name">{detailProduct.name}</DialogTitle>
                  <DialogDescription asChild>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={cn(getCategoryColor(catName), "border-0 text-xs")}>{catName}</Badge>
                      {(detailProduct.tags || []).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                      {detailProduct.imageUrl ? (
                        <img src={detailProduct.imageUrl} alt={detailProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-2", getCategoryColor(catName))}>
                          <Package className="size-16 opacity-30" />
                          <span className="text-lg font-bold opacity-50">{getInitials(detailProduct.name)}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg p-4 text-center bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Your Profit Per Piece</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-detail-profit">
                        {formatCurrency(profit)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                        {multiplier.toFixed(1)}x your cost
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Pricing Breakdown</h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between py-1 gap-2">
                          <span className="text-muted-foreground">Your Landing Cost</span>
                          <span className="font-semibold" style={{ color: ETS_PORTAL_COLOR }}>{formatCurrencyDecimal(cost)}</span>
                        </div>
                        <div className="flex justify-between py-1 gap-2">
                          <span className="text-muted-foreground">Sell at MRP</span>
                          <span className="font-semibold">{formatCurrency(mrp)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between py-1 gap-2">
                          <span className="text-muted-foreground">Profit per piece</span>
                          <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(profit)}</span>
                        </div>
                        <div className="flex justify-between py-1 gap-2">
                          <span className="text-muted-foreground">Return on Cost</span>
                          <span className="font-bold text-green-700 dark:text-green-400">{multiplier.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>

                    {(detailProduct.weight || detailProduct.dimensions || detailProduct.unitsPerCarton) && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Dimensions & Packaging</h4>
                        <div className="space-y-1.5 text-sm">
                          {detailProduct.weight && (
                            <div className="flex items-center gap-2 py-1">
                              <Weight className="size-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Weight</span>
                              <span className="ml-auto font-medium">{detailProduct.weight}</span>
                            </div>
                          )}
                          {detailProduct.dimensions && (
                            <div className="flex items-center gap-2 py-1">
                              <Ruler className="size-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Dimensions</span>
                              <span className="ml-auto font-medium">{detailProduct.dimensions}</span>
                            </div>
                          )}
                          {detailProduct.unitsPerCarton > 0 && (
                            <div className="flex items-center gap-2 py-1">
                              <Layers className="size-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Units/Carton</span>
                              <span className="ml-auto font-medium">{detailProduct.unitsPerCarton}</span>
                            </div>
                          )}
                          {detailProduct.moq > 0 && (
                            <div className="flex items-center gap-2 py-1">
                              <Package className="size-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Min Order Qty</span>
                              <span className="ml-auto font-medium">{detailProduct.moq}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      style={{ backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR }}
                      onClick={() => {
                        setDetailProduct(null);
                        handleAddToKit(detailProduct);
                      }}
                      data-testid="button-detail-add-to-kit"
                    >
                      <Plus className="size-4" /> Add to Launch Kit
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!kitDialogProduct} onOpenChange={(open) => { if (!open) { setKitDialogProduct(null); } }}>
        <DialogContent className="max-w-md">
          {kitDialogProduct && (() => {
            const cost = getPrice(kitDialogProduct);
            const mrp = getMrp(kitDialogProduct);
            const multiplier = getMultiplier(kitDialogProduct);
            const effectiveQty = kitQtyType === "cartons"
              ? kitQty * (kitDialogProduct.unitsPerCarton || 1)
              : kitQty;
            const totalCost = cost * effectiveQty;
            const totalRevenue = mrp * effectiveQty;
            const totalProfit = totalRevenue - totalCost;

            return (
              <>
                <DialogHeader>
                  <DialogTitle data-testid="text-kit-dialog-title">Add to Launch Kit</DialogTitle>
                  <DialogDescription>{kitDialogProduct.name}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("size-12 rounded-lg flex items-center justify-center shrink-0", getCategoryColor(kitDialogProduct.categoryName || categoryMap[kitDialogProduct.categoryId] || "Other"))}>
                      <Package className="size-5 opacity-50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{kitDialogProduct.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(cost)} cost &middot; {formatCurrency(mrp)} MRP &middot; {multiplier.toFixed(1)}x
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={kitQty}
                        onChange={(e) => setKitQty(Math.max(1, parseInt(e.target.value) || 1))}
                        data-testid="input-kit-qty"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Unit</Label>
                      <Select value={kitQtyType} onValueChange={(v) => setKitQtyType(v as "pieces" | "cartons")}>
                        <SelectTrigger data-testid="select-kit-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="cartons">Cartons ({kitDialogProduct.unitsPerCarton || 1} pcs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {kitQtyType === "cartons" && (
                    <p className="text-xs text-muted-foreground">
                      {kitQty} carton(s) = {effectiveQty} pieces
                    </p>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Total Pieces</span>
                      <span className="font-semibold" data-testid="text-kit-total-pieces">{effectiveQty}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-semibold" style={{ color: ETS_PORTAL_COLOR }} data-testid="text-kit-total-cost">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Total MRP</span>
                      <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t">
                      <span className="text-muted-foreground font-medium">Potential Profit</span>
                      <span className="font-bold text-green-700 dark:text-green-400" data-testid="text-kit-total-profit">
                        {formatCurrency(totalProfit)}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setKitDialogProduct(null)}
                    data-testid="button-kit-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAddToKit}
                    disabled={addToKitMutation.isPending}
                    style={{ backgroundColor: ETS_PORTAL_COLOR, borderColor: ETS_PORTAL_COLOR }}
                    data-testid="button-kit-confirm"
                  >
                    {addToKitMutation.isPending ? "Adding..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
