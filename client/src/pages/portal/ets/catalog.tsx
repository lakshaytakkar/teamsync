import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Search, Package, Grid3x3, List, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  moq: number;
  image?: string;
  description?: string;
}

function normalizeProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name || "",
    category: p.categoryName || p.category || "General",
    price: p.suggestedMrp || p.storeLandingPrice || p.mrp || p.price || 0,
    moq: p.moq || 1,
    image: p.image,
    description: p.description || "",
  };
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: "LED Desk Lamp", category: "Electronics", price: 450, moq: 50, description: "Modern LED desk lamp with adjustable brightness." },
  { id: 2, name: "Wireless Earbuds", category: "Electronics", price: 320, moq: 100, description: "Bluetooth 5.0 earbuds with charging case." },
  { id: 3, name: "Phone Stand", category: "Accessories", price: 120, moq: 200, description: "Adjustable aluminum phone/tablet stand." },
  { id: 4, name: "Wall Clock", category: "Home Decor", price: 280, moq: 50, description: "Minimalist wall clock with silent mechanism." },
  { id: 5, name: "Ceramic Vase", category: "Home Decor", price: 350, moq: 30, description: "Handcrafted ceramic vase, ideal for centerpieces." },
  { id: 6, name: "Makeup Organizer", category: "Beauty", price: 180, moq: 100, description: "Acrylic organizer with multiple compartments." },
  { id: 7, name: "Travel Bag", category: "Fashion", price: 550, moq: 50, description: "Water-resistant travel duffel bag." },
  { id: 8, name: "Smart Watch Band", category: "Accessories", price: 150, moq: 200, description: "Silicone bands compatible with popular smartwatches." },
  { id: 9, name: "Essential Oil Diffuser", category: "Home Decor", price: 480, moq: 30, description: "Ultrasonic aroma diffuser with LED lights." },
  { id: 10, name: "Portable Charger", category: "Electronics", price: 520, moq: 100, description: "10,000mAh power bank with dual USB ports." },
  { id: 11, name: "Sunglasses", category: "Fashion", price: 250, moq: 100, description: "UV400 polarized sunglasses, multiple colors." },
  { id: 12, name: "Kitchen Timer", category: "Home Decor", price: 140, moq: 50, description: "Magnetic digital kitchen timer with loud alarm." },
];

function CatalogSkeleton() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-xs" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function EtsPortalCatalog() {
  const clientId = portalEtsClient.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: productsData, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ['/api/ets-portal/products'],
  });

  const addToKitMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", `/api/ets-portal/client/${clientId}/kit-items`, { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ets-portal/client', clientId, 'kit-items'] });
      toast({ title: "Added to Kit", description: "Product added to your launch kit." });
    },
    onError: () => {
      toast({ title: "Could not add", description: "Failed to add product to kit. Please try again.", variant: "destructive" });
    },
  });

  const rawProducts = productsData?.products;
  const products: Product[] = rawProducts ? rawProducts.map(normalizeProduct) : SAMPLE_PRODUCTS;
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (isLoading) return <CatalogSkeleton />;

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-catalog">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-catalog-title">Product Catalog</h1>
          <p className="text-muted-foreground">Browse products available for your store inventory.</p>
        </div>
        <Badge variant="outline" className="text-sm self-start md:self-auto" data-testid="badge-product-count">
          {filtered.length} products
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-catalog"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-44" data-testid="select-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-title">No Products Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/20" />
                )}
                <Badge className="absolute top-2 left-2 text-xs" variant="secondary">{product.category}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: ETS_PORTAL_COLOR }} data-testid={`text-price-${product.id}`}>
                    {"\u20B9"}{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-foreground">MOQ: {product.moq}</span>
                </div>
                <Button
                  className="w-full mt-3 text-white"
                  size="sm"
                  style={{ backgroundColor: ETS_PORTAL_COLOR }}
                  onClick={() => addToKitMutation.mutate(product.id)}
                  disabled={addToKitMutation.isPending}
                  data-testid={`button-add-${product.id}`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Kit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold" style={{ color: ETS_PORTAL_COLOR }}>{"\u20B9"}{product.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">MOQ: {product.moq}</p>
                </div>
                <Button size="sm" className="shrink-0 text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }} onClick={() => addToKitMutation.mutate(product.id)} disabled={addToKitMutation.isPending} data-testid={`button-add-${product.id}`}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
