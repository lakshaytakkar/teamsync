import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  DollarSign,
  FolderKanban,
  TrendingUp,
  Phone,
  CheckSquare,
  CalendarCheck,
  MapPin,
  Ticket,
  Settings,
  Shield,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
}

export interface NavCategory {
  title: string;
  defaultUrl: string;
  icon: LucideIcon;
  items: NavItem[];
}

export interface Vertical {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  color: string;
  description: string;
  navCategories: NavCategory[];
}

export const verticals: Vertical[] = [
  {
    id: "hr",
    name: "HR Portal",
    shortName: "HR",
    icon: Users,
    color: "#225AEA",
    description: "People, recruitment, and operations",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "People",
        defaultUrl: "/employees",
        icon: Users,
        items: [
          { title: "Employees", url: "/employees" },
          { title: "Departments", url: "/departments" },
        ],
      },
      {
        title: "Recruitment",
        defaultUrl: "/candidates",
        icon: UserPlus,
        items: [
          { title: "Candidates", url: "/candidates" },
          { title: "Job Postings", url: "/job-postings" },
        ],
      },
      {
        title: "Operations",
        defaultUrl: "/leave",
        icon: CalendarDays,
        items: [
          { title: "Leave Management", url: "/leave" },
          { title: "Attendance", url: "/attendance" },
          { title: "Documents", url: "/documents" },
        ],
      },
      {
        title: "Finance",
        defaultUrl: "/payroll",
        icon: DollarSign,
        items: [
          { title: "Payroll", url: "/payroll" },
        ],
      },
      {
        title: "Projects",
        defaultUrl: "/projects",
        icon: FolderKanban,
        items: [
          { title: "Projects", url: "/projects" },
        ],
      },
      {
        title: "Design System",
        defaultUrl: "/dev/style-guide",
        icon: Settings,
        items: [
          { title: "Style Guide", url: "/dev/style-guide" },
          { title: "Components", url: "/dev/components" },
          { title: "Icons", url: "/dev/icons" },
        ],
      },
    ],
  },
  {
    id: "sales",
    name: "Sales CRM",
    shortName: "Sales",
    icon: TrendingUp,
    color: "#F34147",
    description: "Leads, pipeline, and performance",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/sales",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Pipeline",
        defaultUrl: "/sales/leads",
        icon: FolderKanban,
        items: [
          { title: "Leads", url: "/sales/leads" },
          { title: "Pipeline Board", url: "/sales/pipeline" },
        ],
      },
      {
        title: "Activities",
        defaultUrl: "/sales/tasks",
        icon: CheckSquare,
        items: [
          { title: "Tasks", url: "/sales/tasks" },
          { title: "Follow-ups", url: "/sales/follow-ups" },
        ],
      },
      {
        title: "Performance",
        defaultUrl: "/sales/performance",
        icon: BarChart3,
        items: [
          { title: "Performance", url: "/sales/performance" },
        ],
      },
    ],
  },
  {
    id: "events",
    name: "Events",
    shortName: "Events",
    icon: Ticket,
    color: "#E91E63",
    description: "Seminars, meets, and venue management",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/events",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Events",
        defaultUrl: "/events/list",
        icon: CalendarCheck,
        items: [
          { title: "All Events", url: "/events/list" },
          { title: "Check-in", url: "/events/checkin" },
        ],
      },
      {
        title: "Venues",
        defaultUrl: "/events/venues",
        icon: MapPin,
        items: [
          { title: "Venues", url: "/events/venues" },
        ],
      },
    ],
  },
  {
    id: "admin",
    name: "Admin & IT",
    shortName: "Admin",
    icon: Shield,
    color: "#673AB7",
    description: "System administration and reports",
    navCategories: [
      {
        title: "Dashboard",
        defaultUrl: "/admin",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Team",
        defaultUrl: "/admin/team",
        icon: Users,
        items: [
          { title: "Team Members", url: "/admin/team" },
        ],
      },
      {
        title: "System",
        defaultUrl: "/admin/settings",
        icon: Settings,
        items: [
          { title: "Settings", url: "/admin/settings" },
          { title: "Reports", url: "/admin/reports" },
        ],
      },
    ],
  },
];

export function getVerticalById(id: string): Vertical | undefined {
  return verticals.find((v) => v.id === id);
}

export function getDefaultVertical(): Vertical {
  return verticals[0];
}

export function getAllNavUrls(vertical: Vertical): string[] {
  const urls: string[] = [];
  for (const cat of vertical.navCategories) {
    urls.push(cat.defaultUrl);
    for (const item of cat.items) {
      urls.push(item.url);
    }
  }
  return urls;
}

export function detectVerticalFromUrl(location: string): Vertical | undefined {
  if (location.startsWith("/sales")) return getVerticalById("sales");
  if (location.startsWith("/events")) return getVerticalById("events");
  if (location.startsWith("/admin")) return getVerticalById("admin");
  return getVerticalById("hr");
}
