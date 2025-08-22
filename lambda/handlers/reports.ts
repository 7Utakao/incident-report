import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getUserId, encodeNextToken } from '../utils/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { CreateReportSchema, QueryParamsSchema } from '../services/validation';
import {
  createReport,
  getReport,
  queryReports,
  dynamoToApi,
  apiToDynamo,
} from '../services/dynamodb';

export async function handleCreateReport(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    console.log('🔍 handleCreateReport 開始');
    console.log('Event body:', event.body);

    const userId = getUserId(event);
    console.log('取得したユーザーID:', userId);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const body = JSON.parse(event.body || '{}');
    console.log('パースしたボディ:', body);

    const validatedData = CreateReportSchema.parse(body);
    console.log('バリデーション後のデータ:', validatedData);

    const reportId = uuidv4();
    console.log('生成したレポートID:', reportId);

    const reportItem = apiToDynamo(validatedData, reportId, userId);
    console.log('DynamoDB保存用データ:', reportItem);

    await createReport(reportItem);
    console.log('✅ DynamoDBへの保存完了');

    return createResponse(201, { reportId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ バリデーションエラー:', error.issues);
      return createErrorResponse(
        400,
        'BadRequest',
        `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`,
      );
    }
    console.error('❌ レポート作成エラー:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to create report');
  }
}

export async function handleGetReports(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    console.log('🔍 handleGetReports 開始');
    console.log('Event:', JSON.stringify(event, null, 2));

    const userId = getUserId(event);
    console.log('取得したユーザーID:', userId);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const queryParams = QueryParamsSchema.parse(event.queryStringParameters || {});
    const { category, from, to, nextToken, q } = queryParams;
    console.log('クエリパラメータ:', { category, from, to, nextToken, q });

    const result = await queryReports({ category, from, to, nextToken, q });
    console.log('DynamoDB クエリ結果:', {
      itemCount: result.items.length,
      hasLastEvaluatedKey: !!result.lastEvaluatedKey,
      items: result.items.map((item) => ({
        ReportId: item.ReportId,
        Title: item.Title,
        Category: item.Category,
        CreatedAt: item.CreatedAt,
        UserId: item.UserId,
      })),
    });

    const apiItems = result.items.map(dynamoToApi);
    console.log('API形式に変換後:', {
      itemCount: apiItems.length,
      items: apiItems.map((item) => ({
        reportId: item.reportId,
        title: item.title,
        category: item.category,
        createdAt: item.createdAt,
        userId: item.userId,
      })),
    });

    const response: any = {
      items: apiItems,
    };

    if (result.lastEvaluatedKey) {
      response.nextToken = encodeNextToken(result.lastEvaluatedKey);
    }

    console.log('✅ レスポンス準備完了:', {
      itemCount: response.items.length,
      hasNextToken: !!response.nextToken,
    });

    return createResponse(200, response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ バリデーションエラー:', error.issues);
      return createErrorResponse(
        400,
        'BadRequest',
        `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`,
      );
    }
    console.error('❌ レポート取得エラー:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to get reports');
  }
}

export async function handleGetReport(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const reportId = event.pathParameters?.id;
    if (!reportId) {
      return createErrorResponse(400, 'BadRequest', 'Report ID is required');
    }

    const reportItem = await getReport(reportId);

    if (!reportItem) {
      return createErrorResponse(404, 'NotFound', 'Report not found');
    }

    const apiItem = dynamoToApi(reportItem);
    return createResponse(200, apiItem);
  } catch (error) {
    console.error('Error getting report:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to get report');
  }
}
