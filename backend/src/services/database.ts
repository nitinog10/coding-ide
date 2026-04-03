import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLE_NAME } from '../config/dynamodb';
import { User, Project, UserStats, ExecutionOutput } from '../types';
import { v4 as uuidv4 } from 'uuid';

// User operations
export async function createUser(username: string, email: string, passwordHash: string): Promise<User> {
  const user: User = {
    id: uuidv4(),
    username,
    email,
    passwordHash,
    createdAt: Date.now()
  };

  await dynamoDb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${user.id}`,
      SK: 'PROFILE',
      GSI1PK: `USERNAME#${username}`,
      GSI1SK: 'PROFILE',
      entityType: 'user',
      ...user
    }
  }));

  return user;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await dynamoDb.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `USERNAME#${username}`,
      ':sk': 'PROFILE'
    }
  }));

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return result.Items[0] as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await dynamoDb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE'
    }
  }));

  return result.Item as User || null;
}

// Project operations
export async function createProject(userId: string, name: string, code: string, language: string): Promise<Project> {
  const project: Project = {
    id: uuidv4(),
    userId,
    name,
    code,
    language: language as any,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await dynamoDb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `PROJECT#${project.id}`,
      GSI1PK: `PROJECT#${project.id}`,
      GSI1SK: 'METADATA',
      entityType: 'project',
      ...project
    }
  }));

  return project;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const result = await dynamoDb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'PROJECT#'
    },
    ScanIndexForward: false
  }));

  return (result.Items || []) as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const result = await dynamoDb.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'METADATA'
    }
  }));

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return result.Items[0] as Project;
}

export async function updateProject(projectId: string, userId: string, updates: Partial<Project>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  if (updates.name) {
    updateExpressions.push('#name = :name');
    expressionAttributeValues[':name'] = updates.name;
    expressionAttributeNames['#name'] = 'name';
  }

  if (updates.code !== undefined) {
    updateExpressions.push('code = :code');
    expressionAttributeValues[':code'] = updates.code;
  }

  if (updates.language) {
    updateExpressions.push('#language = :language');
    expressionAttributeValues[':language'] = updates.language;
    expressionAttributeNames['#language'] = 'language';
  }

  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = Date.now();

  await dynamoDb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `PROJECT#${projectId}`
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined
  }));
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  await dynamoDb.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `PROJECT#${projectId}`
    }
  }));
}

// User stats operations
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const result = await dynamoDb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'STATS'
    }
  }));

  return result.Item as UserStats || null;
}

export async function initializeUserStats(userId: string): Promise<UserStats> {
  const stats: UserStats = {
    userId,
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
  };

  await dynamoDb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: 'STATS',
      GSI2PK: 'LEADERBOARD',
      GSI2SK: `XP#${String(0).padStart(10, '0')}`,
      entityType: 'stats',
      ...stats
    }
  }));

  return stats;
}

export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  if (updates.xp !== undefined) {
    updateExpressions.push('xp = :xp');
    expressionAttributeValues[':xp'] = updates.xp;
    updateExpressions.push('GSI2SK = :gsi2sk');
    expressionAttributeValues[':gsi2sk'] = `XP#${String(updates.xp).padStart(10, '0')}`;
  }

  if (updates.level !== undefined) {
    updateExpressions.push('#level = :level');
    expressionAttributeValues[':level'] = updates.level;
    expressionAttributeNames['#level'] = 'level';
  }

  if (updates.achievements) {
    updateExpressions.push('achievements = :achievements');
    expressionAttributeValues[':achievements'] = updates.achievements;
  }

  if (updates.totalExecutions !== undefined) {
    updateExpressions.push('totalExecutions = :totalExecutions');
    expressionAttributeValues[':totalExecutions'] = updates.totalExecutions;
  }

  if (updates.successfulExecutions !== undefined) {
    updateExpressions.push('successfulExecutions = :successfulExecutions');
    expressionAttributeValues[':successfulExecutions'] = updates.successfulExecutions;
  }

  if (updates.executionsByLanguage) {
    updateExpressions.push('executionsByLanguage = :executionsByLanguage');
    expressionAttributeValues[':executionsByLanguage'] = updates.executionsByLanguage;
  }

  await dynamoDb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'STATS'
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined
  }));
}

// Execution history
export async function logExecution(
  userId: string,
  code: string,
  language: string,
  output: ExecutionOutput
): Promise<void> {
  await dynamoDb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `EXECUTION#${Date.now()}`,
      entityType: 'execution',
      code,
      language,
      output,
      createdAt: Date.now()
    }
  }));
}
