import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getUserId } from '../utils/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { validateReport } from '../services/validation';

export async function handleValidateReport(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const body = JSON.parse(event.body || '{}');
    const validationResult = validateReport(body);

    return createResponse(200, validationResult);
  } catch (error) {
    return createErrorResponse(500, 'InternalError', 'Failed to validate report');
  }
}
