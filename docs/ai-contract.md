# AI 契約仕様書

## 概要

Incident Report System における AI 処理の契約仕様書です。AWS Bedrock（Claude 3 Sonnet）を使用した自動分析・匿名化機能の詳細仕様を記述します。

## AI 処理概要

### 目的

- インシデントレポートの自動分析
- 機密情報の検出・匿名化
- カテゴリ分類・タグ付け・要約生成

### 使用モデル

- **v1.0**: モック実装（開発・テスト用）
- **v2.0**: AWS Bedrock Claude 3 Sonnet (`anthropic.claude-3-sonnet-20240229`)

## 出力 JSON 仕様

### v1.0 スキーマ（現在）

```json
{
  "summary": "string",
  "tags": ["string"],
  "category": "string",
  "anonymizedText": "string",
  "suggestedReplacements": [
    {
      "from": "string",
      "to": "string"
    }
  ]
}
```

#### フィールド詳細

| フィールド            | 型       | 必須 | 説明                           | 例                                                                             |
| --------------------- | -------- | ---- | ------------------------------ | ------------------------------------------------------------------------------ |
| summary               | string   | ✓    | レポートの要約（100 文字以内） | `データベース接続プールの設定問題により、ユーザーログインが不可能になった障害` |
| tags                  | string[] | ✓    | 関連タグ（3-5 個）             | `["データベース", "接続エラー", "設定ミス"]`                                   |
| category              | string   | ✓    | カテゴリ分類                   | `環境設定ミス`                                                                 |
| anonymizedText        | string   | ✓    | 匿名化後の本文                 | `本日午前中に[システム名]への接続が...`                                        |
| suggestedReplacements | object[] | ✓    | 匿名化置換候補                 | `[{"from": "顧客A社", "to": "[顧客名]"}]`                                      |

#### カテゴリ一覧

```javascript
const CATEGORIES = [
  '技術的知識不足',
  '環境設定ミス',
  'コミュニケーション不足',
  '工数/スケジュール管理',
  '要件定義・仕様理解',
  'その他',
];
```

### v2.0 拡張スキーマ（予定）

```json
{
  "summary": "string",
  "tags": ["string"],
  "category": "string",
  "anonymizedText": "string",
  "suggestedReplacements": [
    {
      "from": "string",
      "to": "string",
      "confidence": "number",
      "type": "string"
    }
  ],
  "confidence": "number",
  "rationale": "string",
  "severity": "string",
  "impact": "string",
  "recommendations": ["string"]
}
```

#### v2.0 追加フィールド

| フィールド      | 型       | 説明                  | 例                                                 |
| --------------- | -------- | --------------------- | -------------------------------------------------- |
| confidence      | number   | 分析信頼度（0.0-1.0） | `0.85`                                             |
| rationale       | string   | 分類根拠              | `データベース関連のキーワードが多数検出されたため` |
| severity        | string   | 重要度                | `HIGH`, `MEDIUM`, `LOW`                            |
| impact          | string   | 影響範囲              | `ユーザー全体`, `特定機能のみ`                     |
| recommendations | string[] | 改善提案              | `["接続プール設定の見直し", "監視強化"]`           |

## プロンプト設計

### 基本プロンプト構造

```text
あなたはSES会社のインシデント分析AIアシスタントです。
以下のインシデントレポートを分析し、指定されたJSON形式で回答してください。

## 分析対象
タイトル: {title}
本文: {body}

## 分析要件
1. 要約: 100文字以内で簡潔に
2. タグ: 技術的なキーワードを3-5個
3. カテゴリ: 以下から1つ選択
   - 技術的知識不足
   - 環境設定ミス
   - コミュニケーション不足
   - 工数/スケジュール管理
   - 要件定義・仕様理解
   - その他

4. 匿名化: 以下の情報を検出・置換
   - 個人名 → [個人名]
   - 顧客名・企業名 → [顧客名]
   - メールアドレス → [メールアドレス]
   - 電話番号 → [電話番号]
   - IPアドレス → [IPアドレス]
   - URL・ドメイン → [URL]

## 出力形式
必ずJSON形式のみで回答してください。説明文は不要です。

{
  "summary": "要約文",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "category": "選択されたカテゴリ",
  "anonymizedText": "匿名化後の本文",
  "suggestedReplacements": [
    {"from": "置換前", "to": "置換後"}
  ]
}
```

### Bedrock 用制御プロンプト

```text
Human: {上記の基本プロンプト}
```
