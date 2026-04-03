export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface ExecutionOutput {
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

export interface CodeContext {
  language: SupportedLanguage;
  code: string;
  lineNumber?: number;
  error?: string;
}

export interface CodeSuggestion {
  type: 'fix' | 'optimization' | 'alternative';
  description: string;
  code: string;
  lineRange?: { start: number; end: number };
}

export interface ExecuteCodeRequest {
  workspaceId?: string;
  code: string;
  language: SupportedLanguage;
  stdin?: string;
  timeout?: number;
}

export interface AIServiceRequest {
  workspaceId?: string;
  userId: string;
  query: string;
  codeContext: CodeContext;
  action: AIAction;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    username: string;
  };
  body: any;
  params: any;
  query: any;
}
