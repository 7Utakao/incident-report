// インシデント報告のカテゴリ定義（バックエンドと統一）
export interface Category {
  code: string;
  displayName: string;
  description: string;
  group: string;
}

// カテゴリ定義（バックエンドのlambda/constants/categories.tsと統一）
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
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' {
  const group = getCategoryGroup(code);

  // グループに基づいてバリアントを決定
  switch (group) {
    case '要求仕様関連':
    case '判断・意思決定関連':
      return 'error';
    case '設計関連':
    case '実装関連':
    case 'テスト関連':
      return 'secondary';
    case 'プロセス・手順関連':
    case 'コミュニケーション関連':
    case '人的要因関連':
      return 'warning';
    default:
      return 'default';
  }
}
