import { z } from 'zod';

export const ReportSchema = z.object({
  reportId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  summary: z.string(),
  tags: z.array(z.string()),
  category: z.enum([
    '技術的知識不足',
    '環境設定ミス',
    'コミュニケーション不足',
    '工数/スケジュール管理',
    '要件定義・仕様理解',
    'その他',
  ]),
  createdAt: z.string(),
  pointsAwarded: z.number().default(10),
  riskFlags: z.array(z.string()).default([]),
});

export const CreateReportSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  body: z.string().min(1, '本文は必須です').max(5000, '本文は5000文字以内で入力してください'),
});

export const ReportFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type Report = z.infer<typeof ReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
