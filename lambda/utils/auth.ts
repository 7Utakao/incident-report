import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { logger } from './logger';

// Cognito JWKSエンドポイントのキャッシュ
let jwksCache: any = null;
let jwksCacheExpiry = 0;

export async function getUserId(event: APIGatewayProxyEventV2): Promise<string | null> {
  try {
    // Development bypass for specific endpoints
    const devAllow = process.env.AUTH_DEV_ALLOW === 'true';
    const path = event.requestContext.http.path;
    const publicPaths = ['/health'];

    if (devAllow && publicPaths.includes(path)) {
      return 'dev-user-id';
    }

    // Authorization headerからJWTトークンを取得
    const authHeader = event.headers?.authorization || event.headers?.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // 環境変数から設定を取得
    const userPoolId = process.env.USER_POOL_ID;
    const userPoolClientId = process.env.USER_POOL_CLIENT_ID;
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-northeast-1';

    // 必要な環境変数が設定されているかチェック
    if (!userPoolId || !userPoolClientId) {
      logger.error('Missing required environment variables for Cognito authentication', {
        userPoolId: !!userPoolId,
        userPoolClientId: !!userPoolClientId,
      });
      return null;
    }

    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    const expectedIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    // JWKSを取得（キャッシュ機能付き）
    const now = Date.now();
    if (!jwksCache || now > jwksCacheExpiry) {
      try {
        jwksCache = createRemoteJWKSet(new URL(jwksUrl));
        jwksCacheExpiry = now + 3600000; // 1時間キャッシュ
      } catch (jwksError) {
        logger.error('JWKS fetch error', {
          jwksUrl,
          error: jwksError instanceof Error ? jwksError.message : String(jwksError),
        });
        throw jwksError;
      }
    }

    // JWTトークンを検証
    const { payload } = await jwtVerify(token, jwksCache, {
      issuer: expectedIssuer,
      audience: userPoolClientId,
    });

    return payload.sub as string;
  } catch (error: any) {
    logger.error('JWT verification failed', {
      error: error.message,
      path: event.requestContext.http.path,
    });
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
    logger.error('Failed to decode nextToken', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
