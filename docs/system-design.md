# インシデントレポートシステム 簡易設計書

## 1. システム概要

### 1.1 アーキテクチャ

```
[Frontend: Nuxt 3]
    ↓ HTTPS
[AWS Amplify Hosting]
    ↓ JWT Token
[Lambda Function URL]
    ↓
[Lambda Functions] → [DynamoDB] → [Bedrock Claude]
```

### 1.2 技術スタック

- **フロントエンド**: Nuxt 3, Vue 3, TailwindCSS
- **認証**: AWS Cognito
- **API**: AWS Lambda (Node.js 20)
- **データベース**: DynamoDB
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet)
- **ホスティング**: AWS Amplify
- **テスト**: Vitest

## 2. データモデル

### 2.1 DynamoDB テーブル構造

**Reports テーブル**

```
PK: REPORT#<reportId>
SK: META
属性:
- reportId: string
- userId: string
- title: string (1-120文字)
- body: string (1-4000文字)
- summary: string (AI生成)
- tags: string[] (AI生成)
- category: enum (WHY_TECHNICAL_KNOWLEDGE | WHY_ENVIRONMENT_SETUP | WHY_COMMUNICATION | WHY_SCHEDULE_MANAGEMENT | WHY_REQUIREMENT_UNDERSTANDING | WHY_OTHER)
- createdAt: string (ISO 8601)
- status: enum (DRAFT | PUBLISHED | ARCHIVED)
- pointsAwarded: number (デフォルト: 10)
- riskFlags: string[]
```

### 2.2 GSI 設計

- **GSI1**: category(PK) / createdAt(SK) - カテゴリ別検索
- **GSI2**: 'ALL'(PK) / createdAt(SK) - 全体の新着順

## 3. API 仕様

### 3.1 エンドポイント一覧

| メソッド | パス              | 説明             | 認証 |
| -------- | ----------------- | ---------------- | ---- |
| GET      | /health           | ヘルスチェック   | 不要 |
| GET      | /reports          | レポート一覧取得 | 必要 |
| GET      | /reports/{id}     | レポート詳細取得 | 必要 |
| POST     | /reports:precheck | 匿名化チェック   | 不要 |
| POST     | /reports          | レポート作成     | 必要 |
| GET      | /stats/categories | カテゴリ統計     | 必要 |

### 3.2 共通レスポンス形式

```typescript
// 成功時
{
  ok: true,
  data: any,
  correlationId?: string
}

// エラー時
{
  ok: false,
  error: {
    code: string,
    message: string, // 日本語
    details?: Record<string, any>,
    correlationId?: string
  }
}
```

### 3.3 エラーコード一覧

| コード                    | 日本語メッセージ                   | HTTP Status |
| ------------------------- | ---------------------------------- | ----------- |
| AUTH_REQUIRED             | ログインが必要です                 | 401         |
| AUTH_INVALID_TOKEN        | 認証情報が無効です                 | 401         |
| VALIDATION_REQUIRED_FIELD | 必須項目が入力されていません       | 400         |
| VALIDATION_TOO_LONG       | 入力文字数が上限を超えています     | 400         |
| RESOURCE_NOT_FOUND        | 指定されたリソースが見つかりません | 404         |
| SYSTEM_INTERNAL_ERROR     | システム内部エラーが発生しました   | 500         |

## 4. フロントエンド設計

### 4.1 ページ構成

```
/                    - ホーム（ダッシュボード）
/login              - ログイン
/reports            - レポート一覧
/reports/new        - レポート作成
/reports/[id]       - レポート詳細
/dashboard          - 統計ダッシュボード
```

### 4.2 主要コンポーネント

- **UI Components**: `components/ui/` - 再利用可能な UI コンポーネント
- **Report Components**: `components/reports/` - レポート関連コンポーネント
- **Layout Components**: `layouts/` - レイアウトコンポーネント

### 4.3 状態管理

- **Composables**: Vue 3 Composition API
- **useAuth**: 認証状態管理
- **useApi**: API 呼び出し管理
- **useLevel**: レベル・ポイント管理

## 5. セキュリティ

### 5.1 認証・認可

- **JWT Token**: Cognito 発行の ID トークンを使用
- **Token 検証**: Lambda 関数で JWK 検証
- **CORS**: 適切なオリジン設定

### 5.2 データ保護

- **匿名化**: AI による個人情報検出・置換提案
- **入力検証**: Zod スキーマによる厳密な検証
- **SQL インジェクション対策**: DynamoDB 使用により対策済み

## 6. パフォーマンス

### 6.1 フロントエンド

- **SSG**: Nuxt 3 の静的サイト生成
- **CDN**: Amplify Hosting による配信
- **コード分割**: 自動的なチャンク分割

### 6.2 バックエンド

- **Lambda**: サーバーレスによる自動スケーリング
- **DynamoDB**: 高速な NoSQL データベース
- **GSI**: 効率的なクエリパターン

## 7. 監視・ログ

### 7.1 ログ形式

```typescript
{
  level: 'info' | 'warn' | 'error',
  timestamp: string,
  route?: string,
  userSub?: string,
  correlationId: string,
  detail: Record<string, any>
}
```

### 7.2 監視項目

- **CloudWatch Logs**: 構造化ログ
- **相関 ID**: リクエスト追跡
- **エラー率**: システム健全性監視

## 8. デプロイメント

### 8.1 環境

- **開発**: ローカル開発環境
- **本番**: AWS Amplify + Lambda

### 8.2 CI/CD

- **GitHub 連携**: Amplify 自動デプロイ
- **Lambda**: 手動デプロイ（将来的に CI/CD 化予定）

## 9. テスト戦略

### 9.1 テスト種別

- **ユニットテスト**: 共有スキーマの境界値テスト
- **結合テスト**: API エンドポイントテスト
- **E2E テスト**: ユーザーフローテスト

### 9.2 テストツール

- **Vitest**: ユニット・結合テスト
- **MSW**: API モック
- **Testing Library**: コンポーネントテスト

## 10. 今後の改善予定

### 10.1 Phase 2 (将来実装)

- **API Gateway 導入**: Function URL → API Gateway 移行
- **タグ機能**: GSI3 によるタグ別検索
- **通知機能**: レポート作成時の通知
- **レポート編集**: 既存レポートの更新機能

### 10.2 Phase 3 (長期計画)

- **マルチテナント**: 組織別データ分離
- **高度な分析**: より詳細な統計・分析機能
- **モバイルアプリ**: ネイティブアプリ開発

---

**最終更新**: 2025 年 8 月 23 日  
**バージョン**: 1.0.0
