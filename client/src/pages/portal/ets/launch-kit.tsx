import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Package, Plus, Minus, Trash2, ShoppingCart,
  IndianRupee, TrendingUp, BarChart3, Send,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PageShell, PageHeader, StatGrid, StatCard, SectionCard,
} from "@/components/layout";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

interface KitItem {
  id: number;
  clientId: number;
  productId: number;
  productName: string;
  categoryName: string;
  landedCost: number;
  mrp: number;
  quantity: number;
  unitsPerCarton: number;
}

const MOCK_KIT_ITEMS: KitItem[] = [
  { id: 1, clientId: 1, productId: 101, productName: "Brass Table Lamp", categoryName: "Lighting", landedCost: 450, mrp: 1299, quantity: 20, unitsPerCarton: 6 },
  { id: 2, clientId: 1, productId: 102, productName: "Ceramic Vase Set", categoryName: "Decor", landedCost: 320, mrp: 899, quantity: 30, unitsPerCarton: 12 },
  { id: 3, clientId: 1, productId: 103, productName: "Wooden Wall Clock", categoryName: "Clocks", landedCost: 580, mrp: 1599, quantity: 15, unitsPerCarton: 8 },
  { id: 4, clientId: 1, productId: 104, productName: "Cotton Cushion Cover (Set of 5)", categoryName: "Textiles", landedCost: 280, mrp: 799, quantity: 40, unitsPerCarton: 20 },
  { id: 5, clientId: 1, productId: 105, productName: "Metal Photo Frame", categoryName: "Decor", landedCost: 190, mrp: 549, quantity: 25, unitsPerCarton: 24 },
  { id: 6, clientId: 1, productId: 106, productName: "Scented Candle Gift Box", categoryName: "Gifting", landedCost: 350, mrp: 999, quantity: 20, unitsPerCarton: 10 },
  { id: 7, clientId: 1, productId: 107, productName: "Bamboo Organiser Set", categoryName: "Storage", landedCost: 420, mrp: 1199, quantity: 10, unitsPerCarton: 6 },
  { id: 8, clientId: 1, productId: 108, productName: "Handwoven Jute Rug", categoryName: "Textiles", landedCost: 680, mrp: 1899, quantity: 8, unitsPerCarton: 4 },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatShort(val: number): string {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString("en-IN");
}

function KitSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </PageShell>
  );
}

