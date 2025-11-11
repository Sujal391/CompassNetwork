// User Roles
export type UserRole = 'Admin' | 'Distributor' | 'Company' | 'Technician';

// Auth Response
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  userType: UserRole;
  userData: User;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  referCode?: string;
}

// Distributor Registration
export interface DistributorRegisterRequest {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

// Company Registration
export interface CompanyRegisterRequest {
  companyName: string;
  companyEmail: string;
  gstNumber: string;
  mobileNumber: string;
  companyAddress: string;
  password: string;
  confirmPassword: string;
  referCode: string;
}

// Technician Registration
export interface TechnicianRegisterRequest {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Distributor Data (for admin dashboard)
export interface Distributor {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  referCode?: string;
  createdAt?: string;
}

// Company Data (for admin dashboard)
export interface Company {
  id: number;
  name: string;
  email: string;
  gstNumber: string;
  mobileNumber: string;
  address: string;
  referCode?: string;
  createdAt?: string;
}

// Technician Data (for admin dashboard)
export interface Technician {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  referCode?: string;
  createdAt?: string;
}

export interface CableConnection {
  coreNumber: number;
  fromColor: string;
  toColor: string;
  reason: string;
}

export interface Photo {
  photoUrl: string;
  photoName: string;
  uploadedAt: string;
}

export interface SiteVisitPhase1Request {
  latitude: number;
  longitude: number;
  houseNo: string;
  area: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  cableConnections: CableConnection[];
}

export interface SiteVisit {
  id: number;
  siteName: string;
  siteAddress: string;
  visitDate: string;
  visitTime: string;
  visitReason: string;
  visitStatus: string;
  visitRemarks: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  houseNo?: string;
  area?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  cableConnections?: CableConnection[];
  photos?: Photo[];
}

export interface SiteVisitRequest {
  siteName: string;
  siteAddress: string;
  visitDate: string;
  visitTime: string;
  visitReason: string;
  visitStatus: string;
  visitRemarks: string;
}