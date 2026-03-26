import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEtsRole } from "@/lib/use-ets-role";
import { Users, UserPlus, Eye, EyeOff, Info } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: "owner" | "cashier";
  active: boolean;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Ramesh Kumar", phone: "+91 98765 43210", role: "cashier", active: true },
  { id: "s2", name: "Priya Sharma", phone: "+91 87654 32109", role: "cashier", active: false },
];

export default function EtsTeamSettings() {
  const { subRole, setSubRole, isCashier } = useEtsRole();
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const toggleCashierMode = () => {
    setSubRole(isCashier ? "owner" : "cashier");
  };

  const toggleStaffRole = (id: string) => {
    setStaff(prev =>
      prev.map(s => s.id === id ? { ...s, role: s.role === "cashier" ? "owner" : "cashier" } : s)
    );
  };

  const toggleActive = (id: string) => {
    setStaff(prev =>
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    );
  };

  return (
    <div className="px-6 lg:px-10 py-6 space-y-6" data-testid="team-settings-page">
      <div>
        <h1 className="text-xl font-bold">Team Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store staff and access roles</p>
      </div>

      <Card className="border-orange-200 bg-orange-50/40 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800">Cashier Mode</p>
              <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                When a staff member logs in with the cashier role, they can only access POS Billing and Stock Receive.
                Reports, settings, payments, and financial data are hidden from cashiers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Preview Role (Dev Mode)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50/50" data-testid="cashier-mode-toggle">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCashier ? "bg-amber-100" : "bg-orange-100"}`}>
                {isCashier ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-orange-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{isCashier ? "Currently in Cashier Mode" : "Currently in Owner Mode"}</p>
                <p className="text-xs text-muted-foreground">
                  {isCashier
                    ? "You see only POS Billing & Stock Receive (as staff would)"
                    : "You see all store features as the owner"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="cashier-switch" className="text-xs font-medium text-muted-foreground">
                Cashier view
              </Label>
              <Switch
                id="cashier-switch"
                checked={isCashier}
                onCheckedChange={toggleCashierMode}
                data-testid="switch-cashier-mode"
              />
            </div>
          </div>
          {isCashier && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Cashier view is active. Switch back to owner mode to see all features.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Staff Members
            </CardTitle>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1 h-7 text-xs" data-testid="button-add-staff">
              <UserPlus className="w-3.5 h-3.5" /> Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-4 rounded-xl border ${!member.active ? "opacity-60 bg-muted/20" : "bg-white"}`}
              data-testid={`staff-member-${member.id}`}
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
                {member.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.phone}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[10px] cursor-pointer select-none ${member.role === "cashier" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-orange-300 text-orange-700 bg-orange-50"}`}
                  onClick={() => toggleStaffRole(member.id)}
                  data-testid={`toggle-role-${member.id}`}
                >
                  {member.role === "cashier" ? "Cashier" : "Co-owner"}
                </Badge>
                <Switch
                  checked={member.active}
                  onCheckedChange={() => toggleActive(member.id)}
                  data-testid={`toggle-active-${member.id}`}
                />
              </div>
            </div>
          ))}

          <div className="p-4 rounded-xl border border-dashed text-center">
            <p className="text-xs text-muted-foreground">Click the role badge to toggle between Cashier and Co-owner</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Access Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { feature: "POS Billing", owner: true, cashier: true },
              { feature: "Stock Receive", owner: true, cashier: true },
              { feature: "Inventory", owner: true, cashier: false },
              { feature: "Daily Report", owner: true, cashier: false },
              { feature: "Payments", owner: true, cashier: false },
              { feature: "Store Settings", owner: true, cashier: false },
              { feature: "Returns", owner: true, cashier: false },
              { feature: "Cash Register", owner: true, cashier: false },
            ].map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30" data-testid={`access-row-${item.feature.toLowerCase().replace(/\s+/g, "-")}`}>
                <span className="text-xs font-medium">{item.feature}</span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Owner ✓</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.cashier ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"}`}>
                    {item.cashier ? "Cashier ✓" : "Cashier ✗"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
