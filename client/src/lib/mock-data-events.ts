export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  endDate: string;
  venue: string;
  city: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  totalAttendees: number;
  checkedIn: number;
  budget: number;
  organizer: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  capacity: number;
  type: string;
  pricePerDay: number;
  rating: number;
  amenities: string[];
  status: "available" | "booked" | "maintenance";
  image: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  eventId: string;
  ticketType: string;
  checkedIn: boolean;
  checkedInAt?: string;
  registeredDate: string;
}

export const events: Event[] = [
  { id: "EVT-001", name: "IBS Delhi Summit 2025", type: "Seminar", date: "2025-03-15", endDate: "2025-03-16", venue: "Taj Palace Convention Centre", city: "New Delhi", status: "upcoming", totalAttendees: 320, checkedIn: 0, budget: 2500000, organizer: "Sneha Patel" },
  { id: "EVT-002", name: "Investor Meet Q1", type: "Investor Meet", date: "2025-03-22", endDate: "2025-03-22", venue: "Oberoi Business Hub", city: "Mumbai", status: "upcoming", totalAttendees: 85, checkedIn: 0, budget: 800000, organizer: "Vikram Singh" },
  { id: "EVT-003", name: "Startup Funding Workshop", type: "Workshop", date: "2025-02-20", endDate: "2025-02-21", venue: "ITC Grand Chola", city: "Chennai", status: "completed", totalAttendees: 150, checkedIn: 142, budget: 1200000, organizer: "Arjun Mehta" },
  { id: "EVT-004", name: "Tech Founders Conference", type: "Conference", date: "2025-04-05", endDate: "2025-04-07", venue: "Hyatt Regency", city: "Bengaluru", status: "upcoming", totalAttendees: 500, checkedIn: 0, budget: 4500000, organizer: "Sneha Patel" },
  { id: "EVT-005", name: "IBS Mumbai Roundtable", type: "Seminar", date: "2025-02-10", endDate: "2025-02-10", venue: "The Lalit", city: "Mumbai", status: "completed", totalAttendees: 60, checkedIn: 58, budget: 450000, organizer: "Vikram Singh" },
  { id: "EVT-006", name: "Product Launch Gala", type: "Launch Event", date: "2025-03-28", endDate: "2025-03-28", venue: "Leela Palace", city: "New Delhi", status: "upcoming", totalAttendees: 200, checkedIn: 0, budget: 3000000, organizer: "Priya Sharma" },
  { id: "EVT-007", name: "Annual Leadership Summit", type: "Conference", date: "2025-01-15", endDate: "2025-01-17", venue: "JW Marriott", city: "Pune", status: "completed", totalAttendees: 280, checkedIn: 265, budget: 3200000, organizer: "Arjun Mehta" },
  { id: "EVT-008", name: "HR Innovation Forum", type: "Workshop", date: "2025-04-12", endDate: "2025-04-12", venue: "Radisson Blu", city: "Gurugram", status: "upcoming", totalAttendees: 120, checkedIn: 0, budget: 600000, organizer: "Sneha Patel" },
];

