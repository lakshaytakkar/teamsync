import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Store, Calendar, Shield, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  portalEtsClient,
  ETS_PORTAL_COLOR,
  ETS_STAGE_DISPLAY_LABELS,
} from "@/lib/mock-data-portal-ets";

function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid md:grid-cols-3 gap-8">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl md:col-span-2" />
      </div>
    </div>
  );
}

export default function EtsPortalProfile() {
  const clientId = portalEtsClient.id;

  const { data: clientData, isLoading } = useQuery<{ client: any }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  if (isLoading) return <ProfileSkeleton />;

  const client = clientData?.client;
  if (!client) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground p-6">
        Unable to load profile data. Please try again.
      </div>
    );
  }

  const name = client.name || portalEtsClient.name;
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const detailItems = [
    { icon: Mail, label: "Email", value: client.email || portalEtsClient.email },
    { icon: Phone, label: "Phone", value: client.phone || portalEtsClient.phone },
    { icon: MapPin, label: "City", value: client.city || portalEtsClient.city },
    { icon: Store, label: "Store Address", value: client.storeAddress || "Not set" },
    { icon: Building2, label: "Store Area", value: client.storeArea ? `${client.storeArea} sq ft` : "Not specified" },
    { icon: Calendar, label: "Joined", value: client.createdDate || "—" },
    { icon: Shield, label: "Account Manager", value: client.managerName || "EazyToSell Team" },
  ];

  return (
    <div className="space-y-8 p-6" data-testid="ets-portal-profile">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-profile-title">My Profile</h1>
        <p className="text-muted-foreground">Your account information and store details.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback
                className="text-2xl font-bold text-white"
                style={{ backgroundColor: ETS_PORTAL_COLOR }}
                data-testid="text-avatar-initials"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">{name}</h2>
            <Badge
              className="text-white border-0 mb-4"
              style={{ backgroundColor: ETS_PORTAL_COLOR }}
              data-testid="badge-profile-stage"
            >
              {ETS_STAGE_DISPLAY_LABELS[client.stage] || client.stage}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Partner ID: <span className="font-mono font-medium" data-testid="text-partner-id">ETS-{String(client.id).padStart(4, '0')}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              {detailItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="font-medium text-sm mt-0.5" data-testid={`text-detail-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Package</p>
              <p className="font-semibold" data-testid="text-package">{client.packageName || "Standard Package"}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Investment</p>
              <p className="font-semibold" data-testid="text-investment">
                {client.totalInvestment ? `\u20B9${client.totalInvestment.toLocaleString("en-IN")}` : "As per agreement"}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Launch</p>
              <p className="font-semibold" data-testid="text-launch-date">{client.estimatedLaunchDate || "TBD"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
