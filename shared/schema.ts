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

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
