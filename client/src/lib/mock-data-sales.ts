export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  stage: string;
  value: number;
  assignedTo: string;
  createdDate: string;
  lastContact: string;
  priority: "high" | "medium" | "low";
}

export interface SalesTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  relatedLead?: string;
}

export interface FollowUp {
  id: string;
  leadName: string;
  type: "call" | "email" | "meeting";
  scheduledDate: string;
  notes: string;
  status: "scheduled" | "completed" | "missed";
  assignedTo: string;
}

export interface SalesRep {
  id: string;
  name: string;
  closedDeals: number;
  revenue: number;
  conversionRate: number;
  leadsAssigned: number;
  target: number;
}

export const pipelineStages = [
  { id: "new", label: "New Lead", color: "#6366f1" },
  { id: "qualified", label: "Qualified", color: "#3b82f6" },
  { id: "proposal", label: "Proposal", color: "#f59e0b" },
  { id: "negotiation", label: "Negotiation", color: "#f97316" },
  { id: "won", label: "Won", color: "#10b981" },
  { id: "lost", label: "Lost", color: "#ef4444" },
];

export const leads: Lead[] = [
  { id: "L-001", name: "Rajesh Kapoor", email: "rajesh@techflow.in", phone: "+91 98111 22334", company: "TechFlow Solutions", source: "LinkedIn", stage: "qualified", value: 450000, assignedTo: "Karan Gupta", createdDate: "2025-02-15", lastContact: "2025-02-24", priority: "high" },
  { id: "L-002", name: "Anita Deshmukh", email: "anita@brightstar.com", phone: "+91 98222 33445", company: "BrightStar Media", source: "Website", stage: "proposal", value: 280000, assignedTo: "Karan Gupta", createdDate: "2025-02-10", lastContact: "2025-02-22", priority: "medium" },
  { id: "L-003", name: "Suresh Menon", email: "suresh@globaledge.io", phone: "+91 98333 44556", company: "GlobalEdge Partners", source: "Referral", stage: "new", value: 750000, assignedTo: "Vikram Singh", createdDate: "2025-02-20", lastContact: "2025-02-20", priority: "high" },
  { id: "L-004", name: "Priyanka Joshi", email: "priyanka@nexaventures.com", phone: "+91 98444 55667", company: "NexaVentures", source: "Trade Show", stage: "negotiation", value: 1200000, assignedTo: "Vikram Singh", createdDate: "2025-01-28", lastContact: "2025-02-25", priority: "high" },
  { id: "L-005", name: "Deepak Malhotra", email: "deepak@pinnacle.co.in", phone: "+91 98555 66778", company: "Pinnacle Corp", source: "Cold Call", stage: "qualified", value: 320000, assignedTo: "Karan Gupta", createdDate: "2025-02-18", lastContact: "2025-02-23", priority: "medium" },
  { id: "L-006", name: "Neha Bhatia", email: "neha@cloudnine.tech", phone: "+91 98666 77889", company: "CloudNine Tech", source: "LinkedIn", stage: "won", value: 580000, assignedTo: "Vikram Singh", createdDate: "2025-01-15", lastContact: "2025-02-20", priority: "low" },
  { id: "L-007", name: "Arjun Malviya", email: "arjun@swiftlogic.in", phone: "+91 98777 88990", company: "SwiftLogic", source: "Website", stage: "new", value: 190000, assignedTo: "Karan Gupta", createdDate: "2025-02-22", lastContact: "2025-02-22", priority: "low" },
  { id: "L-008", name: "Kavitha Rao", email: "kavitha@zenithworks.com", phone: "+91 98888 99001", company: "Zenith Works", source: "Referral", stage: "proposal", value: 640000, assignedTo: "Vikram Singh", createdDate: "2025-02-05", lastContact: "2025-02-24", priority: "high" },
  { id: "L-009", name: "Ravi Krishnan", email: "ravi@datapulse.io", phone: "+91 98999 00112", company: "DataPulse", source: "LinkedIn", stage: "lost", value: 410000, assignedTo: "Karan Gupta", createdDate: "2025-01-20", lastContact: "2025-02-15", priority: "medium" },
  { id: "L-010", name: "Shruti Saxena", email: "shruti@orbitaltech.in", phone: "+91 97111 22334", company: "Orbital Tech", source: "Trade Show", stage: "negotiation", value: 890000, assignedTo: "Vikram Singh", createdDate: "2025-02-01", lastContact: "2025-02-26", priority: "high" },
  { id: "L-011", name: "Manish Agrawal", email: "manish@blueridge.com", phone: "+91 97222 33445", company: "BlueRidge Solutions", source: "Cold Call", stage: "qualified", value: 265000, assignedTo: "Karan Gupta", createdDate: "2025-02-19", lastContact: "2025-02-25", priority: "low" },
  { id: "L-012", name: "Pooja Kulkarni", email: "pooja@vistapro.in", phone: "+91 97333 44556", company: "VistaPro", source: "Website", stage: "new", value: 510000, assignedTo: "Vikram Singh", createdDate: "2025-02-24", lastContact: "2025-02-24", priority: "medium" },
];

