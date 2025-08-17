// 動作確認用テストケース

const { validateReportRequest, validateAiOutput, validateReportsQuery } = require('./validators');
const { processWithMock, detectNgWords, CATEGORIES } = require('./ai-mock');

/**
 * テストケース実行
 */
function runTests() {
  console.log('=== Incident Report API テストケース実行 ===\n');

  let passedTests = 0;
  let totalTests = 0;

  // バリデーションテスト
  console.log('1. バリデーションテスト');
  passedTests += testValidation();
  totalTests += 4;

  // AIモック処理テスト
  console.log('\n2. AIモック処理テスト');
  passedTests += testAiMock();
  totalTests += 3;

  // NGワード検出テスト
  console.log('\n3. NGワード検出テスト');
  passedTests += testNgWordDetection();
  totalTests += 2;

  // 統合テスト
  console.log('\n4. 統合テスト');
  passedTests += testIntegration();
  totalTests += 2;

  console.log(`\n=== テスト結果: ${passedTests}/${totalTests} 成功 ===`);

  if (passedTests === totalTests) {
    console.log('✅ すべてのテストが成功しました！');
    return true;
  } else {
    console.log('❌ 一部のテストが失敗しました。');
    return false;
  }
}

/**
 * バリデーションテスト
 */
function testValidation() {
  let passed = 0;

  // 正常なリクエスト
  const validRequest = {
    title: 'テストタイトル',
    body: 'テスト本文です。',
  };

  const validation1 = validateReportRequest(validRequest);
  if (validation1.isValid) {
    console.log('  ✅ 正常なリクエストのバリデーション');
    passed++;
  } else {
    console.log('  ❌ 正常なリクエストのバリデーション:', validation1.errors);
  }

  // 不正なリクエスト（titleなし）
  const invalidRequest = {
    body: 'テスト本文です。',
  };

  const validation2 = validateReportRequest(invalidRequest);
  if (!validation2.isValid && validation2.errors.some((e) => e.includes('title'))) {
    console.log('  ✅ 不正なリクエスト（titleなし）のバリデーション');
    passed++;
  } else {
    console.log('  ❌ 不正なリクエスト（titleなし）のバリデーション');
  }

  // AI出力の正常バリデーション
  const validAiOutput = {
    summary: 'テスト要約',
    tags: ['テスト', 'モック'],
    category: 'その他',
    anonymizedText: 'テスト本文',
    suggestedReplacements: [],
  };

  const aiValidation1 = validateAiOutput(validAiOutput);
  if (aiValidation1.isValid) {
    console.log('  ✅ 正常なAI出力のバリデーション');
    passed++;
  } else {
    console.log('  ❌ 正常なAI出力のバリデーション:', aiValidation1.errors);
  }

  // クエリパラメータのバリデーション
  const validQuery = {
    category: '環境設定ミス',
    from: '2024-01-01',
    to: '2024-12-31',
  };

  const queryValidation = validateReportsQuery(validQuery);
  if (queryValidation.isValid) {
    console.log('  ✅ クエリパラメータのバリデーション');
    passed++;
  } else {
    console.log('  ❌ クエリパラメータのバリデーション:', queryValidation.errors);
  }

  return passed;
}

/**
 * AIモック処理テスト
 */
function testAiMock() {
  let passed = 0;

  // 基本的なAI処理
  const title = 'データベース接続エラー';
  const body = 'データベースに接続できませんでした。設定を確認する必要があります。';

  const result1 = processWithMock(title, body);

  if (
    result1.aiResult &&
    result1.aiResult.summary &&
    result1.aiResult.tags &&
    Array.isArray(result1.aiResult.tags) &&
    CATEGORIES.includes(result1.aiResult.category)
  ) {
    console.log('  ✅ 基本的なAI処理');
    console.log(`    カテゴリ: ${result1.aiResult.category}`);
    console.log(`    タグ: ${result1.aiResult.tags.join(', ')}`);
    passed++;
  } else {
    console.log('  ❌ 基本的なAI処理');
  }

  // 決定論的処理の確認
  const result2 = processWithMock(title, body);

  if (JSON.stringify(result1.aiResult) === JSON.stringify(result2.aiResult)) {
    console.log('  ✅ 決定論的処理（同じ入力で同じ出力）');
    passed++;
  } else {
    console.log('  ❌ 決定論的処理（同じ入力で同じ出力）');
  }

  // 異なる入力での異なる出力
  const result3 = processWithMock('別のタイトル', '別の本文内容です。');

  if (JSON.stringify(result1.aiResult) !== JSON.stringify(result3.aiResult)) {
    console.log('  ✅ 異なる入力での異なる出力');
    passed++;
  } else {
    console.log('  ❌ 異なる入力での異なる出力');
  }

  return passed;
}

