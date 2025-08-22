// インシデント分類カテゴリ定義
export interface Category {
  code: string;
  displayName: string;
  description: string;
  group: string;
}

// カテゴリ定義
export const CATEGORIES: Record<string, Category> = {
  // 要求仕様関連 (Requirements)
  WHY_REQ_001: {
    code: 'WHY_REQ_001',
    displayName: '期待値合意不足',
    description: 'ステークホルダー間での期待値や要求の合意が不十分だった',
    group: '要求仕様関連',
  },
  WHY_REQ_002: {
    code: 'WHY_REQ_002',
    displayName: '要求仕様不明確',
    description: '要求仕様が曖昧で解釈に幅があった',
    group: '要求仕様関連',
  },
  WHY_REQ_003: {
    code: 'WHY_REQ_003',
    displayName: '要求変更管理不備',
    description: '要求変更の管理プロセスが不適切だった',
    group: '要求仕様関連',
  },

  // 判断・意思決定関連 (Judgment)
  WHY_JDG_001: {
    code: 'WHY_JDG_001',
    displayName: 'トレードオフ評価不足',
    description: '複数の選択肢のトレードオフを十分に評価しなかった',
    group: '判断・意思決定関連',
  },
  WHY_JDG_002: {
    code: 'WHY_JDG_002',
    displayName: 'リスク評価不足',
    description: 'リスクの識別や評価が不十分だった',
    group: '判断・意思決定関連',
  },
  WHY_JDG_003: {
    code: 'WHY_JDG_003',
    displayName: '意思決定遅延',
    description: '必要な意思決定が適切なタイミングで行われなかった',
    group: '判断・意思決定関連',
  },

  // 設計関連 (Design)
  WHY_DES_001: {
    code: 'WHY_DES_001',
    displayName: 'アーキテクチャ設計不備',
    description: 'システム全体のアーキテクチャ設計に問題があった',
    group: '設計関連',
  },
  WHY_DES_002: {
    code: 'WHY_DES_002',
    displayName: '詳細設計不備',
    description: '詳細設計レベルでの検討が不十分だった',
    group: '設計関連',
  },
  WHY_DES_003: {
    code: 'WHY_DES_003',
    displayName: '設計レビュー不備',
    description: '設計レビューのプロセスや品質が不適切だった',
    group: '設計関連',
  },

  // 実装関連 (Implementation)
  WHY_IMP_001: {
    code: 'WHY_IMP_001',
    displayName: 'コーディング品質不足',
    description: 'コードの品質や実装方法に問題があった',
    group: '実装関連',
  },
  WHY_IMP_002: {
    code: 'WHY_IMP_002',
    displayName: 'コードレビュー不備',
    description: 'コードレビューのプロセスや品質が不適切だった',
    group: '実装関連',
  },
  WHY_IMP_003: {
    code: 'WHY_IMP_003',
    displayName: '実装標準未遵守',
    description: 'コーディング標準やベストプラクティスに従わなかった',
    group: '実装関連',
  },

  // テスト関連 (Testing)
  WHY_TST_001: {
    code: 'WHY_TST_001',
    displayName: 'テスト計画不備',
    description: 'テスト計画の策定や内容に問題があった',
    group: 'テスト関連',
  },
  WHY_TST_002: {
    code: 'WHY_TST_002',
    displayName: 'テスト実行不備',
    description: 'テストの実行方法や範囲に問題があった',
    group: 'テスト関連',
  },
  WHY_TST_003: {
    code: 'WHY_TST_003',
    displayName: 'テスト環境問題',
    description: 'テスト環境の構築や管理に問題があった',
    group: 'テスト関連',
  },

  // デプロイ・リリース関連 (Deployment)
  WHY_DEP_001: {
    code: 'WHY_DEP_001',
    displayName: 'デプロイ手順不備',
    description: 'デプロイメントの手順や方法に問題があった',
    group: 'デプロイ・リリース関連',
  },
  WHY_DEP_002: {
    code: 'WHY_DEP_002',
    displayName: 'リリース管理不備',
    description: 'リリース管理のプロセスに問題があった',
    group: 'デプロイ・リリース関連',
  },
  WHY_DEP_003: {
    code: 'WHY_DEP_003',
    displayName: 'ロールバック準備不足',
    description: 'ロールバック計画や準備が不十分だった',
    group: 'デプロイ・リリース関連',
  },

  // 運用・監視関連 (Operations)
  WHY_OPS_001: {
    code: 'WHY_OPS_001',
    displayName: '監視体制不備',
    description: 'システム監視の体制や仕組みに問題があった',
    group: '運用・監視関連',
  },
  WHY_OPS_002: {
    code: 'WHY_OPS_002',
    displayName: 'アラート設定不備',
    description: 'アラートの設定や通知に問題があった',
    group: '運用・監視関連',
  },
  WHY_OPS_003: {
    code: 'WHY_OPS_003',
    displayName: '運用手順不備',
    description: '日常運用の手順や方法に問題があった',
    group: '運用・監視関連',
  },

  // インフラ・環境関連 (Infrastructure)
  WHY_INF_001: {
    code: 'WHY_INF_001',
    displayName: 'インフラ設計不備',
    description: 'インフラストラクチャの設計に問題があった',
    group: 'インフラ・環境関連',
  },
  WHY_INF_002: {
    code: 'WHY_INF_002',
    displayName: '環境構築不備',
    description: '環境の構築や設定に問題があった',
    group: 'インフラ・環境関連',
  },
  WHY_INF_003: {
    code: 'WHY_INF_003',
    displayName: 'キャパシティ不足',
    description: 'システムのキャパシティ計画や管理に問題があった',
    group: 'インフラ・環境関連',
  },

  // セキュリティ関連 (Security)
  WHY_SEC_001: {
    code: 'WHY_SEC_001',
    displayName: 'セキュリティ設計不備',
    description: 'セキュリティ要件の設計や実装に問題があった',
    group: 'セキュリティ関連',
  },
  WHY_SEC_002: {
    code: 'WHY_SEC_002',
    displayName: 'アクセス制御不備',
    description: 'アクセス制御の設定や管理に問題があった',
    group: 'セキュリティ関連',
  },
  WHY_SEC_003: {
    code: 'WHY_SEC_003',
    displayName: 'セキュリティ監査不足',
    description: 'セキュリティ監査や脆弱性チェックが不十分だった',
    group: 'セキュリティ関連',
  },

  // データ管理関連 (Data Management)
  WHY_DAT_001: {
    code: 'WHY_DAT_001',
    displayName: 'データ設計不備',
    description: 'データベース設計やデータ構造に問題があった',
    group: 'データ管理関連',
  },
  WHY_DAT_002: {
    code: 'WHY_DAT_002',
    displayName: 'データ移行不備',
    description: 'データ移行の計画や実行に問題があった',
    group: 'データ管理関連',
  },
  WHY_DAT_003: {
    code: 'WHY_DAT_003',
    displayName: 'バックアップ不備',
    description: 'データバックアップの仕組みや運用に問題があった',
    group: 'データ管理関連',
  },

  // 外部連携関連 (External Integration)
  WHY_EXT_001: {
    code: 'WHY_EXT_001',
    displayName: 'API設計不備',
    description: 'API設計や仕様に問題があった',
    group: '外部連携関連',
  },
  WHY_EXT_002: {
    code: 'WHY_EXT_002',
    displayName: '外部依存管理不備',
    description: '外部システムやサービスへの依存管理に問題があった',
    group: '外部連携関連',
  },
  WHY_EXT_003: {
    code: 'WHY_EXT_003',
    displayName: '連携テスト不足',
    description: '外部システムとの連携テストが不十分だった',
    group: '外部連携関連',
  },

  // プロジェクト管理関連 (Project Management)
  WHY_PJT_001: {
    code: 'WHY_PJT_001',
    displayName: 'スケジュール管理不備',
    description: 'プロジェクトのスケジュール管理に問題があった',
    group: 'プロジェクト管理関連',
  },
  WHY_PJT_002: {
    code: 'WHY_PJT_002',
    displayName: 'リソース管理不備',
    description: 'プロジェクトのリソース管理に問題があった',
    group: 'プロジェクト管理関連',
  },
  WHY_PJT_003: {
    code: 'WHY_PJT_003',
    displayName: '進捗管理不備',
    description: 'プロジェクトの進捗管理に問題があった',
    group: 'プロジェクト管理関連',
  },

  // コミュニケーション関連 (Communication)
  WHY_COM_001: {
    code: 'WHY_COM_001',
    displayName: '情報共有不足',
    description: 'チーム内外での情報共有が不十分だった',
    group: 'コミュニケーション関連',
  },
  WHY_COM_002: {
    code: 'WHY_COM_002',
    displayName: '報告・連絡不備',
    description: '適切な報告・連絡が行われなかった',
    group: 'コミュニケーション関連',
  },
  WHY_COM_003: {
    code: 'WHY_COM_003',
    displayName: 'ドキュメント不備',
    description: 'ドキュメントの作成や管理に問題があった',
    group: 'コミュニケーション関連',
  },

  // 人的要因関連 (Human Factors)
  WHY_HUM_001: {
    code: 'WHY_HUM_001',
    displayName: 'スキル不足',
    description: '必要なスキルや知識が不足していた',
    group: '人的要因関連',
  },
  WHY_HUM_002: {
    code: 'WHY_HUM_002',
    displayName: '教育・研修不足',
    description: '適切な教育や研修が行われていなかった',
    group: '人的要因関連',
  },
  WHY_HUM_003: {
    code: 'WHY_HUM_003',
    displayName: '作業負荷過多',
    description: '作業負荷が過多で適切な作業ができなかった',
    group: '人的要因関連',
  },

  // プロセス・手順関連 (Process)
  WHY_PRC_001: {
    code: 'WHY_PRC_001',
    displayName: '手順書不備',
    description: '作業手順書の内容や管理に問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_002: {
    code: 'WHY_PRC_002',
    displayName: 'チェック体制不備',
    description: 'チェックやレビューの体制に問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_003: {
    code: 'WHY_PRC_003',
    displayName: '承認プロセス不備',
    description: '承認プロセスの設計や運用に問題があった',
    group: 'プロセス・手順関連',
  },

  // ツール・技術関連 (Tools & Technology)
  WHY_TOL_001: {
    code: 'WHY_TOL_001',
    displayName: 'ツール選定不適切',
    description: '使用するツールの選定が不適切だった',
    group: 'ツール・技術関連',
  },
  WHY_TOL_002: {
    code: 'WHY_TOL_002',
    displayName: 'ツール習熟不足',
    description: 'ツールの使い方や機能の理解が不十分だった',
    group: 'ツール・技術関連',
  },
  WHY_TOL_003: {
    code: 'WHY_TOL_003',
    displayName: '技術選定不適切',
    description: '使用する技術の選定が不適切だった',
    group: 'ツール・技術関連',
  },

  // 組織・体制関連 (Organization)
  WHY_ORG_001: {
    code: 'WHY_ORG_001',
    displayName: '役割分担不明確',
    description: '役割や責任の分担が不明確だった',
    group: '組織・体制関連',
  },
  WHY_ORG_002: {
    code: 'WHY_ORG_002',
    displayName: '権限設定不適切',
    description: '権限の設定や管理が不適切だった',
    group: '組織・体制関連',
  },
  WHY_ORG_003: {
    code: 'WHY_ORG_003',
    displayName: '組織間連携不備',
    description: '組織間の連携や調整に問題があった',
    group: '組織・体制関連',
  },

  // 外部要因関連 (External Factors)
  WHY_ENV_001: {
    code: 'WHY_ENV_001',
    displayName: '外部環境変化',
    description: '外部環境の変化への対応が不十分だった',
    group: '外部要因関連',
  },
  WHY_ENV_002: {
    code: 'WHY_ENV_002',
    displayName: 'ベンダー問題',
    description: 'ベンダーやサプライヤーに起因する問題があった',
    group: '外部要因関連',
  },
  WHY_ENV_003: {
    code: 'WHY_ENV_003',
    displayName: '法規制対応不備',
    description: '法規制や規制要件への対応が不十分だった',
    group: '外部要因関連',
  },

  // 後方互換性のためのレガシーカテゴリ
  LEGACY_001: {
    code: 'LEGACY_001',
    displayName: '情報漏洩・誤送信',
    description: '情報漏洩や誤送信に関するインシデント',
    group: 'レガシー',
  },
  LEGACY_002: {
    code: 'LEGACY_002',
    displayName: 'システム障害',
    description: 'システム障害に関するインシデント',
    group: 'レガシー',
  },
  LEGACY_003: {
    code: 'LEGACY_003',
    displayName: '作業ミス',
    description: '作業ミスに関するインシデント',
    group: 'レガシー',
  },
  LEGACY_004: {
    code: 'LEGACY_004',
    displayName: 'コミュニケーション',
    description: 'コミュニケーションに関するインシデント',
    group: 'レガシー',
  },
  LEGACY_005: {
    code: 'LEGACY_005',
    displayName: 'その他',
    description: 'その他のインシデント',
    group: 'レガシー',
  },
};

