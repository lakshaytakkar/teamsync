import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Building2, FileText, Receipt,
  MessageSquare, LogOut, ChevronLeft, Bell, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LegalNationsLogo } from "@/components/brand/legalnations-logo";
import { portalClient, portalMessages } from "@/lib/mock-data-portal-legalnations";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/portal/legalnations", icon: LayoutDashboard },
  { title: "My Companies", url: "/portal/legalnations/companies", icon: Building2 },
  { title: "Documents", url: "/portal/legalnations/documents", icon: FileText },
  { title: "Invoices", url: "/portal/legalnations/invoices", icon: Receipt },
  { title: "Messages", url: "/portal/legalnations/messages", icon: MessageSquare, badge: portalMessages.filter(m => !m.read).length },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const isActive = (url: string) => {
    if (url === "/portal/legalnations") return location === url;
    return location.startsWith(url);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-slate-900 shrink-0">
        <div className="p-5 flex items-center gap-3">
          <LegalNationsLogo size={36} />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">LegalNations</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Client Portal</p>
          </div>
        </div>

        <Separator />

        <div className="px-3 py-4 flex-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          <nav className="space-y-0.5" data-testid="portal-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                  data-testid={`nav-portal-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Icon className={cn("size-4", active ? "text-blue-600" : "text-slate-400")} />
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] text-[10px] px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400">
              {portalClient.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{portalClient.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{portalClient.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500 hover:text-slate-700 gap-2"
            onClick={() => setLocation("/hr")}
            data-testid="button-back-internal"
          >
            <ChevronLeft className="size-4" />
            Back to Internal Portal
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <LegalNationsLogo size={28} />
              <span className="text-sm font-bold">LegalNations</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
              Preview Mode
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" data-testid="button-portal-notifications">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-portal-profile">
              <User className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
