import { z } from "zod";

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "Active" | "Inactive" | "On Leave";
  joinDate: string;
  avatar?: string;
  salary?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected";
  appliedDate: string;
  source: string;
  rating?: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
  description: string;
  status: "Active" | "Inactive";
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  status: "Open" | "Closed" | "Draft";
  postedDate: string;
  closingDate?: string;
  applicants: number;
  description: string;
  salaryRange?: string;
  experience?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Annual" | "Sick" | "Personal" | "Maternity" | "Paternity";
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  days: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Absent" | "Late" | "Half Day";
  department: string;
  workHours: string;
}

export interface HRDocument {
  id: string;
  title: string;
  category: "Policy" | "Contract" | "Certificate" | "Report" | "Other";
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  status: "Active" | "Archived";
}

export const insertEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  department: z.string().min(1),
  position: z.string().min(1),
  status: z.enum(["Active", "Inactive", "On Leave"]),
  joinDate: z.string().min(1),
  salary: z.number().optional(),
});

export const insertCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  position: z.string().min(1),
  department: z.string().min(1),
  stage: z.enum(["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"]),
  appliedDate: z.string().min(1),
  source: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
});

export const insertDepartmentSchema = z.object({
  name: z.string().min(1),
  head: z.string().min(1),
  employeeCount: z.number().min(0),
  description: z.string().min(1),
  status: z.enum(["Active", "Inactive"]),
});

export const insertJobPostingSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  status: z.enum(["Open", "Closed", "Draft"]),
  postedDate: z.string().min(1),
  closingDate: z.string().optional(),
  applicants: z.number().min(0),
  description: z.string().min(1),
  salaryRange: z.string().optional(),
  experience: z.string().optional(),
});

export const insertLeaveRequestSchema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  type: z.enum(["Annual", "Sick", "Personal", "Maternity", "Paternity"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(["Pending", "Approved", "Rejected"]),
  reason: z.string().min(1),
  days: z.number().min(1),
});

export const insertAttendanceSchema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  date: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  status: z.enum(["Present", "Absent", "Late", "Half Day"]),
  department: z.string().min(1),
  workHours: z.string().min(1),
});

export const insertDocumentSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["Policy", "Contract", "Certificate", "Report", "Other"]),
  uploadedBy: z.string().min(1),
  uploadDate: z.string().min(1),
  fileSize: z.string().min(1),
  fileType: z.string().min(1),
  status: z.enum(["Active", "Archived"]),
});

export interface PayrollRun {
  id: string;
  period: string;
  runDate: string;
  status: "Draft" | "Processing" | "Completed" | "Failed";
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
}

export interface PayrollEntry {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "Paid" | "Pending" | "Failed";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Completed" | "On Hold" | "Overdue";
  startDate: string;
  endDate: string;
  progress: number;
  priority: "High" | "Medium" | "Low";
  teamSize: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: "To Do" | "In Progress" | "Review" | "Done";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
}

export const insertPayrollRunSchema = z.object({
  period: z.string().min(1),
  runDate: z.string().min(1),
  status: z.enum(["Draft", "Processing", "Completed", "Failed"]),
  totalGross: z.number().min(0),
  totalDeductions: z.number().min(0),
  totalNet: z.number().min(0),
  employeeCount: z.number().min(0),
});

export const insertPayrollEntrySchema = z.object({
  payrollRunId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  department: z.string().min(1),
  baseSalary: z.number().min(0),
  bonus: z.number().min(0),
  deductions: z.number().min(0),
  netPay: z.number().min(0),
  status: z.enum(["Paid", "Pending", "Failed"]),
});

export const insertProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["Active", "Completed", "On Hold", "Overdue"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  progress: z.number().min(0).max(100),
  priority: z.enum(["High", "Medium", "Low"]),
  teamSize: z.number().min(1),
});

export const insertProjectTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  assignee: z.string().min(1),
  status: z.enum(["To Do", "In Progress", "Review", "Done"]),
  priority: z.enum(["High", "Medium", "Low"]),
  dueDate: z.string().min(1),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertPayrollRun = z.infer<typeof insertPayrollRunSchema>;
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;
