import { createContext, useContext } from "react";
import { useLocation, Link } from "wouter";
import { useVertical } from "@/lib/vertical-store";
import { useLnRole } from "@/lib/use-ln-role";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, FileText, Receipt,
  MessageSquare, Phone, Shield, HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LnSidebarContext = createContext(false);
export function useLnSidebar() {
  return useContext(LnSidebarContext);
}

const SUB_ITEM_ICONS: Record<string, LucideIcon> = {
  "/portal-ln": LayoutDashboard,
  "/portal-ln/companies": Building2,
  "/portal-ln/documents": FileText,
  "/portal-ln/invoices": Receipt,
  "/portal-ln/messages": MessageSquare,
  "/portal-ln/support": Phone,
  "/portal-ln/onboarding": HelpCircle,
  "/portal-ln/profile": Shield,
};

const PHASE_SUBTITLES: Record<string, string> = {
  "Formation Tracking": "Track your company formations",
  "Documents & Billing": "Manage documents and invoices",
  "Communication": "Messages and support",
};

function isItemActive(location: string, itemUrl: string): boolean {
  if (itemUrl === "/portal-ln") return location === itemUrl;
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

function getActiveCategory(location: string, navCategories: any[]) {
  for (const cat of navCategories) {
    if (cat.items && cat.items.length > 1) {
      for (const item of cat.items) {
        if (isItemActive(location, item.url)) return cat;
      }
    }
  }
  return null;
}

export function LnSubNavSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentVertical } = useVertical();
  const { roleId } = useLnRole();

  const isLnPortal = currentVertical?.id === "ln-portal";
  if (!isLnPortal) return <>{children}</>;
  if (roleId !== "client") return <>{children}</>;

  const activeCategory = getActiveCategory(location, currentVertical.navCategories);
  if (!activeCategory || !activeCategory.items || activeCategory.items.length <= 1) {
    return <>{children}</>;
  }

  const CategoryIcon = activeCategory.icon;
  const subtitle = PHASE_SUBTITLES[activeCategory.title] || "";

  return (
    <LnSidebarContext.Provider value={true}>
      <div className="px-16 lg:px-24 py-6 space-y-4" data-testid="ln-sidebar-layout">
        <div className="flex items-center gap-3">
          {CategoryIcon && <CategoryIcon className="w-6 h-6 text-blue-500" />}
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight" data-testid="text-ln-sidebar-category-title">
              {activeCategory.title}
            </h1>
            {subtitle && <p className="text-sm text-muted-foreground" data-testid="text-ln-sidebar-category-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row rounded-2xl bg-gray-50/60 min-h-[calc(100vh-200px)] overflow-hidden" data-testid="ln-sidebar-card">
          <nav className="w-full md:w-[200px] shrink-0 py-4 md:py-5 px-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible" data-testid="ln-subnav-sidebar">
            <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4" data-testid="text-ln-submenu-label">Sub menu</p>
            {activeCategory.items.map((item: any) => {
              const isActive = isItemActive(location, item.url);
              const Icon = SUB_ITEM_ICONS[item.url];

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  data-testid={`ln-sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] transition-colors cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : "text-[#6c7278] font-semibold hover:bg-gray-100"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] shrink-0",
                          isActive ? "text-blue-500" : "text-gray-400"
                        )}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-1 bg-white md:rounded-r-2xl rounded-b-2xl md:rounded-bl-none overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </LnSidebarContext.Provider>
  );
}
