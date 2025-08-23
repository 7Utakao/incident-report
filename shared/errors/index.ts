import { z } from 'zod';

// エラーコード定義
export const ErrorCodeSchema = z.enum([
  // 認証・認可エラー
  'AUTH_REQUIRED',
  'AUTH_INVALID_TOKEN',
  'AUTH_EXPIRED_TOKEN',
  'AUTH_INSUFFICIENT_PERMISSIONS',

  // バリデーションエラー
  'VALIDATION_REQUIRED_FIELD',
  'VALIDATION_INVALID_FORMAT',
  'VALIDATION_TOO_LONG',
  'VALIDATION_TOO_SHORT',
  'VALIDATION_INVALID_CATEGORY',

  // リソースエラー
  'RESOURCE_NOT_FOUND',
  'RESOURCE_ALREADY_EXISTS',
  'RESOURCE_CONFLICT',

  // システムエラー
  'SYSTEM_INTERNAL_ERROR',
  'SYSTEM_SERVICE_UNAVAILABLE',
  'SYSTEM_TIMEOUT',
  'SYSTEM_RATE_LIMIT_EXCEEDED',

  // AI関連エラー
  'AI_GENERATION_FAILED',
  'AI_INVALID_RESPONSE',
  'AI_SERVICE_UNAVAILABLE',

  // データベースエラー
  'DB_CONNECTION_ERROR',
  'DB_QUERY_ERROR',
  'DB_CONSTRAINT_VIOLATION',
]);

// エラーレスポンススキーマ
export const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
    correlationId: z.string().optional(),
  }),
});

// 成功レスポンススキーマ
export const SuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: z.any(),
  correlationId: z.string().optional(),
});

// エラーメッセージマッピング（日本語）
export const ERROR_MESSAGES: Record<z.infer<typeof ErrorCodeSchema>, string> = {
  // 認証・認可エラー
  AUTH_REQUIRED: 'ログインが必要です',
  AUTH_INVALID_TOKEN: '認証情報が無効です',
  AUTH_EXPIRED_TOKEN: '認証の有効期限が切れています',
  AUTH_INSUFFICIENT_PERMISSIONS: 'この操作を実行する権限がありません',

  // バリデーションエラー
  VALIDATION_REQUIRED_FIELD: '必須項目が入力されていません',
  VALIDATION_INVALID_FORMAT: '入力形式が正しくありません',
  VALIDATION_TOO_LONG: '入力文字数が上限を超えています',
  VALIDATION_TOO_SHORT: '入力文字数が不足しています',
  VALIDATION_INVALID_CATEGORY: '無効なカテゴリが選択されています',

  // リソースエラー
  RESOURCE_NOT_FOUND: '指定されたリソースが見つかりません',
  RESOURCE_ALREADY_EXISTS: '既に存在するリソースです',
  RESOURCE_CONFLICT: 'リソースの競合が発生しました',

  // システムエラー
  SYSTEM_INTERNAL_ERROR: 'システム内部エラーが発生しました',
  SYSTEM_SERVICE_UNAVAILABLE: 'サービスが一時的に利用できません',
  SYSTEM_TIMEOUT: '処理がタイムアウトしました',
  SYSTEM_RATE_LIMIT_EXCEEDED: 'リクエスト制限に達しました',

  // AI関連エラー
  AI_GENERATION_FAILED: 'AI処理に失敗しました',
  AI_INVALID_RESPONSE: 'AI応答の形式が無効です',
  AI_SERVICE_UNAVAILABLE: 'AI サービスが利用できません',

  // データベースエラー
  DB_CONNECTION_ERROR: 'データベース接続エラーが発生しました',
  DB_QUERY_ERROR: 'データベースクエリエラーが発生しました',
  DB_CONSTRAINT_VIOLATION: 'データベース制約違反が発生しました',
};

// エラークラス
export class AppError extends Error {
  constructor(
    public code: z.infer<typeof ErrorCodeSchema>,
    public details?: Record<string, any>,
    public correlationId?: string,
  ) {
    super(ERROR_MESSAGES[code]);
    this.name = 'AppError';
  }

  toResponse(): z.infer<typeof ErrorResponseSchema> {
    return {
      ok: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        correlationId: this.correlationId,
      },
    };
  }
}

// ヘルパー関数
export function createErrorResponse(
  code: z.infer<typeof ErrorCodeSchema>,
  details?: Record<string, any>,
  correlationId?: string,
): z.infer<typeof ErrorResponseSchema> {
  return {
    ok: false,
    error: {
      code,
      message: ERROR_MESSAGES[code],
      details,
      correlationId,
    },
  };
}

export function createSuccessResponse<T>(
  data: T,
  correlationId?: string,
): z.infer<typeof SuccessResponseSchema> {
  return {
    ok: true,
    data,
    correlationId,
  };
}

// 型エクスポート
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
