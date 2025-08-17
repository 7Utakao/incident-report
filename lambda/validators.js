// バリデーション関数群

/**
 * POST /reports のリクエストボディをバリデーション
 */
function validateReportRequest(body) {
  const errors = [];

  if (!body) {
    errors.push('Request body is required');
    return { isValid: false, errors };
  }

  if (!body.title || typeof body.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (body.title.trim().length === 0) {
    errors.push('title cannot be empty');
  } else if (body.title.length > 200) {
    errors.push('title must be 200 characters or less');
  }

  if (!body.body || typeof body.body !== 'string') {
    errors.push('body is required and must be a string');
  } else if (body.body.trim().length === 0) {
    errors.push('body cannot be empty');
  } else if (body.body.length > 5000) {
    errors.push('body must be 5000 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * AI出力JSONがbasic-policy.txt v1.0に準拠しているかチェック
 */
function validateAiOutput(aiResult) {
  const errors = [];

  if (!aiResult || typeof aiResult !== 'object') {
    errors.push('AI result must be an object');
    return { isValid: false, errors };
  }

  // 必須フィールドのチェック
  const requiredFields = ['summary', 'tags', 'category', 'anonymizedText', 'suggestedReplacements'];

  for (const field of requiredFields) {
    if (!(field in aiResult)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 型チェック
  if (aiResult.summary && typeof aiResult.summary !== 'string') {
    errors.push('summary must be a string');
  }

  if (aiResult.tags && !Array.isArray(aiResult.tags)) {
    errors.push('tags must be an array');
  } else if (aiResult.tags) {
    for (let i = 0; i < aiResult.tags.length; i++) {
      if (typeof aiResult.tags[i] !== 'string') {
        errors.push(`tags[${i}] must be a string`);
      }
    }
  }

  if (aiResult.category && typeof aiResult.category !== 'string') {
    errors.push('category must be a string');
  }

  if (aiResult.anonymizedText && typeof aiResult.anonymizedText !== 'string') {
    errors.push('anonymizedText must be a string');
  }

  if (aiResult.suggestedReplacements && !Array.isArray(aiResult.suggestedReplacements)) {
    errors.push('suggestedReplacements must be an array');
  } else if (aiResult.suggestedReplacements) {
    for (let i = 0; i < aiResult.suggestedReplacements.length; i++) {
      const replacement = aiResult.suggestedReplacements[i];
      if (!replacement || typeof replacement !== 'object') {
        errors.push(`suggestedReplacements[${i}] must be an object`);
      } else {
        if (!replacement.from || typeof replacement.from !== 'string') {
          errors.push(`suggestedReplacements[${i}].from must be a string`);
        }
        if (!replacement.to || typeof replacement.to !== 'string') {
          errors.push(`suggestedReplacements[${i}].to must be a string`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /reports のクエリパラメータをバリデーション
 */
function validateReportsQuery(queryParams) {
  const errors = [];
  const validatedParams = {};

  // category
  if (queryParams.category) {
    if (typeof queryParams.category !== 'string') {
      errors.push('category must be a string');
    } else {
      validatedParams.category = queryParams.category.trim();
    }
  }

  // q (keyword)
  if (queryParams.q) {
    if (typeof queryParams.q !== 'string') {
      errors.push('q must be a string');
    } else {
      validatedParams.q = queryParams.q.trim();
    }
  }

  // from (date)
  if (queryParams.from) {
    if (typeof queryParams.from !== 'string') {
      errors.push('from must be a string');
    } else {
      const fromDate = new Date(queryParams.from);
      if (isNaN(fromDate.getTime())) {
        errors.push('from must be a valid date');
      } else {
        validatedParams.from = fromDate.toISOString();
      }
    }
  }

  // to (date)
  if (queryParams.to) {
    if (typeof queryParams.to !== 'string') {
      errors.push('to must be a string');
    } else {
      const toDate = new Date(queryParams.to);
      if (isNaN(toDate.getTime())) {
        errors.push('to must be a valid date');
      } else {
        validatedParams.to = toDate.toISOString();
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedParams,
  };
}

module.exports = {
  validateReportRequest,
  validateAiOutput,
  validateReportsQuery,
};
