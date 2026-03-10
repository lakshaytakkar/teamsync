import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Store, Package, IndianRupee,
  MessageSquare, Bell, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { portalEtsClient, ETS_PORTAL_COLOR } from "@/lib/mock-data-portal-ets";
import { useQuery } from "@tanstack/react-query";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

export default function EtsPortalLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const clientId = portalEtsClient.id;

  const { data: messagesData } = useQuery<{ messages: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'messages'],
  });

  const unreadCount = (messagesData?.messages || []).filter((m: any) => !m.read && m.sender === 'team').length;

  const navItems: NavItem[] = [
    { title: "Dashboard", url: "/portal/ets", icon: LayoutDashboard },
    { title: "My Store", url: "/portal/ets/store", icon: Store },
    { title: "Orders", url: "/portal/ets/orders", icon: Package },
    { title: "Payments", url: "/portal/ets/payments", icon: IndianRupee },
    { title: "Messages", url: "/portal/ets/messages", icon: MessageSquare, badge: unreadCount },
  ];

  const isActive = (url: string) => {
    if (url === "/portal/ets") return location === url;
    return location.startsWith(url);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="h-14 border-b bg-white dark:bg-slate-900 shrink-0 z-30">
        <div className="h-full px-4 sm:px-8 lg:px-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal/ets" className="flex items-center gap-2.5" data-testid="link-ets-portal-home">
              <span className="text-xl font-black tracking-tight select-none" style={{ letterSpacing: "-0.03em", color: ETS_PORTAL_COLOR }}>ETS</span>
              <div className="h-5 w-px bg-border" />
              <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Client Portal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" data-testid="ets-portal-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`nav-ets-portal-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1 rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 hidden sm:flex">
              Client Portal
            </Badge>

            <Button variant="ghost" size="icon" className="h-8 w-8 relative" data-testid="button-ets-portal-notifications">
              <Bell className="size-4" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />}
            </Button>

            <div className="h-5 w-px bg-border hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
                {portalEtsClient.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-none">{portalEtsClient.name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{portalEtsClient.city}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setLocation("/ets")}
              data-testid="button-back-admin"
              title="Back to Admin Portal"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="md:hidden border-b bg-white dark:bg-slate-900 overflow-x-auto">
        <nav className="flex items-center gap-1 px-4 py-2" data-testid="ets-portal-nav-mobile">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                    : "text-muted-foreground hover:bg-muted"
                )}
                data-testid={`nav-ets-portal-mobile-${item.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <Icon className="size-3.5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
