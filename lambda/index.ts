import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { createErrorResponse, createOptionsResponse } from './utils/response';
import { handleHealth } from './handlers/health';
import { handleAiGenerate } from './handlers/ai-generate';
import { handleValidateReport } from './handlers/validate';
import { handleCreateReport, handleGetReports, handleGetReport } from './handlers/reports';
import { getStats } from './handlers/stats';

// Main handler
export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> => {
  // Top-level try/catch to prevent 502 Bad Gateway errors
  try {
    try {
      // Handle both API Gateway v2 and Lambda Function URL formats
      const method = event.requestContext.http.method;
      const path = event.requestContext.http.path;
      const routeKey = event.routeKey || `${method} ${path}`;

      // Handle OPTIONS requests for CORS preflight
      if (method === 'OPTIONS') {
        return createOptionsResponse();
      }

      // For Lambda Function URL, routeKey is always "$default", so we need to route based on method and path
      if (routeKey === '$default' || routeKey === `${method} ${path}`) {
        // Route based on method and path
        if (method === 'GET' && path === '/health') {
          return await handleHealth();
        } else if (method === 'POST' && path === '/ai/generate') {
          return await handleAiGenerate(event);
        } else if (method === 'POST' && path === '/validate') {
          return await handleValidateReport(event);
        } else if (method === 'POST' && path === '/reports') {
          return await handleCreateReport(event);
        } else if (method === 'GET' && path === '/reports') {
          return await handleGetReports(event);
        } else if (method === 'GET' && path === '/stats/categories') {
          return await getStats(event);
        } else if (method === 'GET' && path.startsWith('/reports/') && path !== '/reports') {
          // Extract report ID from path
          const reportId = path.split('/reports/')[1];
          if (reportId) {
            // Modify event to include pathParameters for compatibility
            event.pathParameters = { id: reportId };
            return await handleGetReport(event);
          }
        }
      } else {
        // Handle API Gateway v2 format
        switch (routeKey) {
          case 'GET /health':
            return await handleHealth();
          case 'POST /ai/generate':
            return await handleAiGenerate(event);
          case 'POST /validate':
            return await handleValidateReport(event);
          case 'POST /reports':
            return await handleCreateReport(event);
          case 'GET /reports':
            return await handleGetReports(event);
          case 'GET /reports/{id}':
            return await handleGetReport(event);
          case 'GET /stats/categories':
            return await getStats(event);
          default:
            // Handle dynamic paths for API Gateway
            if (method === 'GET' && path.startsWith('/reports/') && path !== '/reports') {
              // Extract report ID from path
              const reportId = path.split('/reports/')[1];
              if (reportId) {
                // Modify event to include pathParameters for compatibility
                event.pathParameters = { id: reportId };
                return await handleGetReport(event);
              }
            }
            break;
        }
      }

      return createErrorResponse(404, 'NotFound', `Route not found: ${method} ${path}`);
    } catch (error) {
      console.error('Route handling error:', error);
      return createErrorResponse(500, 'InternalError', 'Internal server error');
    }
  } catch (criticalError) {
    // Critical error handler - ensures we always return valid JSON
    console.error('CRITICAL ERROR - Top level catch:', criticalError);

    // Fallback response to prevent 502 Bad Gateway
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'critical_error',
        message: 'A critical error occurred in the Lambda function',
        error: criticalError instanceof Error ? criticalError.message : String(criticalError),
      }),
    };
  }
};
