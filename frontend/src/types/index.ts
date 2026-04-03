export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
  timestamp: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  code: string;
  language: SupportedLanguage;
  createdAt: number;
  updatedAt: number;
}

export interface UserStats {
  userId: string;
  xp: number;
  level: number;
  achievements: Achievement[];
  totalExecutions: number;
  successfulExecutions: number;
  executionsByLanguage: Record<SupportedLanguage, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlockedAt: number;
}

export type AIAction = 'explain' | 'debug' | 'optimize' | 'convert' | 'chat';

export interface AIResponse {
  success: boolean;
  response: string;
  suggestions?: CodeSuggestion[];
  error?: string;
}

export interface CodeSuggestion {
  type: 'fix' | 'optimization' | 'alternative';
  description: string;
  code: string;
  lineRange?: { start: number; end: number };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
