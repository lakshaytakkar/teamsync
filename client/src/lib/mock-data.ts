import type {
  Employee,
  Candidate,
  Department,
  JobPosting,
  LeaveRequest,
  AttendanceRecord,
  HRDocument,
} from "@shared/schema";

export const employees: Employee[] = [
  { id: "1", employeeId: "EMP-001", firstName: "Arjun", lastName: "Mehta", email: "arjun.mehta@lumin.com", phone: "+91 98765 43210", department: "Engineering", position: "Senior Software Engineer", status: "Active", joinDate: "2023-01-15", salary: 1800000 },
  { id: "2", employeeId: "EMP-002", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@lumin.com", phone: "+91 98765 43211", department: "Design", position: "Lead Product Designer", status: "Active", joinDate: "2022-06-20", salary: 1600000 },
  { id: "3", employeeId: "EMP-003", firstName: "Rahul", lastName: "Kumar", email: "rahul.kumar@lumin.com", phone: "+91 98765 43212", department: "Engineering", position: "Frontend Developer", status: "Active", joinDate: "2023-03-10", salary: 1200000 },
  { id: "4", employeeId: "EMP-004", firstName: "Sneha", lastName: "Patel", email: "sneha.patel@lumin.com", phone: "+91 98765 43213", department: "HR", position: "HR Manager", status: "Active", joinDate: "2021-09-01", salary: 1500000 },
  { id: "5", employeeId: "EMP-005", firstName: "Vikram", lastName: "Singh", email: "vikram.singh@lumin.com", phone: "+91 98765 43214", department: "Marketing", position: "Marketing Lead", status: "Active", joinDate: "2022-11-05", salary: 1400000 },
  { id: "6", employeeId: "EMP-006", firstName: "Ananya", lastName: "Reddy", email: "ananya.reddy@lumin.com", phone: "+91 98765 43215", department: "Engineering", position: "Backend Developer", status: "On Leave", joinDate: "2023-07-12", salary: 1100000 },
  { id: "7", employeeId: "EMP-007", firstName: "Karan", lastName: "Gupta", email: "karan.gupta@lumin.com", phone: "+91 98765 43216", department: "Sales", position: "Sales Executive", status: "Active", joinDate: "2024-01-08", salary: 900000 },
  { id: "8", employeeId: "EMP-008", firstName: "Meera", lastName: "Nair", email: "meera.nair@lumin.com", phone: "+91 98765 43217", department: "Design", position: "UI Designer", status: "Active", joinDate: "2023-09-22", salary: 1000000 },
  { id: "9", employeeId: "EMP-009", firstName: "Rohan", lastName: "Joshi", email: "rohan.joshi@lumin.com", phone: "+91 98765 43218", department: "Engineering", position: "DevOps Engineer", status: "Active", joinDate: "2022-04-15", salary: 1500000 },
  { id: "10", employeeId: "EMP-010", firstName: "Divya", lastName: "Iyer", email: "divya.iyer@lumin.com", phone: "+91 98765 43219", department: "Finance", position: "Finance Analyst", status: "Inactive", joinDate: "2021-12-01", salary: 1100000 },
  { id: "11", employeeId: "EMP-011", firstName: "Aditya", lastName: "Verma", email: "aditya.verma@lumin.com", phone: "+91 98765 43220", department: "Engineering", position: "QA Engineer", status: "Active", joinDate: "2023-05-18", salary: 950000 },
  { id: "12", employeeId: "EMP-012", firstName: "Nisha", lastName: "Choudhary", email: "nisha.choudhary@lumin.com", phone: "+91 98765 43221", department: "HR", position: "Recruiter", status: "Active", joinDate: "2024-02-10", salary: 800000 },
  { id: "13", employeeId: "EMP-013", firstName: "Siddharth", lastName: "Rao", email: "siddharth.rao@lumin.com", phone: "+91 98765 43222", department: "Product", position: "Product Manager", status: "Active", joinDate: "2022-08-14", salary: 1700000 },
  { id: "14", employeeId: "EMP-014", firstName: "Pooja", lastName: "Bhat", email: "pooja.bhat@lumin.com", phone: "+91 98765 43223", department: "Marketing", position: "Content Writer", status: "Active", joinDate: "2023-11-03", salary: 700000 },
  { id: "15", employeeId: "EMP-015", firstName: "Amit", lastName: "Desai", email: "amit.desai@lumin.com", phone: "+91 98765 43224", department: "Engineering", position: "Tech Lead", status: "Active", joinDate: "2021-03-20", salary: 2200000 },
];

export const candidates: Candidate[] = [
  { id: "1", name: "Ravi Shankar", email: "ravi.shankar@gmail.com", phone: "+91 99876 54321", position: "Senior Frontend Developer", department: "Engineering", stage: "Interview", appliedDate: "2025-02-10", source: "LinkedIn", rating: 4 },
  { id: "2", name: "Kavitha Menon", email: "kavitha.m@gmail.com", phone: "+91 99876 54322", position: "Product Designer", department: "Design", stage: "Screening", appliedDate: "2025-02-15", source: "Referral", rating: 3 },
  { id: "3", name: "Deepak Tiwari", email: "deepak.t@outlook.com", phone: "+91 99876 54323", position: "Backend Developer", department: "Engineering", stage: "Applied", appliedDate: "2025-02-18", source: "Indeed", rating: 3 },
  { id: "4", name: "Swati Kapoor", email: "swati.k@gmail.com", phone: "+91 99876 54324", position: "HR Coordinator", department: "HR", stage: "Offer", appliedDate: "2025-01-25", source: "LinkedIn", rating: 5 },
  { id: "5", name: "Nikhil Agarwal", email: "nikhil.a@yahoo.com", phone: "+91 99876 54325", position: "Data Analyst", department: "Finance", stage: "Interview", appliedDate: "2025-02-05", source: "Naukri", rating: 4 },
  { id: "6", name: "Anjali Das", email: "anjali.d@gmail.com", phone: "+91 99876 54326", position: "Marketing Executive", department: "Marketing", stage: "Hired", appliedDate: "2025-01-10", source: "Referral", rating: 5 },
  { id: "7", name: "Manish Pandey", email: "manish.p@outlook.com", phone: "+91 99876 54327", position: "DevOps Engineer", department: "Engineering", stage: "Rejected", appliedDate: "2025-01-20", source: "LinkedIn", rating: 2 },
  { id: "8", name: "Shruti Mishra", email: "shruti.m@gmail.com", phone: "+91 99876 54328", position: "UX Researcher", department: "Design", stage: "Screening", appliedDate: "2025-02-20", source: "Glassdoor", rating: 4 },
  { id: "9", name: "Varun Saxena", email: "varun.s@gmail.com", phone: "+91 99876 54329", position: "Sales Manager", department: "Sales", stage: "Applied", appliedDate: "2025-02-22", source: "Indeed", rating: 3 },
  { id: "10", name: "Pallavi Jain", email: "pallavi.j@gmail.com", phone: "+91 99876 54330", position: "Content Strategist", department: "Marketing", stage: "Interview", appliedDate: "2025-02-08", source: "LinkedIn", rating: 4 },
];

export const departments: Department[] = [
  { id: "1", name: "Engineering", head: "Amit Desai", employeeCount: 6, description: "Software development and technical infrastructure", status: "Active" },
  { id: "2", name: "Design", head: "Priya Sharma", employeeCount: 2, description: "Product design, UI/UX, and brand identity", status: "Active" },
  { id: "3", name: "HR", head: "Sneha Patel", employeeCount: 2, description: "Human resources, recruitment, and employee relations", status: "Active" },
  { id: "4", name: "Marketing", head: "Vikram Singh", employeeCount: 2, description: "Brand marketing, content, and growth", status: "Active" },
  { id: "5", name: "Sales", head: "Karan Gupta", employeeCount: 1, description: "Sales operations and business development", status: "Active" },
  { id: "6", name: "Finance", head: "Divya Iyer", employeeCount: 1, description: "Financial planning, accounting, and compliance", status: "Active" },
  { id: "7", name: "Product", head: "Siddharth Rao", employeeCount: 1, description: "Product strategy and roadmap management", status: "Active" },
];

export const jobPostings: JobPosting[] = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", location: "Bangalore", type: "Full-time", status: "Open", postedDate: "2025-02-01", closingDate: "2025-03-15", applicants: 24, description: "Looking for an experienced frontend developer with expertise in React and TypeScript", salaryRange: "15-22 LPA", experience: "4-6 years" },
  { id: "2", title: "Product Designer", department: "Design", location: "Mumbai", type: "Full-time", status: "Open", postedDate: "2025-02-05", closingDate: "2025-03-20", applicants: 18, description: "Join our design team to create exceptional user experiences", salaryRange: "12-18 LPA", experience: "3-5 years" },
  { id: "3", title: "Backend Developer", department: "Engineering", location: "Bangalore", type: "Full-time", status: "Open", postedDate: "2025-02-10", closingDate: "2025-03-25", applicants: 32, description: "Build scalable backend services using Node.js and PostgreSQL", salaryRange: "14-20 LPA", experience: "3-5 years" },
  { id: "4", title: "HR Coordinator", department: "HR", location: "Delhi", type: "Full-time", status: "Closed", postedDate: "2025-01-15", closingDate: "2025-02-15", applicants: 45, description: "Support HR operations including recruitment coordination and onboarding", salaryRange: "6-9 LPA", experience: "1-3 years" },
  { id: "5", title: "Marketing Intern", department: "Marketing", location: "Remote", type: "Internship", status: "Open", postedDate: "2025-02-15", closingDate: "2025-03-30", applicants: 56, description: "Assist with digital marketing campaigns and social media management", salaryRange: "25K/month", experience: "0-1 years" },
  { id: "6", title: "Data Analyst", department: "Finance", location: "Bangalore", type: "Full-time", status: "Draft", postedDate: "2025-02-20", applicants: 0, description: "Analyze financial data and create reports for leadership team", salaryRange: "10-15 LPA", experience: "2-4 years" },
  { id: "7", title: "DevOps Engineer", department: "Engineering", location: "Hyderabad", type: "Full-time", status: "Open", postedDate: "2025-02-12", closingDate: "2025-03-28", applicants: 15, description: "Manage CI/CD pipelines, cloud infrastructure, and monitoring", salaryRange: "16-24 LPA", experience: "3-6 years" },
  { id: "8", title: "Content Writer", department: "Marketing", location: "Remote", type: "Contract", status: "Open", postedDate: "2025-02-18", closingDate: "2025-04-01", applicants: 28, description: "Create compelling content for blog, social media, and marketing materials", salaryRange: "6-10 LPA", experience: "2-4 years" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "1", employeeId: "6", employeeName: "Ananya Reddy", type: "Annual", startDate: "2025-02-25", endDate: "2025-03-01", status: "Approved", reason: "Family vacation", days: 5 },
  { id: "2", employeeId: "3", employeeName: "Rahul Kumar", type: "Sick", startDate: "2025-02-20", endDate: "2025-02-21", status: "Approved", reason: "Feeling unwell", days: 2 },
  { id: "3", employeeId: "5", employeeName: "Vikram Singh", type: "Personal", startDate: "2025-03-05", endDate: "2025-03-06", status: "Pending", reason: "Personal errand", days: 2 },
  { id: "4", employeeId: "8", employeeName: "Meera Nair", type: "Annual", startDate: "2025-03-10", endDate: "2025-03-14", status: "Pending", reason: "Travel plans", days: 5 },
  { id: "5", employeeId: "1", employeeName: "Arjun Mehta", type: "Sick", startDate: "2025-02-18", endDate: "2025-02-18", status: "Approved", reason: "Doctor appointment", days: 1 },
  { id: "6", employeeId: "11", employeeName: "Aditya Verma", type: "Personal", startDate: "2025-03-01", endDate: "2025-03-02", status: "Rejected", reason: "House shifting", days: 2 },
  { id: "7", employeeId: "14", employeeName: "Pooja Bhat", type: "Annual", startDate: "2025-03-15", endDate: "2025-03-22", status: "Pending", reason: "Hometown visit", days: 6 },
  { id: "8", employeeId: "9", employeeName: "Rohan Joshi", type: "Sick", startDate: "2025-02-24", endDate: "2025-02-25", status: "Approved", reason: "Flu", days: 2 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: "1", employeeId: "1", employeeName: "Arjun Mehta", date: "2025-02-27", checkIn: "09:02", checkOut: "18:15", status: "Present", department: "Engineering", workHours: "9h 13m" },
  { id: "2", employeeId: "2", employeeName: "Priya Sharma", date: "2025-02-27", checkIn: "09:30", checkOut: "18:00", status: "Present", department: "Design", workHours: "8h 30m" },
  { id: "3", employeeId: "3", employeeName: "Rahul Kumar", date: "2025-02-27", checkIn: "09:45", checkOut: "18:30", status: "Late", department: "Engineering", workHours: "8h 45m" },
  { id: "4", employeeId: "4", employeeName: "Sneha Patel", date: "2025-02-27", checkIn: "08:55", checkOut: "17:30", status: "Present", department: "HR", workHours: "8h 35m" },
  { id: "5", employeeId: "5", employeeName: "Vikram Singh", date: "2025-02-27", checkIn: "10:15", checkOut: "19:00", status: "Late", department: "Marketing", workHours: "8h 45m" },
  { id: "6", employeeId: "6", employeeName: "Ananya Reddy", date: "2025-02-27", checkIn: "--:--", checkOut: "--:--", status: "Absent", department: "Engineering", workHours: "0h 0m" },
  { id: "7", employeeId: "7", employeeName: "Karan Gupta", date: "2025-02-27", checkIn: "09:00", checkOut: "18:10", status: "Present", department: "Sales", workHours: "9h 10m" },
  { id: "8", employeeId: "8", employeeName: "Meera Nair", date: "2025-02-27", checkIn: "09:10", checkOut: "18:20", status: "Present", department: "Design", workHours: "9h 10m" },
  { id: "9", employeeId: "9", employeeName: "Rohan Joshi", date: "2025-02-27", checkIn: "08:45", checkOut: "17:45", status: "Present", department: "Engineering", workHours: "9h 0m" },
  { id: "10", employeeId: "11", employeeName: "Aditya Verma", date: "2025-02-27", checkIn: "09:05", checkOut: "13:00", status: "Half Day", department: "Engineering", workHours: "3h 55m" },
  { id: "11", employeeId: "12", employeeName: "Nisha Choudhary", date: "2025-02-27", checkIn: "09:00", checkOut: "18:00", status: "Present", department: "HR", workHours: "9h 0m" },
  { id: "12", employeeId: "13", employeeName: "Siddharth Rao", date: "2025-02-27", checkIn: "09:20", checkOut: "18:45", status: "Present", department: "Product", workHours: "9h 25m" },
  { id: "13", employeeId: "14", employeeName: "Pooja Bhat", date: "2025-02-27", checkIn: "09:30", checkOut: "18:30", status: "Late", department: "Marketing", workHours: "9h 0m" },
  { id: "14", employeeId: "15", employeeName: "Amit Desai", date: "2025-02-27", checkIn: "08:30", checkOut: "19:00", status: "Present", department: "Engineering", workHours: "10h 30m" },
];

