export const LN_PORTAL_COLOR = "#225AEA";

export interface LnCompany {
  id: string;
  name: string;
  entityType: "LLC" | "C-Corp" | "S-Corp";
  state: string;
  status: "active" | "forming" | "completed" | "dissolved";
  currentStage: number;
  ein?: string;
  packageTier: string;
  startedAt: string;
}

export interface LnClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedAt: string;
  specialistName: string;
  specialistRole: string;
  companies: LnCompany[];
}

export const CLIENT_PROFILE: LnClientProfile = {
  id: "LN-C-0042",
  name: "Rajesh Kumar",
  email: "rajesh@techventures.in",
  phone: "+91 98765 43210",
  avatar: "RK",
  joinedAt: "2025-11-15",
  specialistName: "Priya Sharma",
  specialistRole: "Formation Specialist",
  companies: [
    {
      id: "co-001",
      name: "TechVentures LLC",
      entityType: "LLC",
      state: "Delaware",
      status: "forming",
      currentStage: 4,
      packageTier: "Premium",
      startedAt: "2025-12-12",
    },
    {
      id: "co-002",
      name: "CloudBase Corp",
      entityType: "C-Corp",
      state: "Wyoming",
      status: "completed",
      currentStage: 7,
      ein: "92-7654321",
      packageTier: "Standard",
      startedAt: "2025-06-01",
    },
  ],
};

export interface FormationStageDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export const FORMATION_STAGE_DEFINITIONS: FormationStageDefinition[] = [
  { id: "s1", name: "Payment & Package Selection", shortName: "Package", description: "Select your formation package and complete payment" },
  { id: "s2", name: "KYC & Document Collection", shortName: "KYC", description: "Upload passport, address proof, and identity documents" },
  { id: "s3", name: "Articles of Organization", shortName: "Articles", description: "File formation documents with the Secretary of State" },
  { id: "s4", name: "EIN Application", shortName: "EIN", description: "Apply for Employer Identification Number from IRS" },
  { id: "s5", name: "BOI Filing", shortName: "BOI", description: "Submit Beneficial Ownership Information to FinCEN" },
  { id: "s6", name: "Banking & Stripe Setup", shortName: "Banking", description: "Open US business bank account and payment processing" },
  { id: "s7", name: "Compliance Calendar & Handover", shortName: "Handover", description: "Deliver compliance calendar and complete document package" },
];

export interface DashboardMetrics {
  activeEntities: number;
  completedEntities: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  pendingInvoices: number;
  outstandingAmount: number;
  unreadMessages: number;
  nextDeadline: string;
  nextDeadlineTitle: string;
}

export const DASHBOARD_METRICS: DashboardMetrics = {
  activeEntities: 1,
  completedEntities: 1,
  verifiedDocuments: 9,
  pendingDocuments: 1,
  pendingInvoices: 2,
  outstandingAmount: 224,
  unreadMessages: 2,
  nextDeadline: "2026-03-05",
  nextDeadlineTitle: "Review BOI Filing Draft",
};

export interface ComplianceDeadline {
  id: string;
  title: string;
  dueDate: string;
  company: string;
  priority: "high" | "medium" | "low";
  type: "boi" | "annual-report" | "franchise-tax" | "registered-agent" | "tax-filing";
}

export const COMPLIANCE_DEADLINES: ComplianceDeadline[] = [
  { id: "dl-001", title: "Review BOI Filing Draft", dueDate: "2026-03-05", company: "TechVentures LLC", priority: "high", type: "boi" },
  { id: "dl-002", title: "Pay BOI Filing Invoice", dueDate: "2026-03-10", company: "TechVentures LLC", priority: "medium", type: "boi" },
  { id: "dl-003", title: "IRS Form 1120 Filing", dueDate: "2026-04-15", company: "CloudBase Corp", priority: "high", type: "tax-filing" },
  { id: "dl-004", title: "Annual Report — Wyoming", dueDate: "2026-05-01", company: "CloudBase Corp", priority: "medium", type: "annual-report" },
  { id: "dl-005", title: "Delaware Franchise Tax", dueDate: "2026-06-01", company: "TechVentures LLC", priority: "low", type: "franchise-tax" },
  { id: "dl-006", title: "Registered Agent Renewal", dueDate: "2026-08-20", company: "CloudBase Corp", priority: "low", type: "registered-agent" },
];

