import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { logger } from './logger';

// Allowed origins for CORS
const ALLOW_ORIGINS = new Set(['http://localhost:3002', 'https://report-seed.com']);

// Generate CORS headers based on request origin
function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin = origin && ALLOW_ORIGINS.has(origin) ? origin : 'https://report-seed.com';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    Vary: 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-requested-with',
    'Access-Control-Max-Age': '86400',
  };
}

export function createResponse(
  statusCode: number,
  body: any,
  origin?: string,
  additionalHeaders: Record<string, string> = {},
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      ...corsHeaders(origin),
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
  origin?: string,
): APIGatewayProxyResultV2 {
  logger.error('API Error Response', {
    statusCode,
    code,
    message,
  });
  return createResponse(statusCode, { code, message }, origin);
}

// Handle OPTIONS preflight requests with proper CORS headers
export function createOptionsResponse(origin?: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 204, // No Content is more appropriate for OPTIONS
    headers: corsHeaders(origin),
    body: '',
  };
}
