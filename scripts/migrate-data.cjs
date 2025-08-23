const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

// Environment variables
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';

// DynamoDB client setup
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function migrateData() {
  console.log('🔄 データ移行を開始します...');
  console.log(`テーブル名: ${DDB_REPORTS}`);
  console.log(`リージョン: ${AWS_REGION}`);

  try {
    // Step 1: 既存データをスキャンして取得
    console.log('\n📖 Step 1: 既存データの取得');
    const scanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
    });

    const scanResult = await docClient.send(scanCommand);
    const existingItems = scanResult.Items || [];

    console.log(`取得したアイテム数: ${existingItems.length}`);

    if (existingItems.length === 0) {
      console.log('移行対象のデータがありません。');
      return;
    }

    // Step 2: 既存データの構造を確認
    console.log('\n🔍 Step 2: データ構造の確認');
    const sampleItem = existingItems[0];
    console.log('サンプルアイテム:', JSON.stringify(sampleItem, null, 2));

    // 新しい構造のアイテムかどうかチェック
    const hasNewStructure = sampleItem.PK && sampleItem.SK;
    if (hasNewStructure) {
      console.log('✅ データは既に新しい構造になっています。移行は不要です。');
      return;
    }

    // Step 3: データを新しい構造に変換
    console.log('\n🔄 Step 3: データの変換と移行');
    let migratedCount = 0;
    let errorCount = 0;

    for (const item of existingItems) {
      try {
        // 古い構造から新しい構造に変換
        const migratedItem = {
          // Primary Key
          PK: `REPORT#${item.ReportId}`,
          SK: 'META',

          // GSI Keys
          GSI1PK: item.Category,
          GSI1SK: item.CreatedAt,
          GSI2PK: 'ALL',
          GSI2SK: item.CreatedAt,

          // Report Data (既存データをそのまま保持)
          ReportId: item.ReportId,
          UserId: item.UserId,
          Title: item.Title,
          Body: item.Body,
          Summary: item.Summary,
          Tags: item.Tags,
          Category: item.Category,
          CreatedAt: item.CreatedAt,
          Improvements: item.Improvements,
        };

        // 新しい構造でデータを保存
        const putCommand = new PutCommand({
          TableName: DDB_REPORTS,
          Item: migratedItem,
        });

        await docClient.send(putCommand);
        migratedCount++;

        console.log(`✅ 移行完了: ${item.ReportId} (${migratedCount}/${existingItems.length})`);
      } catch (error) {
        console.error(`❌ 移行エラー: ${item.ReportId}`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 移行結果:`);
    console.log(`成功: ${migratedCount}件`);
    console.log(`エラー: ${errorCount}件`);

    // Step 4: 古いアイテムの削除（安全確認後）
    if (migratedCount > 0 && errorCount === 0) {
      console.log('\n🗑️ Step 4: 古いアイテムの削除');
      console.log('注意: 古いアイテムを削除します。この操作は元に戻せません。');

      // 実際の削除は手動で実行するようにコメントアウト
      /*
      for (const item of existingItems) {
        try {
          const deleteCommand = new DeleteCommand({
            TableName: DDB_REPORTS,
            Key: {
              ReportId: item.ReportId,
            },
          });

          await docClient.send(deleteCommand);
          console.log(`🗑️ 削除完了: ${item.ReportId}`);
        } catch (error) {
          console.error(`❌ 削除エラー: ${item.ReportId}`, error);
        }
      }
      */

      console.log('⚠️ 古いアイテムの削除はコメントアウトされています。');
      console.log('   データの整合性を確認後、手動で削除してください。');
    }

    console.log('\n✅ データ移行が完了しました！');
  } catch (error) {
    console.error('❌ データ移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行確認
async function confirmMigration() {
  console.log('🔍 移行後のデータ確認');

  try {
    const scanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
      Limit: 5, // サンプルとして5件取得
    });

    const result = await docClient.send(scanCommand);
    const items = result.Items || [];

    console.log(`\n📊 移行後のデータサンプル (${items.length}件):`);
    items.forEach((item, index) => {
      console.log(`\nアイテム ${index + 1}:`);
      console.log(`  PK: ${item.PK}`);
      console.log(`  SK: ${item.SK}`);
      console.log(`  GSI1PK: ${item.GSI1PK}`);
      console.log(`  GSI1SK: ${item.GSI1SK}`);
      console.log(`  GSI2PK: ${item.GSI2PK}`);
      console.log(`  GSI2SK: ${item.GSI2SK}`);
      console.log(`  ReportId: ${item.ReportId}`);
      console.log(`  Title: ${item.Title}`);
      console.log(`  Category: ${item.Category}`);
    });
  } catch (error) {
    console.error('❌ データ確認中にエラーが発生しました:', error);
  }
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--confirm')) {
    await confirmMigration();
  } else {
    await migrateData();
    console.log('\n💡 移行後のデータを確認するには:');
    console.log('   node scripts/migrate-data.js --confirm');
  }
}

main().catch(console.error);
