import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function getUserId(event: APIGatewayProxyEventV2): string | null {
  try {
    console.log('🔍 getUserId 開始');
    console.log('Event headers:', JSON.stringify(event.headers, null, 2));
    console.log('Request context:', JSON.stringify(event.requestContext, null, 2));

    // Development bypass for specific endpoints
    const devAllow = process.env.AUTH_DEV_ALLOW === 'true';
    const path = event.requestContext.http.path;
    const publicPaths = ['/health', '/ai/generate'];

    console.log('Development bypass:', devAllow, 'Path:', path);

    if (devAllow && publicPaths.includes(path)) {
      console.log(`Development bypass enabled for path: ${path}`);
      return 'dev-user-id';
    }

    // For Lambda Function URL, we need to extract JWT from Authorization header
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'なし');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid Authorization header found');
      return null;
    }

    // For development/testing purposes, we'll use a mock user ID
    // In production, you would decode and validate the JWT token here
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Extracted token:', `${token.substring(0, 50)}...`);

    // Mock validation - in production, use a proper JWT library
    if (token === 'test-token') {
      console.log('✅ Test token detected');
      return 'test-user-id';
    }

    // 一時的に実際のJWTトークンも受け入れる（開発用）
    if (token && token.length > 50) {
      console.log('✅ JWT token detected, using temporary bypass');
      // JWTトークンの構造を確認
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('JWT payload:', JSON.stringify(payload, null, 2));

          // Cognitoのsubクレームを使用
          if (payload.sub) {
            console.log('✅ Using Cognito sub as user ID:', payload.sub);
            return payload.sub;
          }
        }
      } catch (jwtError) {
        console.error('JWT parsing error:', jwtError);
      }
    }

    // For API Gateway with JWT authorizer (this property may not exist in Lambda Function URL)
    const requestContext = event.requestContext as any;
    const claims = requestContext.authorizer?.jwt?.claims;
    console.log('Request context claims:', claims);

    if (claims?.sub) {
      console.log('✅ Using request context sub:', claims.sub);
      return claims.sub as string;
    }

    console.log('❌ Invalid or missing JWT token');
    return null;
  } catch (error) {
    console.error('❌ Failed to extract user ID from JWT:', error);
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
