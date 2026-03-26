import { useLocation, Link } from "wouter";
import { MessageCircle, Users, BookOpen, BarChart2, Phone, Ticket, ClipboardList, Blocks, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "./notification-panel";
import { SearchPanel } from "./search-panel";
import { Separator } from "@/components/ui/separator";
import { getPersonAvatar } from "@/lib/avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerticalSwitcher } from "./vertical-switcher";
import { useVertical } from "@/lib/vertical-store";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/verticals-config";
import { useEtsRole } from "@/lib/use-ets-role";
import { ETS_ROLES, type EtsRoleId } from "@/lib/ets-role-config";

const PINNED_TITLES = new Set(["Chat", "Team", "Resources", "Reports", "Contacts", "Important Contacts", "Tickets", "Tasks", "Apps"]);

function getActiveCategory(location: string, categories: NavCategory[]): NavCategory | null {
  for (const cat of categories) {
    if (cat.items.length === 0 && location === cat.defaultUrl) return cat;
    for (const item of cat.items) {
      if (location === item.url || location.startsWith(item.url + "/")) {
        return cat;
      }
    }
  }
  if (categories.length > 0 && location === categories[0].defaultUrl) {
    return categories[0];
  }
  return null;
}

function isItemActive(location: string, itemUrl: string): boolean {
  return location === itemUrl || location.startsWith(itemUrl + "/");
}

function EtsRoleSwitcher() {
  const { role, roleId, setRole } = useEtsRole();
  const [, setLocation] = useLocation();

  return (
    <>
      <Separator orientation="vertical" className="h-5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-8 px-2.5 rounded-lg"
            data-testid="button-ets-role-switcher"
          >
            <div
              className="size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: role.color }}
            >
              {role.userInitials}
            </div>
            <span className="text-xs font-semibold">{role.label}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
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
                  className="size-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function TopNavigation() {
  const [location, setLocation] = useLocation();
  const { currentVertical } = useVertical();
  const navCategories = currentVertical.navCategories;
  const activeCategory = getActiveCategory(location, navCategories);
  const isEtsPortal = currentVertical?.id === "ets-portal";
  const showSubNav = !isEtsPortal && activeCategory && activeCategory.items.length > 1;

  const findUrl = (...titles: string[]) => {
    for (const t of titles) {
      const url = navCategories.find(c => c.title === t)?.defaultUrl;
      if (url) return url;
    }
    return null;
  };

  const chatUrl = findUrl("Chat");
  const teamUrl = findUrl("Team");
  const resourcesUrl = findUrl("Resources");
  const reportsUrl = findUrl("Reports", "Team Reports");
  const contactsUrl = findUrl("Important Contacts", "Contacts");
  const ticketsUrl = findUrl("Tickets");
  const tasksUrl = findUrl("Tasks");
  const appsUrl = findUrl("Apps");

  function PinnedBtn({
    url,
    icon: Icon,
    label,
    testId,
  }: {
    url: string | null;
    icon: React.ElementType;
    label: string;
    testId: string;
  }) {
    if (!url) return null;
    return (
      <Button
        size="icon"
        variant={location === url ? "secondary" : "ghost"}
        onClick={() => setLocation(url)}
        data-testid={testId}
        title={label}
      >
        <Icon className="size-4" />
      </Button>
    );
  }

  return (
    <div className="shrink-0 overflow-y-hidden px-16 lg:px-24 pt-3 space-y-2">
      <header
        className="flex h-14 items-center justify-between gap-2 rounded-xl border bg-background px-5 overflow-hidden overflow-y-hidden"
        data-testid="topbar-main"
      >
        <div className="flex items-center gap-6 min-w-0">
          <VerticalSwitcher />

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <nav className="flex items-center gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-hide" data-testid="nav-level-1">
            {navCategories.filter(cat => !PINNED_TITLES.has(cat.title)).map((cat) => {
              const isActive = activeCategory?.title === cat.title;
              return (
                <Link
                  key={cat.title}
                  href={cat.defaultUrl}
                  data-testid={`nav-l1-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "relative whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.title}
                  {isActive && (
                    <motion.div
                      layoutId="nav-l1-indicator"
                      className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SearchPanel />
          <NotificationPanel />

          <PinnedBtn url={tasksUrl} icon={ClipboardList} label="Tasks" testId="button-tasks" />
          <PinnedBtn url={ticketsUrl} icon={Ticket} label="Tickets" testId="button-tickets" />
          <PinnedBtn url={resourcesUrl} icon={BookOpen} label="Resources" testId="button-resources" />
          <PinnedBtn url={reportsUrl} icon={BarChart2} label="Reports" testId="button-reports" />
          <PinnedBtn url={contactsUrl} icon={Phone} label="Contacts" testId="button-contacts" />
          <PinnedBtn url={chatUrl} icon={MessageCircle} label="Chat" testId="button-chat" />
          <PinnedBtn url={teamUrl} icon={Users} label="Team" testId="button-team" />
          <PinnedBtn url={appsUrl} icon={Blocks} label="Apps" testId="button-apps" />

          {isEtsPortal && <EtsRoleSwitcher />}

          <Separator orientation="vertical" className="h-5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                <img src={getPersonAvatar("Sneha Patel", 32)} alt="SP" className="size-8 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 px-2 py-2.5">
                <img src={getPersonAvatar("Sneha Patel", 40)} alt="SP" className="size-10 rounded-full" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Sneha Patel</span>
                  <span className="text-xs text-muted-foreground">Operations Manager</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm" data-testid="menu-item-profile">My Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-sm" data-testid="menu-item-settings">Account Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm" data-testid="menu-item-logout">Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showSubNav && (
        <div
          className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
          data-testid="nav-level-2"
        >
          {activeCategory.items.map((item, index) => {
            const isActive = isItemActive(location, item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                data-testid={`nav-l2-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "relative whitespace-nowrap px-4 py-1.5 text-sm rounded-lg transition-all",
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/70 font-medium hover:text-white hover:bg-white/10"
                )}
              >
                <span className="text-white/50 mr-1.5">{index + 1})</span>
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
