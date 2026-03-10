import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User, Store, Ruler, Package, ClipboardCheck,
  ChevronRight, ChevronLeft, Check, Pencil,
  Mail, Phone, MapPin, Building2, IndianRupee,
  Footprints, SquareStack,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

const STEPS = [
  { key: "details", label: "Your Details", icon: User },
  { key: "identity", label: "Store Identity", icon: Store },
  { key: "dimensions", label: "Store Dimensions", icon: Ruler },
  { key: "inventory", label: "Inventory Preferences", icon: Package },
  { key: "review", label: "Review & Confirm", icon: ClipboardCheck },
] as const;

const STORE_TYPES = ["Mini Store", "Standard", "Premium", "Flagship"];
const MARKET_TYPES = ["High Street", "Mall", "Residential"];

const BUDGET_RANGES = [
  { label: "INR 2-5 Lakhs", min: 200000, max: 500000 },
  { label: "INR 5-10 Lakhs", min: 500000, max: 1000000 },
  { label: "INR 10-20 Lakhs", min: 1000000, max: 2000000 },
  { label: "INR 20+ Lakhs", min: 2000000, max: 5000000 },
];

const CATEGORY_OPTIONS = [
  "Electronics & Gadgets",
  "Home & Kitchen",
  "Fashion Accessories",
  "Toys & Games",
  "Health & Wellness",
  "Sports & Outdoors",
];

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  storeName: string;
  storeType: string;
  marketType: string;
  storeAddress: string;
  storeArea: string;
  storeFrontage: string;
  monthlyRent: string;
  expectedFootfall: string;
  inventoryBudget: string;
  categoryPreferences: string[];
}

