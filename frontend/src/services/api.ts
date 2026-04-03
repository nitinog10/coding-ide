import axios from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ExecutionResult, 
  Project, 
  UserStats,
  AIResponse,
  SupportedLanguage,
  AIAction
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string; user: any }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
};

// Code execution API
export const codeAPI = {
  execute: async (code: string, language: SupportedLanguage, stdin?: string): Promise<{ success: boolean; output: ExecutionResult }> => {
    const response = await api.post('/code/execute', { code, language, stdin });
    return response.data;
  }
};

// AI assistance API
export const aiAPI = {
  assist: async (
    query: string,
    codeContext: { language: SupportedLanguage; code: string; error?: string },
    action: AIAction
  ): Promise<AIResponse> => {
    const response = await api.post('/ai/assist', { query, codeContext, action });
    return response.data;
  }
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<{ projects: Project[] }> => {
    const response = await api.get('/projects');
    return response.data;
  },

  create: async (name: string, code: string, language: SupportedLanguage): Promise<{ project: Project }> => {
    const response = await api.post('/projects', { name, code, language });
    return response.data;
  },

  update: async (id: string, updates: Partial<Project>): Promise<void> => {
    await api.put(`/projects/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};

// User API
export const userAPI = {
  getStats: async (): Promise<{ stats: UserStats }> => {
    const response = await api.get('/user/stats');
    return response.data;
  }
};

export default api;
