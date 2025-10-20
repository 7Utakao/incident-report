# GitHub リポジトリ設定ガイド

このドキュメントは、リポジトリを安全に公開運用するために必要な GitHub 設定の手順をまとめています。

## 📝 必須設定

### 1. リポジトリの説明とトピックスの設定

1. GitHub リポジトリページ（https://github.com/7Utakao/incident-report）に移動
2. 右上の「⚙️ Settings」をクリック
3. 「About」セクションで「⚙️」（歯車アイコン）をクリック
4. 以下を入力：
   - **Description**: `インシデント報告システム - Nuxt 3 + AWS Amplify + Lambda + DynamoDB + Amazon Bedrock`
   - **Topics**: `nuxt`, `aws-amplify`, `aws-lambda`, `dynamodb`, `amazon-bedrock`, `incident-report`, `typescript`, `tailwindcss`
5. 「Save changes」をクリック

### 2. Security 機能の有効化

#### Secret Scanning（秘密情報スキャン）

1. リポジトリの「Settings」→「Security」→「Code security and analysis」に移動
2. 「Secret scanning」セクションで「Enable」をクリック
3. 「Push protection」も有効化（推奨）

#### Dependabot Alerts（依存関係の脆弱性警告）

1. 同じページで「Dependabot alerts」の「Enable」をクリック
2. 「Dependabot security updates」も有効化（自動セキュリティ更新）

#### Code Scanning（CodeQL）

1. 「Code scanning」セクションで「Set up」→「Advanced」をクリック
2. デフォルト設定を確認して有効化
   - または、リポジトリの「Security」タブ →「Code scanning」→「Set up code scanning」

### 3. ブランチ保護ルールの設定

1. 「Settings」→「Branches」に移動
2. 「Branch protection rules」で「Add rule」をクリック
3. 以下を設定：
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Status checks: `build-and-test` (CI 完了後に表示されます)
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
4. 「Create」をクリック

## 🔐 推奨設定

### 4. GitHub Actions の権限設定

1. 「Settings」→「Actions」→「General」に移動
2. 「Workflow permissions」で以下を選択：
   - 🔘 **Read repository contents and packages permissions**
3. ✅ **Allow GitHub Actions to create and approve pull requests** のチェックを外す（セキュリティ上の理由）

### 5. Pull Request テンプレート作成

すでに `.github/CODEOWNERS` が設定されているため、PR のレビュアーは自動的にアサインされます。

### 6. Issue テンプレート作成（オプション）

1. 「Settings」→「Features」→「Issues」の「Set up templates」をクリック
2. 以下のテンプレートを追加：
   - Bug Report
   - Feature Request

## ✅ 設定完了の確認

以下をチェックして、すべてが正しく設定されていることを確認：

- [ ] リポジトリに Description と Topics が表示されている
- [ ] Security タブで Secret scanning が有効
- [ ] Security タブで Dependabot alerts が有効
- [ ] Security タブで Code scanning が有効
- [ ] Branches で main ブランチ保護が設定済み
- [ ] Actions タブで `Frontend CI` ワークフローが実行されている

## 🚨 重要な注意事項

### 強制プッシュ後の注意

履歴を書き換えて強制プッシュしたため、他のコントリビューターは以下の手順でローカルリポジトリを更新する必要があります：

```bash
# リモートの変更を取得
git fetch origin

# ローカルブランチをリモートに強制的に合わせる
git reset --hard origin/main

# 他のブランチも同様に
git checkout fix/nuxt-types-prepare
git reset --hard origin/fix/nuxt-types-prepare
```

### 環境変数の管理

Amplify コンソールで、以下の環境変数を設定してください：

```
NUXT_PUBLIC_API_BASE=<実際のLambda URL>
NUXT_PUBLIC_USER_POOL_ID=<実際のCognito User Pool ID>
NUXT_PUBLIC_USER_POOL_CLIENT_ID=<実際のCognito Client ID>
NUXT_PUBLIC_AWS_REGION=ap-northeast-1
```

## 📊 監視とメンテナンス

### 定期的に確認すべき項目

- **毎週**: Dependabot alerts の確認と対応
- **毎月**: npm audit の実行 (`npm audit`)
- **四半期ごと**: 依存関係の更新 (`npm update`)
- **必要に応じて**: Security advisories の確認

## 🔗 関連ドキュメント

- [SECURITY.md](../SECURITY.md) - セキュリティポリシー
- [README.md](../README.md) - プロジェクト概要とセットアップ
- [LICENSE](../LICENSE) - ライセンス情報
