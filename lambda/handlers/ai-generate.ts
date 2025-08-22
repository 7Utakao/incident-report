import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { z } from 'zod';
import { getUserId } from '../utils/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { AiGenerateSchema } from '../services/validation';
import { generateAIReport } from '../providers/ai';
import { withRetry, createRetryableError } from '../utils/retry';
import { withConcurrencyControl, aiConcurrencyLimiter } from '../utils/concurrency';
import { preprocessText, getProcessingStats } from '../services/text-processing';

export async function handleAiGenerate(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = await getUserId(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized', 'Valid JWT token required');
    }

    const body = JSON.parse(event.body || '{}');
    const validatedData = AiGenerateSchema.parse(body);

    // Check AI provider configuration - NO MOCK FALLBACK
    const provider = process.env.AI_PROVIDER || 'bedrock';

    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return createErrorResponse(500, 'ai_not_configured', 'OpenAI API key not configured');
    }

    if (provider === 'bedrock' && !process.env.BEDROCK_REGION && !process.env.AWS_REGION) {
      return createErrorResponse(500, 'ai_not_configured', 'Bedrock region not configured');
    }

    // Log concurrency status
    const status = aiConcurrencyLimiter.getStatus();
    console.log(`AI Concurrency Status: ${JSON.stringify(status)}`);

    // Execute with concurrency control and retry logic
    const aiResult = await withConcurrencyControl(async () => {
      // Preprocess text if needed
      const processedText = await preprocessText(validatedData.content);
      console.log(`Text processing: ${getProcessingStats(processedText)}`);

      // Execute AI generation with retry
      return await withRetry(
        async () => {
          try {
            return await generateAIReport(processedText.content);
          } catch (error: any) {
            // Convert certain errors to retryable errors
            if (
              error.message?.includes('throttl') ||
              error.message?.includes('rate limit') ||
              error.message?.includes('overload') ||
              error.message?.includes('busy') ||
              error.statusCode === 429 ||
              error.statusCode === 503
            ) {
              throw createRetryableError(error.message, error.statusCode);
            }
            throw error;
          }
        },
        {
          maxRetries: 3, // Reduced retries for AI calls
          baseDelay: 2000, // 2 second base delay
          maxDelay: 10000, // 10 second max delay
        },
      );
    });

    // Add processing metadata to response
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-ai-provider': provider,
      'x-concurrency-status': JSON.stringify(status),
    };

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify(aiResult),
    };
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        400,
        'BadRequest',
        `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`,
      );
    }

    // Handle service overload (503 with Retry-After)
    if (error.statusCode === 503 || error.message?.includes('overload')) {
      return {
        statusCode: 503,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(error.retryAfter || 2),
        },
        body: JSON.stringify({
          code: 'service_overloaded',
          message: 'AI service is temporarily overloaded. Please retry after a few seconds.',
          retryAfter: error.retryAfter || 2,
        }),
      };
    }

    // Handle other errors
    console.error('Error in AI generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI report';
    const statusCode = error.statusCode || 500;

    return createErrorResponse(statusCode, 'ai_generation_failed', errorMessage);
  }
}
