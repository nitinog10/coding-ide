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


## Algorithmic Pseudocode

### Main Code Execution Algorithm

```typescript
async function executeCodeInDocker(
  code: string,
  language: SupportedLanguage,
  stdin: string = '',
  timeout: number = 5000
): Promise<ExecutionOutput> {
  // Step 1: Validate and sanitize code
  const validation = validateAndSanitizeCode(code, language);
  
  if (!validation.valid) {
    return {
      stdout: '',
      stderr: `Validation errors:\n${validation.errors.join('\n')}`,
      exitCode: 1,
      executionTime: 0,
      memoryUsed: 0,
      timestamp: Date.now()
    };
  }
  
  // Step 2: Create Docker container with resource limits
  const { containerId, cleanup } = await createDockerContainer(
    language,
    validation.sanitized,
    stdin
  );
  
  try {
    // Step 3: Start container and capture output
    const startTime = Date.now();
    
    const execPromise = docker.containers.get(containerId).start().then(() => {
      return docker.containers.get(containerId).wait();
    });
    
    // Step 4: Apply timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), timeout);
    });
    
    const result = await Promise.race([execPromise, timeoutPromise]);
    
    // Step 5: Collect output and metrics
    const logs = await docker.containers.get(containerId).logs({
      stdout: true,
      stderr: true
    });
    
    const stats = await docker.containers.get(containerId).stats({ stream: false });
    
    const executionTime = Date.now() - startTime;
    
    return {
      stdout: logs.stdout,
      stderr: logs.stderr,
      exitCode: result.StatusCode,
      executionTime,
      memoryUsed: stats.memory_stats.usage,
      timestamp: Date.now()
    };
    
  } catch (error) {
    // Handle timeout or execution error
    return {
      stdout: '',
      stderr: error.message,
      exitCode: 124, // Timeout exit code
      executionTime: timeout,
      memoryUsed: 0,
      timestamp: Date.now()
    };
    
  } finally {
    // Step 6: Always cleanup container
    await cleanup();
  }
}
```

**Preconditions:**
- Docker daemon is running and accessible
- Language-specific images are built and available
- Code is provided as string
- Timeout is reasonable (1000-30000ms)

**Postconditions:**
- Container is always cleaned up (via finally block)
- Execution time never exceeds timeout + cleanup overhead
- Output is captured completely or timeout error is returned
- No containers are left running after function completes

**Loop Invariants:** N/A (async operations, no explicit loops)

### AI Request Processing Algorithm

```typescript
async function processAIRequest(
  request: AIServiceRequest
): Promise<AIServiceResponse> {
  // Step 1: Fetch conversation history from DynamoDB
  const history = await fetchConversationHistory(
    request.workspaceId,
    limit = 10
  );
  
  // Step 2: Build context-aware prompt
  const systemPrompt = buildSystemPrompt(request.action);
  const userPrompt = buildUserPrompt(
    request.query,
    request.codeContext,
    history
  );
  
  // Step 3: Call Claude API
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userPrompt }
      ]
    });
    
    // Step 4: Parse response and extract suggestions
    const aiResponse = response.content[0].text;
    const suggestions = extractCodeSuggestions(aiResponse, request.action);
    
    // Step 5: Store conversation in DynamoDB
    await storeAIMessage({
      workspaceId: request.workspaceId,
      role: 'user',
      content: request.query,
      codeContext: request.codeContext,
      timestamp: Date.now()
    });
    
    await storeAIMessage({
      workspaceId: request.workspaceId,
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now()
    });
    
    // Step 6: Return structured response
    return {
      success: true,
      response: aiResponse,
      suggestions
    };
    
  } catch (error) {
    return {
      success: false,
      response: '',
      error: `AI service error: ${error.message}`
    };
  }
}
```

**Preconditions:**
- User is authenticated and authorized
- Workspace exists in database
- Claude API key is configured
- Request contains valid action type

**Postconditions:**
- Conversation history is persisted to database
- AI response is contextually relevant to code
- Suggestions are extracted and structured
- Error handling returns descriptive messages

**Loop Invariants:**
- For history mapping loop: All messages maintain role and content integrity

### DynamoDB Access Pattern Algorithm

```typescript
// Access Pattern 1: Get all workspaces for a user
async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const params = {
    TableName: 'CodingIDETable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'WORKSPACE#'
    }
  };
  
  const result = await dynamodb.query(params);
  return result.Items.map(item => mapItemToWorkspace(item));
}

// Access Pattern 2: Get workspace by ID (using GSI1)
async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const params = {
    TableName: 'CodingIDETable',
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `WORKSPACE#${workspaceId}`,
      ':sk': 'METADATA'
    }
  };
  
  const result = await dynamodb.query(params);
  return result.Items.length > 0 ? mapItemToWorkspace(result.Items[0]) : null;
}

// Access Pattern 3: Get execution history for workspace
async function getExecutionHistory(
  workspaceId: string,
  limit: number = 20
): Promise<ExecutionLogItem[]> {
  const params = {
    TableName: 'CodingIDETable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `WORKSPACE#${workspaceId}`,
      ':sk': 'EXECUTION#'
    },
    ScanIndexForward: false, // Most recent first
    Limit: limit
  };
  
  const result = await dynamodb.query(params);
  return result.Items;
}

// Access Pattern 4: Get leaderboard (using GSI2)
async function getLeaderboard(limit: number = 100): Promise<UserProfile[]> {
  const params = {
    TableName: 'CodingIDETable',
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :pk',
    ExpressionAttributeValues: {
      ':pk': 'LEADERBOARD'
    },
    ScanIndexForward: false, // Highest XP first
    Limit: limit
  };
  
  const result = await dynamodb.query(params);
  return result.Items.map(item => mapItemToUserProfile(item));
}

// Access Pattern 5: Get AI conversation history
async function fetchConversationHistory(
  workspaceId: string,
  limit: number = 10
): Promise<AIMessage[]> {
  const params = {
    TableName: 'CodingIDETable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `WORKSPACE#${workspaceId}`,
      ':sk': 'AI#'
    },
    ScanIndexForward: false, // Most recent first
    Limit: limit
  };
  
  const result = await dynamodb.query(params);
  return result.Items.reverse(); // Oldest first for conversation context
}
```

**Preconditions:**
- DynamoDB table exists with correct schema
- GSI1 and GSI2 are created and active
- Input IDs are valid UUIDs or strings
- Limit parameters are positive integers

**Postconditions:**
- Queries use key conditions (no scans)
- Results are sorted appropriately
- Empty arrays returned when no items found
- All queries complete in O(log n) time

**Loop Invariants:**
- For mapping loops: All items are transformed consistently
