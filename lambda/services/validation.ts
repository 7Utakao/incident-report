import { z } from 'zod';
import { detectProhibitedInfo } from '../utils/prohibited-info';

// Zod schemas for validation
export const CreateReportSchema = z.object({
  body: z.string().min(1).max(5000),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1).max(100),
  createdAt: z.string().optional(),
  improvements: z.string().optional(),
});

export const QueryParamsSchema = z.object({
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  nextToken: z.string().optional(),
  q: z.string().optional(),
  authorId: z.string().optional(),
  countOnly: z.string().optional(),
  limit: z.string().optional(),
});

export const AiGenerateSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const ValidateReportSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  occurredAt: z.string(),
  content: z.string().min(1).max(5000),
  improvements: z.string().min(1).max(2000),
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestedReplacements: any[];
}

export function validateReport(data: any): ValidationResult {
  try {
    const validatedData = ValidateReportSchema.parse(data);

    // Perform additional validation checks
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Check for prohibited information
    const prohibitedMatches = detectProhibitedInfo(
      `${validatedData.title} ${validatedData.content} ${validatedData.improvements}`,
    );

    if (prohibitedMatches.length > 0) {
      warnings.push('個人情報や機密情報が含まれている可能性があります');
    }

    // Check required fields more strictly
    if (validatedData.title.trim().length < 5) {
      validationErrors.push('タイトルは5文字以上で入力してください');
    }

    if (validatedData.content.trim().length < 20) {
      validationErrors.push('内容は20文字以上で入力してください');
    }

    if (validatedData.improvements.trim().length < 10) {
      validationErrors.push('改善案は10文字以上で入力してください');
    }

    // Check date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(validatedData.occurredAt)) {
      validationErrors.push('発生日時の形式が正しくありません（YYYY-MM-DD）');
    }

    // Check if date is not in the future
    const occurredDate = new Date(validatedData.occurredAt);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (occurredDate > today) {
      validationErrors.push('発生日時は未来の日付にできません');
    }

    const isValid = validationErrors.length === 0;

    return {
      valid: isValid,
      errors: validationErrors,
      warnings: warnings,
      suggestedReplacements: prohibitedMatches,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e: any) => e.message),
        warnings: [],
        suggestedReplacements: [],
      };
    }
    throw error;
  }
}