export const venues: Venue[] = [
  { id: "VN-001", name: "Taj Palace Convention Centre", city: "New Delhi", capacity: 500, type: "Convention Centre", pricePerDay: 350000, rating: 4.8, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking", "VIP Lounge"], status: "booked", image: "" },
  { id: "VN-002", name: "Oberoi Business Hub", city: "Mumbai", capacity: 120, type: "Business Centre", pricePerDay: 150000, rating: 4.6, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking"], status: "available", image: "" },
  { id: "VN-003", name: "ITC Grand Chola", city: "Chennai", capacity: 300, type: "Hotel Ballroom", pricePerDay: 280000, rating: 4.7, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking", "Accommodation"], status: "available", image: "" },
  { id: "VN-004", name: "Hyatt Regency", city: "Bengaluru", capacity: 600, type: "Convention Centre", pricePerDay: 400000, rating: 4.5, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking", "VIP Lounge", "Accommodation"], status: "booked", image: "" },
  { id: "VN-005", name: "The Lalit", city: "Mumbai", capacity: 80, type: "Boutique Hotel", pricePerDay: 120000, rating: 4.3, amenities: ["AV Equipment", "Wi-Fi", "Catering"], status: "available", image: "" },
  { id: "VN-006", name: "Leela Palace", city: "New Delhi", capacity: 250, type: "Hotel Ballroom", pricePerDay: 320000, rating: 4.9, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking", "VIP Lounge"], status: "available", image: "" },
  { id: "VN-007", name: "JW Marriott", city: "Pune", capacity: 350, type: "Convention Centre", pricePerDay: 300000, rating: 4.6, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking", "Accommodation"], status: "maintenance", image: "" },
  { id: "VN-008", name: "Radisson Blu", city: "Gurugram", capacity: 150, type: "Hotel Ballroom", pricePerDay: 180000, rating: 4.4, amenities: ["AV Equipment", "Wi-Fi", "Catering", "Parking"], status: "available", image: "" },
];

export const attendees: Attendee[] = [
  { id: "ATT-001", name: "Amit Sharma", email: "amit@techcorp.in", phone: "+91 98111 11111", company: "TechCorp India", eventId: "EVT-003", ticketType: "VIP", checkedIn: true, checkedInAt: "2025-02-20 09:15", registeredDate: "2025-02-01" },
  { id: "ATT-002", name: "Priya Verma", email: "priya@startupx.com", phone: "+91 98222 22222", company: "StartupX", eventId: "EVT-003", ticketType: "Standard", checkedIn: true, checkedInAt: "2025-02-20 09:30", registeredDate: "2025-02-05" },
  { id: "ATT-003", name: "Rahul Nair", email: "rahul@investco.in", phone: "+91 98333 33333", company: "InvestCo", eventId: "EVT-001", ticketType: "VIP", checkedIn: false, registeredDate: "2025-02-18" },
  { id: "ATT-004", name: "Sneha Gupta", email: "sneha@finserv.com", phone: "+91 98444 44444", company: "FinServ Global", eventId: "EVT-001", ticketType: "Standard", checkedIn: false, registeredDate: "2025-02-20" },
  { id: "ATT-005", name: "Vikash Reddy", email: "vikash@cloudworks.io", phone: "+91 98555 55555", company: "CloudWorks", eventId: "EVT-001", ticketType: "VIP", checkedIn: false, registeredDate: "2025-02-15" },
  { id: "ATT-006", name: "Ananya Iyer", email: "ananya@nexgen.in", phone: "+91 98666 66666", company: "NexGen Solutions", eventId: "EVT-004", ticketType: "Standard", checkedIn: false, registeredDate: "2025-02-22" },
  { id: "ATT-007", name: "Deepak Kumar", email: "deepak@blueocean.com", phone: "+91 98777 77777", company: "BlueOcean Ventures", eventId: "EVT-002", ticketType: "VIP", checkedIn: false, registeredDate: "2025-02-25" },
  { id: "ATT-008", name: "Meera Patel", email: "meera@growthlab.in", phone: "+91 98888 88888", company: "GrowthLab", eventId: "EVT-001", ticketType: "Standard", checkedIn: false, registeredDate: "2025-02-12" },
  { id: "ATT-009", name: "Karthik Menon", email: "karthik@alphatech.io", phone: "+91 98999 99999", company: "AlphaTech", eventId: "EVT-003", ticketType: "VIP", checkedIn: true, checkedInAt: "2025-02-20 10:00", registeredDate: "2025-01-28" },
  { id: "ATT-010", name: "Sanjana Das", email: "sanjana@innovate.co", phone: "+91 97111 11111", company: "Innovate Co", eventId: "EVT-004", ticketType: "Standard", checkedIn: false, registeredDate: "2025-02-24" },
];
