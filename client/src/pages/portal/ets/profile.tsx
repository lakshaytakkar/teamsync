import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User, Mail, Phone, MapPin, Store, Ruler, Building2,
  CreditCard, FileText, Shield, Award, TrendingUp,
  CheckCircle2, Circle, Pencil, Save, X, IndianRupee,
  Briefcase, Hash, Landmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";

function formatINR(val: number) {
  if (val >= 100000) return `INR ${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `INR ${(val / 1000).toFixed(0)}K`;
  return `INR ${val.toLocaleString("en-IN")}`;
}

const tierColors: Record<string, { bg: string; text: string; label: string }> = {
  lite: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", label: "Lite" },
  pro: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Pro" },
  elite: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Elite" },
};

function ProfileSkeleton() {
  return (
    <div className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface EditableFields {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  storeAddress: string;
  storeArea: string;
  storeFrontage: string;
}

export default function EtsPortalProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const clientId = portalEtsClient.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields>({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    storeAddress: "",
    storeArea: "",
    storeFrontage: "",
  });

  const { data: clientData, isLoading } = useQuery<{ client: any }>({
    queryKey: ["/api/ets-portal/client", clientId],
  });

  const { data: paymentsData } = useQuery<{ payments: any[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "payments"],
  });

  const { data: checklistData } = useQuery<{ checklist: any[] }>({
    queryKey: ["/api/ets-portal/client", clientId, "checklist"],
  });

  const saveMutation = useMutation({
    mutationFn: async (fields: EditableFields) => {
      return apiRequest("PATCH", `/api/ets-portal/client/${clientId}/profile`, fields);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/ets-portal/client", clientId] });
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile changes.", variant: "destructive" });
    },
  });

  if (isLoading) return <ProfileSkeleton />;

  const client = clientData?.client;
  const payments = paymentsData?.payments || [];
  const checklist = checklistData?.checklist || [];

  if (!client) {
    return (
      <div className="px-4 sm:px-8 lg:px-24 py-8">
        <div className="py-20 text-center text-sm text-muted-foreground" data-testid="text-no-client">
          Unable to load profile data. Please try again.
        </div>
      </div>
    );
  }

  const tier = tierColors[client.packageTier] || tierColors.lite;
  const totalPaid = client.totalPaid || 0;
  const pendingDues = client.pendingDues || 0;
  const totalInvestment = totalPaid + pendingDues;

  const milestones = [
    { key: "qualification", label: "Qualification Approved", done: ["qualified", "token-paid", "store-design", "inventory-ordered", "in-transit", "launched", "reordering"].includes(client.stage) },
    { key: "agreement", label: "Agreement Signed", done: ["token-paid", "store-design", "inventory-ordered", "in-transit", "launched", "reordering"].includes(client.stage) },
    { key: "scope", label: "Scope Document Finalized", done: ["store-design", "inventory-ordered", "in-transit", "launched", "reordering"].includes(client.stage) },
    { key: "design", label: "Store Design Approved", done: ["inventory-ordered", "in-transit", "launched", "reordering"].includes(client.stage) },
    { key: "inventory", label: "Inventory Ordered", done: ["in-transit", "launched", "reordering"].includes(client.stage) },
    { key: "launch", label: "Store Launched", done: ["launched", "reordering"].includes(client.stage) },
  ];

  const handleEditStart = () => {
    setEditFields({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      city: client.city || "",
      state: client.state || "",
      storeAddress: client.storeAddress || "",
      storeArea: client.storeSize ? String(client.storeSize) : "",
      storeFrontage: client.storeFrontage || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    saveMutation.mutate(editFields);
  };

  const updateField = (key: keyof EditableFields, value: string) => {
    setEditFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="px-4 sm:px-8 lg:px-24 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground" data-testid="text-profile-title">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your personal and store information</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-edit">
                <X className="size-4 mr-1.5" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-profile">
                <Save className="size-4 mr-1.5" />
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEditStart} data-testid="button-edit-profile">
              <Pencil className="size-4 mr-1.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-personal-info">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow
                  icon={User}
                  label="Full Name"
                  value={client.name}
                  editValue={editFields.name}
                  isEditing={isEditing}
                  onChange={(v) => updateField("name", v)}
                  testId="field-name"
                />
                <FieldRow
                  icon={Mail}
                  label="Email Address"
                  value={client.email || "—"}
                  editValue={editFields.email}
                  isEditing={isEditing}
                  onChange={(v) => updateField("email", v)}
                  testId="field-email"
                />
                <FieldRow
                  icon={Phone}
                  label="Phone Number"
                  value={client.phone || "—"}
                  editValue={editFields.phone}
                  isEditing={isEditing}
                  onChange={(v) => updateField("phone", v)}
                  testId="field-phone"
                />
                <FieldRow
                  icon={MapPin}
                  label="City"
                  value={client.city || "—"}
                  editValue={editFields.city}
                  isEditing={isEditing}
                  onChange={(v) => updateField("city", v)}
                  testId="field-city"
                />
                <FieldRow
                  icon={MapPin}
                  label="State"
                  value={client.state || "—"}
                  editValue={editFields.state}
                  isEditing={isEditing}
                  onChange={(v) => updateField("state", v)}
                  testId="field-state"
                />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-store-info">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Store className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Store Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow
                  icon={MapPin}
                  label="Store Address"
                  value={client.storeAddress || "—"}
                  editValue={editFields.storeAddress}
                  isEditing={isEditing}
                  onChange={(v) => updateField("storeAddress", v)}
                  testId="field-store-address"
                />
                <FieldRow
                  icon={Ruler}
                  label="Store Area (sqft)"
                  value={client.storeSize ? `${client.storeSize} sqft` : "—"}
                  editValue={editFields.storeArea}
                  isEditing={isEditing}
                  onChange={(v) => updateField("storeArea", v)}
                  testId="field-store-area"
                  inputType="number"
                />
                <FieldRow
                  icon={Ruler}
                  label="Store Frontage"
                  value={client.storeFrontage || "—"}
                  editValue={editFields.storeFrontage}
                  isEditing={isEditing}
                  onChange={(v) => updateField("storeFrontage", v)}
                  testId="field-store-frontage"
                />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-business-info">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Business Information</h3>
                <Badge variant="outline" className="text-[10px] ml-auto">Read Only</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField icon={Hash} label="GST Number" value={client.gstNumber || "Not provided"} testId="field-gst" />
                <ReadOnlyField icon={CreditCard} label="PAN Number" value={client.panNumber || "Not provided"} testId="field-pan" />
                <ReadOnlyField icon={Landmark} label="Bank Name" value={client.bankName || "Not provided"} testId="field-bank-name" />
                <ReadOnlyField icon={FileText} label="Account Number" value={client.bankAccountNumber || "Not provided"} testId="field-bank-account" />
                <ReadOnlyField icon={Briefcase} label="IFSC Code" value={client.bankIfsc || "Not provided"} testId="field-bank-ifsc" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-program-status">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Program Status</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Current Stage</span>
                  <Badge
                    className="text-[10px] border-0"
                    style={{ backgroundColor: `${ETS_PORTAL_COLOR}15`, color: ETS_PORTAL_COLOR }}
                    data-testid="badge-current-stage"
                  >
                    {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Package Tier</span>
                  <Badge className={cn("text-[10px] border-0", tier.bg, tier.text)} data-testid="badge-package-tier">
                    {tier.label}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Lead Score</span>
                  <span className="text-sm font-bold" data-testid="text-lead-score">{client.score || 0}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Total Investment</span>
                  <span className="text-sm font-bold" data-testid="text-total-investment">{formatINR(totalInvestment)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Amount Paid</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400" data-testid="text-amount-paid">{formatINR(totalPaid)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Pending Dues</span>
                  <span className={cn(
                    "text-sm font-bold",
                    pendingDues > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                  )} data-testid="text-pending-dues">
                    {pendingDues > 0 ? formatINR(pendingDues) : "All Clear"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-milestones">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Milestones</h3>
              </div>

              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.key}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5",
                      m.done ? "bg-green-50/60 dark:bg-green-900/10" : "bg-muted/30"
                    )}
                    data-testid={`milestone-${m.key}`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      m.done ? "font-medium" : "text-muted-foreground"
                    )}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-account-info">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Account Details</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Client ID</span>
                  <span className="text-xs font-mono font-medium" data-testid="text-client-id">#{client.id}</span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Account Manager</span>
                  <span className="text-xs font-medium" data-testid="text-account-manager">{client.assignedTo || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Lead Source</span>
                  <span className="text-xs font-medium" data-testid="text-lead-source">{client.leadSource || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Joined</span>
                  <span className="text-xs font-medium" data-testid="text-joined-date">{client.createdDate || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  editValue,
  isEditing,
  onChange,
  testId,
  inputType = "text",
}: {
  icon: any;
  label: string;
  value: string;
  editValue: string;
  isEditing: boolean;
  onChange: (v: string) => void;
  testId: string;
  inputType?: string;
}) {
  return (
    <div className="space-y-1.5" data-testid={testId}>
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3 shrink-0" />
        {label}
      </Label>
      {isEditing ? (
        <Input
          type={inputType}
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`input-${testId}`}
        />
      ) : (
        <p className="text-sm font-medium" data-testid={`text-${testId}`}>{value}</p>
      )}
    </div>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  testId,
}: {
  icon: any;
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="space-y-1.5" data-testid={testId}>
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3 shrink-0" />
        {label}
      </Label>
      <p className="text-sm font-medium text-muted-foreground" data-testid={`text-${testId}`}>{value}</p>
    </div>
  );
}
