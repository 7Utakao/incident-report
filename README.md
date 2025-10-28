# Incident Report System

インシデント報告システム - Nuxt 3 + AWS Amplify + Lambda + DynamoDB + Amazon Bedrock を使用したモダンな Web アプリケーション

## 🚀 Features

- **フロントエンド**: Nuxt 3 + TypeScript + Tailwind CSS
- **認証**: AWS Cognito
- **バックエンド**: AWS Lambda (Function URLs)
- **データベース**: Amazon DynamoDB
- **AI 機能**: Amazon Bedrock
- **ホスティング**: AWS Amplify
- **UI**: レスポンシブデザイン、ダークモード対応

## 📋 Requirements

- Node.js 20.x 以上
- pnpm (推奨) または npm/yarn
- AWS アカウント（本番環境用）

## 🛠️ Setup

### 1. リポジトリのクローン

```bash
git clone https://github.com/7Utakao/incident-report.git
cd incident-report
```

### 2. 依存関係のインストール

```bash
pnpm install
# または
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の値を設定してください：

```env
# API設定
NUXT_PUBLIC_API_BASE=https://your-lambda-url.lambda-url.ap-northeast-1.on.aws

# AWS Cognito設定
NUXT_PUBLIC_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
NUXT_PUBLIC_USER_POOL_CLIENT_ID=your-client-id
NUXT_PUBLIC_AWS_REGION=ap-northeast-1
```

## 🏃‍♂️ Development

### 開発サーバーの起動

```bash
pnpm dev
# または
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

### ビルド

```bash
pnpm build
# または
npm run build
```

### プレビュー

```bash
pnpm preview
# または
npm run preview
```

## 🏗️ Project Structure

```
├── components/          # Vue コンポーネント
│   ├── levels/         # レベル関連コンポーネント
│   ├── mascot/         # マスコット関連コンポーネント
│   ├── reports/        # レポート関連コンポーネント
│   └── ui/             # 共通UIコンポーネント
├── composables/        # Vue Composables
├── lambda/             # AWS Lambda 関数
├── pages/              # ページコンポーネント
├── schemas/            # データスキーマ定義
├── shared/             # 共有型定義・ユーティリティ
└── docs/               # ドキュメント
```

## 🔧 Environment Variables

| 変数名                            | 説明                  | 例                                             |
| --------------------------------- | --------------------- | ---------------------------------------------- |
| `NUXT_PUBLIC_API_BASE`            | Lambda Function URL   | `https://xxx.lambda-url.ap-northeast-1.on.aws` |
| `NUXT_PUBLIC_USER_POOL_ID`        | Cognito User Pool ID  | `ap-northeast-1_XXXXXXXXX`                     |
| `NUXT_PUBLIC_USER_POOL_CLIENT_ID` | Cognito App Client ID | `your-client-id`                               |
| `NUXT_PUBLIC_AWS_REGION`          | AWS リージョン        | `ap-northeast-1`                               |

## 🚀 Deployment

### AWS Amplify でのデプロイ

1. AWS Amplify コンソールでアプリを作成
2. GitHub リポジトリを接続
3. 環境変数を設定
4. 自動デプロイが開始されます

### Lambda 関数のデプロイ

```bash
cd lambda
npm run deploy
```

## 🧪 Testing

```bash
pnpm test
# または
npm test
```

## 📚 Documentation

詳細なドキュメントは `docs/` ディレクトリを参照してください：

- [API 仕様書](docs/api-spec.md)
- [システム設計](docs/system-design.md)
- [画面仕様書](docs/screen-spec.md)
- [デプロイ手順](docs/デプロイ設定手順書.md)
- [Lambda Function URL 権限モデル変更対応](docs/lambda-function-url-permission-update.md) ⚠️ 2026 年 11 月 1 日期限

## 🤝 Contributing

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 License

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🔒 Security

セキュリティに関する問題を発見した場合は、[SECURITY.md](SECURITY.md) の手順に従って報告してください。

## 📞 Support

問題や質問がある場合は、[Issues](https://github.com/7Utakao/incident-report/issues) で報告してください。
