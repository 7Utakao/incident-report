import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createResponse, createErrorResponse } from '../utils/response';
import { getUserId } from '../utils/auth';
import { queryReports } from '../services/dynamodb';
import { getCategoryDisplayName } from '../constants/categories';

interface CategoryStat {
  code: string;
  name: string;
  count: number;
}

interface StatsResponse {
  ok: boolean;
  scope: string;
  from?: string;
  to?: string;
  totalReports: number;
  byCategory: CategoryStat[];
  advice: string;
  updatedAt: string;
}

export async function getStats(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    // JWT認証
    const userId = await getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // クエリパラメータの取得
    const scope = event.queryStringParameters?.scope || 'all';
    const topN = parseInt(event.queryStringParameters?.topN || '10');
    const tz = event.queryStringParameters?.tz || 'Asia/Tokyo';

    if (!['all', 'month', 'company', 'user', 'today'].includes(scope)) {
      return createErrorResponse(
        400,
        'INVALID_SCOPE',
        'Invalid scope parameter. Use "all", "month", "company", "user", or "today"',
      );
    }

    // 日付範囲の計算
    let from: string | undefined;
    let to: string | undefined;

    if (scope === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      // 月初（JST）
      const monthStart = new Date(year, month, 1);
      from = monthStart.toISOString().split('T')[0];

      // 月末（JST）
      const monthEnd = new Date(year, month + 1, 0);
      to = monthEnd.toISOString().split('T')[0];
    } else if (scope === 'today') {
      // 今日の日付（JST）
      const now = new Date();
      const jstOffset = 9 * 60; // JST is UTC+9
      const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
      const today = jstTime.toISOString().split('T')[0];
      from = today;
      to = today;
    }

    // DynamoDBからデータ取得
    const queryParams: any = {};
    if (from) queryParams.from = from;
    if (to) queryParams.to = to;

    // ユーザー別統計の場合はuserIdでフィルタ
    if (scope === 'user') {
      queryParams.userId = userId;
    }

    const { items } = await queryReports(queryParams);

    // カテゴリ別集計
    const categoryCount: Record<string, number> = {};

    items.forEach((item) => {
      const category = item.Category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    // Top N の作成
    const byCategory: CategoryStat[] = Object.entries(categoryCount)
      .map(([code, count]) => ({
        code,
        name: getCategoryDisplayName(code),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);

    // 総報告数
    const totalReports = items.length;

    // AI総評の生成（フォールバック付き）
    const advice = generateAdvice(byCategory, scope, totalReports);

    const response: StatsResponse = {
      ok: true,
      scope,
      from,
      to,
      totalReports,
      byCategory,
      advice,
      updatedAt: new Date().toISOString(),
    };

    return createResponse(200, response);
  } catch (error) {
    console.error('Stats API error:', error);
    return createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error');
  }
}

function generateAdvice(categories: CategoryStat[], scope: string, totalReports: number): string {
  // フォールバック総評
  if (categories.length === 0) {
    const scopeText = scope === 'user' ? 'あなたの' : '';
    return `${scopeText}直近の傾向は確認中です。気づきがあれば短文でも構いません、まずは一件投稿してみましょう。`;
  }

  const topCategory = categories[0];
  let scopeText = '';

  switch (scope) {
    case 'month':
      scopeText = '今月は';
      break;
    case 'user':
      scopeText = `あなたは${totalReports}件の報告をされており、`;
      break;
    case 'company':
      scopeText = '全社では';
      break;
    default:
      scopeText = 'これまでに';
  }

  return `${scopeText}${topCategory.name}が多いので、関連手順の見直しとダブルチェックを徹底しましょう。報告が少ない領域は見落としの可能性もあるため、気づいたら積極的に共有しましょう。`;
}
