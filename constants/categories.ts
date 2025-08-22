// インシデント報告のカテゴリ定義
export interface Category {
  code: string; // WHY_REQ_001
  displayName: string; // 期待値合意不足
  description: string; // 詳細説明
  group: string; // グループ名
}

export const CATEGORY_GROUPS = [
  '要件・期待の不一致',
  '判断基準・意思決定の欠落/誤り',
  '知識/スキル不足・誤適用',
  'メンタルモデル不一致・仕様読み違い',
  '時間圧力・優先順位錯誤',
  '手順逸脱・確認不足',
  'コミュニケーション/引き継ぎ不備',
  'レビュー/検証不足',
  '設計原則・トレードオフの誤認',
  '設定/運用基準未整備・逸脱',
  '自動化不足・手作業依存',
  '観測性/フィードバック不足',
  'セキュリティ/機密・法令認知不足',
  '運用性/ユーザビリティの軽視',
  'コスト認知/FinOps不備',
  '依存関係/外部サービス前提の崩壊',
  '変更管理/リリース管理不備',
  '組織/責任分界の曖昧さ',
] as const;

export const CATEGORIES: Category[] = [
  // 1) 要件・期待の不一致（WHY_REQ_*）
  {
    code: 'WHY_REQ_001',
    displayName: '期待値合意不足',
    description: '成功条件/品質基準が共有されていない',
    group: '要件・期待の不一致',
  },
  {
    code: 'WHY_REQ_002',
    displayName: '曖昧・矛盾した要件',
    description: '用語・優先度の解釈ズレ',
    group: '要件・期待の不一致',
  },
  {
    code: 'WHY_REQ_003',
    displayName: 'スコープ境界不明',
    description: '範囲の線引きが無い/動く',
    group: '要件・期待の不一致',
  },
  {
    code: 'WHY_REQ_004',
    displayName: '受け入れ基準欠落',
    description: '検証可能なACが無い',
    group: '要件・期待の不一致',
  },
  {
    code: 'WHY_REQ_005',
    displayName: '非機能要件の軽視',
    description: 'SLO/セキュリティ/コスト未定義',
    group: '要件・期待の不一致',
  },

  // 2) 判断基準・意思決定の欠落/誤り（WHY_JDG_*）
  {
    code: 'WHY_JDG_001',
    displayName: 'トレードオフ評価不足',
    description: '可用性vsコスト等の比較抜け',
    group: '判断基準・意思決定の欠落/誤り',
  },
  {
    code: 'WHY_JDG_002',
    displayName: 'データ不在の判断',
    description: '計測なしの感覚判断',
    group: '判断基準・意思決定の欠落/誤り',
  },
  {
    code: 'WHY_JDG_003',
    displayName: 'アンカー/確証バイアス',
    description: '最初の案に固執',
    group: '判断基準・意思決定の欠落/誤り',
  },
  {
    code: 'WHY_JDG_004',
    displayName: 'エスカレーション遅延',
    description: '決める人に届かない',
    group: '判断基準・意思決定の欠落/誤り',
  },

  // 3) 知識/スキル不足・誤適用（WHY_SKL_*）
  {
    code: 'WHY_SKL_001',
    displayName: 'サービス仕様の理解不足',
    description: 'Cognitoのサインイン識別子は後から変えられない等',
    group: '知識/スキル不足・誤適用',
  },
  {
    code: 'WHY_SKL_002',
    displayName: 'ベストプラクティス未習得',
    description: 'DynamoDBパーティション設計等',
    group: '知識/スキル不足・誤適用',
  },
  {
    code: 'WHY_SKL_003',
    displayName: '暗黙仕様の読み落とし',
    description: '整合性/再試行/レート制限',
    group: '知識/スキル不足・誤適用',
  },
  {
    code: 'WHY_SKL_004',
    displayName: 'ライブラリ更新追随ミス',
    description: 'Breaking change見落とし',
    group: '知識/スキル不足・誤適用',
  },

  // 4) メンタルモデル不一致・仕様読み違い（WHY_MDL_*）
  {
    code: 'WHY_MDL_001',
    displayName: '一貫性モデルの誤認',
    description: '最終的整合性を即時と想定',
    group: 'メンタルモデル不一致・仕様読み違い',
  },
  {
    code: 'WHY_MDL_002',
    displayName: '認証フローの勘違い',
    description: 'Function URLはJWT自動検証しない等',
    group: 'メンタルモデル不一致・仕様読み違い',
  },
  {
    code: 'WHY_MDL_003',
    displayName: 'データ形式の前提ズレ',
    description: 'JSON/BOM/エンコーディング誤解',
    group: 'メンタルモデル不一致・仕様読み違い',
  },
  {
    code: 'WHY_MDL_004',
    displayName: '設計書の読み方差異',
    description: '図と文の齟齬、用語解釈差',
    group: 'メンタルモデル不一致・仕様読み違い',
  },

  // 5) 時間圧力・優先順位錯誤（WHY_TME_*）
  {
    code: 'WHY_TME_001',
    displayName: 'デッドライン優先で検証削減',
    description: 'デッドライン優先で検証削減',
    group: '時間圧力・優先順位錯誤',
  },
  {
    code: 'WHY_TME_002',
    displayName: '緊急対応で手順省略',
    description: '緊急対応で手順省略',
    group: '時間圧力・優先順位錯誤',
  },
  {
    code: 'WHY_TME_003',
    displayName: '重要度/緊急度マトリクスの誤用',
    description: '緊急だが重要でない作業に偏る',
    group: '時間圧力・優先順位錯誤',
  },

  // 6) 手順逸脱・確認不足（WHY_PRCS_*）
  {
    code: 'WHY_PRCS_001',
    displayName: 'SOP未遵守',
    description: 'レビュー/承認を飛ばす',
    group: '手順逸脱・確認不足',
  },
  {
    code: 'WHY_PRCS_002',
    displayName: 'チェックリスト未使用',
    description: 'チェックリスト未使用',
    group: '手順逸脱・確認不足',
  },
  {
    code: 'WHY_PRCS_003',
    displayName: '単独作業での見逃し',
    description: '4-eyes未実施',
    group: '手順逸脱・確認不足',
  },
  {
    code: 'WHY_PRCS_004',
    displayName: '作業記録なし',
    description: '再現不能',
    group: '手順逸脱・確認不足',
  },

  // 7) コミュニケーション/引き継ぎ不備（WHY_COM_*）
  {
    code: 'WHY_COM_001',
    displayName: '非同期連絡のみで重要事項が埋没',
    description: 'Slack既読スルー',
    group: 'コミュニケーション/引き継ぎ不備',
  },
  {
    code: 'WHY_COM_002',
    displayName: 'ハンドオフ不明確',
    description: '担当/当番の空白',
    group: 'コミュニケーション/引き継ぎ不備',
  },
  {
    code: 'WHY_COM_003',
    displayName: '用語定義共有不足',
    description: '略語/顧客言語の混在',
    group: 'コミュニケーション/引き継ぎ不備',
  },
  {
    code: 'WHY_COM_004',
    displayName: '決定事項の記録欠落',
    description: '議事録/Issue更新なし',
    group: 'コミュニケーション/引き継ぎ不備',
  },

  // 8) レビュー/検証不足（WHY_REV_*）
  {
    code: 'WHY_REV_001',
    displayName: 'コード/設計レビュー省略',
    description: 'コード/設計レビュー省略',
    group: 'レビュー/検証不足',
  },
  {
    code: 'WHY_REV_002',
    displayName: '仕様テスト/受入テスト不足',
    description: '仕様テスト/受入テスト不足',
    group: 'レビュー/検証不足',
  },
  {
    code: 'WHY_REV_003',
    displayName: '性能/負荷・可用性検証不足',
    description: '性能/負荷・可用性検証不足',
    group: 'レビュー/検証不足',
  },
  {
    code: 'WHY_REV_004',
    displayName: 'ステージング非対称',
    description: '本番と設定/データが乖離',
    group: 'レビュー/検証不足',
  },

  // 9) 設計原則・トレードオフの誤認（WHY_DES_*）
  {
    code: 'WHY_DES_001',
    displayName: 'キー/インデックス戦略誤り',
    description: 'DynamoDBホットパーティション',
    group: '設計原則・トレードオフの誤認',
  },
  {
    code: 'WHY_DES_002',
    displayName: 'APIコントラクト凍結前の変更管理不備',
    description: 'APIコントラクト凍結前の変更管理不備',
    group: '設計原則・トレードオフの誤認',
  },
  {
    code: 'WHY_DES_003',
    displayName: 'セキュリティ境界設計不足',
    description: '最小権限/信頼境界',
    group: '設計原則・トレードオフの誤認',
  },
  {
    code: 'WHY_DES_004',
    displayName: 'コストを無視した構成',
    description: '常時オン/過剰サイズ',
    group: '設計原則・トレードオフの誤認',
  },

  // 10) 設定/運用基準未整備・逸脱（WHY_CFG_*）
  {
    code: 'WHY_CFG_001',
    displayName: '環境変数/シークレットの誤設定',
    description: '環境変数/シークレットの誤設定',
    group: '設定/運用基準未整備・逸脱',
  },
  {
    code: 'WHY_CFG_002',
    displayName: 'CORS/プリフライト未対応',
    description: 'CORS/プリフライト未対応',
    group: '設定/運用基準未整備・逸脱',
  },
  {
    code: 'WHY_CFG_003',
    displayName: 'DNS/証明書/鍵ローテの運用基準なし',
    description: 'DNS/証明書/鍵ローテの運用基準なし',
    group: '設定/運用基準未整備・逸脱',
  },
  {
    code: 'WHY_CFG_004',
    displayName: '機能フラグの切替手順未整備',
    description: '機能フラグの切替手順未整備',
    group: '設定/運用基準未整備・逸脱',
  },

  // 11) 自動化不足・手作業依存（WHY_AUT_*）
  {
    code: 'WHY_AUT_001',
    displayName: '定型作業が人手',
    description: 'デプロイ/移行/ロールバック',
    group: '自動化不足・手作業依存',
  },
  {
    code: 'WHY_AUT_002',
    displayName: 'IaC不足',
    description: 'クリック作業の再現不能',
    group: '自動化不足・手作業依存',
  },
  {
    code: 'WHY_AUT_003',
    displayName: 'フォールバック/リトライ自動化なし',
    description: 'Bedrock失敗時のスキップ保存未実装',
    group: '自動化不足・手作業依存',
  },

  // 12) 観測性/フィードバック不足（WHY_OBS_*）
  {
    code: 'WHY_OBS_001',
    displayName: 'ログ/メトリクス設計不在',
    description: 'LambdaにBasicExecutionRoleがない/RAW_EVENTなし',
    group: '観測性/フィードバック不足',
  },
  {
    code: 'WHY_OBS_002',
    displayName: 'アラート閾値/通知ルール不適',
    description: 'アラート閾値/通知ルール不適',
    group: '観測性/フィードバック不足',
  },
  {
    code: 'WHY_OBS_003',
    displayName: 'トレーシング未導入/低サンプリング',
    description: 'トレーシング未導入/低サンプリング',
    group: '観測性/フィードバック不足',
  },
  {
    code: 'WHY_OBS_004',
    displayName: 'ログ保持期間/コストの見積もり不足',
    description: 'ログ保持期間/コストの見積もり不足',
    group: '観測性/フィードバック不足',
  },

  // 13) セキュリティ/機密・法令認知不足（WHY_SEC_*）
  {
    code: 'WHY_SEC_001',
    displayName: '過剰権限',
    description: 'Action:*/AdministratorAccess常用',
    group: 'セキュリティ/機密・法令認知不足',
  },
  {
    code: 'WHY_SEC_002',
    displayName: '機密情報の露出',
    description: 'ログ/Git/S3',
    group: 'セキュリティ/機密・法令認知不足',
  },
  {
    code: 'WHY_SEC_003',
    displayName: 'PIIをテストデータで使用',
    description: 'PIIをテストデータで使用',
    group: 'セキュリティ/機密・法令認知不足',
  },
  {
    code: 'WHY_SEC_004',
    displayName: '監査証跡不足',
    description: '監査証跡不足',
    group: 'セキュリティ/機密・法令認知不足',
  },

  // 14) 運用性/ユーザビリティの軽視（WHY_USR_*）
  {
    code: 'WHY_USR_001',
    displayName: 'エラーメッセージが不明瞭',
    description: '{"Message":null}のような汎化',
    group: '運用性/ユーザビリティの軽視',
  },
  {
    code: 'WHY_USR_002',
    displayName: '再試行手順/自己回復導線なし',
    description: '再試行手順/自己回復導線なし',
    group: '運用性/ユーザビリティの軽視',
  },
  {
    code: 'WHY_USR_003',
    displayName: '操作負荷が高い',
    description: '多段クリック/確認過多',
    group: '運用性/ユーザビリティの軽視',
  },

  // 15) コスト認知/FinOps不備（WHY_COST_*）
  {
    code: 'WHY_COST_001',
    displayName: '予算/アラート未設定',
    description: 'Budgets/Anomaly未使用',
    group: 'コスト認知/FinOps不備',
  },
  {
    code: 'WHY_COST_002',
    displayName: '転送料・クロスリージョン費の見落とし',
    description: '転送料・クロスリージョン費の見落とし',
    group: 'コスト認知/FinOps不備',
  },
  {
    code: 'WHY_COST_003',
    displayName: '過剰プロビジョニング',
    description: '常時オン/最大サイズ固定',
    group: 'コスト認知/FinOps不備',
  },
  {
    code: 'WHY_COST_004',
    displayName: '実験の後片付け忘れ',
    description: 'ゾンビリソース',
    group: 'コスト認知/FinOps不備',
  },

  // 16) 依存関係/外部サービス前提の崩壊（WHY_DEP_*）
  {
    code: 'WHY_DEP_001',
    displayName: '外部API仕様変更の未追随',
    description: '外部API仕様変更の未追随',
    group: '依存関係/外部サービス前提の崩壊',
  },
  {
    code: 'WHY_DEP_002',
    displayName: 'レート制限/スロットリング対策不足',
    description: 'レート制限/スロットリング対策不足',
    group: '依存関係/外部サービス前提の崩壊',
  },
  {
    code: 'WHY_DEP_003',
    displayName: 'SDKメジャーアップグレード対応漏れ',
    description: 'SDKメジャーアップグレード対応漏れ',
    group: '依存関係/外部サービス前提の崩壊',
  },

  // 17) 変更管理/リリース管理不備（WHY_CHG_*）
  {
    code: 'WHY_CHG_001',
    displayName: 'マイグレーション順序誤り',
    description: '非互換スキーマ',
    group: '変更管理/リリース管理不備',
  },
  {
    code: 'WHY_CHG_002',
    displayName: 'ロールバック手段不備',
    description: 'ロールバック手段不備',
    group: '変更管理/リリース管理不備',
  },
  {
    code: 'WHY_CHG_003',
    displayName: '承認ゲート未設定',
    description: '本番直行',
    group: '変更管理/リリース管理不備',
  },

  // 18) 組織/責任分界の曖昧さ（WHY_ORG_*）
  {
    code: 'WHY_ORG_001',
    displayName: 'RACI不明確',
    description: '誰が決める/やる/承認するか',
    group: '組織/責任分界の曖昧さ',
  },
  {
    code: 'WHY_ORG_002',
    displayName: '当番/オンコール体制不全',
    description: '当番/オンコール体制不全',
    group: '組織/責任分界の曖昧さ',
  },
  {
    code: 'WHY_ORG_003',
    displayName: 'サポートプラン/連絡経路不整備',
    description: 'サポートプラン/連絡経路不整備',
    group: '組織/責任分界の曖昧さ',
  },

  // 従来のカテゴリも残す（後方互換性のため）
  {
    code: 'LEGACY_001',
    displayName: '情報漏洩・誤送信',
    description: '従来のカテゴリ（後方互換性）',
    group: 'その他',
  },
  {
    code: 'LEGACY_002',
    displayName: 'システム障害',
    description: '従来のカテゴリ（後方互換性）',
    group: 'その他',
  },
  {
    code: 'LEGACY_003',
    displayName: '作業ミス',
    description: '従来のカテゴリ（後方互換性）',
    group: 'その他',
  },
  {
    code: 'LEGACY_004',
    displayName: 'コミュニケーション',
    description: '従来のカテゴリ（後方互換性）',
    group: 'その他',
  },
  {
    code: 'LEGACY_005',
    displayName: 'その他',
    description: '従来のカテゴリ（後方互換性）',
    group: 'その他',
  },
];