// ヘルパー関数
export function getCategoryOptions(): Array<{ value: string; label: string }> {
  return Object.values(CATEGORIES).map((category) => ({
    value: category.code,
    label: category.displayName,
  }));
}

export function getCategoryDisplayName(code: string): string {
  return CATEGORIES[code]?.displayName || code;
}

export function getCategoryGroup(code: string): string {
  return CATEGORIES[code]?.group || 'その他';
}

export function getCategoryVariant(
  code: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const group = getCategoryGroup(code);

  // グループに基づいてバリアントを決定
  switch (group) {
    case '要求仕様関連':
    case '判断・意思決定関連':
      return 'destructive';
    case '設計関連':
    case '実装関連':
    case 'テスト関連':
      return 'secondary';
    case 'デプロイ・リリース関連':
    case '運用・監視関連':
    case 'インフラ・環境関連':
      return 'outline';
    case 'セキュリティ関連':
    case 'データ管理関連':
      return 'destructive';
    default:
      return 'default';
  }
}

// AI生成用の詳細カテゴリリスト（プロンプトで使用）
export function getAICategoryList(): string {
  const groups = Array.from(new Set(Object.values(CATEGORIES).map((c) => c.group)));
  return groups
    .map((group) => {
      const categoriesInGroup = Object.values(CATEGORIES)
        .filter((c) => c.group === group)
        .map((c) => `${c.code}: ${c.displayName} - ${c.description}`)
        .join('\n  ');
      return `**${group}:**\n  ${categoriesInGroup}`;
    })
    .join('\n\n');
}

