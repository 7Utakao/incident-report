# 基本方針に沿った実装ガイド＆Cline指示書

対象スタック：Nuxt 3 / Amplify(Auth=Cognito) / Amplify Hosting / API Gateway + Lambda / DynamoDB / Bedrock(Claude) / CloudWatch Logs

---

## 0. 妥当性と要点（結論）
- **構成は妥当**。将来の「Bedrock × DynamoDB」案件に横展開しやすく、運用も単純。
- ローカル `http://localhost:3000` でも問題なく動作（CORS と JWT 検証だけ正しく設定）。本番は Amplify Hosting に GitHub 連携で自動デプロイ。
- API は **API Gateway 経由**を基本（ステージ、WAF、メトリクス、カスタムドメインが使える）。Function URL は開発・検証用に限定。

---

## 1. リポジトリ標準構成（ワークスペース推奨）
```
repo/
  frontend/                # Nuxt3
    src/{pages,components,composables,utils,styles}
    tests/
  backend/                 # Lambda(Node18/20/22)
    src/{handlers,libs}
    tests/
  shared/                  # FE/BE共通
    schemas/ (Zod)
    errors/  (code→日本語)
    types/   (Zod infer)
  infra/                   # IaC(任意)
  docs/                    # 設計/テスト/運用
```

---

