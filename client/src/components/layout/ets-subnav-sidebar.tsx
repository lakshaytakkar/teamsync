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

  return (
    <div className="flex h-full" data-testid="ets-sidebar-layout">
      <aside className="w-56 shrink-0 border-r bg-gray-50/70 overflow-y-auto" data-testid="ets-subnav-sidebar">
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2.5 px-2 mb-4">
            {CategoryIcon && <CategoryIcon className="w-5 h-5 text-orange-600" />}
            <span className="text-sm font-bold text-gray-900 tracking-tight">{activeCategory.title}</span>
          </div>
          <nav className="space-y-0.5">
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
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                      isActive
                        ? "bg-orange-50 text-orange-700 font-semibold border border-orange-200/60"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-orange-600" : "text-gray-400"
                        )}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
