# Design Document: AI-Powered Coding IDE

## Overview

A next-generation AI-powered coding IDE that provides a structured, guided coding environment with integrated AI assistance, multi-language execution in Docker containers, and gamification elements. Unlike traditional IDEs, this system organizes coding into structured sections (Problem, Approach, Code, Output, Optimization) and provides real-time AI guidance for explanation, debugging, optimization, and language conversion.

## Main Architecture Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant AI as AI Service
    participant Exec as Execution Service
    participant DB as DynamoDB
    participant Docker as Docker Engine
    
    User->>Frontend: Write code
    Frontend->>Gateway: Submit code execution
    Gateway->>Auth: Validate token
    Auth-->>Gateway: Token valid
    Gateway->>Exec: Execute code request
    Exec->>Docker: Create container
    Docker->>Docker: Run code in sandbox
    Docker-->>Exec: Execution result
    Exec->>DB: Store execution log
    Exec-->>Gateway: Return output
    Gateway-->>Frontend: Display result
    
    User->>Frontend: Ask AI for help
    Frontend->>Gateway: AI request
    Gateway->>AI: Process query
    AI->>DB: Fetch code context
    AI->>AI: Generate response
    AI-->>Gateway: AI response
    Gateway-->>Frontend: Display AI response


## Core Interfaces/Types

### Frontend Types

```typescript
// Core workspace structure
interface Workspace {
  id: string;
  userId: string;
  title: string;
  problem: string;
  approach: string;
  code: string;
  language: SupportedLanguage;
  output: ExecutionOutput | null;
  optimization: string;
  createdAt: number;
  updatedAt: number;
}

type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

interface ExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
  timestamp: number;
}

// AI interaction types
interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeContext?: CodeContext;
}

interface CodeContext {
  language: SupportedLanguage;
  code: string;
  lineNumber?: number;
  error?: string;
}

interface AIRequest {
  workspaceId: string;
  query: string;
  context: CodeContext;
  action: AIAction;
}

type AIAction = 'explain' | 'debug' | 'optimize' | 'convert' | 'chat';

// Gamification types
interface UserProfile {
  userId: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  skillLevels: Record<SupportedLanguage, number>;
  achievements: Achievement[];
  createdAt: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlockedAt: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  testCases: TestCase[];
  language: SupportedLanguage;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}
```

### Backend API Types

```typescript
// API Request/Response types
interface ExecuteCodeRequest {
  workspaceId: string;
  code: string;
  language: SupportedLanguage;
  stdin?: string;
  timeout?: number; // milliseconds, default 5000
}

interface ExecuteCodeResponse {
  success: boolean;
  output: ExecutionOutput;
  error?: string;
}

interface AIServiceRequest {
  workspaceId: string;
  userId: string;
  query: string;
  codeContext: CodeContext;
  action: AIAction;
  conversationHistory?: AIMessage[];
}

interface AIServiceResponse {
  success: boolean;
  response: string;
  suggestions?: CodeSuggestion[];
  error?: string;
}

interface CodeSuggestion {
  type: 'fix' | 'optimization' | 'alternative';
  description: string;
  code: string;
  lineRange?: { start: number; end: number };
}

// DynamoDB Item types
interface WorkspaceItem {
  PK: string; // USER#${userId}
  SK: string; // WORKSPACE#${workspaceId}
  GSI1PK: string; // WORKSPACE#${workspaceId}
  GSI1SK: string; // METADATA
  entityType: 'workspace';
  title: string;
  problem: string;
  approach: string;
  code: string;
  language: SupportedLanguage;
  output: ExecutionOutput | null;
  optimization: string;
  createdAt: number;
  updatedAt: number;
}

interface UserItem {
  PK: string; // USER#${userId}
  SK: string; // PROFILE
  GSI2PK: string; // LEADERBOARD
  GSI2SK: string; // XP#${xp}
  entityType: 'user';
  username: string;
  email: string;
  xp: number;
  level: number;
  skillLevels: Record<SupportedLanguage, number>;
  achievements: Achievement[];
  createdAt: number;
}

interface ExecutionLogItem {
  PK: string; // WORKSPACE#${workspaceId}
  SK: string; // EXECUTION#${timestamp}
  entityType: 'execution';
  code: string;
  language: SupportedLanguage;
  output: ExecutionOutput;
  createdAt: number;
}

interface AIConversationItem {
  PK: string; // WORKSPACE#${workspaceId}
  SK: string; // AI#${timestamp}
  entityType: 'ai_message';
  role: 'user' | 'assistant';
  content: string;
  codeContext?: CodeContext;
  createdAt: number;
}
```