export const salesTasks: SalesTask[] = [
  { id: "ST-001", title: "Send proposal to TechFlow Solutions", description: "Prepare and send detailed pricing proposal", assignedTo: "Karan Gupta", dueDate: "2025-02-28", priority: "high", status: "in-progress", relatedLead: "L-001" },
  { id: "ST-002", title: "Follow up with BrightStar Media", description: "Check on proposal review status", assignedTo: "Karan Gupta", dueDate: "2025-02-27", priority: "medium", status: "pending", relatedLead: "L-002" },
  { id: "ST-003", title: "Schedule demo for GlobalEdge Partners", description: "Set up product walkthrough", assignedTo: "Vikram Singh", dueDate: "2025-03-01", priority: "high", status: "pending", relatedLead: "L-003" },
  { id: "ST-004", title: "Prepare contract for NexaVentures", description: "Draft final agreement terms", assignedTo: "Vikram Singh", dueDate: "2025-02-26", priority: "high", status: "in-progress", relatedLead: "L-004" },
  { id: "ST-005", title: "Research Pinnacle Corp needs", description: "Deep dive into their tech stack", assignedTo: "Karan Gupta", dueDate: "2025-03-02", priority: "low", status: "pending", relatedLead: "L-005" },
  { id: "ST-006", title: "Update CRM with latest deal info", description: "Log all recent communications", assignedTo: "Karan Gupta", dueDate: "2025-02-25", priority: "medium", status: "completed" },
  { id: "ST-007", title: "Prepare quarterly sales report", description: "Compile Q1 performance data", assignedTo: "Vikram Singh", dueDate: "2025-03-05", priority: "medium", status: "pending" },
  { id: "ST-008", title: "Review Zenith Works proposal feedback", description: "Address client concerns in revised proposal", assignedTo: "Vikram Singh", dueDate: "2025-02-27", priority: "high", status: "in-progress", relatedLead: "L-008" },
];

export const followUps: FollowUp[] = [
  { id: "FU-001", leadName: "Rajesh Kapoor", type: "call", scheduledDate: "2025-02-27", notes: "Discuss pricing options and timeline", status: "scheduled", assignedTo: "Karan Gupta" },
  { id: "FU-002", leadName: "Anita Deshmukh", type: "email", scheduledDate: "2025-02-26", notes: "Send revised proposal with updated scope", status: "scheduled", assignedTo: "Karan Gupta" },
  { id: "FU-003", leadName: "Suresh Menon", type: "meeting", scheduledDate: "2025-03-01", notes: "In-person product demo at their office", status: "scheduled", assignedTo: "Vikram Singh" },
  { id: "FU-004", leadName: "Priyanka Joshi", type: "call", scheduledDate: "2025-02-25", notes: "Final negotiation call", status: "completed", assignedTo: "Vikram Singh" },
  { id: "FU-005", leadName: "Deepak Malhotra", type: "email", scheduledDate: "2025-02-24", notes: "Share case studies", status: "completed", assignedTo: "Karan Gupta" },
  { id: "FU-006", leadName: "Kavitha Rao", type: "meeting", scheduledDate: "2025-02-28", notes: "Proposal walkthrough with their CTO", status: "scheduled", assignedTo: "Vikram Singh" },
  { id: "FU-007", leadName: "Shruti Saxena", type: "call", scheduledDate: "2025-02-26", notes: "Check on decision timeline", status: "scheduled", assignedTo: "Vikram Singh" },
  { id: "FU-008", leadName: "Manish Agrawal", type: "email", scheduledDate: "2025-02-23", notes: "Initial introduction and service overview", status: "missed", assignedTo: "Karan Gupta" },
];

export const salesReps: SalesRep[] = [
  { id: "SR-001", name: "Karan Gupta", closedDeals: 12, revenue: 3450000, conversionRate: 28, leadsAssigned: 43, target: 5000000 },
  { id: "SR-002", name: "Vikram Singh", closedDeals: 18, revenue: 5200000, conversionRate: 35, leadsAssigned: 51, target: 6000000 },
  { id: "SR-003", name: "Rohan Joshi", closedDeals: 8, revenue: 1890000, conversionRate: 22, leadsAssigned: 36, target: 3500000 },
  { id: "SR-004", name: "Sneha Patel", closedDeals: 15, revenue: 4100000, conversionRate: 31, leadsAssigned: 48, target: 5500000 },
];

export const revenueByMonth = [
  { month: "Sep", revenue: 2800000, target: 3000000 },
  { month: "Oct", revenue: 3200000, target: 3200000 },
  { month: "Nov", revenue: 3850000, target: 3500000 },
  { month: "Dec", revenue: 4100000, target: 3800000 },
  { month: "Jan", revenue: 3600000, target: 4000000 },
  { month: "Feb", revenue: 4500000, target: 4200000 },
];
