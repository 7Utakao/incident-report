import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function getUserId(event: APIGatewayProxyEventV2): string | null {
  try {
    // Development bypass for specific endpoints
    const devAllow = process.env.AUTH_DEV_ALLOW === 'true';
    const path = event.requestContext.http.path;
    const publicPaths = ['/health', '/ai/generate'];

    if (devAllow && publicPaths.includes(path)) {
      console.log(`Development bypass enabled for path: ${path}`);
      return 'dev-user-id';
    }

    // For Lambda Function URL, we need to extract JWT from Authorization header
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Authorization header found');
      return null;
    }

    // For development/testing purposes, we'll use a mock user ID
    // In production, you would decode and validate the JWT token here
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Mock validation - in production, use a proper JWT library
    if (token === 'test-token') {
      return 'test-user-id';
    }

    // For API Gateway with JWT authorizer (this property may not exist in Lambda Function URL)
    const requestContext = event.requestContext as any;
    const claims = requestContext.authorizer?.jwt?.claims;
    if (claims?.sub) {
      return claims.sub as string;
    }

    console.log('Invalid or missing JWT token');
    return null;
  } catch (error) {
    console.error('Failed to extract user ID from JWT:', error);
    return null;
  }
}

export function encodeNextToken(lastEvaluatedKey: any): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

export function decodeNextToken(nextToken: string): any {
  try {
    return JSON.parse(Buffer.from(nextToken, 'base64').toString());
  } catch (error) {
    console.error('Failed to decode nextToken:', error);
    return null;
  }
}
