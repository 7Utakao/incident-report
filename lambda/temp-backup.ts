import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Environment variables
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';

// DynamoDB client setup
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Zod schemas for validation
const CreateReportSchema = z.object({
  body: z.string().min(1).max(5000),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().min(1).max(100),
  createdAt: z.string().optional(),
});

const QueryParamsSchema = z.object({
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  nextToken: z.string().optional(),
  q: z.string().optional(),
});

// Types
interface ReportItem {
  ReportId: string;
  UserId: string;
  Title?: string;
  Body: string;
  Summary?: string;
  Tags?: string[];
  Category: string;
  CreatedAt: string;
}

interface ApiReport {
  reportId: string;
  userId: string;
  title?: string;
  body: string;
  summary?: string;
  tags?: string[];
  category: string;
  createdAt: string;
}

// Data mapping functions
function dynamoToApi(item: ReportItem): ApiReport {
  return {
    reportId: item.ReportId,
    userId: item.UserId,
    title: item.Title,
    body: item.Body,
    summary: item.Summary,
    tags: item.Tags,
    category: item.Category,
    createdAt: item.CreatedAt,
  };
}

function apiToDynamo(report: Partial<ApiReport>, reportId: string, userId: string): ReportItem {
  return {
    ReportId: reportId,
    UserId: userId,
    Title: report.title,
    Body: report.body!,
    Summary: report.summary,
    Tags: report.tags,
    Category: report.category!,
    CreatedAt: report.createdAt || new Date().toISOString(),
  };
}

// Utility functions
function createResponse(statusCode: number, body: any): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
): APIGatewayProxyResultV2 {
  console.error(`Error ${statusCode}: ${code} - ${message}`);
  return createResponse(statusCode, { code, message });
}

function getUserId(event: APIGatewayProxyEventV2): string | null {
  try {
    const claims = event.requestContext.authorizer?.jwt?.claims;
    return (claims?.sub as string) || null;
  } catch (error) {
    console.error('Failed to extract user ID from JWT:', error);
    return null;
  }
}

function encodeNextToken(lastEvaluatedKey: any): string {
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

function decodeNextToken(nextToken: string): any {
  try {
    return JSON.parse(Buffer.from(nextToken, 'base64').toString());
  } catch (error) {
    console.error('Failed to decode nextToken:', error);
    return null;
  }
}

// Route handlers
async function handleHealth(): Promise<APIGatewayProxyResultV2> {
  return createResponse(200, { ok: true });
}

async function handleCreateReport(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const body = JSON.parse(event.body || '{}');
    const validatedData = CreateReportSchema.parse(body);

    const reportId = uuidv4();
    const reportItem = apiToDynamo(validatedData, reportId, userId);

    const command = new PutCommand({
      TableName: DDB_REPORTS,
      Item: reportItem,
    });

    await docClient.send(command);

    return createResponse(201, { reportId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        400,
        'BadRequest',
        `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
      );
    }
    console.error('Error creating report:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to create report');
  }
}

async function handleGetReports(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const queryParams = QueryParamsSchema.parse(event.queryStringParameters || {});
    const { category, from, to, nextToken, q } = queryParams;

    let command;
    let exclusiveStartKey;

    if (nextToken) {
      exclusiveStartKey = decodeNextToken(nextToken);
      if (!exclusiveStartKey) {
        return createErrorResponse(400, 'BadRequest', 'Invalid nextToken');
      }
    }

    // Use GSI if category and date range are specified
    if (category && from && to) {
      command = new QueryCommand({
        TableName: DDB_REPORTS,
        IndexName: 'Category-CreatedAt-Index',
        KeyConditionExpression: 'Category = :category AND CreatedAt BETWEEN :from AND :to',
        ExpressionAttributeValues: {
          ':category': category,
          ':from': from,
          ':to': to,
        },
        ScanIndexForward: false, // Descending order (newest first)
        Limit: 20,
        ExclusiveStartKey: exclusiveStartKey,
      });
    } else {
      // Use Scan for other cases (development use)
      const filterExpressions = [];
      const expressionAttributeValues: any = {};

      if (category) {
        filterExpressions.push('Category = :category');
        expressionAttributeValues[':category'] = category;
      }

      if (from) {
        filterExpressions.push('CreatedAt >= :from');
        expressionAttributeValues[':from'] = from;
      }

      if (to) {
        filterExpressions.push('CreatedAt <= :to');
        expressionAttributeValues[':to'] = to;
      }

      // Simple text search (contains)
      if (q) {
        filterExpressions.push('(contains(Title, :q) OR contains(Body, :q))');
        expressionAttributeValues[':q'] = q;
      }

      command = new ScanCommand({
        TableName: DDB_REPORTS,
        FilterExpression:
          filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeValues:
          Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
        Limit: 20,
        ExclusiveStartKey: exclusiveStartKey,
      });
    }

    const result = await docClient.send(command);
    const items = (result.Items || []) as ReportItem[];
    const apiItems = items.map(dynamoToApi);

    const response: any = {
      items: apiItems,
    };

    if (result.LastEvaluatedKey) {
      response.nextToken = encodeNextToken(result.LastEvaluatedKey);
    }

    return createResponse(200, response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        400,
        'BadRequest',
        `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
      );
    }
    console.error('Error getting reports:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to get reports');
  }
}

async function handleGetReport(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const reportId = event.pathParameters?.id;
    if (!reportId) {
      return createErrorResponse(400, 'BadRequest', 'Report ID is required');
    }

    const command = new GetCommand({
      TableName: DDB_REPORTS,
      Key: {
        ReportId: reportId,
      },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return createErrorResponse(404, 'NotFound', 'Report not found');
    }

    const apiItem = dynamoToApi(result.Item as ReportItem);
    return createResponse(200, apiItem);
  } catch (error) {
    console.error('Error getting report:', error);
    return createErrorResponse(500, 'InternalError', 'Failed to get report');
  }
}

// Main handler
export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Handle both API Gateway v2 and Lambda Function URL formats
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const routeKey = event.routeKey || `${method} ${path}`;

    console.log(`Processing route: ${routeKey}`);

    switch (routeKey) {
      case 'GET /health':
        return await handleHealth();
      case 'POST /reports':
        return await handleCreateReport(event);
      case 'GET /reports':
        return await handleGetReports(event);
      case 'GET /reports/{id}':
        return await handleGetReport(event);
      default:
        // Handle dynamic paths for Lambda Function URL
        if (method === 'GET' && path.startsWith('/reports/') && path !== '/reports') {
          // Extract report ID from path
          const reportId = path.split('/reports/')[1];
          if (reportId) {
            // Modify event to include pathParameters for compatibility
            event.pathParameters = { id: reportId };
            return await handleGetReport(event);
          }
        }
        return createErrorResponse(404, 'NotFound', `Route not found: ${routeKey}`);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return createErrorResponse(500, 'InternalError', 'Internal server error');
  }
};
