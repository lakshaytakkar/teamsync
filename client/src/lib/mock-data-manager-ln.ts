import { SALES_LEADS } from "@/lib/mock-data-dashboard-ln";

export interface ManagerBOIOwner {
  id: string;
  name: string;
  ownership: string;
  dob: string;
  address: string;
  passportNum: string;
}

export interface ManagerClientDoc {
  id: string;
  name: string;
  category: "identity" | "formation" | "tax" | "compliance" | "banking";
  status: "pending-upload" | "uploaded" | "in-review" | "approved" | "rejected" | "action-required";
  uploadedAt?: string;
  notes?: string;
}

export interface ManagerTask {
  id: string;
  title: string;
  assignedTo: string;
  due: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

export interface ManagerTicket {
  id: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  created: string;
  lastUpdate: string;
  notes: string;
}

export interface ManagerActivityEntry {
  id: string;
  timestamp: string;
  type: "stage" | "document" | "message" | "system" | "action";
  description: string;
  by: string;
}

export interface ManagerClient {
  id: string;
  companyName: string;
  clientName: string;
  email: string;
  phone: string;
  state: string;
  entityType: "LLC" | "C-Corp" | "S-Corp";
  package: "Basic" | "Standard" | "Premium";
  stage: number;
  stageName: string;
  daysInStage: number;
  healthScore: number;
  assignedTo: string;
  assignedToInitials: string;
  startedAt: string;
  paymentStatus: "pending" | "paid";
  packageAmount: number;
  kycStatus: "not-started" | "in-review" | "approved" | "rejected";
  kycDocs: ManagerClientDoc[];
  kycNotes: string;
  articlesState: "not-started" | "in-progress" | "submitted" | "approved";
  articlesFiledDate?: string;
  operatingAgreement: "pending" | "generated" | "signed";
  llcNotes: string;
  einStatus: "not-started" | "submitted-fax" | "submitted-online" | "received";
  einNumber?: string;
  einSubmittedDate?: string;
  einReceivedDate?: string;
  einMethod: "Fax" | "Online" | "-";
  einNotes: string;
  boiStatus: "not-started" | "pending-kyc" | "in-progress" | "draft-ready" | "filed";
  boiOwners: ManagerBOIOwner[];
  boiFiledDate?: string;
  boiConfirmationNum?: string;
  boiNotes: string;
  mercuryStatus: "not-started" | "applied" | "approved" | "rejected";
  mercuryAccountNum?: string;
  mercuryApprovedDate?: string;
  stripeStatus: "not-started" | "applied" | "approved" | "rejected";
  stripeAccountId?: string;
  stripeApprovedDate?: string;
  bankingNotes: string;
  complianceCalendarDelivered: boolean;
  documentPackageDelivered: boolean;
  handoverNotes: string;
  tasks: ManagerTask[];
  tickets: ManagerTicket[];
  activityLog: ManagerActivityEntry[];
}

export interface ManagerTeamMember {
  name: string;
  initials: string;
  role: string;
  activeClients: number;
}

export const MANAGER_TEAM: ManagerTeamMember[] = [
  { name: "Priya Sharma", initials: "PS", role: "Formation Specialist", activeClients: 14 },
  { name: "Arjun Mehta", initials: "AM", role: "Compliance Officer", activeClients: 11 },
  { name: "Neha Gupta", initials: "NG", role: "Sales/BD", activeClients: 8 },
  { name: "Deepak Verma", initials: "DV", role: "Tax Specialist", activeClients: 9 },
];

export const MANAGER_ALL_LEADS = SALES_LEADS.map((l) => ({
  ...l,
  assignedSalesName: l.assignedTo === "manager" ? "Vikas (Manager)" : "Neha Gupta",
}));

export const MANAGER_CLIENTS: ManagerClient[] = [
  {
    id: "FC-001",
    companyName: "TechVentures LLC",
    clientName: "Rajesh Kumar",
    email: "rajesh@techventures.in",
    phone: "+91 98765 43210",
    state: "Delaware",
    entityType: "LLC",
    package: "Premium",
    stage: 4,
    stageName: "EIN Application",
    daysInStage: 12,
    healthScore: 78,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-12-12",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-001", name: "Passport — Rajesh Kumar", category: "identity", status: "approved", uploadedAt: "2025-12-15" },
      { id: "kd-002", name: "Address Proof — Utility Bill", category: "identity", status: "approved", uploadedAt: "2025-12-16" },
      { id: "kd-003", name: "Selfie with Passport", category: "identity", status: "approved", uploadedAt: "2025-12-16" },
    ],
    kycNotes: "All KYC documents verified and approved on 16 Dec 2025.",
    articlesState: "approved",
    articlesFiledDate: "2026-01-20",
    operatingAgreement: "generated",
    llcNotes: "Articles filed with Delaware Division of Corporations. Stamped copy delivered to client vault.",
    einStatus: "submitted-fax",
    einNumber: undefined,
    einSubmittedDate: "2026-02-01",
    einMethod: "Fax",
    einNotes: "IRS SS-4 faxed on Feb 1. Estimated 4-6 weeks. Follow up scheduled for Mar 15.",
    boiStatus: "draft-ready",
    boiOwners: [
      { id: "bo-001", name: "Rajesh Kumar", ownership: "100%", dob: "1985-04-12", address: "B-204, Andheri West, Mumbai 400053", passportNum: "Z1234567" },
    ],
    boiConfirmationNum: undefined,
    boiNotes: "BOI draft prepared — awaiting client review and sign-off.",
    mercuryStatus: "not-started",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Will initiate Mercury after EIN received.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-001", title: "Follow up on EIN fax status with IRS", assignedTo: "Priya Sharma", due: "2026-03-28", done: false, priority: "high" },
      { id: "mt-002", title: "Get client to approve BOI draft", assignedTo: "Arjun Mehta", due: "2026-03-27", done: false, priority: "high" },
      { id: "mt-003", title: "Prepare Mercury application documents", assignedTo: "Priya Sharma", due: "2026-04-10", done: false, priority: "medium" },
    ],
    tickets: [
      { id: "tk-001", subject: "EIN delay — IRS fax confirmation needed", priority: "high", status: "in-progress", created: "2026-03-10", lastUpdate: "2026-03-24", notes: "Tracking IRS fax acknowledgement. EIN expected by end of March." },
    ],
    activityLog: [
      { id: "al-001", timestamp: "2026-02-28T09:15:00Z", type: "document", description: "BOI draft uploaded by Arjun Mehta", by: "Arjun Mehta" },
      { id: "al-002", timestamp: "2026-02-05T10:20:00Z", type: "stage", description: "Stage 4 (EIN Application) initiated — SS-4 submitted via fax", by: "Priya Sharma" },
      { id: "al-003", timestamp: "2026-01-22T11:00:00Z", type: "document", description: "Operating Agreement generated and uploaded", by: "System" },
      { id: "al-004", timestamp: "2026-01-20T14:30:00Z", type: "stage", description: "Stage 3 complete — Articles filed with Delaware", by: "Priya Sharma" },
      { id: "al-005", timestamp: "2025-12-16T10:00:00Z", type: "stage", description: "Stage 2 complete — KYC approved", by: "Arjun Mehta" },
      { id: "al-006", timestamp: "2025-12-12T10:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-002",
    companyName: "GreenLeaf Organics LLC",
    clientName: "Amit Patel",
    email: "amit@greenleaforganics.com",
    phone: "+91 98001 23456",
    state: "Delaware",
    entityType: "LLC",
    package: "Premium",
    stage: 3,
    stageName: "Articles Filing",
    daysInStage: 8,
    healthScore: 55,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2026-01-15",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-010", name: "Passport — Amit Patel", category: "identity", status: "approved", uploadedAt: "2026-01-18" },
      { id: "kd-011", name: "Address Proof — Bank Statement", category: "identity", status: "approved", uploadedAt: "2026-01-19" },
      { id: "kd-012", name: "Selfie with Passport", category: "identity", status: "approved", uploadedAt: "2026-01-20" },
    ],
    kycNotes: "All documents clear. Approved Jan 20.",
    articlesState: "in-progress",
    operatingAgreement: "pending",
    llcNotes: "Articles draft under preparation. Name check completed — GreenLeaf Organics LLC available in Delaware.",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "EIN will be initiated after Articles approval.",
    boiStatus: "not-started",
    boiOwners: [
      { id: "bo-010", name: "Amit Patel", ownership: "70%", dob: "1988-09-23", address: "302, Satellite Road, Ahmedabad 380015", passportNum: "P7654321" },
      { id: "bo-011", name: "Ritu Patel", ownership: "30%", dob: "1990-03-14", address: "302, Satellite Road, Ahmedabad 380015", passportNum: "P9012345" },
    ],
    boiConfirmationNum: undefined,
    boiNotes: "BOI to begin after EIN received.",
    mercuryStatus: "not-started",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-010", title: "Complete Articles of Organization draft", assignedTo: "Priya Sharma", due: "2026-03-30", done: false, priority: "high" },
      { id: "mt-011", title: "Submit Articles to Delaware SOS", assignedTo: "Priya Sharma", due: "2026-04-02", done: false, priority: "medium" },
    ],
    tickets: [
      { id: "tk-010", subject: "Articles filing timeline — client requesting update", priority: "medium", status: "open", created: "2026-03-21", lastUpdate: "2026-03-21", notes: "Client asked for ETA on Articles filing." },
    ],
    activityLog: [
      { id: "al-010", timestamp: "2026-03-18T10:00:00Z", type: "stage", description: "Stage 3 (Articles Filing) started", by: "Priya Sharma" },
      { id: "al-011", timestamp: "2026-01-20T14:00:00Z", type: "stage", description: "Stage 2 complete — KYC approved", by: "Arjun Mehta" },
      { id: "al-012", timestamp: "2026-01-15T09:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-003",
    companyName: "SwiftPay Solutions Inc",
    clientName: "Neha Joshi",
    email: "neha@swiftpay.io",
    phone: "+91 97532 10987",
    state: "Nevada",
    entityType: "C-Corp",
    package: "Basic",
    stage: 2,
    stageName: "KYC & Document Collection",
    daysInStage: 3,
    healthScore: 30,
    assignedTo: "Arjun Mehta",
    assignedToInitials: "AM",
    startedAt: "2026-02-28",
    paymentStatus: "paid",
    packageAmount: 399,
    kycStatus: "in-review",
    kycDocs: [
      { id: "kd-020", name: "Passport — Neha Joshi", category: "identity", status: "approved", uploadedAt: "2026-03-01" },
      { id: "kd-021", name: "Address Proof — Utility Bill", category: "identity", status: "action-required", uploadedAt: "2026-03-02", notes: "Document is blurry — please re-upload a clear scan" },
    ],
    kycNotes: "Utility bill re-upload required. Passport is clear.",
    articlesState: "not-started",
    operatingAgreement: "pending",
    llcNotes: "",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "",
    boiStatus: "pending-kyc",
    boiOwners: [
      { id: "bo-020", name: "Neha Joshi", ownership: "100%", dob: "1992-07-04", address: "A-12, Koregaon Park, Pune 411001", passportNum: "M3344556" },
    ],
    boiConfirmationNum: undefined,
    boiNotes: "",
    mercuryStatus: "not-started",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-020", title: "Request re-upload of address proof from Neha", assignedTo: "Arjun Mehta", due: "2026-03-27", done: false, priority: "high" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-020", timestamp: "2026-03-23T09:00:00Z", type: "stage", description: "Stage 2 (KYC) started — documents requested", by: "Arjun Mehta" },
      { id: "al-021", timestamp: "2026-03-02T12:00:00Z", type: "document", description: "Address proof flagged — blurry scan", by: "Arjun Mehta" },
      { id: "al-022", timestamp: "2026-02-28T10:00:00Z", type: "action", description: "Client onboarded — Basic package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-004",
    companyName: "DataBridge Analytics LLC",
    clientName: "Vikram Rao",
    email: "vikram@databridge.ai",
    phone: "+91 96543 21098",
    state: "Wyoming",
    entityType: "LLC",
    package: "Standard",
    stage: 5,
    stageName: "BOI Filing",
    daysInStage: 5,
    healthScore: 88,
    assignedTo: "Arjun Mehta",
    assignedToInitials: "AM",
    startedAt: "2025-11-20",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-030", name: "Passport — Vikram Rao", category: "identity", status: "approved", uploadedAt: "2025-11-25" },
      { id: "kd-031", name: "Address Proof — Bank Statement", category: "identity", status: "approved", uploadedAt: "2025-11-25" },
    ],
    kycNotes: "KYC approved Nov 28, 2025.",
    articlesState: "approved",
    articlesFiledDate: "2025-12-10",
    operatingAgreement: "signed",
    llcNotes: "Articles approved. Operating Agreement reviewed and signed by client.",
    einStatus: "received",
    einNumber: "92-8765432",
    einSubmittedDate: "2025-12-15",
    einReceivedDate: "2026-01-20",
    einMethod: "Online",
    einNotes: "EIN received online same-day. CP 575 uploaded to client vault.",
    boiStatus: "in-progress",
    boiOwners: [
      { id: "bo-030", name: "Vikram Rao", ownership: "60%", dob: "1980-11-30", address: "Flat 5B, Jubilee Hills, Hyderabad 500033", passportNum: "A9988776" },
      { id: "bo-031", name: "Ananya Rao", ownership: "40%", dob: "1983-06-15", address: "Flat 5B, Jubilee Hills, Hyderabad 500033", passportNum: "A7766554" },
    ],
    boiConfirmationNum: undefined,
    boiNotes: "BOI in progress. Collecting owner information. Filing due by Apr 15.",
    mercuryStatus: "not-started",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Mercury application queued after BOI filing.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-030", title: "Collect BOI owner details from Vikram", assignedTo: "Arjun Mehta", due: "2026-03-28", done: false, priority: "high" },
      { id: "mt-031", title: "File BOI report with FinCEN", assignedTo: "Arjun Mehta", due: "2026-04-10", done: false, priority: "high" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-030", timestamp: "2026-03-21T09:00:00Z", type: "stage", description: "Stage 5 (BOI Filing) started", by: "Arjun Mehta" },
      { id: "al-031", timestamp: "2026-01-20T10:00:00Z", type: "stage", description: "EIN received — 92-8765432", by: "System" },
      { id: "al-032", timestamp: "2025-12-10T14:00:00Z", type: "stage", description: "Articles of Organization approved by Wyoming SOS", by: "Priya Sharma" },
      { id: "al-033", timestamp: "2025-11-28T11:00:00Z", type: "stage", description: "KYC approved", by: "Arjun Mehta" },
    ],
  },
  {
    id: "FC-005",
    companyName: "UrbanNest Realty Corp",
    clientName: "Priya Singh",
    email: "priya@urbannest.co",
    phone: "+91 94321 00987",
    state: "Texas",
    entityType: "C-Corp",
    package: "Premium",
    stage: 1,
    stageName: "Payment & Package Selection",
    daysInStage: 1,
    healthScore: 12,
    assignedTo: "Neha Gupta",
    assignedToInitials: "NG",
    startedAt: "2026-03-25",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "not-started",
    kycDocs: [],
    kycNotes: "KYC documents not yet requested.",
    articlesState: "not-started",
    operatingAgreement: "pending",
    llcNotes: "",
    einStatus: "not-started",
    einMethod: "-",
    einNotes: "",
    boiStatus: "not-started",
    boiOwners: [
      { id: "bo-050", name: "Priya Singh", ownership: "100%", dob: "1991-02-19", address: "401, Sector 15, Gurgaon 122001", passportNum: "J5544332" },
    ],
    boiConfirmationNum: undefined,
    boiNotes: "",
    mercuryStatus: "not-started",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-050", title: "Send KYC document checklist to Priya Singh", assignedTo: "Neha Gupta", due: "2026-03-27", done: false, priority: "high" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-050", timestamp: "2026-03-25T10:00:00Z", type: "action", description: "Client onboarded — Premium package payment confirmed", by: "System" },
    ],
  },
  {
    id: "FC-006",
    companyName: "NovaTech AI Inc",
    clientName: "Deepak Verma",
    email: "deepak@novatech.ai",
    phone: "+91 99001 55432",
    state: "Delaware",
    entityType: "C-Corp",
    package: "Standard",
    stage: 6,
    stageName: "Banking & Stripe Setup",
    daysInStage: 4,
    healthScore: 92,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-10-05",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-060", name: "Passport — Deepak Verma", category: "identity", status: "approved", uploadedAt: "2025-10-10" },
      { id: "kd-061", name: "Address Proof — Utility Bill", category: "identity", status: "approved", uploadedAt: "2025-10-11" },
    ],
    kycNotes: "KYC approved Oct 12, 2025.",
    articlesState: "approved",
    articlesFiledDate: "2025-11-15",
    operatingAgreement: "signed",
    llcNotes: "Articles of Incorporation approved by Delaware.",
    einStatus: "received",
    einNumber: "88-9123456",
    einSubmittedDate: "2025-11-20",
    einReceivedDate: "2025-12-10",
    einMethod: "Fax",
    einNotes: "EIN 88-9123456 received via fax confirmation letter.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-060", name: "Deepak Verma", ownership: "55%", dob: "1979-08-22", address: "C-301, Powai, Mumbai 400076", passportNum: "G1122334" },
      { id: "bo-061", name: "Simran Verma", ownership: "25%", dob: "1982-12-01", address: "C-301, Powai, Mumbai 400076", passportNum: "G3344556" },
      { id: "bo-062", name: "Kiran Holdings Ltd", ownership: "20%", dob: "", address: "Mauritius", passportNum: "N/A (Corporate)" },
    ],
    boiFiledDate: "2026-01-28",
    boiConfirmationNum: "FIN-2026-88912",
    boiNotes: "BOI filed with FinCEN on Jan 28. Tracking number: FIN-2026-88912.",
    mercuryStatus: "applied",
    mercuryAccountNum: undefined,
    mercuryApprovedDate: undefined,
    stripeStatus: "not-started",
    stripeAccountId: undefined,
    stripeApprovedDate: undefined,
    bankingNotes: "Mercury application submitted Mar 22. Stripe to follow after Mercury approval.",
    complianceCalendarDelivered: false,
    documentPackageDelivered: false,
    handoverNotes: "",
    tasks: [
      { id: "mt-060", title: "Follow up Mercury account approval", assignedTo: "Priya Sharma", due: "2026-03-30", done: false, priority: "high" },
      { id: "mt-061", title: "Initiate Stripe business account", assignedTo: "Priya Sharma", due: "2026-04-05", done: false, priority: "medium" },
    ],
    tickets: [],
    activityLog: [
      { id: "al-060", timestamp: "2026-03-22T10:00:00Z", type: "action", description: "Mercury bank application submitted", by: "Priya Sharma" },
      { id: "al-061", timestamp: "2026-01-28T14:00:00Z", type: "stage", description: "BOI filed with FinCEN — tracking #FIN-2026-88912", by: "Arjun Mehta" },
      { id: "al-062", timestamp: "2025-12-10T10:00:00Z", type: "stage", description: "EIN 88-9123456 received", by: "System" },
      { id: "al-063", timestamp: "2025-11-15T14:00:00Z", type: "stage", description: "Articles of Incorporation approved", by: "Priya Sharma" },
    ],
  },
  {
    id: "FC-007",
    companyName: "CloudBase Corp",
    clientName: "Rajesh Kumar",
    email: "rajesh@techventures.in",
    phone: "+91 98765 43210",
    state: "Wyoming",
    entityType: "C-Corp",
    package: "Standard",
    stage: 7,
    stageName: "Compliance & Handover",
    daysInStage: 0,
    healthScore: 100,
    assignedTo: "Priya Sharma",
    assignedToInitials: "PS",
    startedAt: "2025-06-01",
    paymentStatus: "paid",
    packageAmount: 799,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-070", name: "Passport — Rajesh Kumar", category: "identity", status: "approved", uploadedAt: "2025-06-10" },
      { id: "kd-071", name: "Address Proof — Bank Statement", category: "identity", status: "approved", uploadedAt: "2025-06-10" },
    ],
    kycNotes: "KYC approved June 15, 2025.",
    articlesState: "approved",
    articlesFiledDate: "2025-08-15",
    operatingAgreement: "signed",
    llcNotes: "Articles of Incorporation filed in Wyoming. Complete.",
    einStatus: "received",
    einNumber: "92-7654321",
    einSubmittedDate: "2025-09-01",
    einReceivedDate: "2025-09-02",
    einMethod: "Online",
    einNotes: "EIN received online same-day.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-070", name: "Rajesh Kumar", ownership: "100%", dob: "1985-04-12", address: "B-204, Andheri West, Mumbai 400053", passportNum: "Z1234567" },
    ],
    boiFiledDate: "2025-09-18",
    boiConfirmationNum: "FIN-2025-92761",
    boiNotes: "BOI filed Sep 18, 2025.",
    mercuryStatus: "approved",
    mercuryAccountNum: "4521987630",
    mercuryApprovedDate: "2025-10-05",
    stripeStatus: "approved",
    stripeAccountId: "acct_CB7823K912",
    stripeApprovedDate: "2025-10-12",
    bankingNotes: "Mercury and Stripe both active.",
    complianceCalendarDelivered: true,
    documentPackageDelivered: true,
    handoverNotes: "Formation complete. Annual report due May 1, 2026.",
    tasks: [
      { id: "mt-070", title: "Annual report filing reminder for CloudBase", assignedTo: "Priya Sharma", due: "2026-04-20", done: false, priority: "medium" },
    ],
    tickets: [
      { id: "tk-070", subject: "Annual report filing — Wyoming due May 1", priority: "medium", status: "open", created: "2026-03-01", lastUpdate: "2026-03-01", notes: "Client notified. Will file before May 1." },
    ],
    activityLog: [
      { id: "al-070", timestamp: "2025-10-28T16:00:00Z", type: "stage", description: "Stage 7 complete — Compliance calendar & document package delivered", by: "Priya Sharma" },
      { id: "al-071", timestamp: "2025-10-15T10:00:00Z", type: "stage", description: "Banking setup complete — Mercury & Stripe approved", by: "Priya Sharma" },
      { id: "al-072", timestamp: "2025-09-20T14:00:00Z", type: "stage", description: "BOI filed with FinCEN", by: "Arjun Mehta" },
      { id: "al-073", timestamp: "2025-09-02T10:00:00Z", type: "stage", description: "EIN 92-7654321 received online", by: "System" },
    ],
  },
  {
    id: "FC-008",
    companyName: "MediCare Solutions LLC",
    clientName: "Sunita Agarwal",
    email: "sunita@medicaresol.com",
    phone: "+91 98123 45670",
    state: "Florida",
    entityType: "LLC",
    package: "Premium",
    stage: 7,
    stageName: "Compliance & Handover",
    daysInStage: 0,
    healthScore: 100,
    assignedTo: "Deepak Verma",
    assignedToInitials: "DV",
    startedAt: "2025-09-01",
    paymentStatus: "paid",
    packageAmount: 1499,
    kycStatus: "approved",
    kycDocs: [
      { id: "kd-080", name: "Passport — Sunita Agarwal", category: "identity", status: "approved", uploadedAt: "2025-09-08" },
      { id: "kd-081", name: "Address Proof — Utility Bill", category: "identity", status: "approved", uploadedAt: "2025-09-08" },
    ],
    kycNotes: "KYC approved Sept 10.",
    articlesState: "approved",
    articlesFiledDate: "2025-10-05",
    operatingAgreement: "signed",
    llcNotes: "Articles filed in Florida. Complete.",
    einStatus: "received",
    einNumber: "65-4321987",
    einSubmittedDate: "2025-10-10",
    einReceivedDate: "2025-10-25",
    einMethod: "Fax",
    einNotes: "EIN 65-4321987 received via fax.",
    boiStatus: "filed",
    boiOwners: [
      { id: "bo-080", name: "Sunita Agarwal", ownership: "100%", dob: "1977-11-08", address: "D-5, Vasant Kunj, New Delhi 110070", passportNum: "K8877665" },
    ],
    boiFiledDate: "2025-11-10",
    boiConfirmationNum: "FIN-2025-65432",
    boiNotes: "BOI filed Nov 10, 2025.",
    mercuryStatus: "approved",
    mercuryAccountNum: "7734512890",
    mercuryApprovedDate: "2025-11-28",
    stripeStatus: "approved",
    stripeAccountId: "acct_MC4412X887",
    stripeApprovedDate: "2025-12-05",
    bankingNotes: "Mercury and Stripe both active since Dec 2025.",
    complianceCalendarDelivered: true,
    documentPackageDelivered: true,
    handoverNotes: "Formation complete. Tax filing in progress.",
    tasks: [],
    tickets: [],
    activityLog: [
      { id: "al-080", timestamp: "2025-12-20T14:00:00Z", type: "stage", description: "Stage 7 complete — Full document package delivered", by: "Deepak Verma" },
      { id: "al-081", timestamp: "2025-12-01T10:00:00Z", type: "stage", description: "Mercury & Stripe setup completed", by: "Priya Sharma" },
      { id: "al-082", timestamp: "2025-11-10T14:00:00Z", type: "stage", description: "BOI filed with FinCEN", by: "Arjun Mehta" },
    ],
  },
];
