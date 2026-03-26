import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User, Store, Package, ClipboardCheck,
  ChevronRight, ChevronLeft, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
} from "@/lib/mock-data-portal-ets";

const STEPS = [
  { id: 1, title: "Personal Details", icon: User, description: "Your name, email, and phone number." },
  { id: 2, title: "Store Location", icon: Store, description: "Your store city, address, and area." },
  { id: 3, title: "Business Preferences", icon: Package, description: "Product categories and store size." },
  { id: 4, title: "Review & Confirm", icon: ClipboardCheck, description: "Review your information before submitting." },
];

function OnboardingSkeleton() {
  return (
    <div className="px-16 lg:px-24 py-6 space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function EtsPortalOnboarding() {
  const clientId = portalEtsClient.id;
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: portalEtsClient.name,
    email: portalEtsClient.email,
    phone: portalEtsClient.phone,
    city: portalEtsClient.city,
    storeAddress: "",
    storeArea: "",
    preferredCategories: "",
    notes: "",
  });

  const { data: clientData, isLoading } = useQuery<{ client: any }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ets-portal/client', clientId] });
    },
  });

  if (isLoading) return <OnboardingSkeleton />;

  const progress = (currentStep / STEPS.length) * 100;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      saveMutation.mutate({
        ...formData,
        profileCompleted: true,
        onboardingStep: STEPS.length,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="px-16 lg:px-24 py-6 space-y-6" data-testid="ets-portal-onboarding">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-onboarding-title">Store Onboarding</h1>
        <p className="text-muted-foreground">Complete your profile to get started with EazyToSell.</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                      ? "border-orange-500 text-orange-600"
                      : "border-muted-foreground/20 text-muted-foreground/40"
                }`}
                style={currentStep === step.id ? { borderColor: ETS_PORTAL_COLOR, color: ETS_PORTAL_COLOR } : {}}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className="text-[11px] mt-1 text-center hidden sm:block">{step.title}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? "bg-green-500" : "bg-muted-foreground/15"}`} />
            )}
          </div>
        ))}
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={e => updateField("phone", e.target.value)} data-testid="input-phone" />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={e => updateField("city", e.target.value)} data-testid="input-city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Input id="address" value={formData.storeAddress} onChange={e => updateField("storeAddress", e.target.value)} placeholder="Full street address" data-testid="input-address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Store Area (sq ft)</Label>
                <Input id="area" type="number" value={formData.storeArea} onChange={e => updateField("storeArea", e.target.value)} placeholder="e.g. 400" data-testid="input-area" />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="categories">Preferred Product Categories</Label>
                <Input id="categories" value={formData.preferredCategories} onChange={e => updateField("preferredCategories", e.target.value)} placeholder="e.g. Electronics, Home Decor, Fashion" data-testid="input-categories" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Input id="notes" value={formData.notes} onChange={e => updateField("notes", e.target.value)} placeholder="Any other details you'd like to share" data-testid="input-notes" />
              </div>
            </>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Name", value: formData.name },
                  { label: "Email", value: formData.email },
                  { label: "Phone", value: formData.phone },
                  { label: "City", value: formData.city },
                  { label: "Store Address", value: formData.storeAddress || "Not provided" },
                  { label: "Store Area", value: formData.storeArea ? `${formData.storeArea} sq ft` : "Not specified" },
                  { label: "Categories", value: formData.preferredCategories || "Not specified" },
                  { label: "Notes", value: formData.notes || "None" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="font-medium text-sm mt-1" data-testid={`text-review-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} data-testid="button-back">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleNext}
          style={{ backgroundColor: ETS_PORTAL_COLOR }}
          className="text-white"
          disabled={saveMutation.isPending}
          data-testid="button-next"
        >
          {currentStep === STEPS.length ? (saveMutation.isPending ? "Saving..." : "Submit") : "Next"}
          {currentStep < STEPS.length && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
