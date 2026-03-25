import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  AlertCircle, CheckCircle2, ChevronRight, Clock, MapPin,
  Package, Phone, Store, ShoppingCart, FileText, CreditCard,
  TrendingUp, DollarSign, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DESCRIPTIONS,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";

const PIPELINE_STAGES = [
  "new-lead", "qualified", "token-paid", "store-design",
  "inventory-ordered", "in-transit", "launched", "reordering",
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function getDaysRemaining(estimatedLaunchDate: string | null): string {
  if (!estimatedLaunchDate) return "TBD";
  const days = Math.ceil((new Date(estimatedLaunchDate).getTime() - new Date().getTime()) / 86400000);
  if (days < 0) return "Launched";
  if (days === 0) return "Today";
  return `${days} days`;
}

function getNextSteps(client: any, kitItemCount: number): { title: string; description: string; active: boolean; href: string }[] {
  const steps: { title: string; description: string; active: boolean; href: string }[] = [];
  const stageIdx = PIPELINE_STAGES.indexOf(client.stage);

  if (!client.profileCompleted) {
    steps.push({ title: "Complete your store profile", description: "Fill in your store details and preferences.", active: true, href: "/portal-ets/onboarding" });
  }

  if (stageIdx >= 2 && stageIdx < 5) {
    if (kitItemCount === 0) {
      steps.push({ title: "Select your launch inventory", description: "Browse the catalog and build your launch kit.", active: steps.length === 0, href: "/portal-ets/catalog" });
    }
    if (stageIdx === 2) {
      steps.push({ title: "Approve 3D store design", description: "Review the layout shared by the design team.", active: steps.length === 0, href: "/portal-ets/store" });
      steps.push({ title: "Release partial payment", description: "50% payment to start production.", active: false, href: "/portal-ets/payments" });
    }
    if (stageIdx >= 4) {
      steps.push({ title: "Track your order shipments", description: "Monitor delivery status for your inventory.", active: steps.length === 0, href: "/portal-ets/orders" });
      steps.push({ title: "Complete readiness checklist", description: "Ensure your store is ready for launch.", active: false, href: "/portal-ets/checklist" });
    }
  } else {
    if (kitItemCount === 0) {
      steps.push({ title: "Select your launch inventory", description: "Browse the catalog and build your launch kit.", active: steps.length === 0, href: "/portal-ets/catalog" });
    }
    steps.push({ title: "Review your program scope", description: "Understand the services included in your package.", active: steps.length === 0, href: "/portal-ets/store" });
    steps.push({ title: "Connect with your manager", description: "Reach out via WhatsApp for any questions.", active: false, href: "/portal-ets/support" });
  }

  return steps.slice(0, 3);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-60 rounded-xl" />
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

  if (clientLoading) return <DashboardSkeleton />;

  const client = clientData?.client;
  const orders = ordersData?.orders || [];
  const payments = paymentsData?.payments || [];
  const checklist = checklistData?.checklist || [];

  if (!client) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground" data-testid="text-no-client">
        Unable to load client data. Please try again.
      </div>
    );
  }

  const stageIdx = PIPELINE_STAGES.indexOf(client.stage);
  const progress = stageIdx >= 0 ? ((stageIdx + 1) / PIPELINE_STAGES.length) * 100 : 10;
  const totalPaid = client.totalPaid || 0;
  const pendingDues = client.pendingDues || 0;
  const totalInvestment = totalPaid + pendingDues;
  const kitItemCount = orders.reduce((sum: number, o: any) => sum + (o.itemCount || 0), 0);
  const daysRemaining = getDaysRemaining(client.estimatedLaunchDate || null);
  const nextSteps = getNextSteps(client, kitItemCount);
  const checklistDone = checklist.filter((c: any) => c.completed).length;
  const checklistTotal = checklist.length;

  const timelineEvents = [
    { label: "Onboarding started", completed: stageIdx >= 0, date: client.createdDate },
    { label: "Token amount received", completed: stageIdx >= 2 },
    { label: "Inventory ordered", completed: stageIdx >= 4 },
    { label: stageIdx >= 6 ? "Store launched" : "Estimated launch", completed: stageIdx >= 6, date: client.estimatedLaunchDate },
  ];

  return (
    <div className="space-y-8 p-6" data-testid="ets-portal-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">My Store Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            <span data-testid="text-client-city">{client.city || portalEtsClient.city}</span> Store
            <span className="font-medium" style={{ color: ETS_PORTAL_COLOR }} data-testid="text-client-stage">
              {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
            </span>
          </p>
        </div>
        <a href="https://wa.me/919306566900" target="_blank" rel="noopener noreferrer">
          <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-contact-manager">
            <Phone className="h-4 w-4 mr-2" /> Contact Manager
          </Button>
        </a>
      </div>

      {!client.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5" style={{ color: ETS_PORTAL_COLOR }} />
                  <h3 className="text-lg font-semibold" data-testid="text-onboarding-cta">Complete Your Store Profile</h3>
                </div>
                <p className="text-sm text-muted-foreground">Finish setting up your store details to unlock all features.</p>
                <div className="flex items-center gap-3 mt-2">
                  <Progress value={(client.onboardingStep || 1) / 5 * 100} className="h-2 flex-1 max-w-[200px]" />
                  <span className="text-xs text-muted-foreground font-medium" data-testid="text-onboarding-progress">{client.onboardingStep || 1}/5 steps</span>
                </div>
              </div>
              <Link href="/portal-ets/onboarding">
                <Button data-testid="button-complete-profile" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
                  Continue Setup <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/10 dark:border-orange-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Launch Progress</CardTitle>
          <CardDescription data-testid="text-launch-countdown">
            {daysRemaining === "TBD"
              ? "Launch date to be determined."
              : daysRemaining === "Launched"
                ? "Your store has launched!"
                : daysRemaining === "Today"
                  ? "Your store opens today!"
                  : `You are on track for opening in ${daysRemaining}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Stage {stageIdx + 1} of {PIPELINE_STAGES.length}</span>
              <span data-testid="text-progress-percent">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
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
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Action Required</h3>
            <p className="text-amber-800 dark:text-amber-200 text-sm mt-1" data-testid="text-next-action">{client.nextAction}</p>
            <Button size="sm" variant="outline" className="mt-3 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100" data-testid="button-complete-now">
              Complete Now <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-paid">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInvestment > 0 ? `of ${formatCurrency(totalInvestment)} total` : "No payments yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inventory-units">{kitItemCount} Items</div>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-inventory-items">
              {kitItemCount > 0 ? `${orders.length} orders placed` : "Launch Kit pending"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold" data-testid="text-manager-name">{client.managerName || "EazyToSell Team"}</div>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-manager-phone">{client.managerPhone || "+91 93065 66900"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextSteps.map((step, idx) => (
                <Link key={idx} href={step.href}>
                  <div className={`flex items-start gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors ${!step.active ? "opacity-60" : ""}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${step.active ? "text-white" : "bg-muted text-muted-foreground"}`}
                      style={step.active ? { backgroundColor: ETS_PORTAL_COLOR } : {}}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-next-step-${idx}`}>{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-muted ml-2 space-y-6 pb-2">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="pl-6 relative">
                  <div
                    className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: event.completed ? ETS_PORTAL_COLOR : "rgba(249, 115, 22, 0.3)" }}
                  />
                  {event.date && <p className="text-xs text-muted-foreground mb-0.5">{event.date}</p>}
                  <p className="text-sm font-medium" data-testid={`text-timeline-${idx}`}>{event.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {checklistTotal > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Store Readiness</CardTitle>
              <Link href="/portal-ets/checklist">
                <Button variant="outline" size="sm" data-testid="button-view-checklist">
                  View Checklist <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0} className="flex-1 h-2.5" />
              <Badge variant="outline" className="shrink-0" data-testid="badge-checklist-progress">
                {checklistDone}/{checklistTotal}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
