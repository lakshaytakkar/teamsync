import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Store, Package, IndianRupee,
  MessageSquare, Bell, LogOut, ShoppingBag, FileText,
  User, HelpCircle, Menu, X, ChevronDown, Boxes, ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clientId = portalEtsClient.id;

  const { data: messagesData } = useQuery<{ messages: any[] }>({
    queryKey: ['/api/ets-portal/client', clientId, 'messages'],
  });

  const unreadCount = (messagesData?.messages || []).filter((m: any) => !m.read && m.sender === 'team').length;

  const navItems: NavItem[] = [
    { title: "Dashboard", url: "/portal/ets", icon: LayoutDashboard },
    { title: "Products", url: "/portal/ets/catalog", icon: ShoppingBag },
    { title: "My Store", url: "/portal/ets/store", icon: Store },
    { title: "Launch Kit", url: "/portal/ets/launch-kit", icon: Boxes },
    { title: "Orders", url: "/portal/ets/orders", icon: Package },
    { title: "Payments", url: "/portal/ets/payments", icon: IndianRupee },
    { title: "Messages", url: "/portal/ets/messages", icon: MessageSquare, badge: unreadCount },
  ];

  const secondaryNavItems: NavItem[] = [
    { title: "Checklist", url: "/portal/ets/checklist", icon: ClipboardCheck },
    { title: "Invoices", url: "/portal/ets/invoices", icon: FileText },
    { title: "Profile", url: "/portal/ets/profile", icon: User },
    { title: "Support", url: "/portal/ets/support", icon: HelpCircle },
  ];

  const isActive = (url: string) => {
    if (url === "/portal/ets") return location === url;
    return location.startsWith(url);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="h-14 border-b bg-white dark:bg-slate-900 shrink-0 z-30">
        <div className="h-full px-4 sm:px-6 lg:px-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/portal/ets" className="flex items-center gap-2.5" data-testid="link-ets-portal-home">
              <span className="text-xl font-black tracking-tight select-none" style={{ letterSpacing: "-0.03em", color: ETS_PORTAL_COLOR }}>EazyToSell</span>
              <div className="h-5 w-px bg-border hidden sm:block" />
              <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Client Portal</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5" data-testid="ets-portal-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    More
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.url}
                        onClick={() => setLocation(item.url)}
                        className={cn(isActive(item.url) && "bg-orange-50 text-orange-700")}
                      >
                        <Icon className="size-4 mr-2" />
                        {item.title}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" data-testid="button-ets-portal-notifications">
              <Bell className="size-4" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
                  <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: ETS_PORTAL_COLOR }}>
                    {portalEtsClient.avatar}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold truncate leading-none">{portalEtsClient.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">{portalEtsClient.city}</p>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/portal/ets/profile")}>
                  <User className="size-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/portal/ets/invoices")}>
                  <FileText className="size-4 mr-2" />
                  Invoices
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/portal/ets/support")}>
                  <HelpCircle className="size-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/ets")} className="text-muted-foreground">
                  <LogOut className="size-4 mr-2" />
                  Back to Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b bg-white dark:bg-slate-900 z-20">
          <nav className="flex flex-col gap-1 p-3" data-testid="ets-portal-nav-mobile">
            {[...navItems, ...secondaryNavItems].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  data-testid={`nav-ets-portal-mobile-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1 rounded-full ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
            <div className="border-t my-1" />
            <button
              onClick={() => { setMobileMenuOpen(false); setLocation("/ets"); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="size-4" />
              <span>Back to Admin</span>
            </button>
          </nav>
        </div>
      )}

      <div className="lg:hidden border-b bg-white dark:bg-slate-900 overflow-x-auto">
        <nav className="flex items-center gap-1 px-4 py-2" data-testid="ets-portal-nav-scroll">
          {navItems.slice(0, 5).map((item) => {
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
