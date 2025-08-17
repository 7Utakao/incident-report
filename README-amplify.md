# Incident Report System - AWS Amplify Hosting デプロイ手順

## 概要

インシデントレポートシステムを AWS Amplify Hosting を使用してデプロイする手順です。
Git push による自動デプロイで、Lambda API 関数と Nuxt.js フロントエンドの両方を管理します。

## アーキテクチャ

```
GitHub Repository
    ↓ (git push)
AWS Amplify Hosting
    ├── Frontend: Nuxt.js アプリケーション
    └── Backend: Lambda関数の自動更新
         ↓
AWS Lambda (incident-report-api-dev)
    ↓
Amazon DynamoDB (incident-report-Reports-dev)
```

## 前提条件

- AWS アカウント
- GitHub リポジトリ
- AWS Amplify Hosting の設定権限
- Lambda 関数と DynamoDB テーブルの作成権限

## プロジェクト構成

```
incident-report/
├── amplify.yml              # Amplifyビルド設定
├── README-amplify.md        # このファイル
├── nuxt.config.ts          # Nuxt.js設定
├── package.json            # フロントエンド依存関係
├── app/                    # Nuxt.jsアプリケーション
├── lambda/                 # Lambda関数
│   ├── index.js           # メインハンドラ
│   ├── package.json       # Lambda依存関係
│   ├── validators.js      # バリデーション
│   ├── ai-mock.js        # AIモック処理
│   └── ai-bedrock.js     # Bedrock接続準備
└── public/                # 静的ファイル
```

## セットアップ手順

### 1. AWS リソースの事前準備

#### DynamoDB テーブル作成

```bash
aws dynamodb create-table \
  --table-name incident-report-Reports-dev \
  --attribute-definitions \
    AttributeName=ReportId,AttributeType=S \
  --key-schema \
    AttributeName=ReportId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

#### Lambda 関数の初期作成

```bash
# 空のLambda関数を作成（Amplifyが後で更新）
aws lambda create-function \
  --function-name incident-report-api-dev \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://empty-function.zip \
  --region ap-northeast-1
```

### 2. IAM ロールの設定

Lambda 実行ロールに以下のポリシーをアタッチ：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:*:*:table/incident-report-Reports-dev"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

Amplify 用サービスロールに以下のポリシーを追加：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionCode", "lambda:UpdateFunctionConfiguration"],
      "Resource": "arn:aws:lambda:*:*:function:incident-report-api-*"
    }
  ]
}
```

### 3. AWS Amplify Hosting 設定

#### 3.1 アプリケーション作成

1. **AWS Amplify コンソール** にアクセス
2. **新しいアプリ** → **ウェブアプリをホスト**
3. **GitHub** を選択してリポジトリを接続
4. ブランチ: `main` (本番環境) / `develop` (ステージング環境)

#### 3.2 ビルド設定

Amplify が自動的に `amplify.yml` を検出します。
カスタム設定が必要な場合は、コンソールで編集可能です。

#### 3.3 環境変数設定

**本番環境 (main ブランチ):**

| 変数名               | 値                                   | 説明                 |
| -------------------- | ------------------------------------ | -------------------- |
| `AI_MODE`            | `mock`                               | AI モード            |
| `DDB_REPORTS`        | `incident-report-Reports-dev`        | DynamoDB テーブル名  |
| `BEDROCK_REGION`     | `us-east-1`                          | Bedrock 用リージョン |
| `BEDROCK_MODEL_ID`   | `anthropic.claude-3-sonnet-20240229` | Bedrock モデル       |
| `AWS_DEFAULT_REGION` | `ap-northeast-1`                     | AWS リージョン       |

**ステージング環境 (develop ブランチ):**

| 変数名                | 値                                   | 説明                                |
| --------------------- | ------------------------------------ | ----------------------------------- |
| `AI_MODE_STAGING`     | `mock`                               | AI モード（ステージング）           |
| `DDB_REPORTS_STAGING` | `incident-report-Reports-staging`    | DynamoDB テーブル名（ステージング） |
| `BEDROCK_REGION`      | `us-east-1`                          | Bedrock 用リージョン                |
| `BEDROCK_MODEL_ID`    | `anthropic.claude-3-sonnet-20240229` | Bedrock モデル                      |
| `AWS_DEFAULT_REGION`  | `ap-northeast-1`                     | AWS リージョン                      |

### 4. API Gateway 設定

Lambda 関数用の API Gateway HTTP API を作成：

```bash
# API作成
aws apigatewayv2 create-api \
  --name incident-report-api \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="Content-Type,Authorization"

# Lambda統合作成
aws apigatewayv2 create-integration \
  --api-id YOUR_API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:ap-northeast-1:YOUR_ACCOUNT:function:incident-report-api-dev

# ルート作成
aws apigatewayv2 create-route \
  --api-id YOUR_API_ID \
  --route-key "GET /health" \
  --target integrations/YOUR_INTEGRATION_ID

aws apigatewayv2 create-route \
  --api-id YOUR_API_ID \
  --route-key "POST /reports" \
  --target integrations/YOUR_INTEGRATION_ID

aws apigatewayv2 create-route \
  --api-id YOUR_API_ID \
  --route-key "GET /reports" \
  --target integrations/YOUR_INTEGRATION_ID
```

