// 共通型定義
export interface User {
  userId: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
}

// API関連の型
export interface APIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    correlationId?: string;
  };
  correlationId?: string;
}

// ページネーション関連
export interface PaginationParams {
  limit?: number;
  nextToken?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  total?: number;
}

// 統計関連
export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

export interface StatsResponse {
  totalReports: number;
  categoriesStats: CategoryStats[];
  period: 'all' | 'month' | 'today';
  generatedAt: string;
}

// ログ関連
export interface LogContext {
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: string;
  route?: string;
  userSub?: string;
  correlationId: string;
  detail: Record<string, any>;
}

// 環境設定関連
export interface RuntimeConfig {
  apiUrl: string;
  apiBase: string;
  userPoolId: string;
  userPoolClientId: string;
  awsRegion: string;
}

// Lambda環境変数
export interface LambdaEnv {
  USER_POOL_ID: string;
  USER_POOL_CLIENT_ID: string;
  AUTH_DEV_ALLOW?: string;
  AI_PROVIDER: string;
  BEDROCK_REGION: string;
  BEDROCK_MODEL: string;
  TABLE_REPORTS: string;
  NODE_ENV: string;
}

// DynamoDB関連
export interface DynamoDBItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  [key: string]: any;
}

// JWT関連
export interface JWTPayload {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  'cognito:username'?: string;
}

// AI関連
export interface AIPromptContext {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

// フロントエンド状態管理関連
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// フォーム関連
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

// テスト関連
export interface TestContext {
  userId: string;
  correlationId: string;
  mockData?: Record<string, any>;
}

// 監査ログ関連
export interface AuditLog {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  resource: string;
  resourceId: string;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
  correlationId: string;
}
