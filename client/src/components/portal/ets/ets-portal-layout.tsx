import { useEffect } from "react";
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

const CASHIER_ALLOWED_PATHS = ["/portal-ets/pos", "/portal-ets/stock-receive"];

export function EtsPortalLayout({ children }: { children: import("react").ReactNode }) {
  const { role, roleId, setRole, isCashier } = useEtsRole();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isCashier) {
      const allowed = CASHIER_ALLOWED_PATHS.some((p) => location === p || location.startsWith(p + "/"));
      if (!allowed) {
        setLocation("/portal-ets/pos", { replace: true });
      }
    }
  }, [isCashier, location, setLocation]);

  const navItems = isCashier
    ? role.navItems.filter((item) => CASHIER_ALLOWED_PATHS.includes(item.url))
    : role.navItems;

  const isActive = (url: string) => {
    const exactRoots = ["/portal-ets", "/portal-ets/admin", "/portal-ets/sales",
      "/portal-ets/ops", "/portal-ets/fulfillment", "/portal-ets/product", "/portal-ets/vendor"];
    if (exactRoots.includes(url)) {
      return location === url;
    }
    return location === url || location.startsWith(url + "/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside
        className="hidden md:flex w-52 flex-col border-r bg-white shrink-0"
        style={{ borderRightColor: role.color + "22" }}
        data-testid="ets-portal-sidebar"
      >
        <div
          className="h-14 flex items-center px-4 border-b shrink-0"
          style={{ borderBottomColor: role.color + "22" }}
        >
          <Link href={role.defaultUrl} data-testid="link-ets-portal-home">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: role.color }}
              >
                {role.userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">EazyToSell</p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">{role.label} Portal</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" data-testid="ets-portal-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                  active
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={active ? { backgroundColor: role.color } : {}}
                data-testid={`nav-ets-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="p-3 border-t shrink-0"
          style={{ borderTopColor: role.color + "22" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 h-9 px-2 justify-start hover:bg-muted"
                data-testid="button-ets-role-switcher-sidebar"
              >
                <div
                  className="size-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ backgroundColor: role.color }}
                >
                  {role.userInitials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold truncate">{role.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{role.userName}</p>
                </div>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" align="end" className="w-64 p-1 mb-1" data-testid="ets-role-menu">
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
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header
          className="h-14 border-b bg-white shrink-0 z-30 flex md:hidden items-center px-4 gap-3"
          style={{ borderBottomColor: role.color + "22" }}
          data-testid="ets-portal-mobile-header"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: role.color }}
          >
            {role.userInitials}
          </div>
          <span className="text-sm font-semibold flex-1">EazyToSell — {role.label}</span>

          {isCashier && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              Cashier
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8 px-2"
                data-testid="button-ets-role-switcher-mobile"
              >
                <span className="text-xs font-medium">{role.label}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1" data-testid="ets-role-menu-mobile">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1.5">
                Switch Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ETS_ROLES.map((r) => {
                const isSelected = r.id === roleId;
                return (
                  <DropdownMenuItem
                    key={r.id}
                    className={cn("flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer", isSelected && "bg-muted")}
                    onClick={() => {
                      setRole(r.id as EtsRoleId);
                      setLocation(r.defaultUrl);
                    }}
                    data-testid={`role-option-mobile-${r.id}`}
                  >
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: r.color }}
                    >
                      {r.userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.userName}</p>
                    </div>
                    {isSelected && (
                      <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div
          className="md:hidden border-b bg-white overflow-x-auto shrink-0"
          data-testid="ets-portal-nav-mobile"
        >
          <nav className="flex items-center gap-1 px-3 py-2 min-w-max">
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
    </div>
  );
}
