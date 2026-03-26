import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  AlertCircle, ChevronRight, MapPin, Phone, Store,
  ShoppingCart, CreditCard, TrendingUp, Zap,
  Package, ClipboardList, AlertTriangle, Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/product-image";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";
import {
  EXPANDED_SALES, RETURN_RECORDS, POS_PRODUCTS, INVENTORY,
  getProductImage,
} from "@/lib/mock-data-pos-ets";

import iconPosBilling from "@assets/generated_images/icon-pos-billing.png";
import iconInventory from "@assets/generated_images/icon-inventory.png";
import iconDailyReport from "@assets/generated_images/icon-daily-report.png";
import iconReturns from "@assets/generated_images/icon-returns.png";
import iconCashRegister from "@assets/generated_images/icon-cash-register.png";
import iconStoreSettings from "@assets/generated_images/icon-store-settings.png";
import iconRevenue from "@assets/generated_images/icon-revenue.png";
import iconAvgBasket from "@assets/generated_images/icon-avg-basket.png";
import iconDigitalPayment from "@assets/generated_images/icon-digital-payment.png";
import iconCashPayment from "@assets/generated_images/icon-cash-payment.png";

const PIPELINE_STAGES = [
  "new-lead", "qualified", "token-paid", "store-design",
  "inventory-ordered", "in-transit", "launched", "reordering",
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function getNextSteps(client: any, kitItemCount: number): { title: string; description: string; active: boolean; href: string; icon: typeof Store }[] {
  const steps: { title: string; description: string; active: boolean; href: string; icon: typeof Store }[] = [];
  const stageIdx = PIPELINE_STAGES.indexOf(client.stage);

  if (!client.profileCompleted) {
    steps.push({ title: "Complete your store profile", description: "Fill in your store details and preferences.", active: true, href: "/portal-ets/onboarding", icon: Store });
  }

  if (stageIdx >= 2 && stageIdx < 5) {
    if (kitItemCount === 0) {
      steps.push({ title: "Select your launch inventory", description: "Browse the catalog and build your launch kit.", active: steps.length === 0, href: "/portal-ets/catalog", icon: Package });
    }
    if (stageIdx === 2) {
      steps.push({ title: "Approve 3D store design", description: "Review the layout shared by the design team.", active: steps.length === 0, href: "/portal-ets/store", icon: Store });
      steps.push({ title: "Release partial payment", description: "50% payment to start production.", active: false, href: "/portal-ets/payments", icon: CreditCard });
    }
    if (stageIdx >= 4) {
      steps.push({ title: "Track your order shipments", description: "Monitor delivery status for your inventory.", active: steps.length === 0, href: "/portal-ets/orders", icon: ShoppingCart });
      steps.push({ title: "Complete readiness checklist", description: "Ensure your store is ready for launch.", active: false, href: "/portal-ets/checklist", icon: ClipboardList });
    }
  } else {
    if (kitItemCount === 0) {
      steps.push({ title: "Select your launch inventory", description: "Browse the catalog and build your launch kit.", active: steps.length === 0, href: "/portal-ets/catalog", icon: Package });
    }
    steps.push({ title: "Review your program scope", description: "Understand the services included in your package.", active: steps.length === 0, href: "/portal-ets/store", icon: Store });
    steps.push({ title: "Connect with your manager", description: "Reach out via WhatsApp for any questions.", active: false, href: "/portal-ets/support", icon: Phone });
  }

  return steps.slice(0, 3);
}

function DashboardSkeleton() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-60 rounded-xl md:col-span-2" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  );
}

