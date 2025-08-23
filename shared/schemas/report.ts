import { z } from 'zod';

// カテゴリ定義（基本方針に合わせてWHY_プレフィックス付き）
export const CategorySchema = z.enum([
  'WHY_TECHNICAL_KNOWLEDGE',
  'WHY_ENVIRONMENT_SETUP',
  'WHY_COMMUNICATION',
  'WHY_SCHEDULE_MANAGEMENT',
  'WHY_REQUIREMENT_UNDERSTANDING',
  'WHY_OTHER',
]);

// レポートの基本スキーマ
export const ReportSchema = z.object({
  reportId: z.string(),
  userId: z.string(),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(120, 'タイトルは120文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(4000, '本文は4000文字以内で入力してください'),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: CategorySchema,
  createdAt: z.string(), // ISO 8601形式
  updatedAt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  pointsAwarded: z.number().min(0).default(10),
  riskFlags: z.array(z.string()).default([]),
});

// レポート作成用スキーマ
export const CreateReportSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(120, 'タイトルは120文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(4000, '本文は4000文字以内で入力してください'),
  category: CategorySchema.optional(),
});

// レポート更新用スキーマ
export const UpdateReportSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(120, 'タイトルは120文字以内で入力してください')
    .optional(),
  body: z
    .string()
    .min(1, '本文は必須です')
    .max(4000, '本文は4000文字以内で入力してください')
    .optional(),
  category: CategorySchema.optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

// フィルタリング用スキーマ
export const ReportFiltersSchema = z.object({
  q: z.string().optional(),
  category: CategorySchema.optional(),
  from: z.string().optional(), // ISO 8601形式
  to: z.string().optional(), // ISO 8601形式
  limit: z.number().min(1).max(100).default(20),
  nextToken: z.string().optional(), // DynamoDB pagination用
});

// AI生成結果スキーマ（基本方針に合わせて）
export const AIGeneratedContentSchema = z.object({
  summary: z.string(),
  tags: z.array(z.string()),
  category: CategorySchema,
  anonymizedText: z.string(),
  suggestedReplacements: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    }),
  ),
});

// プリチェック用スキーマ
export const PrecheckRequestSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const PrecheckResponseSchema = z.object({
  suggestedReplacements: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    }),
  ),
  anonymizedText: z.string(),
});

// 型エクスポート
export type Category = z.infer<typeof CategorySchema>;
export type Report = z.infer<typeof ReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
export type UpdateReport = z.infer<typeof UpdateReportSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
export type AIGeneratedContent = z.infer<typeof AIGeneratedContentSchema>;
export type PrecheckRequest = z.infer<typeof PrecheckRequestSchema>;
export type PrecheckResponse = z.infer<typeof PrecheckResponseSchema>;
