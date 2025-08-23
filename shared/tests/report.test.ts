import { describe, it, expect } from 'vitest';
import {
  ReportSchema,
  CreateReportSchema,
  CategorySchema,
  ReportFiltersSchema,
  AIGeneratedContentSchema,
  PrecheckRequestSchema,
} from '../schemas/report';

describe('Report Schema Tests', () => {
  describe('CategorySchema', () => {
    it('有効なカテゴリを受け入れる', () => {
      const validCategories = [
        'WHY_TECHNICAL_KNOWLEDGE',
        'WHY_ENVIRONMENT_SETUP',
        'WHY_COMMUNICATION',
        'WHY_SCHEDULE_MANAGEMENT',
        'WHY_REQUIREMENT_UNDERSTANDING',
        'WHY_OTHER',
      ];

      validCategories.forEach((category) => {
        expect(() => CategorySchema.parse(category)).not.toThrow();
      });
    });

    it('無効なカテゴリを拒否する', () => {
      const invalidCategories = ['INVALID', '', 'technical_knowledge', null, undefined];

      invalidCategories.forEach((category) => {
        expect(() => CategorySchema.parse(category)).toThrow();
      });
    });
  });

  describe('CreateReportSchema', () => {
    const validReport = {
      title: 'テストタイトル',
      body: 'テスト本文',
      category: 'WHY_TECHNICAL_KNOWLEDGE',
    };

    describe('title validation', () => {
      it('有効なタイトルを受け入れる', () => {
        expect(() => CreateReportSchema.parse(validReport)).not.toThrow();
      });

      it('1文字のタイトルを受け入れる', () => {
        const report = { ...validReport, title: 'a' };
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('120文字のタイトルを受け入れる', () => {
        const report = { ...validReport, title: 'a'.repeat(120) };
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('0文字のタイトルを拒否する', () => {
        const report = { ...validReport, title: '' };
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });

      it('121文字のタイトルを拒否する', () => {
        const report = { ...validReport, title: 'a'.repeat(121) };
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });

      it('undefinedのタイトルを拒否する', () => {
        const report = { ...validReport };
        delete (report as any).title;
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });
    });

    describe('body validation', () => {
      it('1文字の本文を受け入れる', () => {
        const report = { ...validReport, body: 'a' };
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('4000文字の本文を受け入れる', () => {
        const report = { ...validReport, body: 'a'.repeat(4000) };
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('0文字の本文を拒否する', () => {
        const report = { ...validReport, body: '' };
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });

      it('4001文字の本文を拒否する', () => {
        const report = { ...validReport, body: 'a'.repeat(4001) };
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });

      it('undefinedの本文を拒否する', () => {
        const report = { ...validReport };
        delete (report as any).body;
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });
    });

    describe('category validation', () => {
      it('有効なカテゴリを受け入れる', () => {
        const report = { ...validReport, category: 'WHY_OTHER' };
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('カテゴリが未定義でも受け入れる（optional）', () => {
        const report = { ...validReport };
        delete (report as any).category;
        expect(() => CreateReportSchema.parse(report)).not.toThrow();
      });

      it('無効なカテゴリを拒否する', () => {
        const report = { ...validReport, category: 'INVALID_CATEGORY' };
        expect(() => CreateReportSchema.parse(report)).toThrow();
      });
    });
  });

  describe('ReportFiltersSchema', () => {
    it('空のフィルターを受け入れる', () => {
      expect(() => ReportFiltersSchema.parse({})).not.toThrow();
    });

    it('デフォルト値を設定する', () => {
      const result = ReportFiltersSchema.parse({});
      expect(result.limit).toBe(20);
    });

    it('limitの境界値をテストする', () => {
      expect(() => ReportFiltersSchema.parse({ limit: 1 })).not.toThrow();
      expect(() => ReportFiltersSchema.parse({ limit: 100 })).not.toThrow();
      expect(() => ReportFiltersSchema.parse({ limit: 0 })).toThrow();
      expect(() => ReportFiltersSchema.parse({ limit: 101 })).toThrow();
    });

    it('有効なフィルターパラメータを受け入れる', () => {
      const filters = {
        q: '検索クエリ',
        category: 'WHY_TECHNICAL_KNOWLEDGE',
        from: '2024-01-01T00:00:00Z',
        to: '2024-12-31T23:59:59Z',
        limit: 50,
        nextToken: 'token123',
      };
      expect(() => ReportFiltersSchema.parse(filters)).not.toThrow();
    });
  });

  describe('PrecheckRequestSchema', () => {
    it('有効な本文を受け入れる', () => {
      const request = { body: 'テスト本文' };
      expect(() => PrecheckRequestSchema.parse(request)).not.toThrow();
    });

    it('1文字の本文を受け入れる', () => {
      const request = { body: 'a' };
      expect(() => PrecheckRequestSchema.parse(request)).not.toThrow();
    });

    it('4000文字の本文を受け入れる', () => {
      const request = { body: 'a'.repeat(4000) };
      expect(() => PrecheckRequestSchema.parse(request)).not.toThrow();
    });

    it('0文字の本文を拒否する', () => {
      const request = { body: '' };
      expect(() => PrecheckRequestSchema.parse(request)).toThrow();
    });

    it('4001文字の本文を拒否する', () => {
      const request = { body: 'a'.repeat(4001) };
      expect(() => PrecheckRequestSchema.parse(request)).toThrow();
    });
  });

  describe('AIGeneratedContentSchema', () => {
    const validContent = {
      summary: 'AI生成の要約',
      tags: ['タグ1', 'タグ2'],
      category: 'WHY_TECHNICAL_KNOWLEDGE',
      anonymizedText: '匿名化されたテキスト',
      suggestedReplacements: [
        { from: '個人名', to: '[氏名]' },
        { from: '会社名', to: '[会社名]' },
      ],
    };

    it('有効なAI生成コンテンツを受け入れる', () => {
      expect(() => AIGeneratedContentSchema.parse(validContent)).not.toThrow();
    });

    it('空のタグ配列を受け入れる', () => {
      const content = { ...validContent, tags: [] };
      expect(() => AIGeneratedContentSchema.parse(content)).not.toThrow();
    });

    it('空の置換提案配列を受け入れる', () => {
      const content = { ...validContent, suggestedReplacements: [] };
      expect(() => AIGeneratedContentSchema.parse(content)).not.toThrow();
    });

    it('必須フィールドが欠けている場合を拒否する', () => {
      const incompleteContent = { ...validContent };
      delete (incompleteContent as any).summary;
      expect(() => AIGeneratedContentSchema.parse(incompleteContent)).toThrow();
    });
  });
});