export const documents: HRDocument[] = [
  { id: "1", title: "Employee Handbook 2025", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2025-01-05", fileSize: "2.4 MB", fileType: "PDF", status: "Active" },
  { id: "2", title: "Leave Policy", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2025-01-10", fileSize: "856 KB", fileType: "PDF", status: "Active" },
  { id: "3", title: "NDA Template", category: "Contract", uploadedBy: "Sneha Patel", uploadDate: "2024-11-20", fileSize: "128 KB", fileType: "DOCX", status: "Active" },
  { id: "4", title: "Offer Letter Template", category: "Contract", uploadedBy: "Nisha Choudhary", uploadDate: "2024-12-15", fileSize: "95 KB", fileType: "DOCX", status: "Active" },
  { id: "5", title: "Q4 2024 HR Report", category: "Report", uploadedBy: "Sneha Patel", uploadDate: "2025-01-20", fileSize: "1.8 MB", fileType: "PDF", status: "Active" },
  { id: "6", title: "Remote Work Policy", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2024-08-10", fileSize: "420 KB", fileType: "PDF", status: "Active" },
  { id: "7", title: "Performance Review Template", category: "Other", uploadedBy: "Sneha Patel", uploadDate: "2025-02-01", fileSize: "156 KB", fileType: "XLSX", status: "Active" },
  { id: "8", title: "Onboarding Checklist", category: "Other", uploadedBy: "Nisha Choudhary", uploadDate: "2025-01-25", fileSize: "78 KB", fileType: "PDF", status: "Active" },
  { id: "9", title: "Travel Reimbursement Policy", category: "Policy", uploadedBy: "Divya Iyer", uploadDate: "2024-09-15", fileSize: "310 KB", fileType: "PDF", status: "Archived" },
  { id: "10", title: "Code of Conduct", category: "Policy", uploadedBy: "Sneha Patel", uploadDate: "2024-06-01", fileSize: "540 KB", fileType: "PDF", status: "Active" },
];
