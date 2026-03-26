import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useEtsRole } from "@/lib/use-ets-role";
import { ETS_ROLES, type EtsRoleId } from "@/lib/ets-role-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import etsLogoLargeUrl from "@assets/eazytosell-logo-large.png";

function RoleBadge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

export function EtsPortalLayout({ children }: { children: import("react").ReactNode }) {
  const { role, roleId, setRole, isCashier } = useEtsRole();
  const [location, setLocation] = useLocation();

  const navItems = isCashier
    ? role.navItems.filter((item) =>
        item.url === "/portal-ets/pos" || item.url === "/portal-ets/stock-receive"
      )
    : role.navItems;

  const isActive = (url: string) => {
    if (url === "/portal-ets" || url === "/portal-ets/admin" || url === "/portal-ets/sales" ||
        url === "/portal-ets/ops" || url === "/portal-ets/fulfillment" ||
        url === "/portal-ets/product" || url === "/portal-ets/vendor") {
      return location === url;
    }
    return location === url || location.startsWith(url + "/");
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header
        className="h-14 border-b bg-white shrink-0 z-30"
        style={{ borderBottomColor: role.color + "22" }}
        data-testid="ets-portal-header"
      >
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={role.defaultUrl} data-testid="link-ets-portal-home">
              <img
                src={etsLogoLargeUrl}
                alt="EazyToSell"
                className="h-8 w-auto object-contain shrink-0"
              />
            </Link>

            <div className="h-5 w-px bg-border shrink-0" />

            <nav
              className="hidden md:flex items-center gap-0.5 overflow-x-auto"
              data-testid="ets-portal-nav"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    style={active ? { backgroundColor: role.color } : {}}
                    data-testid={`nav-ets-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCashier && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                Cashier Mode
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-9 px-3"
                  data-testid="button-ets-role-switcher"
                >
                  <div
                    className="size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.userInitials}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{role.label}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 p-1" data-testid="ets-role-menu">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1.5">
                  Switch Role (Dev Mode)
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ETS_ROLES.map((r) => {
                  const isSelected = r.id === roleId;
                  return (
                    <DropdownMenuItem
                      key={r.id}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer",
                        isSelected && "bg-muted"
                      )}
                      onClick={() => {
                        setRole(r.id as EtsRoleId);
                        setLocation(r.defaultUrl);
                      }}
                      data-testid={`role-option-${r.id}`}
                    >
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: r.color }}
                      >
                        {r.userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{r.label}</span>
                          {isSelected && (
                            <span
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: r.color }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{r.userName}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-muted-foreground text-sm gap-2"
                  onClick={() => setLocation("/ets")}
                  data-testid="button-ets-back-internal"
                >
                  <LogOut className="size-3.5" />
                  Back to Internal Portal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div
        className="md:hidden border-b bg-white overflow-x-auto"
        data-testid="ets-portal-nav-mobile"
      >
        <nav className="flex items-center gap-1 px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  active ? "text-white" : "text-muted-foreground hover:bg-muted"
                )}
                style={active ? { backgroundColor: role.color } : {}}
                data-testid={`nav-ets-mobile-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="size-3.5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