// UI用のオプション生成関数
export const getCategoryOptions = () => {
  const options = [{ value: '', label: 'すべてのカテゴリ' }];

  // グループごとに整理
  const groupedCategories = CATEGORIES.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = [];
    }
    acc[category.group].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  // グループ順序を定義
  const groupOrder = [
    '要件・期待の不一致',
    '判断基準・意思決定の欠落/誤り',
    '知識/スキル不足・誤適用',
    'メンタルモデル不一致・仕様読み違い',
    '時間圧力・優先順位錯誤',
    '手順逸脱・確認不足',
    'コミュニケーション/引き継ぎ不備',
    'レビュー/検証不足',
    '設計原則・トレードオフの誤認',
    '設定/運用基準未整備・逸脱',
    '自動化不足・手作業依存',
    '観測性/フィードバック不足',
    'セキュリティ/機密・法令認知不足',
    '運用性/ユーザビリティの軽視',
    'コスト認知/FinOps不備',
    '依存関係/外部サービス前提の崩壊',
    '変更管理/リリース管理不備',
    '組織/責任分界の曖昧さ',
    'その他',
  ];

  // グループ順序に従って追加
  groupOrder.forEach((groupName) => {
    const categoriesInGroup = groupedCategories[groupName];
    if (categoriesInGroup) {
      categoriesInGroup.forEach((category) => {
        options.push({
          value: category.code,
          label: category.displayName,
        });
      });
    }
  });

  return options;
};