export default function EtsPortalLaunchKit() {
  const { toast } = useToast();
  const clientId = portalEtsClient.id;

  const { data: kitData, isLoading } = useQuery<{ kitItems: KitItem[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "kit-items"],
  });

  const [localItems, setLocalItems] = useState<KitItem[] | null>(null);

  const items: KitItem[] = useMemo(() => {
    if (localItems !== null) return localItems;
    if (kitData?.kitItems && kitData.kitItems.length > 0) return kitData.kitItems;
    return MOCK_KIT_ITEMS;
  }, [localItems, kitData]);

  const updateQuantity = (id: number, delta: number) => {
    setLocalItems((prev) => {
      const current = prev ?? items;
      return current.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      });
    });
  };

  const removeItem = (id: number) => {
    setLocalItems((prev) => {
      const current = prev ?? items;
      return current.filter((item) => item.id !== id);
    });
    toast({ title: "Item removed", description: "Product removed from your launch kit." });
  };

  const totalCost = items.reduce((sum, i) => sum + i.landedCost * i.quantity, 0);
  const totalMRP = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0);
  const potentialProfit = totalMRP - totalCost;
  const avgMargin = totalMRP > 0 ? (potentialProfit / totalMRP) * 100 : 0;
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { cost: number; units: number }> = {};
    for (const item of items) {
      if (!map[item.categoryName]) map[item.categoryName] = { cost: 0, units: 0 };
      map[item.categoryName].cost += item.landedCost * item.quantity;
      map[item.categoryName].units += item.quantity;
    }
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        cost: data.cost,
        units: data.units,
        percent: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [items, totalCost]);

  const categoryColors = [
    "bg-orange-500", "bg-blue-500", "bg-emerald-500",
    "bg-purple-500", "bg-amber-500", "bg-pink-500",
    "bg-teal-500", "bg-indigo-500",
  ];

  const handleSubmit = () => {
    toast({
      title: "Kit Submitted",
      description: "Your launch kit has been submitted for review. Our team will get back to you shortly.",
    });
  };

  if (isLoading) return <KitSkeleton />;

  return (
    <PageShell>
      <PageHeader
        title="My Launch Kit"
        subtitle="Review and customize your opening inventory before submission."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" data-testid="button-save-draft">
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={items.length === 0}
              style={{ backgroundColor: ETS_PORTAL_COLOR }}
              className="border-orange-600"
              data-testid="button-submit-kit"
            >
              <Send className="size-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        }
      />

      <StatGrid cols={4}>
        <StatCard
          label="Total Investment"
          value={`INR ${formatShort(totalCost)}`}
          icon={IndianRupee}
          iconBg="#fed7aa"
          iconColor="#c2410c"
          trend={`${items.length} products selected`}
        />
        <StatCard
          label="Total Retail (MRP)"
          value={`INR ${formatShort(totalMRP)}`}
          icon={ShoppingCart}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          trend={`${totalUnits} total units`}
        />
        <StatCard
          label="Potential Profit"
          value={`INR ${formatShort(potentialProfit)}`}
          icon={TrendingUp}
          iconBg="#d1fae5"
          iconColor="#059669"
          trend={potentialProfit > 0 ? "Estimated returns" : "Add products"}
        />
        <StatCard
          label="Avg. Margin"
          value={`${avgMargin.toFixed(1)}%`}
          icon={BarChart3}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          trend={avgMargin >= 50 ? "Healthy margin" : "Consider higher-margin items"}
        />
      </StatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <Package className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
                <CardTitle>Selected Products ({items.length})</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {totalUnits} units
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="p-12 text-center" data-testid="text-empty-kit">
                  <ShoppingCart className="size-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No products in your launch kit yet. Browse the catalog to add products.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>MRP</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead className="w-[140px]">Quantity</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const margin = item.mrp > 0
                          ? ((item.mrp - item.landedCost) / item.mrp * 100)
                          : 0;
                        return (
                          <TableRow key={item.id} data-testid={`row-kit-item-${item.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                  {item.productName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(item.landedCost)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(item.mrp)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  margin >= 60 && "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
                                  margin >= 40 && margin < 60 && "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
                                  margin < 40 && "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
                                )}
                              >
                                {margin.toFixed(0)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1}
                                  data-testid={`button-decrease-${item.id}`}
                                >
                                  <Minus className="size-3" />
                                </Button>
                                <span className="w-10 text-center text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  data-testid={`button-increase-${item.id}`}
                                >
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                              {formatCurrency(item.landedCost * item.quantity)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => removeItem(item.id)}
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {items.length > 0 && (
            <SectionCard title="Category Mix">
              <div className="space-y-3">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={cat.name} className="space-y-1.5" data-testid={`category-mix-${cat.name}`}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-3 rounded-sm shrink-0", categoryColors[idx % categoryColors.length])} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{cat.units} units</span>
                        <span className="font-medium text-foreground">{formatCurrency(cat.cost)}</span>
                        <span className="text-xs">({cat.percent.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <Progress value={cat.percent} className="h-2" />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="size-5" style={{ color: ETS_PORTAL_COLOR }} />
                <CardTitle>Investment Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Total Cost (Your Price)</span>
                  <span className="text-lg font-bold" data-testid="text-total-cost">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Total MRP (Retail)</span>
                  <span className="text-sm font-medium" data-testid="text-total-mrp">
                    {formatCurrency(totalMRP)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2 text-emerald-700 dark:text-emerald-400">
                  <span className="text-sm font-medium">Potential Profit</span>
                  <span className="font-bold" data-testid="text-potential-profit">
                    {formatCurrency(potentialProfit)}
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="w-full justify-center py-1.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400 border-emerald-200"
                data-testid="text-avg-margin"
              >
                {avgMargin.toFixed(1)}% Average Margin
              </Badge>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Products</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Total Units</span>
                  <span className="font-medium">{totalUnits}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="font-medium">{categoryBreakdown.length}</span>
                </div>
              </div>

              <Separator />

              {items.length > 0 && (
                <div
                  className="rounded-md p-3 flex items-start gap-3 text-sm"
                  style={{
                    backgroundColor: "rgba(249, 115, 22, 0.08)",
                    border: "1px solid rgba(249, 115, 22, 0.15)",
                  }}
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" style={{ color: ETS_PORTAL_COLOR }} />
                  <p className="text-muted-foreground">
                    Review your kit carefully before submitting. Our team will verify quantities and pricing.
                  </p>
                </div>
              )}

              <Button
                className="w-full border-orange-600"
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                onClick={handleSubmit}
                disabled={items.length === 0}
                data-testid="button-submit-kit-sidebar"
              >
                <Send className="size-4 mr-2" />
                Submit Kit for Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
