import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export function createResponse(statusCode: number, body: any): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
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