## 2. 環境変数と設定
### 2.1 フロント(Nuxt runtimeConfig)
- `NUXT_PUBLIC_API_BASE` : API Gateway のベースURL
- `NUXT_PUBLIC_AWS_REGION` : ap-northeast-1
- `NUXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NUXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- `NUXT_PUBLIC_COGNITO_IDENTITY_POOL_ID`（未使用なら不要）

### 2.2 Lambda(環境変数)
- `USER_POOL_ID` / `USER_POOL_CLIENT_ID`
- `AUTH_DEV_ALLOW` : `true|false`（ローカル/E2E向けバイパス）
- `AI_PROVIDER=bedrock`
- `BEDROCK_REGION=ap-northeast-1`
- `BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20240620-v1:0`
- `TABLE_REPORTS` : DynamoDB テーブル名
- `NODE_ENV=production`

---

## 3. IAM（最小権限ポリシー例）
### 3.1 Lambda 実行ロール
- CloudWatch Logs（書き込み）
- DynamoDB（対象テーブルのみ）：`GetItem`,`PutItem`,`UpdateItem`,`Query`,`Scan`
- Bedrock：`bedrock:InvokeModel`（モデルARNを限定）
- 例（抜粋・リソースは各自置換）
```json
{
  "Version":"2012-10-17",
  "Statement":[
    {"Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"*"},
    {"Effect":"Allow","Action":["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem","dynamodb:Query","dynamodb:Scan"],"Resource":["arn:aws:dynamodb:REG:ACC:table/TABLE","arn:aws:dynamodb:REG:ACC:table/TABLE/index/*"]},
    {"Effect":"Allow","Action":["bedrock:InvokeModel"],"Resource":["arn:aws:bedrock:REG::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"]}
  ]
}
```

---

## 4. データモデル（DynamoDB 単一テーブル）
**Reports**（PK/SK 物理テーブル、GSIでアクセスパターンを担保）
- **PK**: `REPORT#<reportId>` / **SK**: `META`
- **属性**: `title, body, summary, tags[], category, createdAt(ISO), userId, status`
- **補助エンティティ**
  - ユーザー合算: `USER#<userId>` / `REPORT#<createdAt>#<id>`（一覧）
- **GSI**
  - GSI1: `category`(PK) / `createdAt`(SK) → カテゴリ順・期間
  - GSI2: `createdAt`(PK固定 `ALL`) / `createdAt`(SK) → 全体の新着
  - GSI3: `tag`(PK) / `createdAt`(SK) → タグ別

> まずは GSI1/2 で開始。タグは後追いで投入可。

---

## 5. API 設計（API Gateway + Lambda）
- `GET /health` → `{ ok:true }`
- `GET /reports`（認証要）
  - クエリ: `q, category, from, to, limit, nextToken`
- `GET /reports/{id}`（認証要）
- `POST /reports:precheck`（匿名化・機密チェック）
  - 入: `body`
  - 出: `{ suggestedReplacements[], anonymizedText }`
- `POST /reports`（登録・AI要約/分類）
  - 入: `{ title?, body, category? }`
  - 出: `{ id }`
- `GET /stats/categories?scope=all|month|today`（集計）

**共通**：すべて JSON、Zod 検証、失敗時 `{ ok:false, error:{code,message} }`。

---

## 6. 生成AI(Claude) 呼び出し契約
- **プロンプト**: 前提（禁止情報・出力ルール）+ 原文
- **出力(JSON)**
```json
{
  "summary": "…",
  "tags": ["…"],
  "category": "WHY_…",
  "anonymizedText": "…",
  "suggestedReplacements": [{"from":"XXX","to":"[伏せ字]"}]
}
```
- Lambda で zod で厳密検証。検証失敗は再試行→失敗時は「保存のみ」で後日再集計。

---

## 7. 認証とCORS
- フロント→`Authorization: Bearer <idToken>` を付与。
- Lambda で JWK 検証（`iss`,`aud`,`exp`,`sub`）。
- CORS: API Gateway の **CORS 有効化** + レスポンスヘッダに `Access-Control-Allow-*` を付与。
- ローカルは `localhost:3000` を `AllowOrigins` に追加すればOK。

---

## 8. ログ・監査
- 構造化ログ(JSON)：`{level, ts, route, userSub, cid, detail}`
- 相関ID: `x-correlation-id` なければ生成（ULID）。
- 監査ログ（適用/却下、置換前後差分、時刻）を別パーティションに保存可。

---

## 9. フロント実装メモ（Nuxt）
- `useApi`：JWT 自動付与、401→/login へ誘導。
- 入力→`precheck`→置換提案→確定→`POST /reports`。
- ダッシュボード：`/stats/categories`（全体/今月）、所感は集計時のみAIで生成。

---

## 10. テスト（正常/異常/境界）
- **ユニット**：shared スキーマ境界（title 0/1/120/121、body 0/1/4000/4001、category 未定義）。
- **結合**：ハンドラー with DynamoDB Local or 実テーブル、認証モック／実トークン。
- **E2E**：ログイン→作成→一覧→集計。未ログイン→401→リダイレクト。日本語エラー表示の確認。

---

## 11. デプロイ順
1. DynamoDB テーブル作成（GSI1/2）
2. Lambda デプロイ（環境変数・ロール付与）
3. API Gateway 作成・統合・CORS
4. Amplify Hosting を GitHub リポに接続（環境変数設定）
5. ドメイン/HTTPS（任意）

---

## 12. Cline用 具体タスク
1. リポを 1章の構成へリファクタ（frontend/backend/shared）。
2. shared に Zod スキーマ・エラーカタログ移設。型を FE/BE で共有。
3. backend/libs に `auth.ts`(JWK検証), `logger.ts`, `dynamo.ts`, `ai.ts` を実装。
4. 5章API のハンドラーを作成、全レスポンスを JSON 契約化。
5. `POST /reports` で Claude 呼び出し → zod 検証 → 保存。
6. 401/403/404/429/500 の標準化（エラーコード→日本語）。
7. Nuxt 側：`useApi`/`useAuth`/画面接続、ダッシュボード棒グラフ（Chart.js）。
8. テスト整備（ユニット/結合/E2E）。
9. docs に画面/APIごとの設計書テンプレを複製し、境界値・日本語エラーを埋める。

---

## 13. チェックリスト
- [ ] FE/BE で **同一スキーマ** を参照
- [ ] すべてのエラーが **日本語短文**で表示
- [ ] 401 時は未ログイン誘導、403 は権限警告
- [ ] CORS と JWT 検証OK（localhost/Amplify 双方）
- [ ] 集計APIで **全体 / 今月** の両方が整合
- [ ] CloudWatch に相関ID付き構造化ログ