## デプロイフロー

### 自動デプロイ

1. **コードをプッシュ**

   ```bash
   git add .
   git commit -m "Update incident report system"
   git push origin main  # または develop
   ```

2. **Amplify が自動実行**

   - Lambda 関数の依存関係インストール
   - Lambda 関数の Zip ファイル作成
   - Lambda 関数コードの更新
   - Lambda 環境変数の更新
   - Nuxt.js アプリのビルド
   - 静的ファイルのデプロイ

3. **デプロイ完了**
   - フロントエンド: `https://main.YOUR_APP_ID.amplifyapp.com`
   - API: `https://YOUR_API_ID.execute-api.ap-northeast-1.amazonaws.com`

### 手動デプロイ（緊急時）

```bash
# Lambda関数のみ更新
cd lambda
npm install --production
zip -r ../incident-report-api-dev.zip .
aws lambda update-function-code \
  --function-name incident-report-api-dev \
  --zip-file fileb://../incident-report-api-dev.zip
```

## 動作確認

### 1. ヘルスチェック

```bash
curl -X GET https://YOUR_API_ID.execute-api.ap-northeast-1.amazonaws.com/health
```

**期待レスポンス:**

```json
{ "ok": true }
```

### 2. レポート作成テスト

```bash
curl -X POST https://YOUR_API_ID.execute-api.ap-northeast-1.amazonaws.com/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "データベース接続エラー",
    "body": "本日、顧客システムのデータベースに接続できない問題が発生しました。田中さんに相談したところ、設定ファイルの問題だと判明しました。"
  }'
```

### 3. フロントエンド確認

ブラウザで `https://main.YOUR_APP_ID.amplifyapp.com` にアクセス

## 監視とログ

### CloudWatch Logs

- **Lambda 関数ログ**: `/aws/lambda/incident-report-api-dev`
- **Amplify ビルドログ**: Amplify コンソールで確認

### メトリクス監視

```bash
# Lambda関数のメトリクス確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=incident-report-api-dev \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## トラブルシューティング

### よくある問題

1. **Amplify ビルドエラー**

   ```
   解決策: amplify.ymlの構文確認、環境変数の設定確認
   ```

2. **Lambda 更新失敗**

   ```
   解決策: IAMロールの権限確認、関数名の確認
   ```

3. **CORS エラー**

   ```
   解決策: API GatewayのCORS設定確認
   ```

4. **DynamoDB 接続エラー**
   ```
   解決策: テーブル名、IAMロール権限の確認
   ```

### ログ確認コマンド

```bash
# Amplifyビルドログ
aws amplify get-job --app-id YOUR_APP_ID --branch-name main --job-id JOB_ID

# Lambda関数ログ
aws logs describe-log-streams --log-group-name /aws/lambda/incident-report-api-dev
aws logs get-log-events --log-group-name /aws/lambda/incident-report-api-dev --log-stream-name STREAM_NAME
```

## 環境別設定

### 本番環境 (main ブランチ)

- Lambda 関数: `incident-report-api-dev`
- DynamoDB テーブル: `incident-report-Reports-dev`
- ドメイン: `https://main.YOUR_APP_ID.amplifyapp.com`

### ステージング環境 (develop ブランチ)

- Lambda 関数: `incident-report-api-dev-staging`
- DynamoDB テーブル: `incident-report-Reports-staging`
- ドメイン: `https://develop.YOUR_APP_ID.amplifyapp.com`

## セキュリティ考慮事項

1. **環境変数の暗号化**

   - 機密情報は AWS Systems Manager Parameter Store を使用

2. **API 認証**

   - 将来的に JWT 認証を実装予定

3. **CORS 設定**
   - 本番環境では特定ドメインのみ許可

## 次のステップ

1. **実際の DynamoDB 接続実装**

   - AWS SDK v3 の導入
   - `index.js`の dynamoDbClient 実装

2. **Bedrock 統合**

   - `ai-bedrock.js`の完全実装
   - 環境変数`AI_MODE=bedrock`への切り替え

3. **認証機能**

   - Cognito 統合
   - JWT 認証実装

4. **カスタムドメイン**
   - Route 53 での独自ドメイン設定

## 受け入れ基準チェックリスト

- [ ] Git push で Lambda 関数が自動更新される
- [ ] Git push でフロントエンドが自動デプロイされる
- [ ] GET /health が 200 を返す
- [ ] POST /reports でレポートが作成され、201 を返す
- [ ] GET /reports でフィルタ機能が動作する
- [ ] 環境別デプロイ（main/develop）が動作する
- [ ] CloudWatch Logs でログが確認できる
- [ ] フロントエンドと API が正常に連携する
