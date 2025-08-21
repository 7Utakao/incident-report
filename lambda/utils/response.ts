import type { APIGatewayProxyResultV2 } from 'aws-lambda';

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // 本番環境では具体的なドメインを指定
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export function createResponse(
  statusCode: number,
  body: any,
  additionalHeaders: Record<string, string> = {},
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
): APIGatewayProxyResultV2 {
  console.error(`Error ${statusCode}: ${code} - ${message}`);
  return createResponse(statusCode, { code, message });
}

// Handle OPTIONS preflight requests
export function createOptionsResponse(): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: '',
  };
}
