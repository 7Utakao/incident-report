# データモデル設計書

## 概要

Incident Report System のデータモデル設計仕様書です。AWS DynamoDB を使用したデータ構造とアクセスパターンについて記述します。

## データベース構成

### 使用技術

- **データベース**: AWS DynamoDB
- **アクセス方式**: AWS SDK for JavaScript v3
- **データ形式**: JSON（DynamoDB 形式）

### テーブル一覧

#### v1.0（現在）

- `incident-report-Reports-dev` - レポートデータ

#### v2.0（予定）

- `incident-report-Users-dev` - ユーザーデータ
- `incident-report-AuditLogs-dev` - 監査ログ
- 単一テーブル設計への移行検討

## テーブル設計

### 1. Reports テーブル

#### テーブル名

- 開発環境: `incident-report-Reports-dev`
- 本番環境: `incident-report-Reports-prod`

#### 属性一覧

| 属性名    | 型                | 説明                            | 例                                      |
| --------- | ----------------- | ------------------------------- | --------------------------------------- |
| ReportId  | String (PK)       | レポート一意識別子              | `550e8400-e29b-41d4-a716-446655440000`  |
| UserId    | String            | ユーザー識別子（v1 では固定値） | `dummy-user`                            |
| Title     | String            | レポートタイトル                | `データベース接続エラーが発生`          |
| Body      | String            | レポート本文                    | `本日午前中にデータベースへの接続が...` |
| AiResult  | String (JSON)     | AI 分析結果                     | `{"summary":"要約","tags":["タグ1"]}`   |
| CreatedAt | String (ISO 8601) | 作成日時                        | `2024-01-15T10:30:00.000Z`              |
| UpdatedAt | String (ISO 8601) | 更新日時（v2 で追加予定）       | `2024-01-15T10:30:00.000Z`              |
| Category  | String            | カテゴリ                        | `環境設定ミス`                          |
| Tags      | StringSet         | タグ一覧                        | `["データベース", "接続エラー"]`        |

#### 主キー構成

- **パーティションキー**: `ReportId` (String)
- **ソートキー**: なし

#### グローバルセカンダリインデックス（GSI）

##### GSI1: Category-CreatedAt-Index

- **目的**: カテゴリ別の時系列検索
- **パーティションキー**: `Category` (String)
- **ソートキー**: `CreatedAt` (String)
- **射影**: ALL

```javascript
// 使用例: 特定カテゴリの最新レポート取得
const params = {
  TableName: 'incident-report-Reports-dev',
  IndexName: 'Category-CreatedAt-Index',
  KeyConditionExpression: 'Category = :category',
  ExpressionAttributeValues: {
    ':category': { S: '環境設定ミス' },
  },
  ScanIndexForward: false, // 降順（最新順）
  Limit: 10,
};
```

#### データ例

```json
{
  "ReportId": { "S": "550e8400-e29b-41d4-a716-446655440000" },
  "UserId": { "S": "dummy-user" },
  "Title": { "S": "データベース接続エラーが発生" },
  "Body": {
    "S": "本日午前中にデータベースへの接続が不安定になり、ユーザーがログインできない状況が発生しました。原因を調査したところ、接続プールの設定に問題があることが判明しました。"
  },
  "AiResult": {
    "S": "{\"summary\":\"データベース接続プールの設定問題により、ユーザーログインが不可能になった障害\",\"tags\":[\"データベース\",\"接続エラー\",\"設定ミス\"],\"category\":\"環境設定ミス\",\"anonymizedText\":\"本日午前中にデータベースへの接続が不安定になり、ユーザーがログインできない状況が発生しました。原因を調査したところ、接続プールの設定に問題があることが判明しました。\",\"suggestedReplacements\":[]}"
  },
  "CreatedAt": { "S": "2024-01-15T10:30:00.000Z" },
  "Category": { "S": "環境設定ミス" },
  "Tags": { "SS": ["データベース", "接続エラー", "設定ミス"] }
}
```

### 2. Users テーブル（v2.0 予定）

#### テーブル名

- 開発環境: `incident-report-Users-dev`
- 本番環境: `incident-report-Users-prod`

#### 属性一覧

| 属性名      | 型                | 説明                   | 例                                     |
| ----------- | ----------------- | ---------------------- | -------------------------------------- |
| UserId      | String (PK)       | ユーザー一意識別子     | `user-123456`                          |
| CognitoSub  | String            | Cognito ユーザー識別子 | `12345678-1234-1234-1234-123456789012` |
| Email       | String            | メールアドレス         | `user@example.com`                     |
| DisplayName | String            | 表示名                 | `山田太郎`                             |
| Role        | String            | ユーザーロール         | `user`, `admin`                        |
| CreatedAt   | String (ISO 8601) | 作成日時               | `2024-01-15T10:30:00.000Z`             |
| LastLoginAt | String (ISO 8601) | 最終ログイン日時       | `2024-01-15T10:30:00.000Z`             |
| ReportCount | Number            | 投稿レポート数         | `15`                                   |
| Points      | Number            | 獲得ポイント           | `150`                                  |
| Badges      | StringSet         | 獲得バッジ             | `["初回投稿", "月間5投稿"]`            |

#### 主キー構成

- **パーティションキー**: `UserId` (String)
- **ソートキー**: なし

#### グローバルセカンダリインデックス（GSI）

##### GSI1: CognitoSub-Index

- **目的**: Cognito 認証からのユーザー検索
- **パーティションキー**: `CognitoSub` (String)
- **射影**: ALL

### 3. AuditLogs テーブル（v2.0 予定）

#### テーブル名

- 開発環境: `incident-report-AuditLogs-dev`
- 本番環境: `incident-report-AuditLogs-prod`

#### 属性一覧

