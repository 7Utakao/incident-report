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
    improvements: item.Improvements,
  };
}

export function apiToDynamo(
  report: Partial<ApiReport>,
  reportId: string,
  userId: string,
): ReportItem {
  const createdAt = report.createdAt || new Date().toISOString();
  const category = report.category!;

  return {
    // Primary Key (existing table structure)
    ReportId: reportId,
    UserId: userId,
    Title: report.title,
    Body: report.body!,
    Summary: report.summary,
    Tags: report.tags,
    Category: category,
    CreatedAt: createdAt,
    Improvements: report.improvements,
  };
}

// DynamoDB operations
export async function createReport(reportItem: ReportItem): Promise<void> {
  console.log('🔍 createReport 開始');
  console.log('保存するアイテム:', reportItem);
  console.log('テーブル名:', DDB_REPORTS);

  const command = new PutCommand({
    TableName: DDB_REPORTS,
    Item: reportItem,
  });

  console.log('実行するPutCommand:', {
    tableName: command.input.TableName,
    item: command.input.Item,
  });

  const result = await docClient.send(command);
  console.log('✅ PutCommand実行結果:', result);
}

export async function getReport(reportId: string): Promise<ReportItem | null> {
  console.log('🔍 getReport 開始');
  console.log('取得するレポートID:', reportId);
  console.log('テーブル名:', DDB_REPORTS);

  const command = new GetCommand({
    TableName: DDB_REPORTS,
    Key: {
      ReportId: reportId,
    },
  });

  console.log('実行するGetCommand:', {
    tableName: command.input.TableName,
    key: command.input.Key,
  });

  const result = await docClient.send(command);
  console.log('✅ GetCommand実行結果:', {
    item: result.Item
      ? {
          ReportId: result.Item.ReportId,
          Title: result.Item.Title,
          Category: result.Item.Category,
          CreatedAt: result.Item.CreatedAt,
        }
      : null,
  });

  return (result.Item as ReportItem) || null;
}

export async function queryReports(params: {
  category?: string;
  from?: string;
  to?: string;
  nextToken?: string;
  q?: string;
  userId?: string;
  limit?: number;
}): Promise<{ items: ReportItem[]; lastEvaluatedKey?: any }> {
  console.log('🔍 queryReports 開始');
  console.log('パラメータ:', params);
  console.log('テーブル名:', DDB_REPORTS);
  console.log('リージョン:', AWS_REGION);

  const { category, from, to, nextToken, q, userId, limit } = params;
  const queryLimit = limit || 20;

  let command;
  let exclusiveStartKey;

  if (nextToken) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
      console.log('NextToken デコード結果:', exclusiveStartKey);
    } catch (error) {
      console.error('❌ NextToken デコードエラー:', error);
      throw new Error('Invalid nextToken');
    }
  }

  // Use existing Category-CreatedAt-Index for category-based queries
  if (category) {
    let keyConditionExpression = 'Category = :category';
    const expressionAttributeValues: any = {
      ':category': category,
    };

    // Add date range if specified
    if (from && to) {
      keyConditionExpression += ' AND CreatedAt BETWEEN :from AND :to';
      expressionAttributeValues[':from'] = from;
      expressionAttributeValues[':to'] = to;
    } else if (from) {
      keyConditionExpression += ' AND CreatedAt >= :from';
      expressionAttributeValues[':from'] = from;
    } else if (to) {
      keyConditionExpression += ' AND CreatedAt <= :to';
      expressionAttributeValues[':to'] = to;
    }

    command = new QueryCommand({
      TableName: DDB_REPORTS,
      IndexName: 'Category-CreatedAt-Index',
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false, // Descending order (newest first)
      Limit: queryLimit,
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

    // User ID filter
    if (userId) {
      filterExpressions.push('UserId = :userId');
      expressionAttributeValues[':userId'] = userId;
    }

    command = new ScanCommand({
      TableName: DDB_REPORTS,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: queryLimit,
      ExclusiveStartKey: exclusiveStartKey,
    });
  }

  if (command instanceof QueryCommand) {
    console.log('実行するコマンド (Query):', {
      type: 'QueryCommand',
      tableName: command.input.TableName,
      indexName: command.input.IndexName,
      keyConditionExpression: command.input.KeyConditionExpression,
      expressionAttributeValues: command.input.ExpressionAttributeValues,
      limit: command.input.Limit,
      scanIndexForward: command.input.ScanIndexForward,
    });
  } else {
    console.log('実行するコマンド (Scan):', {
      type: 'ScanCommand',
      tableName: command.input.TableName,
      filterExpression: command.input.FilterExpression,
      expressionAttributeValues: command.input.ExpressionAttributeValues,
      limit: command.input.Limit,
    });
  }

  const result = await docClient.send(command);
  console.log('DynamoDB実行結果:', {
    itemCount: result.Items?.length || 0,
    scannedCount: result.ScannedCount,
    consumedCapacity: result.ConsumedCapacity,
    lastEvaluatedKey: result.LastEvaluatedKey,
    items:
      result.Items?.map((item) => ({
        ReportId: item.ReportId,
        Title: item.Title,
        Category: item.Category,
        CreatedAt: item.CreatedAt,
      })) || [],
  });

  return {
    items: (result.Items || []) as ReportItem[],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}
