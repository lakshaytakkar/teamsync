import {
  LayoutDashboard,
  Building2,
  FileText,
  Receipt,
  MessageSquare,
  Phone,
  Shield,
  Kanban,
  UserPlus,
  ClipboardList,
  BarChart3,
  Calendar,
  AlertTriangle,
  Settings,
  Users,
  Briefcase,
  Target,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type LnRoleId = "admin" | "formation" | "compliance" | "tax" | "sales" | "client";

export interface LnRoleNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface LnRoleDefinition {
  id: LnRoleId;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  userName: string;
  userInitials: string;
  navItems: LnRoleNavItem[];
  defaultUrl: string;
}

export const LN_ROLES: LnRoleDefinition[] = [
  {
    id: "admin",
    label: "Admin",
    description: "CEO command center — full visibility",
    color: "#7c3aed",
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
    userName: "Lakshay",
    userInitials: "LA",
    defaultUrl: "/portal-ln/admin",
    navItems: [
      { title: "Overview", url: "/portal-ln/admin", icon: LayoutDashboard },
      { title: "Pipeline", url: "/portal-ln/admin/pipeline", icon: Kanban },
      { title: "Team", url: "/portal-ln/admin/team", icon: Users },
      { title: "Revenue", url: "/portal-ln/admin/revenue", icon: BarChart3 },
      { title: "Settings", url: "/portal-ln/admin/settings", icon: Settings },
    ],
  },
  {
    id: "formation",
    label: "Formation",
    description: "Pipeline execution & client stages",
    color: "#0ea5e9",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
    userName: "Priya Sharma",
    userInitials: "PS",
    defaultUrl: "/portal-ln/formation",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/formation", icon: LayoutDashboard },
      { title: "Pipeline", url: "/portal-ln/formation/pipeline", icon: Kanban },
      { title: "KYC Review", url: "/portal-ln/formation/kyc", icon: UserPlus },
      { title: "EIN Tracker", url: "/portal-ln/formation/ein", icon: ClipboardList },
      { title: "Stage Actions", url: "/portal-ln/formation/actions", icon: Briefcase },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "BOI filings, annual reports & deadlines",
    color: "#10b981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    userName: "Arjun Mehta",
    userInitials: "AM",
    defaultUrl: "/portal-ln/compliance",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/compliance", icon: LayoutDashboard },
      { title: "BOI Queue", url: "/portal-ln/compliance/boi", icon: Shield },
      { title: "Annual Reports", url: "/portal-ln/compliance/annual", icon: Calendar },
      { title: "Alerts", url: "/portal-ln/compliance/alerts", icon: AlertTriangle },
      { title: "Client Detail", url: "/portal-ln/compliance/detail", icon: Building2 },
    ],
  },
  {
    id: "tax",
    label: "Tax",
    description: "IRS filings & tax season tracking",
    color: "#f59e0b",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    userName: "Deepak Verma",
    userInitials: "DV",
    defaultUrl: "/portal-ln/tax",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/tax", icon: LayoutDashboard },
      { title: "Filing Queue", url: "/portal-ln/tax/queue", icon: ClipboardList },
      { title: "Preparation", url: "/portal-ln/tax/prep", icon: FileText },
      { title: "Filing Detail", url: "/portal-ln/tax/detail", icon: Receipt },
      { title: "Tax Calendar", url: "/portal-ln/tax/calendar", icon: Calendar },
    ],
  },
  {
    id: "sales",
    label: "Sales/BD",
    description: "Lead pipeline & proposals",
    color: "#ec4899",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
    userName: "Neha Gupta",
    userInitials: "NG",
    defaultUrl: "/portal-ln/sales",
    navItems: [
      { title: "Dashboard", url: "/portal-ln/sales", icon: LayoutDashboard },
      { title: "Lead Pipeline", url: "/portal-ln/sales/pipeline", icon: Kanban },
      { title: "Proposals", url: "/portal-ln/sales/proposals", icon: FileText },
      { title: "Follow-ups", url: "/portal-ln/sales/followups", icon: Target },
      { title: "Packages", url: "/portal-ln/sales/packages", icon: CreditCard },
    ],
  },
  {
    id: "client",
    label: "Client",
    description: "Self-service formation portal",
    color: "#225AEA",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    userName: "Rajesh Kumar",
    userInitials: "RK",
    defaultUrl: "/portal-ln",
    navItems: [
      { title: "Dashboard", url: "/portal-ln", icon: LayoutDashboard },
      { title: "My Companies", url: "/portal-ln/companies", icon: Building2 },
      { title: "Documents", url: "/portal-ln/documents", icon: FileText },
      { title: "Invoices", url: "/portal-ln/invoices", icon: Receipt },
      { title: "Messages", url: "/portal-ln/messages", icon: MessageSquare },
      { title: "Support", url: "/portal-ln/support", icon: Phone },
    ],
  },
];

export function getLnRole(id: LnRoleId): LnRoleDefinition {
  return LN_ROLES.find((r) => r.id === id) ?? LN_ROLES[5];
}

const ROLE_STORAGE_KEY = "ln-portal-role";

export function getStoredLnRole(): LnRoleId {
  try {
    const v = localStorage.getItem(ROLE_STORAGE_KEY);
    if (v && LN_ROLES.some((r) => r.id === v)) return v as LnRoleId;
  } catch {}
  return "client";
}

export function setStoredLnRole(id: LnRoleId): void {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, id);
  } catch {}
}
