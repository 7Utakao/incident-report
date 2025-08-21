# Lambda Function Deployment Guide

## 概要

incident-report システム用の Lambda 関数です。DynamoDB と統合してレポートの CRUD 操作を提供します。

## 環境変数

Lambda 関数に以下の環境変数を設定してください：

- `DDB_REPORTS`: `incident-report-Reports-dev`
- `AWS_REGION`: `ap-northeast-1`

## デプロイ手順

### 1. 依存関係のインストール

```bash
cd lambda
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. ZIP 作成

```bash
npm run zip
```

### 4. Lambda 関数の更新

AWS コンソールまたは CLI で `function.zip` をアップロードしてください。

```bash
aws lambda update-function-code \
  --function-name ir-report-api-dev \
  --zip-file fileb://function.zip \
  --region ap-northeast-1
```

## API エンドポイント

### GET /health

- 認証: 不要
- レスポンス: `{ "ok": true }`

### POST /reports

- 認証: JWT 必須
- リクエスト: `{ "body": string, "title"?: string, "category": string, "tags"?: string[] }`
- レスポンス: `{ "reportId": string }`

### GET /reports

- 認証: JWT 必須
- クエリパラメータ: `category`, `from`, `to`, `nextToken`, `q`
- レスポンス: `{ "items": Report[], "nextToken"?: string }`

### GET /reports/{id}

- 認証: JWT 必須
- レスポンス: `Report`

## テスト用 cURL コマンド

```bash
# Health check
curl -i https://j14epmghod.execute-api.ap-northeast-1.amazonaws.com/health

# Create report (要JWT)
curl -i -X POST \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"body":"テスト本文","title":"テスト","category":"設定ミス","tags":["test"]}' \
  https://j14epmghod.execute-api.ap-northeast-1.amazonaws.com/reports

# List reports (要JWT)
curl -i \
  -H "Authorization: Bearer <ID_TOKEN>" \
  "https://j14epmghod.execute-api.ap-northeast-1.amazonaws.com/reports"

# Get report by ID (要JWT)
curl -i \
  -H "Authorization: Bearer <ID_TOKEN>" \
  https://j14epmghod.execute-api.ap-northeast-1.amazonaws.com/reports/<REPORT_ID>
```
