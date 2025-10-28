# Lambda Function URL 権限モデル変更対応手順

## 📅 対応期限：2026 年 11 月 1 日

AWS Lambda Function URL の認可モデルが変更されるため、リソースポリシーの更新が必要です。

## 🎯 変更内容

Function URL を公開している Lambda 関数のリソースポリシーに、以下の**両方のアクション**が必要になります：

- `lambda:InvokeFunctionUrl` （新規追加）
- `lambda:InvokeFunction` （既存）

## 📊 現在の構成

### Function URL

```
https://7borjnekgb2x6fd5prto4m4uyy0ilhid.lambda-url.ap-northeast-1.on.aws
```

### 認証タイプ

```
AUTH_TYPE: NONE (パブリックアクセス)
```

### 影響を受ける Lambda 関数

- 本番: `<LAMBDA_FUNCTION_NAME>`
- Staging: `<LAMBDA_FUNCTION_NAME>-staging` （存在する場合）

## ✅ 対応手順

### ステップ 1: 現在のリソースポリシーを確認

```bash
# 本番環境
aws lambda get-policy \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1 \
  --query Policy \
  --output text | jq .

# Staging環境（存在する場合）
aws lambda get-policy \
  --function-name <LAMBDA_FUNCTION_NAME>-staging \
  --region ap-northeast-1 \
  --query Policy \
  --output text | jq .
```

**確認ポイント:**

- `Action` に `lambda:InvokeFunctionUrl` が含まれているか
- 含まれていない場合は、以下のステップ 2 を実施

### ステップ 2: 新しいアクションを追加

#### オプション A: 既存ポリシーに追加（推奨）

```bash
# 本番環境
aws lambda add-permission \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --region ap-northeast-1

# Staging環境（存在する場合）
aws lambda add-permission \
  --function-name <LAMBDA_FUNCTION_NAME>-staging \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --region ap-northeast-1
```

**エラーが出た場合:**

```
An error occurred (ResourceConflictException) when calling the AddPermission operation:
The statement id (FunctionURLAllowPublicAccess) provided already exists.
```

このエラーが出た場合は、既にポリシーが存在するため、以下のように削除してから再追加：

```bash
# 既存のステートメントを削除
aws lambda remove-permission \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --statement-id FunctionURLAllowPublicAccess \
  --region ap-northeast-1

# 両方のアクションを含む新しいステートメントを追加
aws lambda add-permission \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --action lambda:InvokeFunction \
  --principal "*" \
  --function-url-auth-type NONE \
  --region ap-northeast-1
```

#### オプション B: Function URL を再作成

**注意:** この方法では Function URL が変わるため、Amplify の環境変数も更新が必要です。

```bash
# 1. 現在のCORS設定を確認（後で同じ設定を使う）
aws lambda get-function-url-config \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1

# 2. Function URL を削除
aws lambda delete-function-url-config \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1

# 3. Function URL を再作成（自動的に新しいポリシーが適用される）
aws lambda create-function-url-config \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["https://main.d1k9w0b6h6k79s.amplifyapp.com", "http://localhost:3000"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization"],
    "AllowCredentials": true,
    "MaxAge": 86400
  }' \
  --region ap-northeast-1

# 4. 新しい Function URL を取得
aws lambda get-function-url-config \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1 \
  --query FunctionUrl \
  --output text
```

### ステップ 3: 動作確認

```bash
# 1. ポリシーが正しく更新されたことを確認
aws lambda get-policy \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1 \
  --query Policy \
  --output text | jq '.Statement[] | select(.Sid=="FunctionURLAllowPublicAccess")'

# 期待される出力例:
# {
#   "Sid": "FunctionURLAllowPublicAccess",
#   "Effect": "Allow",
#   "Principal": "*",
#   "Action": [
#     "lambda:InvokeFunctionUrl",
#     "lambda:InvokeFunction"
#   ],
#   "Resource": "arn:aws:lambda:ap-northeast-1:...:function:..."
# }

# 2. Function URL の動作確認
FUNC_URL=$(aws lambda get-function-url-config \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region ap-northeast-1 \
  --query FunctionUrl \
  --output text)

# ヘルスチェック（200が返ることを確認）
curl -sS "$FUNC_URL/health"

# 未認証でのアクセス（401が返ることを確認）
curl -i "$FUNC_URL/reports"

# 認証付きアクセス（要IDトークン）
# curl -H "Authorization: Bearer <YOUR_ID_TOKEN>" "$FUNC_URL/reports"
```

### ステップ 4: Amplify 環境変数の確認/更新（オプション B を選択した場合のみ）

オプション B で Function URL を再作成した場合は、Amplify の環境変数を更新：

1. AWS Amplify コンソールにアクセス
2. アプリを選択 → **App settings** → **Environment variables**
3. `NUXT_PUBLIC_API_BASE` の値を新しい Function URL に更新
4. 保存後、アプリを再デプロイ

## 📝 チェックリスト

- [ ] 現在のリソースポリシーを確認した
- [ ] `lambda:InvokeFunctionUrl` アクションを追加した
- [ ] リソースポリシーが正しく更新されたことを確認した
- [ ] ヘルスチェックが成功することを確認した
- [ ] 未認証アクセスで 401 が返ることを確認した
- [ ] （オプション B の場合）Amplify 環境変数を更新した
- [ ] （オプション B の場合）Amplify アプリを再デプロイした
- [ ] 本番環境で動作確認した
- [ ] （存在する場合）Staging 環境でも同様の対応を実施した

## 🚨 トラブルシューティング

### エラー: ResourceConflictException

既存のステートメント ID が競合している場合：

```bash
# 既存のステートメントを削除
aws lambda remove-permission \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --statement-id FunctionURLAllowPublicAccess \
  --region ap-northeast-1

# 再度追加
aws lambda add-permission \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE \
  --region ap-northeast-1
```

### エラー: 403 Forbidden

Function URL にアクセスして 403 エラーが出る場合：

1. リソースポリシーを確認（両方のアクションが含まれているか）
2. Function URL の認証タイプを確認（`NONE`であることを確認）
3. Lambda 関数のログを確認（CloudWatch Logs）

### Function URL が変わった場合の影響

オプション B で再作成した場合：

1. **フロントエンド:** Amplify 環境変数の更新が必要
2. **ドキュメント:** 各種ドキュメントの URL を更新
3. **外部連携:** 他のサービスから呼び出している場合は、そちらも更新

## 📚 参考リンク

- [AWS Lambda Function URLs の認可](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html)
- [Lambda リソースベースポリシー](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)

## 📅 対応履歴

| 日付       | 作業内容             | 担当者 | 備考 |
| ---------- | -------------------- | ------ | ---- |
| YYYY-MM-DD | 対応手順書作成       | -      | -    |
| YYYY-MM-DD | 本番環境対応実施     | -      | -    |
| YYYY-MM-DD | Staging 環境対応実施 | -      | -    |
