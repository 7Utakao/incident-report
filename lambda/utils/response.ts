import type { APIGatewayProxyResultV2 } from 'aws-lambda';

// Basic headers for all responses (CORS is handled by Lambda Function URL)
const BASIC_HEADERS = {
  'Content-Type': 'application/json',
};

export function createResponse(
  statusCode: number,
  body: any,
  additionalHeaders: Record<string, string> = {},
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      ...BASIC_HEADERS,
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

// Handle OPTIONS preflight requests (CORS is handled by Lambda Function URL)
export function createOptionsResponse(): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: BASIC_HEADERS,
    body: '',
  };
}
