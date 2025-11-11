import {
  AuthResponse,
  Company,
  CompanyRegisterRequest,
  Distributor,
  DistributorRegisterRequest,
  LoginRequest,
  SiteVisit,
  SiteVisitRequest,
  Technician,
  TechnicianRegisterRequest
} from '@/src/types';
import apiClient from './client';

/**
 * 🔹 All API endpoints grouped by logical sections.
 */
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER_DISTRIBUTOR: '/api/Auth/register-distributor',
    REGISTER_COMPANY: '/api/Auth/register-company',
    REGISTER_TECHNICIAN: '/api/Auth/register-technician',
  },
  SITE_VISITS: {
    CREATE: '/api/SiteVisits/technician',
    GET_BY_TECHNICIAN: '/api/SiteVisits/technician',
    UPLOAD_PHOTOS: '/api/SiteVisits',
    GET_BY_COMPANY: '/api/SiteVisits/company',
    GET_ALL_ADMIN: '/api/SiteVisits/admin/all',
    GET_BY_ID: '/api/SiteVisits',
  },
  USER: {
    GET_DISTRIBUTORS: '/api/User/distributors',
    GET_COMPANIES: '/api/User/companies',
    GET_DISTRIBUTOR_COMPANIES: '/api/User/distributors',
    GET_TECHNICIANS: '/api/User/technicians',
    GET_COMPANY_TECHNICIANS: '/api/User/companies',
  },
};

/**
 * 🔹 Universal API service
 * Combines Auth + Site Visits + User Management functionality.
 */
export const apiService = {
  // ======================================================
  // 🔸 AUTH SECTION
  // ======================================================

  /**
   * Login for any user (email & password)
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new distributor
   */
  registerDistributor: async (
    data: DistributorRegisterRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER_DISTRIBUTOR,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new company
   */
  registerCompany: async (
    data: CompanyRegisterRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER_COMPANY,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a technician under a company
   */
  registerTechnician: async (
    companyId: number,
    data: TechnicianRegisterRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.AUTH.REGISTER_TECHNICIAN}/${companyId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ======================================================
  // 🔸 SITE VISITS SECTION
  // ======================================================

  /**
   * Create new site visit for a technician
   */
  createSiteVisit: async (
    technicianId: number,
    data: SiteVisitRequest
  ): Promise<SiteVisit> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.SITE_VISITS.CREATE}/${technicianId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all site visits created by a technician
   */
  getSiteVisitsByTechnician: async (
    technicianId: number
  ): Promise<SiteVisit[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SITE_VISITS.GET_BY_TECHNICIAN}/${technicianId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload one or more photos for a site visit
   */
  uploadSiteVisitPhotos: async (
    siteVisitId: number,
    photos: File[]
  ): Promise<any> => {
    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await apiClient.post(
        `${API_ENDPOINTS.SITE_VISITS.UPLOAD_PHOTOS}/${siteVisitId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all site visits linked to a company
   */
  getSiteVisitsByCompany: async (companyId: number): Promise<SiteVisit[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SITE_VISITS.GET_BY_COMPANY}/${companyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all site visits across all companies (admin access)
   */
  getAllSiteVisits: async (): Promise<SiteVisit[]> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.SITE_VISITS.GET_ALL_ADMIN
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get details of a specific site visit by ID
   */
  getSiteVisitById: async (
    id: number,
    companyId?: number
  ): Promise<SiteVisit> => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await apiClient.get(
        `${API_ENDPOINTS.SITE_VISITS.GET_BY_ID}/${id}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ======================================================
  // 🔸 USER MANAGEMENT SECTION
  // ======================================================

  /**
   * Fetch all registered distributors
   */
  getDistributors: async (): Promise<Distributor[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.GET_DISTRIBUTORS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch all registered companies
   */
  getCompanies: async (): Promise<Company[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.GET_COMPANIES);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch companies under a distributor
   */
  getDistributorCompanies: async (
    distributorId: number
  ): Promise<Company[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.GET_DISTRIBUTOR_COMPANIES}/${distributorId}/companies`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch all technicians
   */
  getTechnicians: async (): Promise<Technician[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.GET_TECHNICIANS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch technicians working under a specific company
   */
  getCompanyTechnicians: async (companyId: number): Promise<Technician[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.USER.GET_COMPANY_TECHNICIANS}/${companyId}/technicians`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};