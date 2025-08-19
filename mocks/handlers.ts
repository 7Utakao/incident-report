import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import type { Report } from '~/schemas/report';

// モックデータ生成
const generateMockReport = (id?: string): Report => ({
  reportId: id || faker.string.uuid(),
  userId: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  body: faker.lorem.paragraphs(3, '\n\n'),
  summary: faker.lorem.sentence({ min: 10, max: 20 }),
  tags: faker.helpers.arrayElements(
    [
      'データベース',
      '接続エラー',
      '設定ミス',
      'API',
      'フロントエンド',
      'バックエンド',
      'インフラ',
      'セキュリティ',
    ],
    { min: 2, max: 4 },
  ),
  category: faker.helpers.arrayElement([
    '技術的知識不足',
    '環境設定ミス',
    'コミュニケーション不足',
    '工数/スケジュール管理',
    '要件定義・仕様理解',
    'その他',
  ]),
  createdAt: faker.date.recent({ days: 30 }).toISOString(),
  pointsAwarded: faker.number.int({ min: 5, max: 20 }),
  riskFlags: faker.helpers.maybe(() => ['機密情報検出'], { probability: 0.2 }) || [],
});

// モックレポート一覧を生成
const mockReports: Report[] = Array.from({ length: 50 }, () => generateMockReport());

export const handlers = [
  // GET /reports - レポート一覧取得
  http.get('/api/reports', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let filteredReports = [...mockReports];

    // フィルタリング
    if (q) {
      const query = q.toLowerCase();
      filteredReports = filteredReports.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.body.toLowerCase().includes(query) ||
          report.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (category) {
      filteredReports = filteredReports.filter((report) => report.category === category);
    }

    if (from) {
      filteredReports = filteredReports.filter((report) => report.createdAt >= from);
    }

    if (to) {
      filteredReports = filteredReports.filter((report) => report.createdAt <= to);
    }

    // ソート（新しい順）
    filteredReports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // ページネーション
    const paginatedReports = filteredReports.slice(offset, offset + limit);

    return HttpResponse.json({
      reports: paginatedReports,
      count: paginatedReports.length,
      total: filteredReports.length,
      filters: { q, category, from, to, limit, offset },
    });
  }),

  // GET /reports/:id - レポート詳細取得
  http.get('/api/reports/:id', ({ params }) => {
    const { id } = params;
    const report = mockReports.find((r) => r.reportId === id) || generateMockReport(id as string);

    return HttpResponse.json(report);
  }),

  // POST /reports - レポート作成
  http.post('/api/reports', async ({ request }) => {
    const body = (await request.json()) as { title: string; body: string };

    // AI処理のシミュレーション（遅延）
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // AI分析結果のモック
    const aiResult = {
      summary: `${body.title}に関する問題の分析結果です。`,
      tags: faker.helpers.arrayElements(['分析', '改善', '対策', 'レビュー'], { min: 2, max: 3 }),
      category: faker.helpers.arrayElement([
        '技術的知識不足',
        '環境設定ミス',
        'コミュニケーション不足',
        '工数/スケジュール管理',
        '要件定義・仕様理解',
        'その他',
      ]),
      anonymizedText: body.body,
      suggestedReplacements:
        faker.helpers.maybe(
          () => [
            { from: '田中さん', to: '[個人名]' },
            { from: 'ABC株式会社', to: '[顧客名]' },
          ],
          { probability: 0.3 },
        ) || [],
    };

    const newReport: Report = {
      reportId: faker.string.uuid(),
      userId: faker.string.uuid(),
      title: body.title,
      body: body.body,
      summary: aiResult.summary,
      tags: aiResult.tags,
      category: aiResult.category,
      createdAt: new Date().toISOString(),
      pointsAwarded: faker.number.int({ min: 10, max: 25 }),
      riskFlags: aiResult.suggestedReplacements.length > 0 ? ['機密情報検出'] : [],
    };

    // モックデータに追加
    mockReports.unshift(newReport);

    return HttpResponse.json(
      {
        ...newReport,
        aiResult,
        flags: {
          containsDisallowed: aiResult.suggestedReplacements.length > 0,
        },
      },
      { status: 201 },
    );
  }),

  // GET /dashboard/summary - ダッシュボード統計
  http.get('/api/dashboard/summary', () => {
    const categories = [
      '技術的知識不足',
      '環境設定ミス',
      'コミュニケーション不足',
      '工数/スケジュール管理',
      '要件定義・仕様理解',
      'その他',
    ];

    return HttpResponse.json({
      countsByCategory: categories.map((category) => ({
        category,
        count: faker.number.int({ min: 5, max: 25 }),
      })),
      timeSeries: Array.from({ length: 30 }, (_, i) => ({
        date: faker.date
          .recent({ days: 30 - i })
          .toISOString()
          .split('T')[0],
        count: faker.number.int({ min: 0, max: 8 }),
      })),
      topTags: [
        { tag: 'データベース', count: faker.number.int({ min: 15, max: 30 }) },
        { tag: '設定ミス', count: faker.number.int({ min: 10, max: 25 }) },
        { tag: 'API', count: faker.number.int({ min: 8, max: 20 }) },
        { tag: 'フロントエンド', count: faker.number.int({ min: 5, max: 15 }) },
        { tag: 'インフラ', count: faker.number.int({ min: 3, max: 12 }) },
      ],
      commentary:
        'このところ、データベース関連のインシデントが増加傾向にあります。設定ミスによる問題も多く見られるため、チーム全体での知識共有と手順の見直しが推奨されます。',
    });
  }),
];