export default function EtsPortalDashboard() {
  const [, navigate] = useLocation();
  const clientId = portalEtsClient.id;

  const { data: clientData, isLoading: clientLoading } = useQuery<{ client: any }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'orders'],
  });

  const { data: paymentsData } = useQuery<{ payments: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'payments'],
  });

  const { data: checklistData } = useQuery<{ checklist: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'checklist'],
  });

  const todayStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;
    const todaySales = EXPANDED_SALES.filter(s => {
      const t = new Date(s.timestamp).getTime();
      return t >= todayStart && t < todayEnd;
    });
    const totalRevenue = todaySales.reduce((s, x) => s + x.totalAmount, 0);
    const txCount = todaySales.length;
    const cashTotal = todaySales.filter(s => s.paymentMethod === "cash").reduce((s, x) => s + x.totalAmount, 0);
    const upiTotal = todaySales.filter(s => s.paymentMethod === "upi").reduce((s, x) => s + x.totalAmount, 0);
    const cardTotal = todaySales.filter(s => s.paymentMethod === "card").reduce((s, x) => s + x.totalAmount, 0);
    const avgBasket = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;
    const returnsToday = RETURN_RECORDS.filter(r => {
      const t = new Date(r.timestamp).getTime();
      return t >= todayStart && t < todayEnd;
    });
    const returnAmount = returnsToday.reduce((s, r) => s + r.refundTotal, 0);
    return { totalRevenue, txCount, cashTotal, upiTotal, cardTotal, avgBasket, returnAmount, returnsCount: returnsToday.length };
  }, []);

  const topProducts = useMemo(() => {
    const map: Record<string, { productId: string; name: string; image: string | null; qty: number; revenue: number }> = {};
    EXPANDED_SALES.forEach(sale => sale.items.forEach(item => {
      if (!map[item.productId]) {
        map[item.productId] = { productId: item.productId, name: item.name, image: getProductImage(item.productId), qty: 0, revenue: 0 };
      }
      map[item.productId].qty += item.quantity;
      map[item.productId].revenue += item.lineTotal;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, []);

  const stockAlerts = useMemo(() => {
    return INVENTORY
      .filter(inv => inv.currentStock <= inv.reorderThreshold)
      .map(inv => {
        const prod = POS_PRODUCTS.find(p => p.id === inv.productId)!;
        return { ...inv, ...prod };
      })
      .slice(0, 4);
  }, []);

  const recentSales = useMemo(() => EXPANDED_SALES.slice(0, 5), []);

  if (clientLoading) return <DashboardSkeleton />;

  const fallbackClient = {
    id: portalEtsClient.id,
    name: portalEtsClient.name,
    email: portalEtsClient.email,
    phone: portalEtsClient.phone,
    city: portalEtsClient.city,
    stage: "qualified",
    totalPaid: 0,
    pendingDues: 0,
    profileCompleted: false,
    onboardingStep: 1,
    estimatedLaunchDate: null,
    nextAction: null,
    managerName: "EazyToSell Team",
    managerPhone: "+91 93065 66900",
    createdDate: new Date().toISOString().split("T")[0],
  };

  const client = clientData?.client || fallbackClient;
  const orders = ordersData?.orders || [];
  const payments = paymentsData?.payments || [];
  const checklist = checklistData?.checklist || [];

  const stageIdx = PIPELINE_STAGES.indexOf(client.stage);
  const progress = stageIdx >= 0 ? ((stageIdx + 1) / PIPELINE_STAGES.length) * 100 : 10;
  const totalPaid = client.totalPaid || 0;
  const pendingDues = client.pendingDues || 0;
  const kitItemCount = orders.reduce((sum: number, o: any) => sum + (o.itemCount || 0), 0);
  const nextSteps = getNextSteps(client, kitItemCount);
  const checklistDone = checklist.filter((c: any) => c.completed).length;
  const checklistTotal = checklist.length;
  const isLive = client.stage === "launched" || client.stage === "reordering";

  const quickActions = [
    { label: "POS Billing", href: "/portal-ets/pos", img: iconPosBilling, desc: "Start billing" },
    { label: "Inventory", href: "/portal-ets/inventory", img: iconInventory, desc: "Stock control" },
    { label: "Daily Report", href: "/portal-ets/daily-report", img: iconDailyReport, desc: "View analytics" },
    { label: "Returns", href: "/portal-ets/returns", img: iconReturns, desc: "Process refunds" },
    { label: "Cash Register", href: "/portal-ets/cash-register", img: iconCashRegister, desc: "Cash management" },
    { label: "Store Settings", href: "/portal-ets/store-settings", img: iconStoreSettings, desc: "Configure store" },
  ];

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-dashboard">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-100">Welcome back</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading" data-testid="text-dashboard-title">
                {client.name || portalEtsClient.name}'s Store
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-orange-100">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {client.city || portalEtsClient.city}</span>
                <span className="w-px h-4 bg-white/30" />
                <Badge className="bg-white/20 text-white border-0 text-[10px] font-semibold hover:bg-white/30" data-testid="text-client-stage">
                  {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {isLive && (
                <Link href="/portal-ets/pos">
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md gap-2" data-testid="button-open-pos">
                    <Zap className="h-4 w-4" /> Open POS
                  </Button>
                </Link>
              )}
              <a href="https://wa.me/919306566900" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 gap-2" data-testid="button-contact-manager">
                  <Phone className="h-4 w-4" /> Manager
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {!client.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" data-testid="text-onboarding-cta">Complete your store profile</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={(client.onboardingStep || 1) / 5 * 100} className="h-1.5 flex-1 max-w-[140px]" />
                    <span className="text-[10px] text-muted-foreground font-medium" data-testid="text-onboarding-progress">{client.onboardingStep || 1}/5</span>
                  </div>
                </div>
              </div>
              <Link href="/portal-ets/onboarding">
                <Button size="sm" data-testid="button-complete-profile" style={{ backgroundColor: ETS_PORTAL_COLOR }} className="text-white gap-1">
                  Continue <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {isLive && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <img src={iconRevenue} alt="Revenue" className="w-9 h-9 object-contain" />
                  <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wider">Revenue</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-green-800" data-testid="text-today-revenue">{formatINR(todayStats.totalRevenue)}</p>
                <p className="text-[10px] text-green-600 mt-0.5">{todayStats.txCount} transactions today</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <img src={iconAvgBasket} alt="Avg Basket" className="w-9 h-9 object-contain" />
                  <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Avg Basket</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-blue-800" data-testid="text-avg-basket">{formatINR(todayStats.avgBasket)}</p>
                <p className="text-[10px] text-blue-600 mt-0.5">per transaction</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <img src={iconDigitalPayment} alt="Digital" className="w-9 h-9 object-contain" />
                  <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Digital</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-purple-800" data-testid="text-digital-total">{formatINR(todayStats.upiTotal + todayStats.cardTotal)}</p>
                <p className="text-[10px] text-purple-600 mt-0.5">UPI + Card payments</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <img src={iconCashPayment} alt="Cash" className="w-9 h-9 object-contain" />
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Cash</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-amber-800" data-testid="text-cash-total">{formatINR(todayStats.cashTotal)}</p>
                <p className="text-[10px] text-amber-600 mt-0.5">in cash drawer</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {quickActions.map(action => (
                <Link key={action.label} href={action.href}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full" data-testid={`card-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                      <img src={action.img} alt={action.label} className="w-12 h-12 object-contain" />
                      <div>
                        <p className="text-xs font-semibold leading-tight">{action.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{action.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <Card className="md:col-span-3 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Top Selling Products</CardTitle>
                  <Link href="/portal-ets/daily-report">
                    <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:text-orange-700 gap-1 h-7" data-testid="link-view-report">
                      View Report <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {topProducts.map((product, idx) => (
                    <div key={product.productId} className="flex items-center gap-3 py-1.5" data-testid={`top-product-${idx}`}>
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">{idx + 1}</span>
                      <ProductImage src={product.image} alt={product.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{product.qty} sold</p>
                      </div>
                      <span className="text-sm font-bold">{formatINR(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Sales</CardTitle>
                  <Badge variant="outline" className="text-[9px] font-medium">{todayStats.txCount} today</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentSales.map(sale => (
                    <div key={sale.id} className="flex items-center gap-3 py-1.5 border-b last:border-0" data-testid={`recent-sale-${sale.id}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shrink-0">
                        <Receipt className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{sale.receiptNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{sale.items.length} items · {sale.paymentMethod}</p>
                      </div>
                      <span className="text-xs font-bold">{formatINR(sale.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {stockAlerts.length > 0 && (
            <Card className="shadow-sm border border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Alerts
                  </CardTitle>
                  <Link href="/portal-ets/low-stock-alerts">
                    <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700 gap-1 h-7" data-testid="link-view-alerts">
                      View All <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {stockAlerts.map(item => (
                    <div key={item.productId} className={`rounded-lg p-2.5 ${item.currentStock === 0 ? "bg-red-50" : "bg-amber-50"}`} data-testid={`stock-alert-${item.productId}`}>
                      <div className="flex items-center gap-2">
                        <ProductImage src={item.image} alt={item.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className={`text-[10px] font-bold ${item.currentStock === 0 ? "text-red-600" : "text-amber-600"}`}>
                            {item.currentStock === 0 ? "Out of Stock" : `${item.currentStock} left`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={iconCashPayment} alt="Cash" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Cash Payments</p>
                    <p className="text-lg font-bold">{formatINR(todayStats.cashTotal)}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${todayStats.totalRevenue > 0 ? (todayStats.cashTotal / todayStats.totalRevenue * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={iconDigitalPayment} alt="UPI" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">UPI Payments</p>
                    <p className="text-lg font-bold">{formatINR(todayStats.upiTotal)}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${todayStats.totalRevenue > 0 ? (todayStats.upiTotal / todayStats.totalRevenue * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={iconDigitalPayment} alt="Card" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Card Payments</p>
                    <p className="text-lg font-bold">{formatINR(todayStats.cardTotal)}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${todayStats.totalRevenue > 0 ? (todayStats.cardTotal / todayStats.totalRevenue * 100) : 0}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!isLive && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Launch Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Stage {stageIdx + 1} of {PIPELINE_STAGES.length}</span>
                  <span data-testid="text-progress-percent">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Token Paid</span>
                  <span className="font-semibold" style={{ color: ETS_PORTAL_COLOR }}>
                    Current: {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
                  </span>
                  <span>Launch</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {client.nextAction && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">Action Required</h3>
                <p className="text-amber-800 text-xs mt-1" data-testid="text-next-action">{client.nextAction}</p>
                <Button size="sm" variant="outline" className="mt-2 border-amber-300 text-amber-900 text-xs h-7" data-testid="button-complete-now">
                  Complete Now <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Paid</p>
                    <p className="text-lg font-bold" data-testid="text-total-paid">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Inventory</p>
                    <p className="text-lg font-bold" data-testid="text-inventory-units">{kitItemCount} Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Manager</p>
                    <p className="text-sm font-bold" data-testid="text-manager-name">{client.managerName || "EazyToSell Team"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {nextSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <Link key={idx} href={step.href}>
                        <div className={`flex items-start gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors ${!step.active ? "opacity-50" : ""}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.active ? "bg-orange-100" : "bg-muted"}`}>
                            <Icon className={`w-4 h-4 ${step.active ? "text-orange-600" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm" data-testid={`text-next-step-${idx}`}>{step.title}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative border-l-2 border-orange-200 ml-3 space-y-5 pb-2">
                  {[
                    { label: "Onboarding started", completed: stageIdx >= 0, date: client.createdDate },
                    { label: "Token amount received", completed: stageIdx >= 2 },
                    { label: "Inventory ordered", completed: stageIdx >= 4 },
                    { label: stageIdx >= 6 ? "Store launched" : "Estimated launch", completed: stageIdx >= 6, date: client.estimatedLaunchDate },
                  ].map((event, idx) => (
                    <div key={idx} className="pl-5 relative">
                      <div
                        className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: event.completed ? ETS_PORTAL_COLOR : "#e5e7eb" }}
                      />
                      {event.date && <p className="text-[10px] text-muted-foreground">{event.date}</p>}
                      <p className="text-sm font-medium" data-testid={`text-timeline-${idx}`}>{event.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {checklistTotal > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Store Readiness</span>
                  <Link href="/portal-ets/checklist">
                    <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:text-orange-700 gap-1 h-7" data-testid="button-view-checklist">
                      View Checklist <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0} className="flex-1 h-2" />
                  <Badge variant="outline" className="shrink-0 text-[10px]" data-testid="badge-checklist-progress">
                    {checklistDone}/{checklistTotal}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