// 分類例を含む詳細ガイド
export function getCategoryExamples(): string {
  return `
## 分類例とガイドライン:

**要求仕様関連の例:**
- 「スコープを勘違いして多く実装してしまった」→ WHY_REQ_002: 要求仕様不明確
- 「要件理解が甘く間違った解釈で進めた」→ WHY_REQ_001: 期待値合意不足
- 「仕様変更が伝わらず古い仕様で実装」→ WHY_REQ_003: 要求変更管理不備

**実装関連 vs 要求仕様関連の判断:**
- 実装技術やコーディング手法の問題 → 実装関連
- 何を作るべきかの理解不足 → 要求仕様関連

**人的要因関連の例:**
- 「新人で技術知識が不足していた」→ WHY_HUM_001: スキル不足
- 「研修を受けずに作業を開始した」→ WHY_HUM_002: 教育・研修不足
- 「残業続きで集中力が低下していた」→ WHY_HUM_003: 作業負荷過多

**プロセス・手順関連の例:**
- 「手順書が古く実際の手順と異なっていた」→ WHY_PRC_001: 手順書不備
- 「レビューが形式的で問題を見逃した」→ WHY_PRC_002: チェック体制不備
- 「承認者が不在で勝手に進めた」→ WHY_PRC_003: 承認プロセス不備

**コミュニケーション関連の例:**
- 「チーム間で情報が共有されていなかった」→ WHY_COM_001: 情報共有不足
- 「問題が発生したが報告しなかった」→ WHY_COM_002: 報告・連絡不備
- 「設計書が更新されておらず古い情報で作業」→ WHY_COM_003: ドキュメント不備
`;
}
