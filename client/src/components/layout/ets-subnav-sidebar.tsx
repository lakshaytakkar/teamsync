import { createContext, useContext } from "react";
import { useLocation, Link } from "wouter";
import { useVertical } from "@/lib/vertical-store";
import { cn } from "@/lib/utils";
import {
  Package, ClipboardList, ArrowDownToLine, AlertTriangle,
  Wallet, RotateCcw, BarChart3, Settings,
  ShoppingBag, Store, CheckSquare,
  CreditCard, FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EtsSidebarContext = createContext(false);
export function useEtsSidebar() {
  return useContext(EtsSidebarContext);
}

const SUB_ITEM_ICONS: Record<string, LucideIcon> = {
  "/portal-ets/inventory": Package,
  "/portal-ets/stock-receive": ArrowDownToLine,
  "/portal-ets/stock-adjustment": ClipboardList,
  "/portal-ets/low-stock-alerts": AlertTriangle,
  "/portal-ets/cash-register": Wallet,
  "/portal-ets/returns": RotateCcw,
  "/portal-ets/daily-report": BarChart3,
  "/portal-ets/store-settings": Settings,
  "/portal-ets/launch-kit": ShoppingBag,
  "/portal-ets/store": Store,
  "/portal-ets/checklist": CheckSquare,
  "/portal-ets/payments": CreditCard,
  "/portal-ets/invoices": FileText,
};

const CATEGORY_SUBTITLES: Record<string, string> = {
  "Inventory": "Stock control center",
  "Operations": "Store operations management",
  "My Store": "Store profile & settings",
  "Payments": "Payment tracking",
};

function isItemActive(location: string, itemUrl: string): boolean {
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

export function EtsSubNavSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentVertical } = useVertical();

  const isEtsPortal = currentVertical?.id === "ets-portal";
  if (!isEtsPortal) return <>{children}</>;

  const activeCategory = getActiveCategory(location, currentVertical.navCategories);
  if (!activeCategory || !activeCategory.items || activeCategory.items.length <= 1) {
    return <>{children}</>;
  }

  const CategoryIcon = activeCategory.icon;
  const subtitle = CATEGORY_SUBTITLES[activeCategory.title] || "";

  return (
    <EtsSidebarContext.Provider value={true}>
      <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto" data-testid="ets-sidebar-layout">
        <div className="flex items-center gap-3">
          {CategoryIcon && <CategoryIcon className="w-6 h-6 text-orange-500" />}
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight" data-testid="text-sidebar-category-title">{activeCategory.title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex rounded-2xl bg-gray-50/80 border border-gray-100 min-h-[calc(100vh-200px)] overflow-hidden" data-testid="ets-sidebar-card">
          <nav className="w-[200px] shrink-0 py-5 px-3 space-y-0.5" data-testid="ets-subnav-sidebar">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Sub menu</p>
            {activeCategory.items.map((item: any) => {
              const isActive = isItemActive(location, item.url);
              const Icon = SUB_ITEM_ICONS[item.url];
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[14px] transition-colors cursor-pointer",
                      isActive
                        ? "bg-orange-100 text-orange-600 font-bold"
                        : "text-[#6c7278] font-semibold hover:bg-gray-100"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] shrink-0",
                          isActive ? "text-orange-500" : "text-gray-400"
                        )}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-1 bg-white rounded-r-2xl overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </EtsSidebarContext.Provider>
  );
}
