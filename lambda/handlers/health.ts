import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { createResponse } from '../utils/response';

export async function handleHealth(): Promise<APIGatewayProxyResultV2> {
  return createResponse(200, { ok: true });
}