export interface RecentActivity {
  id: string;
  type: "document" | "stage" | "payment" | "message" | "compliance";
  title: string;
  description: string;
  timestamp: string;
  icon: "check" | "file" | "dollar" | "shield" | "message";
}

export const RECENT_ACTIVITY: RecentActivity[] = [
  { id: "act-001", type: "compliance", title: "BOI Filing Draft Ready", description: "Review your Beneficial Ownership Information draft in Documents", timestamp: "2026-02-28T09:15:00Z", icon: "shield" },
  { id: "act-002", type: "message", title: "New Message from Compliance Officer", description: "Arjun Mehta sent you a message about BOI filing", timestamp: "2026-02-28T09:15:00Z", icon: "message" },
  { id: "act-003", type: "document", title: "EIN Confirmation Uploaded", description: "EIN 88-1234567 confirmed for TechVentures LLC", timestamp: "2026-02-05T10:20:00Z", icon: "file" },
  { id: "act-004", type: "stage", title: "EIN Application Completed", description: "IRS has assigned your Employer Identification Number", timestamp: "2026-02-05T10:15:00Z", icon: "check" },
  { id: "act-005", type: "payment", title: "Invoice LN-2026-0008 Paid", description: "Registered Agent annual fee — $149", timestamp: "2026-01-18T08:00:00Z", icon: "dollar" },
  { id: "act-006", type: "stage", title: "Articles Filed Successfully", description: "Delaware Division of Corporations approved TechVentures LLC", timestamp: "2026-01-20T14:30:00Z", icon: "check" },
  { id: "act-007", type: "document", title: "Operating Agreement Generated", description: "Your LLC operating agreement is ready for download", timestamp: "2026-01-22T11:00:00Z", icon: "file" },
  { id: "act-008", type: "payment", title: "Premium Package Payment", description: "TechVentures LLC formation package — $1,499", timestamp: "2025-12-12T10:00:00Z", icon: "dollar" },
];

export interface RmContact {
  name: string;
  role: string;
  phone: string;
  whatsApp: string;
  email: string;
  avatar: string;
}

export const RM_CONTACT: RmContact = {
  name: "Priya Sharma",
  role: "Formation Specialist",
  phone: "+91 99887 76655",
  whatsApp: "+919988776655",
  email: "priya@legalnations.com",
  avatar: "PS",
};

export interface PackageTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  popular?: boolean;
  features: string[];
}

export const FORMATION_PACKAGES: PackageTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 399,
    currency: "USD",
    features: [
      "LLC or Corporation filing",
      "Articles of Organization",
      "Operating Agreement template",
      "EIN Application",
      "Standard processing (3-4 weeks)",
      "Email support",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 799,
    currency: "USD",
    popular: true,
    features: [
      "Everything in Basic",
      "Expedited processing (2-3 weeks)",
      "BOI Filing included",
      "Registered Agent (1st year free)",
      "Banking setup assistance",
      "Dedicated specialist",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 1499,
    currency: "USD",
    features: [
      "Everything in Standard",
      "Rush processing (7-10 days)",
      "Compliance calendar setup",
      "Annual report filing (1st year)",
      "Tax filing consultation",
      "Mercury/Stripe full setup",
      "WhatsApp direct line",
      "Dedicated compliance officer",
    ],
  },
];

export const US_STATES_POPULAR = [
  { code: "DE", name: "Delaware", tag: "Most Popular", description: "No state income tax for LLCs, business-friendly courts" },
  { code: "WY", name: "Wyoming", tag: "Best Value", description: "No state tax, strong privacy, low fees" },
  { code: "NV", name: "Nevada", tag: "Privacy Focused", description: "No state tax, no information sharing with IRS" },
  { code: "TX", name: "Texas", tag: "", description: "Large market, no state income tax" },
  { code: "FL", name: "Florida", tag: "", description: "No state income tax, growing business hub" },
  { code: "CA", name: "California", tag: "", description: "Largest market, $800 annual franchise tax" },
  { code: "NY", name: "New York", tag: "", description: "Financial hub, publication requirement" },
  { code: "NM", name: "New Mexico", tag: "", description: "No annual report requirement" },
];
