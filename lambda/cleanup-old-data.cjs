const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Environment variables
const DDB_REPORTS = process.env.DDB_REPORTS || 'incident-report-Reports-dev';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';

// DynamoDB client setup
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function cleanupOldData() {
  console.log('🧹 古いデータ構造のクリーンアップを開始します...');
  console.log(`テーブル名: ${DDB_REPORTS}`);
  console.log(`リージョン: ${AWS_REGION}`);

  try {
    // Step 1: 全データをスキャンして取得
    console.log('\n📖 Step 1: 全データの取得');
    const scanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
    });

    const scanResult = await docClient.send(scanCommand);
    const allItems = scanResult.Items || [];

    console.log(`取得したアイテム数: ${allItems.length}`);

    if (allItems.length === 0) {
      console.log('データがありません。');
      return;
    }

    // Step 2: 新旧データの分類
    console.log('\n🔍 Step 2: データ構造の分析');
    const oldStructureItems = [];
    const newStructureItems = [];

    for (const item of allItems) {
      if (item.PK && item.SK) {
        // 新しい構造
        newStructureItems.push(item);
      } else if (item.ReportId && !item.PK) {
        // 古い構造
        oldStructureItems.push(item);
      }
    }

    console.log(`新しい構造のアイテム: ${newStructureItems.length}件`);
    console.log(`古い構造のアイテム: ${oldStructureItems.length}件`);

    // Step 3: サンプル表示
    if (oldStructureItems.length > 0) {
      console.log('\n📋 古い構造のサンプル:');
      const sample = oldStructureItems[0];
      console.log(`  ReportId: ${sample.ReportId}`);
      console.log(`  Title: ${sample.Title}`);
      console.log(`  Category: ${sample.Category}`);
      console.log(`  CreatedAt: ${sample.CreatedAt}`);
    }

    if (newStructureItems.length > 0) {
      console.log('\n📋 新しい構造のサンプル:');
      const sample = newStructureItems[0];
      console.log(`  PK: ${sample.PK}`);
      console.log(`  SK: ${sample.SK}`);
      console.log(`  GSI1PK: ${sample.GSI1PK}`);
      console.log(`  GSI1SK: ${sample.GSI1SK}`);
      console.log(`  ReportId: ${sample.ReportId}`);
    }

    // Step 4: 古いデータの削除
    if (oldStructureItems.length > 0) {
      console.log(`\n🗑️ Step 3: 古い構造のアイテムを削除します (${oldStructureItems.length}件)`);

      let deletedCount = 0;
      let errorCount = 0;

      for (const item of oldStructureItems) {
        try {
          const deleteCommand = new DeleteCommand({
            TableName: DDB_REPORTS,
            Key: {
              ReportId: item.ReportId,
            },
          });

          await docClient.send(deleteCommand);
          deletedCount++;
          console.log(
            `✅ 削除完了: ${item.ReportId} (${deletedCount}/${oldStructureItems.length})`,
          );
        } catch (error) {
          console.error(`❌ 削除エラー: ${item.ReportId}`, error);
          errorCount++;
        }
      }

      console.log(`\n📊 削除結果:`);
      console.log(`成功: ${deletedCount}件`);
      console.log(`エラー: ${errorCount}件`);
    } else {
      console.log('\n✅ 古い構造のアイテムは見つかりませんでした。');
    }

    // Step 5: 最終確認
    console.log('\n🔍 Step 4: クリーンアップ後の確認');
    const finalScanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
    });

    const finalResult = await docClient.send(finalScanCommand);
    const finalItems = finalResult.Items || [];

    const finalOldItems = finalItems.filter((item) => item.ReportId && !item.PK);
    const finalNewItems = finalItems.filter((item) => item.PK && item.SK);

    console.log(`\n📊 最終結果:`);
    console.log(`総アイテム数: ${finalItems.length}件`);
    console.log(`新しい構造: ${finalNewItems.length}件`);
    console.log(`古い構造: ${finalOldItems.length}件`);

    if (finalOldItems.length === 0) {
      console.log('\n✅ クリーンアップが完了しました！');
      console.log('すべてのデータが新しい構造に統一されました。');
    } else {
      console.log('\n⚠️ まだ古い構造のアイテムが残っています。');
    }
  } catch (error) {
    console.error('❌ クリーンアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// 確認用関数
async function confirmData() {
  console.log('🔍 データ構造の確認');

  try {
    const scanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
      Limit: 10, // サンプルとして10件取得
    });

    const result = await docClient.send(scanCommand);
    const items = result.Items || [];

    console.log(`\n📊 データサンプル (${items.length}件):`);

    items.forEach((item, index) => {
      console.log(`\nアイテム ${index + 1}:`);
      if (item.PK && item.SK) {
        console.log(`  [新構造] PK: ${item.PK}, SK: ${item.SK}`);
        console.log(`  ReportId: ${item.ReportId}`);
        console.log(`  Title: ${item.Title}`);
      } else if (item.ReportId && !item.PK) {
        console.log(`  [旧構造] ReportId: ${item.ReportId}`);
        console.log(`  Title: ${item.Title}`);
      } else {
        console.log(`  [不明] ${JSON.stringify(item, null, 2)}`);
      }
    });

    // 統計情報
    const allScanCommand = new ScanCommand({
      TableName: DDB_REPORTS,
    });
    const allResult = await docClient.send(allScanCommand);
    const allItems = allResult.Items || [];

    const oldCount = allItems.filter((item) => item.ReportId && !item.PK).length;
    const newCount = allItems.filter((item) => item.PK && item.SK).length;

    console.log(`\n📈 統計情報:`);
    console.log(`総アイテム数: ${allItems.length}件`);
    console.log(`新しい構造: ${newCount}件`);
    console.log(`古い構造: ${oldCount}件`);
  } catch (error) {
    console.error('❌ データ確認中にエラーが発生しました:', error);
  }
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--confirm')) {
    await confirmData();
  } else if (args.includes('--dry-run')) {
    console.log('🔍 ドライラン: 削除は実行せず、対象データのみ表示します');
    // ドライラン実装は省略（必要に応じて追加）
  } else {
    console.log('⚠️ 重要: この操作は古いデータ構造のアイテムを完全に削除します。');
    console.log('新しい構造のデータは保持されます。');
    console.log('');
    await cleanupOldData();
    console.log('\n💡 データ確認するには:');
    console.log('   node scripts/cleanup-old-data.cjs --confirm');
  }
}

main().catch(console.error);
