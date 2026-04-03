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


## Key Functions with Formal Specifications

### Function 1: executeCodeInDocker()

```typescript
async function executeCodeInDocker(
  code: string,
  language: SupportedLanguage,
  stdin: string = '',
  timeout: number = 5000
): Promise<ExecutionOutput>
```

**Preconditions:**
- `code` is non-empty string
- `language` is one of: 'cpp', 'python', 'java', 'javascript'
- `timeout` is positive integer between 1000 and 30000 milliseconds
- Docker daemon is running and accessible

**Postconditions:**
- Returns valid ExecutionOutput object
- `executionTime` is less than or equal to `timeout`
- If execution exceeds timeout: `stderr` contains timeout message and `exitCode` is non-zero
- Container is destroyed after execution completes
- No side effects on host system

**Loop Invariants:** N/A (no loops in main function body)

### Function 2: processAIRequest()

```typescript
async function processAIRequest(
  request: AIServiceRequest
): Promise<AIServiceResponse>
```

**Preconditions:**
- `request.userId` is valid and authenticated
- `request.workspaceId` exists in database
- `request.query` is non-empty string
- `request.action` is valid AIAction type
- AI service (Claude API) is accessible

**Postconditions:**
- Returns AIServiceResponse with `success` boolean
- If `success === true`: `response` contains non-empty AI-generated text
- If `success === false`: `error` contains descriptive error message
- Conversation history is stored in DynamoDB
- AI response is contextually relevant to code and query

**Loop Invariants:** N/A

### Function 3: calculateXPReward()

```typescript
function calculateXPReward(
  action: UserAction,
  codeComplexity: number,
  executionSuccess: boolean
): number
```

**Preconditions:**
- `action` is valid UserAction type ('execute', 'debug', 'optimize', 'challenge_complete')
- `codeComplexity` is non-negative integer (lines of code or cyclomatic complexity)
- `executionSuccess` is boolean

**Postconditions:**
- Returns non-negative integer XP value
- XP is proportional to code complexity
- Successful execution yields higher XP than failed execution
- XP value is between 0 and 1000 for single action
- Formula: baseXP * complexityMultiplier * successMultiplier

**Loop Invariants:** N/A

### Function 4: validateAndSanitizeCode()

```typescript
function validateAndSanitizeCode(
  code: string,
  language: SupportedLanguage
): { valid: boolean; sanitized: string; errors: string[] }
```

**Preconditions:**
- `code` is string (may be empty)
- `language` is valid SupportedLanguage

**Postconditions:**
- Returns object with `valid` boolean, `sanitized` string, and `errors` array
- `sanitized` code has dangerous patterns removed (file I/O, network calls, system commands)
- If `valid === false`: `errors` array contains at least one error message
- If `valid === true`: `sanitized` code is safe to execute in Docker container
- Original `code` parameter is not mutated

**Loop Invariants:**
- For validation loop: All previously checked lines remain valid or invalid consistently

### Function 5: createDockerContainer()

```typescript
async function createDockerContainer(
  language: SupportedLanguage,
  code: string,
  stdin: string
): Promise<{ containerId: string; cleanup: () => Promise<void> }>
```

**Preconditions:**
- Docker daemon is running
- Language-specific Docker image exists (e.g., `code-executor-python:latest`)
- `code` is sanitized and validated
- System has available resources (CPU, memory, disk)

**Postconditions:**
- Returns object with `containerId` and `cleanup` function
- Container is created but not started
- Container has resource limits: 256MB memory, 1 CPU core, 10MB disk
- Container has no network access
- Container has read-only filesystem except /tmp
- `cleanup` function removes container when called

**Loop Invariants:** N/A

### Function 6: storeWorkspace()

```typescript
async function storeWorkspace(
  workspace: Workspace
): Promise<{ success: boolean; error?: string }>
```

**Preconditions:**
- `workspace.userId` is valid UUID
- `workspace.id` is valid UUID
- `workspace.language` is valid SupportedLanguage
- DynamoDB table exists and is accessible

**Postconditions:**
- Returns object with `success` boolean
- If `success === true`: workspace is stored in DynamoDB with correct partition and sort keys
- If `success === false`: `error` contains descriptive message
- Workspace is queryable by userId (PK) and workspaceId (SK)
- Workspace is queryable by workspaceId via GSI1
- `updatedAt` timestamp is set to current time

**Loop Invariants:** N/A
