import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { ReportItem, ApiReport } from '../types';

// Environment variables
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';

// DynamoDB client setup
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Data mapping functions
export function dynamoToApi(item: ReportItem): ApiReport {
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

export function apiToDynamo(
  report: Partial<ApiReport>,
  reportId: string,
  userId: string,
): ReportItem {
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

// DynamoDB operations
export async function createReport(reportItem: ReportItem): Promise<void> {
  const command = new PutCommand({
    TableName: DDB_REPORTS,
    Item: reportItem,
  });

  await docClient.send(command);
}

export async function getReport(reportId: string): Promise<ReportItem | null> {
  const command = new GetCommand({
    TableName: DDB_REPORTS,
    Key: {
      ReportId: reportId,
    },
  });

  const result = await docClient.send(command);
  return (result.Item as ReportItem) || null;
}

export async function queryReports(params: {
  category?: string;
  from?: string;
  to?: string;
  nextToken?: string;
  q?: string;
}): Promise<{ items: ReportItem[]; lastEvaluatedKey?: any }> {
  const { category, from, to, nextToken, q } = params;

  let command;
  let exclusiveStartKey;

  if (nextToken) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
    } catch (error) {
      throw new Error('Invalid nextToken');
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
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: 20,
      ExclusiveStartKey: exclusiveStartKey,
    });
  }

  const result = await docClient.send(command);
  return {
    items: (result.Items || []) as ReportItem[],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}
