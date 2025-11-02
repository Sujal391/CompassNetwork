// User Roles
export type UserRole = 'Distributor' | 'Company' | 'Technician';

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