/**
 * NGワード検出テスト
 */
function testNgWordDetection() {
  let passed = 0;

  // NGワードを含むテキスト
  const textWithNg =
    '田中さんに相談して、test@example.comにメールを送りました。株式会社テストの件です。';

  const detection1 = detectNgWords(textWithNg);

  if (detection1.flags.containsDisallowed && detection1.detectedWords.length > 0) {
    console.log('  ✅ NGワード検出');
    console.log(`    検出されたワード: ${detection1.detectedWords.join(', ')}`);
    passed++;
  } else {
    console.log('  ❌ NGワード検出');
  }

  // NGワードを含まないテキスト
  const textWithoutNg = '今日はシステムの設定を確認しました。問題なく動作しています。';

  const detection2 = detectNgWords(textWithoutNg);

  if (!detection2.flags.containsDisallowed && detection2.detectedWords.length === 0) {
    console.log('  ✅ NGワードなしの検出');
    passed++;
  } else {
    console.log('  ❌ NGワードなしの検出');
  }

  return passed;
}

/**
 * 統合テスト
 */
function testIntegration() {
  let passed = 0;

  // NGワードを含むレポートの処理
  const title = 'データベース接続問題';
  const body =
    '田中部長に相談したところ、test@company.comの設定に問題があることが判明しました。株式会社テストシステムズの環境で発生。';

  const result = processWithMock(title, body);

  // AI処理結果の確認
  if (
    result.aiResult &&
    result.flags.containsDisallowed &&
    result.aiResult.suggestedReplacements.length > 0 &&
    result.aiResult.anonymizedText !== body
  ) {
    console.log('  ✅ NGワード含有レポートの統合処理');
    console.log(`    匿名化前: ${body.substring(0, 50)}...`);
    console.log(`    匿名化後: ${result.aiResult.anonymizedText.substring(0, 50)}...`);
    console.log(`    置換提案数: ${result.aiResult.suggestedReplacements.length}`);
    passed++;
  } else {
    console.log('  ❌ NGワード含有レポートの統合処理');
  }

  // バリデーション統合テスト
  const validationResult = validateAiOutput(result.aiResult);

  if (validationResult.isValid) {
    console.log('  ✅ AI出力のバリデーション統合テスト');
    passed++;
  } else {
    console.log('  ❌ AI出力のバリデーション統合テスト:', validationResult.errors);
  }

  return passed;
}

/**
 * サンプルAPIリクエストの生成
 */
function generateSampleRequests() {
  console.log('\n=== サンプルAPIリクエスト ===\n');

  console.log('1. ヘルスチェック:');
  console.log('curl -X GET https://YOUR_API_URL/health\n');

  console.log('2. レポート作成（正常ケース）:');
  console.log(`curl -X POST https://YOUR_API_URL/reports \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "データベース接続エラー",
    "body": "本日、システムのデータベースに接続できない問題が発生しました。設定ファイルを確認したところ、接続文字列に誤りがありました。"
  }'\n`);

  console.log('3. レポート作成（NGワード含有）:');
  console.log(`curl -X POST https://YOUR_API_URL/reports \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "顧客対応の問題",
    "body": "田中さんから連絡があり、株式会社テストシステムズの件でtest@example.comにメールを送る必要があります。"
  }'\n`);

  console.log('4. レポート取得（フィルタなし）:');
  console.log('curl -X GET https://YOUR_API_URL/reports\n');

  console.log('5. レポート取得（カテゴリフィルタ）:');
  console.log('curl -X GET "https://YOUR_API_URL/reports?category=環境設定ミス"\n');

  console.log('6. レポート取得（キーワード検索）:');
  console.log('curl -X GET "https://YOUR_API_URL/reports?q=データベース"\n');
}

// テスト実行
if (require.main === module) {
  const success = runTests();
  generateSampleRequests();

  process.exit(success ? 0 : 1);
}

module.exports = {
  runTests,
  testValidation,
  testAiMock,
  testNgWordDetection,
  testIntegration,
  generateSampleRequests,
};