function OnboardingSkeleton() {
  return (
    <div className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function EtsPortalOnboarding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const clientId = portalEtsClient.id;
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    storeName: "",
    storeType: "",
    marketType: "",
    storeAddress: "",
    storeArea: "",
    storeFrontage: "",
    monthlyRent: "",
    expectedFootfall: "",
    inventoryBudget: "",
    categoryPreferences: [],
  });

  const { data: clientData, isLoading } = useQuery<{ client: any }>({
    queryKey: ["/api/ets-portal/client", clientId],
  });

  useEffect(() => {
    if (clientData?.client) {
      const c = clientData.client;
      const saved = (() => {
        try {
          const raw = localStorage.getItem(`ets_onboarding_${clientId}`);
          return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
      })();
      setForm((prev) => ({
        ...prev,
        name: c.name || prev.name || "",
        phone: c.phone || prev.phone || "",
        email: c.email || prev.email || "",
        city: c.city || prev.city || "",
        state: c.state || prev.state || "",
        storeAddress: c.storeAddress || prev.storeAddress || "",
        storeArea: c.storeSize ? String(c.storeSize) : prev.storeArea || "",
        storeFrontage: c.storeFrontage || prev.storeFrontage || "",
        storeName: saved.storeName || prev.storeName || "",
        storeType: saved.storeType || prev.storeType || "",
        marketType: saved.marketType || prev.marketType || "",
        monthlyRent: saved.monthlyRent || prev.monthlyRent || "",
        expectedFootfall: saved.expectedFootfall || prev.expectedFootfall || "",
        inventoryBudget: saved.inventoryBudget || prev.inventoryBudget || "",
        categoryPreferences: saved.categoryPreferences || prev.categoryPreferences || [],
      }));
    }
  }, [clientData]);

  const saveMutation = useMutation({
    mutationFn: async (fields: Partial<FormData>) => {
      const payload: Record<string, any> = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.email !== undefined) payload.email = fields.email;
      if (fields.phone !== undefined) payload.phone = fields.phone;
      if (fields.city !== undefined) payload.city = fields.city;
      if (fields.state !== undefined) payload.state = fields.state;
      if (fields.storeAddress !== undefined) payload.storeAddress = fields.storeAddress;
      if (fields.storeArea !== undefined) payload.storeArea = fields.storeArea;
      if (fields.storeFrontage !== undefined) payload.storeFrontage = fields.storeFrontage;
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/profile`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save progress.", variant: "destructive" });
    },
  });

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categoryPreferences: prev.categoryPreferences.includes(cat)
        ? prev.categoryPreferences.filter((c) => c !== cat)
        : [...prev.categoryPreferences, cat],
    }));
  };

  const saveWizardLocally = () => {
    localStorage.setItem(
      `ets_onboarding_${clientId}`,
      JSON.stringify({
        storeName: form.storeName,
        storeType: form.storeType,
        marketType: form.marketType,
        monthlyRent: form.monthlyRent,
        expectedFootfall: form.expectedFootfall,
        inventoryBudget: form.inventoryBudget,
        categoryPreferences: form.categoryPreferences,
      }),
    );
  };

  const handleNext = () => {
    if (currentStep === 0) {
      saveMutation.mutate({
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        state: form.state,
      });
    } else if (currentStep === 1) {
      saveWizardLocally();
    } else if (currentStep === 2) {
      saveMutation.mutate({
        storeAddress: form.storeAddress,
        storeArea: form.storeArea,
        storeFrontage: form.storeFrontage,
      });
    } else if (currentStep === 3) {
      saveWizardLocally();
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleComplete = () => {
    saveWizardLocally();
    saveMutation.mutate(
      {
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        state: form.state,
        storeAddress: form.storeAddress,
        storeArea: form.storeArea,
        storeFrontage: form.storeFrontage,
      },
    );
    toast({
      title: "Onboarding Complete",
      description: "Your store setup information has been saved successfully.",
    });
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const progressPercent = Math.round(((currentStep + 1) / STEPS.length) * 100);

  if (isLoading) return <OnboardingSkeleton />;

  return (
    <div className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="text-onboarding-title">
          Store Onboarding
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete the setup wizard to get your store ready for launch
        </p>
      </div>

      <Card data-testid="card-step-indicators">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <span className="text-xs text-muted-foreground" data-testid="text-step-progress">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <Badge
              variant="outline"
              className="text-[10px]"
              data-testid="badge-progress-percent"
            >
              {progressPercent}%
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2 mb-5" data-testid="progress-onboarding" />

          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <button
                  key={step.key}
                  onClick={() => idx <= currentStep && goToStep(idx)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-2 rounded-md transition-colors",
                    isCurrent && "bg-muted/50",
                    idx <= currentStep && "cursor-pointer",
                    idx > currentStep && "cursor-default opacity-50"
                  )}
                  disabled={idx > currentStep}
                  data-testid={`step-indicator-${step.key}`}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted && "border-transparent",
                      isCurrent && "border-transparent ring-2 ring-offset-2 ring-offset-background",
                      !isCompleted && !isCurrent && "border-border bg-background"
                    )}
                    style={{
                      backgroundColor: isCompleted || isCurrent ? ETS_PORTAL_COLOR : undefined,
                      color: isCompleted || isCurrent ? "#fff" : undefined,
                      ...(isCurrent ? { "--tw-ring-color": ETS_PORTAL_COLOR } as any : {}),
                    }}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] sm:text-xs font-medium text-center leading-tight",
                    isCurrent && "font-bold",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )} style={isCurrent ? { color: ETS_PORTAL_COLOR } : undefined}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentStep === 0 && (
        <Card data-testid="card-step-details">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <User className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Your Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                icon={User}
                label="Full Name"
                value={form.name}
                onChange={(v) => updateField("name", v)}
                testId="input-name"
              />
              <FormField
                icon={Phone}
                label="Phone Number"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                testId="input-phone"
              />
              <FormField
                icon={Mail}
                label="Email Address"
                value={form.email}
                onChange={(v) => updateField("email", v)}
                type="email"
                testId="input-email"
              />
              <FormField
                icon={MapPin}
                label="City"
                value={form.city}
                onChange={(v) => updateField("city", v)}
                testId="input-city"
              />
              <FormField
                icon={MapPin}
                label="State"
                value={form.state}
                onChange={(v) => updateField("state", v)}
                testId="input-state"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card data-testid="card-step-identity">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Store className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Store Identity</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                icon={Store}
                label="Store Name"
                value={form.storeName}
                onChange={(v) => updateField("storeName", v)}
                testId="input-store-name"
              />
              <div className="space-y-1.5" data-testid="select-store-type-wrapper">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-3 shrink-0" />
                  Store Type
                </Label>
                <Select value={form.storeType} onValueChange={(v) => updateField("storeType", v)}>
                  <SelectTrigger data-testid="select-store-type">
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_TYPES.map((t) => (
                      <SelectItem key={t} value={t} data-testid={`option-store-type-${t.toLowerCase().replace(/\s+/g, "-")}`}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5" data-testid="select-market-type-wrapper">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3 shrink-0" />
                  Market Type
                </Label>
                <Select value={form.marketType} onValueChange={(v) => updateField("marketType", v)}>
                  <SelectTrigger data-testid="select-market-type">
                    <SelectValue placeholder="Select market type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKET_TYPES.map((t) => (
                      <SelectItem key={t} value={t} data-testid={`option-market-type-${t.toLowerCase().replace(/\s+/g, "-")}`}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card data-testid="card-step-dimensions">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Ruler className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Store Dimensions</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField
                  icon={MapPin}
                  label="Store Address"
                  value={form.storeAddress}
                  onChange={(v) => updateField("storeAddress", v)}
                  testId="input-store-address"
                />
              </div>
              <FormField
                icon={Ruler}
                label="Store Area (sqft)"
                value={form.storeArea}
                onChange={(v) => updateField("storeArea", v)}
                type="number"
                testId="input-store-area"
              />
              <FormField
                icon={Ruler}
                label="Store Frontage (ft)"
                value={form.storeFrontage}
                onChange={(v) => updateField("storeFrontage", v)}
                testId="input-store-frontage"
              />
              <FormField
                icon={IndianRupee}
                label="Monthly Rent (INR)"
                value={form.monthlyRent}
                onChange={(v) => updateField("monthlyRent", v)}
                type="number"
                testId="input-monthly-rent"
              />
              <FormField
                icon={Footprints}
                label="Expected Daily Footfall"
                value={form.expectedFootfall}
                onChange={(v) => updateField("expectedFootfall", v)}
                type="number"
                testId="input-expected-footfall"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card data-testid="card-step-inventory">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Package className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Inventory Preferences</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5" data-testid="select-budget-wrapper">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <IndianRupee className="size-3 shrink-0" />
                  Inventory Budget
                </Label>
                <Select value={form.inventoryBudget} onValueChange={(v) => updateField("inventoryBudget", v)}>
                  <SelectTrigger data-testid="select-inventory-budget">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((r) => (
                      <SelectItem key={r.label} value={r.label} data-testid={`option-budget-${r.min}`}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
                  <SquareStack className="size-3 shrink-0" />
                  Category Preferences
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="category-preferences">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = form.categoryPreferences.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-left transition-colors border",
                          isSelected
                            ? "border-transparent bg-green-50/60 dark:bg-green-900/10 font-medium"
                            : "border-border"
                        )}
                        style={isSelected ? { borderColor: `${ETS_PORTAL_COLOR}40` } : undefined}
                        data-testid={`category-option-${cat.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-")}`}
                      >
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            isSelected ? "border-transparent" : "border-border"
                          )}
                          style={isSelected ? { backgroundColor: ETS_PORTAL_COLOR } : undefined}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <div className="space-y-4" data-testid="step-review">
          <ReviewSection
            title="Your Details"
            icon={User}
            stepIndex={0}
            onEdit={goToStep}
            items={[
              { label: "Full Name", value: form.name },
              { label: "Phone", value: form.phone },
              { label: "Email", value: form.email },
              { label: "City", value: form.city },
              { label: "State", value: form.state },
            ]}
          />
          <ReviewSection
            title="Store Identity"
            icon={Store}
            stepIndex={1}
            onEdit={goToStep}
            items={[
              { label: "Store Name", value: form.storeName },
              { label: "Store Type", value: form.storeType },
              { label: "Market Type", value: form.marketType },
            ]}
          />
          <ReviewSection
            title="Store Dimensions"
            icon={Ruler}
            stepIndex={2}
            onEdit={goToStep}
            items={[
              { label: "Store Address", value: form.storeAddress },
              { label: "Store Area", value: form.storeArea ? `${form.storeArea} sqft` : "" },
              { label: "Store Frontage", value: form.storeFrontage },
              { label: "Monthly Rent", value: form.monthlyRent ? `INR ${Number(form.monthlyRent).toLocaleString("en-IN")}` : "" },
              { label: "Expected Footfall", value: form.expectedFootfall ? `${form.expectedFootfall}/day` : "" },
            ]}
          />
          <ReviewSection
            title="Inventory Preferences"
            icon={Package}
            stepIndex={3}
            onEdit={goToStep}
            items={[
              { label: "Budget", value: form.inventoryBudget },
              { label: "Categories", value: form.categoryPreferences.join(", ") },
            ]}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          data-testid="button-back"
        >
          <ChevronLeft className="size-4 mr-1.5" />
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={saveMutation.isPending}
            data-testid="button-next"
          >
            {saveMutation.isPending ? "Saving..." : "Next"}
            <ChevronRight className="size-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={saveMutation.isPending}
            data-testid="button-complete-setup"
          >
            {saveMutation.isPending ? "Saving..." : "Complete Setup"}
            <Check className="size-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function FormField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  testId,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3 shrink-0" />
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        data-testid={testId}
      />
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  stepIndex,
  onEdit,
  items,
}: {
  title: string;
  icon: any;
  stepIndex: number;
  onEdit: (step: number) => void;
  items: { label: string; value: string }[];
}) {
  return (
    <Card data-testid={`card-review-${stepIndex}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(stepIndex)}
            data-testid={`button-edit-section-${stepIndex}`}
          >
            <Pencil className="size-3 mr-1.5" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="space-y-0.5" data-testid={`review-field-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value || "—"}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
