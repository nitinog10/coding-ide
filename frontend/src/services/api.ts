import axios from 'axios';
import type { 
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

// Code execution API
export const codeAPI = {
  execute: async (code: string, language: SupportedLanguage, stdin?: string): Promise<{ success: boolean; output: ExecutionResult }> => {
    try {
      const response = await api.post('/code/execute', { code, language, stdin });
      return response.data;
    } catch (error: any) {
      console.error('Code execution error:', error);
      throw error;
    }
  }
};

// AI assistance API
export const aiAPI = {
  assist: async (
    query: string,
    codeContext: { language: SupportedLanguage; code: string; error?: string },
    action: AIAction
  ): Promise<AIResponse> => {
    try {
      const response = await api.post('/ai/assist', { query, codeContext, action });
      return response.data;
    } catch (error: any) {
      console.error('AI assist error:', error);
      throw error;
    }
  }
};

// Projects API (disabled without auth)
export const projectsAPI = {
  getAll: async (): Promise<{ projects: Project[] }> => {
    return { projects: [] };
  },

  create: async (name: string, code: string, language: SupportedLanguage): Promise<{ project: Project }> => {
    throw new Error('Projects require authentication');
  },

  update: async (id: string, updates: Partial<Project>): Promise<void> => {
    throw new Error('Projects require authentication');
  },

  delete: async (id: string): Promise<void> => {
    throw new Error('Projects require authentication');
  }
};

// User API (disabled without auth)
export const userAPI = {
  getStats: async (): Promise<{ stats: UserStats }> => {
    return {
      stats: {
        userId: 'demo',
        xp: 0,
        level: 1,
        achievements: [],
        totalExecutions: 0,
        successfulExecutions: 0,
        executionsByLanguage: {
          cpp: 0,
          python: 0,
          java: 0,
          javascript: 0
        }
      }
    };
  }
};

export default api;
