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
    const userId = await getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const body = JSON.parse(event.body || '{}');
    const validatedData = CreateReportSchema.parse(body);

    const reportId = uuidv4();
    const reportItem = apiToDynamo(validatedData, reportId, userId);
    await createReport(reportItem);

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
    const userId = await getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const queryParams = QueryParamsSchema.parse(event.queryStringParameters || {});
    const { category, from, to, nextToken, q, authorId, countOnly, limit } = queryParams;

    // authorId=me の場合は現在のユーザーIDに置き換え
    const actualAuthorId = authorId === 'me' ? userId : authorId;

    const result = await queryReports({
      category,
      from,
      to,
      nextToken,
      q,
      userId: actualAuthorId,
      limit: limit ? parseInt(limit) : 1000,
    });

    // countOnlyが指定されている場合は件数のみ返す
    if (countOnly === 'true') {
      return createResponse(200, { count: result.items.length });
    }

    const apiItems = result.items.map(dynamoToApi);

    const response: any = {
      items: apiItems,
    };

    if (result.lastEvaluatedKey) {
      response.nextToken = encodeNextToken(result.lastEvaluatedKey);
    }

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
    const userId = await getUserId(event);
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
    console.error('❌ handleGetReport エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(500, 'InternalError', `Failed to get report: ${errorMessage}`);
  }
}
