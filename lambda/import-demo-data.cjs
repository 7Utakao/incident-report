const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

// Environment variables
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';

// DynamoDB client setup
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// データ変換関数
function convertToDynamoFormat(item, index) {
  // 25件目以降は2人目のユーザーに変更
  const userId = index >= 25 ? 'd7c47a98-20a1-700d-3c21-111cfc8a7a45' : item.userId;

  return {
    ReportId: item.reportId,
    UserId: userId,
    Title: item.title,
    Body: item.body,
    Summary: item.body.substring(0, 100) + '...', // bodyから要約を生成
    Tags: [], // 空の配列
    Category: item.category,
    CreatedAt: new Date(item.createdAt).toISOString(), // ISO 8601形式に変換
    Improvements: item.improvements,
  };
}

// バッチ書き込み関数
async function batchWriteItems(items) {
  const BATCH_SIZE = 25; // DynamoDBの制限
  const batches = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 ${batches.length}個のバッチに分割しました`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📝 バッチ ${i + 1}/${batches.length} を処理中... (${batch.length}件)`);

    const putRequests = batch.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [DDB_REPORTS]: putRequests,
      },
    });

    try {
      const result = await docClient.send(command);

      // 未処理のアイテムがある場合は再試行
      if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
        console.log('⚠️  未処理のアイテムがあります。再試行中...');
        // 簡単な再試行ロジック
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryCommand = new BatchWriteCommand({
          RequestItems: result.UnprocessedItems,
        });
        await docClient.send(retryCommand);
      }

      console.log(`✅ バッチ ${i + 1} 完了`);
    } catch (error) {
      console.error(`❌ バッチ ${i + 1} でエラー:`, error);
      throw error;
    }

    // レート制限を避けるため少し待機
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

// メイン処理
async function main() {
  try {
    console.log('🚀 デモデータのインポートを開始します');
    console.log(`📋 テーブル名: ${DDB_REPORTS}`);
    console.log(`🌏 リージョン: ${AWS_REGION}`);

    // JSONファイルを読み込み
    const jsonPath = path.join(__dirname, '../docs/ai_incident_samples_prc.json');
    console.log(`📖 ファイルを読み込み中: ${jsonPath}`);

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`📊 ${data.items.length}件のデータを発見しました`);

    // データを変換（25件目以降は2人目のユーザーに変更）
    console.log('🔄 データを変換中...');
    const dynamoItems = data.items.map((item, index) => convertToDynamoFormat(item, index));

    // ユーザー分布を確認
    const userCounts = {};
    dynamoItems.forEach((item) => {
      userCounts[item.UserId] = (userCounts[item.UserId] || 0) + 1;
    });

    console.log('👥 ユーザー分布:');
    Object.entries(userCounts).forEach(([userId, count]) => {
      const userLabel =
        userId === '17b4ca98-4041-70bc-4264-d15a4fbf95ec' ? 'ユーザー1' : 'ユーザー2';
      console.log(`  ${userLabel} (${userId.substring(0, 8)}...): ${count}件`);
    });

    // サンプルデータを表示
    console.log('📋 変換後のサンプルデータ:');
    console.log(JSON.stringify(dynamoItems[0], null, 2));
    console.log('📋 2人目のユーザーのサンプル:');
    console.log(JSON.stringify(dynamoItems[25], null, 2));

    // DynamoDBに書き込み
    console.log('💾 DynamoDBに書き込み中...');
    await batchWriteItems(dynamoItems);

    console.log('🎉 インポート完了！');
    console.log(`✅ ${data.items.length}件のデータをDynamoDBに登録しました`);
    console.log(`👥 ユーザー1: ${userCounts['17b4ca98-4041-70bc-4264-d15a4fbf95ec']}件`);
    console.log(`👥 ユーザー2: ${userCounts['d7c47a98-20a1-700d-3c21-111cfc8a7a45']}件`);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = { main, convertToDynamoFormat };
