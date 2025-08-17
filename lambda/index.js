const { v4: uuidv4 } = require('uuid');
const { validateReportRequest, validateAiOutput, validateReportsQuery } = require('./validators');
const { processWithMock } = require('./ai-mock');
const { processWithBedrock } = require('./ai-bedrock');

// 環境変数
const AI_MODE = process.env.AI_MODE || 'mock';
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';

// DynamoDBクライアント（モック実装）
const dynamoDbClient = {
  async putItem(params) {
    // TODO: 実際のDynamoDB実装
    console.log('DynamoDB putItem:', JSON.stringify(params, null, 2));
    return { success: true };
  },

  async scan(params) {
    // TODO: 実際のDynamoDB実装
    console.log('DynamoDB scan:', JSON.stringify(params, null, 2));

    // モックデータを返す
    const mockItems = [
      {
        ReportId: { S: 'mock-report-1' },
        UserId: { S: 'dummy-user' },
        Title: { S: 'テストレポート1' },
        Body: { S: 'これはテスト用のレポートです。' },
        AiResult: {
          S: JSON.stringify({
            summary: 'テスト用の要約',
            tags: ['テスト', 'モック'],
            category: 'その他',
            anonymizedText: 'これはテスト用のレポートです。',
            suggestedReplacements: [],
          }),
        },
        CreatedAt: { S: new Date().toISOString() },
        Category: { S: 'その他' },
        Tags: { SS: ['テスト', 'モック'] },
      },
    ];

    return {
      Items: mockItems,
      Count: mockItems.length,
    };
  },
};

/**
 * Lambda関数のメインハンドラ
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, queryStringParameters, body } = event;

    // CORS ヘッダー
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    };

    // OPTIONS リクエスト（CORS プリフライト）
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    // ルーティング
    if (httpMethod === 'GET' && path === '/health') {
      return handleHealth(corsHeaders);
    }

    if (httpMethod === 'POST' && path === '/reports') {
      return await handleCreateReport(body, corsHeaders);
    }

    if (httpMethod === 'GET' && path === '/reports') {
      return await handleGetReports(queryStringParameters, corsHeaders);
    }

    // 404 Not Found
    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Not Found',
        message: `Path ${path} not found`,
      }),
    };
  } catch (error) {
    console.error('Handler error:', error);

    // CORS ヘッダー
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    };

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};

/**
 * GET /health ハンドラ
 */
function handleHealth(corsHeaders) {
  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
}

/**
 * POST /reports ハンドラ
 */
async function handleCreateReport(requestBody, corsHeaders) {
  try {
    // リクエストボディのパース
    let body;
    try {
      body = JSON.parse(requestBody || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON in request body',
        }),
      };
    }

    // バリデーション
    const validation = validateReportRequest(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: validation.errors,
        }),
      };
    }

    const { title, body: reportBody } = body;

    // AI処理
    let aiProcessResult;
    try {
      if (AI_MODE === 'bedrock') {
        aiProcessResult = await processWithBedrock(title, reportBody);
      } else {
        aiProcessResult = await processWithMock(title, reportBody);
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'AI Processing Error',
          message: aiError.message,
        }),
      };
    }

    // AI出力のバリデーション
    const aiValidation = validateAiOutput(aiProcessResult.aiResult);
    if (!aiValidation.isValid) {
      console.error('AI output validation failed:', aiValidation.errors);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'AI Output Validation Error',
          message: 'AI output does not conform to expected format',
          details: aiValidation.errors,
        }),
      };
    }

    // DynamoDB保存用のアイテム作成
    const reportId = uuidv4();
    const createdAt = new Date().toISOString();
    const { aiResult } = aiProcessResult;

    const dynamoItem = {
      TableName: DDB_REPORTS,
      Item: {
        ReportId: { S: reportId },
        UserId: { S: 'dummy-user' }, // 固定値
        Title: { S: title },
        Body: { S: reportBody },
        AiResult: { S: JSON.stringify(aiResult) },
        CreatedAt: { S: createdAt },
        Category: { S: aiResult.category },
        Tags: { SS: aiResult.tags },
      },
    };

    // DynamoDB保存
    try {
      await dynamoDbClient.putItem(dynamoItem);
    } catch (dbError) {
      console.error('DynamoDB error:', dbError);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Database Error',
          message: 'Failed to save report',
        }),
      };
    }

    // レスポンス作成
    const response = {
      reportId,
      title,
      body: reportBody,
      aiResult,
      createdAt,
      flags: aiProcessResult.flags,
    };

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Create report error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
}

/**
 * GET /reports ハンドラ
 */
async function handleGetReports(queryStringParameters, corsHeaders) {
  try {
    const queryParams = queryStringParameters || {};

    // クエリパラメータのバリデーション
    const validation = validateReportsQuery(queryParams);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Query parameter validation failed',
          details: validation.errors,
        }),
      };
    }

    const { validatedParams } = validation;

    // DynamoDB スキャンパラメータ作成
    const scanParams = {
      TableName: DDB_REPORTS,
    };

    // フィルタ条件の追加（簡易実装）
    const filterExpressions = [];
    const expressionAttributeValues = {};

    if (validatedParams.category) {
      filterExpressions.push('Category = :category');
      expressionAttributeValues[':category'] = { S: validatedParams.category };
    }

    if (validatedParams.from) {
      filterExpressions.push('CreatedAt >= :from');
      expressionAttributeValues[':from'] = { S: validatedParams.from };
    }

    if (validatedParams.to) {
      filterExpressions.push('CreatedAt <= :to');
      expressionAttributeValues[':to'] = { S: validatedParams.to };
    }

    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // DynamoDB スキャン実行
    let scanResult;
    try {
      scanResult = await dynamoDbClient.scan(scanParams);
    } catch (dbError) {
      console.error('DynamoDB scan error:', dbError);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Database Error',
          message: 'Failed to retrieve reports',
        }),
      };
    }

    // レスポンス形式に変換
    const reports = scanResult.Items.map((item) => {
      const aiResult = JSON.parse(item.AiResult.S);
      return {
        reportId: item.ReportId.S,
        title: item.Title.S,
        body: item.Body.S,
        aiResult,
        createdAt: item.CreatedAt.S,
        category: item.Category.S,
        tags: item.Tags.SS || [],
      };
    });

    // キーワード検索（簡易実装）
    let filteredReports = reports;
    if (validatedParams.q) {
      const keyword = validatedParams.q.toLowerCase();
      filteredReports = reports.filter((report) => {
        return (
          report.title.toLowerCase().includes(keyword) ||
          report.body.toLowerCase().includes(keyword) ||
          report.aiResult.tags.some((tag) => tag.toLowerCase().includes(keyword))
        );
      });
    }

    const response = {
      reports: filteredReports,
      count: filteredReports.length,
      filters: validatedParams,
    };

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Get reports error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
}