// カテゴリコードから表示名を取得
export const getCategoryDisplayName = (code: string): string => {
  const category = CATEGORIES.find((cat) => cat.code === code);
  return category?.displayName || code;
};

// カテゴリコードからグループ名を取得
export const getCategoryGroup = (code: string): string => {
  const category = CATEGORIES.find((cat) => cat.code === code);
  return category?.group || 'その他';
};

// バッジの色を決定する関数
export const getCategoryVariant = (
  code: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' => {
  const group = getCategoryGroup(code);

  const variants: Record<
    string,
    'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  > = {
    '要件・期待の不一致': 'error',
    '判断基準・意思決定の欠落/誤り': 'warning',
    '知識/スキル不足・誤適用': 'primary',
    'メンタルモデル不一致・仕様読み違い': 'secondary',
    '時間圧力・優先順位錯誤': 'warning',
    '手順逸脱・確認不足': 'error',
    'コミュニケーション/引き継ぎ不備': 'secondary',
    'レビュー/検証不足': 'warning',
    '設計原則・トレードオフの誤認': 'primary',
    '設定/運用基準未整備・逸脱': 'error',
    '自動化不足・手作業依存': 'warning',
    '観測性/フィードバック不足': 'primary',
    'セキュリティ/機密・法令認知不足': 'error',
    '運用性/ユーザビリティの軽視': 'secondary',
    'コスト認知/FinOps不備': 'warning',
    '依存関係/外部サービス前提の崩壊': 'error',
    '変更管理/リリース管理不備': 'warning',
    '組織/責任分界の曖昧さ': 'secondary',
    その他: 'default',
  };

  return variants[group] || 'default';
};
