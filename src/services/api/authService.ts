import apiClient from './client';
import {
  DistributorRegisterRequest,
  CompanyRegisterRequest,
  TechnicianRegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
} from '@/types';

const AUTH_ENDPOINTS = {
  REGISTER_DISTRIBUTOR: '/api/Auth/register-distributor',
  REGISTER_COMPANY: '/api/Auth/register-company',
  REGISTER_TECHNICIAN: '/api/Auth/register-technician',
  LOGIN: '/api/Auth/login',
};

export const authService = {
  /**
   * Register a new distributor
   */
  registerDistributor: async (
    data: DistributorRegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post(
        AUTH_ENDPOINTS.REGISTER_DISTRIBUTOR,
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
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post(
        AUTH_ENDPOINTS.REGISTER_COMPANY,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new technician under a company
   */
  registerTechnician: async (
    companyId: string,
    data: TechnicianRegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post(
        `${AUTH_ENDPOINTS.REGISTER_TECHNICIAN}/${companyId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

