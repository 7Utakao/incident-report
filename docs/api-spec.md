# API インターフェース設計書

## 概要

Incident Report System の API 設計仕様書です。AWS Lambda を使用した REST API の詳細仕様を記述します。

## 基本情報

### ベース URL

- 開発環境: `https://api-dev.incident-report.example.com`
- 本番環境: `https://api.incident-report.example.com`

### 共通ヘッダー

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
Access-Control-Allow-Origin: *
```

### 認証方式

- **v1.0**: 形式的な JWT トークン（検証なし）
- **v2.0**: AWS Cognito による厳格な JWT 検証

## エンドポイント一覧

### 1. ヘルスチェック

#### `GET /health`

**目的**: API サーバーの稼働状況確認

**リクエスト**:

```http
GET /health HTTP/1.1
Host: api.incident-report.example.com
```

**レスポンス**:

```json
{
  "ok": true
}
```

**ステータスコード**:

- `200 OK`: 正常稼働中

---

### 2. レポート作成

#### `POST /reports`

**目的**: 新しいインシデントレポートの作成

**リクエスト**:

```http
POST /reports HTTP/1.1
Host: api.incident-report.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "データベース接続エラーが発生",
  "body": "本日午前中にデータベースへの接続が不安定になり、ユーザーがログインできない状況が発生しました。原因を調査したところ、接続プールの設定に問題があることが判明しました。"
}
```

**リクエストパラメータ**:
| フィールド | 型 | 必須 | 制限 | 説明 |
|-----------|----|----|------|------|
| title | string | ✓ | 1-200 文字 | レポートタイトル |
| body | string | ✓ | 1-5000 文字 | レポート本文 |

**レスポンス**:

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "データベース接続エラーが発生",
  "body": "本日午前中にデータベースへの接続が不安定になり、ユーザーがログインできない状況が発生しました。原因を調査したところ、接続プールの設定に問題があることが判明しました。",
  "aiResult": {
    "summary": "データベース接続プールの設定問題により、ユーザーログインが不可能になった障害",
    "tags": ["データベース", "接続エラー", "設定ミス"],
    "category": "環境設定ミス",
    "anonymizedText": "本日午前中にデータベースへの接続が不安定になり、ユーザーがログインできない状況が発生しました。原因を調査したところ、接続プールの設定に問題があることが判明しました。",
    "suggestedReplacements": []
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "flags": {
    "containsDisallowed": false
  }
}
```

**ステータスコード**:

- `201 Created`: レポート作成成功
- `400 Bad Request`: バリデーションエラー
- `500 Internal Server Error`: サーバーエラー

---

### 3. レポート一覧取得

#### `GET /reports`

**目的**: インシデントレポートの一覧取得（検索・フィルタ機能付き）

**リクエスト**:

```http
GET /reports?category=環境設定ミス&from=2024-01-01T00:00:00.000Z&to=2024-01-31T23:59:59.999Z&q=データベース HTTP/1.1
Host: api.incident-report.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|----|----|------|
| category | string | - | カテゴリフィルタ |
| from | string | - | 開始日時（ISO 8601 形式） |
| to | string | - | 終了日時（ISO 8601 形式） |
| q | string | - | キーワード検索 |
| limit | number | - | 取得件数制限（デフォルト: 20） |
| offset | number | - | オフセット（デフォルト: 0） |

**レスポンス**:

```json
{
  "reports": [
    {
      "reportId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "データベース接続エラーが発生",
      "body": "本日午前中にデータベースへの接続が不安定になり...",
      "aiResult": {
        "summary": "データベース接続プールの設定問題により、ユーザーログインが不可能になった障害",
        "tags": ["データベース", "接続エラー", "設定ミス"],
        "category": "環境設定ミス",
        "anonymizedText": "本日午前中にデータベースへの接続が不安定になり...",
        "suggestedReplacements": []
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "category": "環境設定ミス",
      "tags": ["データベース", "接続エラー", "設定ミス"]
    }
  ],
  "count": 1,
  "filters": {
    "category": "環境設定ミス",
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.999Z",
    "q": "データベース"
  }
}
```

**ステータスコード**:

- `200 OK`: 取得成功
- `400 Bad Request`: クエリパラメータエラー
- `500 Internal Server Error`: サーバーエラー

---

### 4. レポート詳細取得（未実装）

#### `GET /reports/{reportId}`

**目的**: 特定のレポートの詳細情報取得

**リクエスト**:

```http
GET /reports/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: api.incident-report.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**レスポンス**:

```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "データベース接続エラーが発生",
  "body": "本日午前中にデータベースへの接続が不安定になり...",
  "aiResult": {
    "summary": "データベース接続プールの設定問題により、ユーザーログインが不可能になった障害",
    "tags": ["データベース", "接続エラー", "設定ミス"],
    "category": "環境設定ミス",
    "anonymizedText": "本日午前中にデータベースへの接続が不安定になり...",
    "suggestedReplacements": []
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "category": "環境設定ミス",
  "tags": ["データベース", "接続エラー", "設定ミス"]
}
```

## エラーレスポンス形式

### 標準エラー形式

```json
{
  "error": "エラータイプ",
  "message": "エラーメッセージ",
  "details": "詳細情報（オプション）"
}
```

### エラータイプ一覧

| エラータイプ          | ステータスコード | 説明                 |
| --------------------- | ---------------- | -------------------- |
| Bad Request           | 400              | リクエスト形式エラー |
| Unauthorized          | 401              | 認証エラー           |
| Forbidden             | 403              | 認可エラー           |
| Not Found             | 404              | リソース未発見       |
| Validation Error      | 400              | バリデーションエラー |
| AI Processing Error   | 500              | AI 処理エラー        |
| Database Error        | 500              | データベースエラー   |
| Internal Server Error | 500              | サーバー内部エラー   |

### バリデーションエラーの詳細形式

```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "details": [
    {
      "field": "title",
      "message": "タイトルは必須です"
    },
    {
      "field": "body",
      "message": "本文は5000文字以内で入力してください"
    }
  ]
}
```

## 認証・認可

### v1.0 認証方式（現在）

- JWT トークンの形式チェックのみ
- 実際の検証は行わない
- `Authorization: Bearer <任意の文字列>` で通過

### v2.0 認証方式（予定）

- AWS Cognito による厳格な JWT 検証
- ユーザー識別とロールベースアクセス制御
- トークンの有効期限チェック

```javascript
// v2.0 での認証ヘッダー例
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.signature
```

## レート制限

### v1.0（現在）

- レート制限なし

### v2.0（予定）

- ユーザーあたり: 100 リクエスト/分
- IP あたり: 1000 リクエスト/分

## CORS 設定

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,OPTIONS
```

## 今後の拡張予定

### v2.0 での追加エンドポイント

- `PUT /reports/{reportId}` - レポート更新
- `DELETE /reports/{reportId}` - レポート削除
- `GET /reports/{reportId}/comments` - コメント一覧
- `POST /reports/{reportId}/comments` - コメント作成
- `GET /stats` - 統計情報取得
- `GET /categories` - カテゴリ一覧取得
- `GET /tags` - タグ一覧取得

### パフォーマンス最適化

- GraphQL 対応検討
- キャッシュ機能の実装
- ページネーション改善
- 全文検索機能の強化