| 属性名       | 型            | 説明                 | 例                                         |
| ------------ | ------------- | -------------------- | ------------------------------------------ |
| LogId        | String (PK)   | ログ一意識別子       | `log-550e8400-e29b-41d4-a716-446655440000` |
| Timestamp    | String (SK)   | タイムスタンプ       | `2024-01-15T10:30:00.000Z`                 |
| UserId       | String        | 操作ユーザー         | `user-123456`                              |
| Action       | String        | 操作種別             | `CREATE_REPORT`, `VIEW_REPORT`             |
| ResourceType | String        | リソース種別         | `REPORT`, `USER`                           |
| ResourceId   | String        | リソース ID          | `550e8400-e29b-41d4-a716-446655440000`     |
| IpAddress    | String        | IP アドレス          | `192.168.1.100`                            |
| UserAgent    | String        | ユーザーエージェント | `Mozilla/5.0...`                           |
| Details      | String (JSON) | 詳細情報             | `{"title":"変更前タイトル"}`               |

#### 主キー構成

- **パーティションキー**: `LogId` (String)
- **ソートキー**: `Timestamp` (String)

## アクセスパターン

### 1. レポート関連

#### パターン 1: レポート作成

```javascript
const putParams = {
  TableName: 'incident-report-Reports-dev',
  Item: {
    ReportId: { S: uuidv4() },
    UserId: { S: 'dummy-user' },
    Title: { S: title },
    Body: { S: body },
    AiResult: { S: JSON.stringify(aiResult) },
    CreatedAt: { S: new Date().toISOString() },
    Category: { S: aiResult.category },
    Tags: { SS: aiResult.tags },
  },
};
```

#### パターン 2: レポート一覧取得（全件）

```javascript
const scanParams = {
  TableName: 'incident-report-Reports-dev',
  FilterExpression: 'CreatedAt BETWEEN :from AND :to',
  ExpressionAttributeValues: {
    ':from': { S: '2024-01-01T00:00:00.000Z' },
    ':to': { S: '2024-01-31T23:59:59.999Z' },
  },
};
```

#### パターン 3: カテゴリ別レポート取得

```javascript
const queryParams = {
  TableName: 'incident-report-Reports-dev',
  IndexName: 'Category-CreatedAt-Index',
  KeyConditionExpression: 'Category = :category AND CreatedAt BETWEEN :from AND :to',
  ExpressionAttributeValues: {
    ':category': { S: '環境設定ミス' },
    ':from': { S: '2024-01-01T00:00:00.000Z' },
    ':to': { S: '2024-01-31T23:59:59.999Z' },
  },
};
```

#### パターン 4: レポート詳細取得

```javascript
const getParams = {
  TableName: 'incident-report-Reports-dev',
  Key: {
    ReportId: { S: '550e8400-e29b-41d4-a716-446655440000' },
  },
};
```

### 2. 統計情報取得

#### パターン 5: カテゴリ別集計

```javascript
// DynamoDB では集計クエリが制限されるため、
// アプリケーション側で集計処理を実装
const scanParams = {
  TableName: 'incident-report-Reports-dev',
  ProjectionExpression: 'Category, CreatedAt',
};
```

## パフォーマンス考慮事項

### 読み取り容量設定

- **v1.0**: オンデマンド課金
- **v2.0**: プロビジョニング済み容量（予測ベース）

### 書き込み容量設定

- **v1.0**: オンデマンド課金
- **v2.0**: プロビジョニング済み容量（予測ベース）

### 最適化戦略

#### 1. ホットパーティション対策

- レポート ID に UUID を使用してパーティション分散
- 時系列データの偏りを避けるためのキー設計

#### 2. クエリ最適化

- GSI を活用した効率的な検索
- 不要な属性の射影除外
- ページネーション実装

#### 3. コスト最適化

- TTL（Time To Live）設定による古いデータの自動削除（v2.0）
- 適切な射影設定によるストレージ使用量削減

## 将来の拡張計画

### 単一テーブル設計への移行（v3.0 検討）

#### 設計方針

```
PK: ENTITY#<EntityType>#<EntityId>
SK: METADATA#<Timestamp>

例:
PK: REPORT#550e8400-e29b-41d4-a716-446655440000
SK: METADATA#2024-01-15T10:30:00.000Z

PK: USER#user-123456
SK: METADATA#2024-01-15T10:30:00.000Z

PK: CATEGORY#環境設定ミス
SK: REPORT#2024-01-15T10:30:00.000Z#550e8400-e29b-41d4-a716-446655440000
```

#### メリット

- テーブル数の削減
- 複雑なクエリの効率化
- 運用コストの削減

#### 移行課題

- 既存データの移行作業
- アプリケーションロジックの大幅変更
- 開発チームの学習コスト

### データ分析基盤連携（v2.0）

#### Amazon Kinesis Data Streams

- リアルタイムデータストリーミング
- レポート投稿イベントの配信

#### Amazon S3 + Amazon Athena

- 長期データ保存
- 複雑な分析クエリの実行

#### Amazon QuickSight

- ダッシュボード作成
- ビジネスインテリジェンス機能

## データ保護・セキュリティ

### 暗号化

- **保存時暗号化**: DynamoDB 管理キー使用
- **転送時暗号化**: HTTPS/TLS 1.2 以上

### アクセス制御

- **IAM ロール**: 最小権限の原則
- **VPC エンドポイント**: プライベート接続（v2.0）

### データ匿名化

- AI による自動匿名化処理
- 個人情報の検出・置換機能

### バックアップ・復旧

- **ポイントインタイム復旧**: 35 日間
- **オンデマンドバックアップ**: 手動実行可能
- **クロスリージョンレプリケーション**: 災害対策（v2.0）
