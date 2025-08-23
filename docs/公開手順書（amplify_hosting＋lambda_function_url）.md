# 公開手順書（Amplify Hosting＋Lambda Function URL）

> 対象：リファクタ／テスト／設計書整備が完了したリポジトリを **API Gateway なし**で公開する。
> フロント：Amplify Hosting、バックエンド：Lambda Function URL（Cognito JWTはLambda内で検証）

---

## 0. 前提
- リポ構成：`frontend/`（Nuxt3） / `backend/`（Lambda） / `shared/`（Zod 等共有）
- Lambda 実行ロール：CloudWatch Logs 書込、DynamoDB（対象テーブル/Index）、Bedrock Invoke 付与済み
- 環境：`ap-northeast-1`

---

## 1. バックエンド公開（Lambda Function URL 継続）
### 1-1. Lambda 環境変数の最終確認
- `USER_POOL_ID` = `ap-northeast-1_XXXXXXX`
- `USER_POOL_CLIENT_ID` = `<Cognito App Client ID>`
- `AUTH_DEV_ALLOW` = `false`
- `TABLE_REPORTS` = `incident-report-Reports-<stage>`
- `BEDROCK_REGION` = `ap-northeast-1`
- `BEDROCK_MODEL` = `anthropic.claude-3-5-sonnet-20240620-v1:0`
- `NODE_ENV` = `production`

> 変更があれば **再デプロイ**（`backend/` からビルド→zip→更新）。

### 1-2. Function URL の CORS を本番向けに絞る
（`<FUNC_NAME>` と `<AMPLIFY_URL>` は置換）
```bash
aws lambda update-function-url-config \
  --function-name <FUNC_NAME> \
  --auth-type NONE \
  --cors AllowOrigins="https://<AMPLIFY_URL>,http://localhost:3000",\
AllowMethods="GET,POST,PUT,DELETE,OPTIONS",\
AllowHeaders="Content-Type,Authorization",\
AllowCredentials=true \
  --region ap-northeast-1
```

### 1-3. ヘルスチェックと 401/200 動作確認
```bash
FUNC_URL=$(aws lambda get-function-url-config \
  --function-name <FUNC_NAME> --region ap-northeast-1 \
  --query FunctionUrl --output text)

# 1) Health (200)
curl -sS "$FUNC_URL/health"

# 2) 未認証で /reports は 401
test $(curl -s -o /dev/null -w "%{http_code}" "$FUNC_URL/reports") -eq 401 && echo OK || echo NG

# 3) 認証付き（IDトークンをセット）
#   TOKEN に Cognito の id_token を入れる（手動取得 or フロントからコピー）
curl -sS -H "Authorization: Bearer $TOKEN" "$FUNC_URL/reports"
```

---

## 2. フロント公開（Amplify Hosting）
### 2-1. リポ準備（Nuxt3）
- `frontend/.nvmrc`（例：`20`）
- `frontend/package.json` の scripts：
  - `build`: `nuxt build`
  - `preview`: `nuxt preview`
- `nuxt.config.ts`（runtimeConfig）
```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE, // ← ここに統一
      awsRegion: process.env.NUXT_PUBLIC_AWS_REGION,
      userPoolId: process.env.NUXT_PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.NUXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
    }
  }
})
```

### 2-2. Amplify Hosting を GitHub 連携
1. Amplify コンソール → New app → Host web app → GitHub 連携
2. 対象リポとブランチを選択（例：`main`）
3. **Environment variables**（下記を設定）
   - `NUXT_PUBLIC_API_BASE` = `<FUNC_URL>`
   - `NUXT_PUBLIC_AWS_REGION` = `ap-northeast-1`
   - `NUXT_PUBLIC_COGNITO_USER_POOL_ID` = `ap-northeast-1_XXXXXXX`
   - `NUXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` = `<CLIENT_ID>`
4. ビルド開始

> 必要なら `amplify.yml` を追加（標準検出で動くことが多い）
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.output/public
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**
```

### 2-3. フロント動作スモークテスト
- `https://<branch>.<appId>.amplifyapp.com` を開く
- ログイン → レポート一覧が表示（401→リダイレクトが無限に起きない）
- DevTools Network：`/reports` へのリクエストが `200`、CORS OK（Origin=Amplify URL）

---

## 3. 認証フロー確認（Cognito）
- デモユーザー作成（初回変更なしの永久パス）
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <POOL_ID> \
  --username demo \
  --password 'StrongDemoPass!234' \
  --permanent
```
- サインイン → トークン付与 → API 200 を確認

---

## 4. データ／集計の整合性確認
- 新規レポート作成 → 一覧に反映 → ダッシュボード集計（全体／今月）
- カテゴリ名・タグの表示と色分けが仕様どおりか

---

## 5. 監視・ログ
- CloudWatch Logs：`/aws/lambda/<FUNC_NAME>`
  - 相関ID、ルート、httpStatus、ms、userSub が出ているか
- エラー発生時：日本語メッセージで返ること（UI での表示確認）

---

## 6. 切替とロールバック
- 切替（API Base のみ差し替え）：Amplify の環境変数 `NUXT_PUBLIC_API_BASE` を更新 → 再ビルド
- ロールバック：直前の値へ戻すだけ（バックエンド改修不要）

---

## 7. よくある詰まりと対処
- **401 Unauthorized**：
  - フロントが **id_token** を送っているか（`Authorization: Bearer`）
  - Lambda の `USER_POOL_ID / USER_POOL_CLIENT_ID` が一致しているか
  - トークンの `iss/aud/exp/sub` 検証ログに失敗理由が出ているか
- **CORS エラー**：
  - Function URL の `AllowOrigins` に Amplify URL を追加済みか
  - `AllowHeaders` に `Authorization` が含まれているか
- **DynamoDB アクセス不可**：
  - ロールに対象テーブル／GSI の ARN 権限があるか
- **Bedrock 失敗**：
  - `BEDROCK_REGION/MODEL` が正しいか、呼び出しのクォータに達していないか

---

## 付録 A：バックエンド再デプロイ（例）
```bash
cd backend
npm ci && npm run build
# 出力: index.js を zip
powershell -Command "Compress-Archive -Path index.js -DestinationPath function.zip -Force"
aws lambda update-function-code \
  --function-name <FUNC_NAME> \
  --zip-file fileb://function.zip \
  --region ap-northeast-1
```

## 付録 B：ローカル動作との併用
- CORS の `AllowOrigins` に `http://localhost:3000` を残し、Amplify URL と併記
- `frontend/.env`（ローカル）
```
NUXT_PUBLIC_API_BASE=<FUNC_URL>
NUXT_PUBLIC_AWS_REGION=ap-northeast-1
NUXT_PUBLIC_COGNITO_USER_POOL_ID=<POOL_ID>
NUXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=<CLIENT_ID>
```

---

### 完了条件（チェックリスト）
- [ ] Amplify URL でログイン→一覧→新規作成→ダッシュボードまで遷移OK
- [ ] `/reports` が 200、401/403/429 が日本語メッセージで正しくハンドリング
- [ ] CloudWatch に構造化ログ（相関ID、userSub、httpStatus、ms）が出ている
- [ ] CORS が Amplify URL と localhost に限定されている
- [ ] いつでも `NUXT_PUBLIC_API_BASE` 差し替えでロールバック可能

