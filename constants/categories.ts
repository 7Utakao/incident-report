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
  WHY_PRC_004: {
    code: 'WHY_PRC_004',
    displayName: '評価指標の未整備',
    description: '評価指標や測定方法が整備されていなかった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_005: {
    code: 'WHY_PRC_005',
    displayName: '推論コストの見積もり誤り',
    description: 'AI推論コストの見積もりや管理に問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_006: {
    code: 'WHY_PRC_006',
    displayName: 'RAGの更新フロー不備',
    description: 'RAGシステムの更新フローや管理に問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_007: {
    code: 'WHY_PRC_007',
    displayName: 'キー/権限管理の不備',
    description: 'APIキーや権限管理に問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_008: {
    code: 'WHY_PRC_008',
    displayName: 'モニタリング不足',
    description: 'システムの監視や異常検知が不十分だった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_009: {
    code: 'WHY_PRC_009',
    displayName: 'データ品質管理不備',
    description: 'データの品質管理や検証プロセスに問題があった',
    group: 'プロセス・手順関連',
  },
  WHY_PRC_010: {
    code: 'WHY_PRC_010',
    displayName: 'セキュリティ/PII取り扱いの不備',
    description: 'セキュリティや個人情報の取り扱いに問題があった',
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
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' {
  const group = getCategoryGroup(code);

  // グループに基づいてバリアントを決定
  switch (group) {
    case '要求仕様関連':
    case '判断・意思決定関連':
      return 'error'; // 赤系 - 重要度高
    case '設計関連':
    case '実装関連':
    case 'テスト関連':
      return 'secondary'; // 青系 - 技術関連
    case 'デプロイ・リリース関連':
    case '運用・監視関連':
    case 'インフラ・環境関連':
      return 'primary'; // 青系 - インフラ関連
    case 'セキュリティ関連':
    case 'データ管理関連':
      return 'error'; // 赤系 - セキュリティ重要
    case 'プロセス・手順関連':
    case 'コミュニケーション関連':
    case '人的要因関連':
      return 'warning'; // 黄系 - プロセス改善
    case '外部連携関連':
    case 'プロジェクト管理関連':
      return 'outline'; // グレー系 - 外部要因
    case 'ツール・技術関連':
    case '組織・体制関連':
    case '外部要因関連':
      return 'outline'; // グレー系 - 環境要因
    case 'レガシー':
      return 'secondary'; // 青系 - 後方互換
    default:
      return 'default';
  }
}

// ホーム画面用のTailwind CSS色クラスを取得する関数（視認性向上版）
export function getCategoryColorClasses(code: string): { bg: string; text: string } {
  // 各カテゴリに個別の色を割り当て（より濃い色で視認性向上）
  const colorMap: Record<string, { bg: string; text: string }> = {
    // 🔴 赤系（要求仕様・判断意思決定）
    WHY_REQ_001: { bg: 'bg-red-200', text: 'text-red-800' }, // #fee2e2 / #991b1b
    WHY_REQ_002: { bg: 'bg-rose-200', text: 'text-rose-800' }, // #ffe4e6 / #9f1239
    WHY_REQ_003: { bg: 'bg-red-300', text: 'text-red-900' }, // #fecaca / #7f1d1d
    WHY_JDG_001: { bg: 'bg-orange-200', text: 'text-orange-800' }, // #ffedd5 / #9a3412
    WHY_JDG_002: { bg: 'bg-yellow-300', text: 'text-yellow-900' }, // #fde68a / #78350f
    WHY_JDG_003: { bg: 'bg-rose-300', text: 'text-rose-900' }, // #fecdd3 / #881337

    // 🔵 青系（設計・実装・テスト）
    WHY_DES_001: { bg: 'bg-blue-200', text: 'text-blue-800' }, // #dbeafe / #1e40af
    WHY_DES_002: { bg: 'bg-sky-200', text: 'text-sky-800' }, // #e0f2fe / #075985
    WHY_DES_003: { bg: 'bg-indigo-200', text: 'text-indigo-800' }, // #e0e7ff / #3730a3
    WHY_IMP_001: { bg: 'bg-cyan-200', text: 'text-cyan-800' }, // #cffafe / #155e75
    WHY_IMP_002: { bg: 'bg-blue-300', text: 'text-blue-900' }, // #bfdbfe / #1e3a8a
    WHY_IMP_003: { bg: 'bg-sky-300', text: 'text-sky-900' }, // #bae6fd / #0c4a6e
    WHY_TST_001: { bg: 'bg-indigo-300', text: 'text-indigo-900' }, // #c7d2fe / #312e81
    WHY_TST_002: { bg: 'bg-violet-200', text: 'text-violet-800' }, // #ede9fe / #5b21b6
    WHY_TST_003: { bg: 'bg-cyan-300', text: 'text-cyan-900' }, // #a5f3fc / #164e63

    // 🟦 インディゴ系（デプロイ・運用・インフラ）
    WHY_DEP_001: { bg: 'bg-indigo-200', text: 'text-indigo-800' }, // #e0e7ff / #3730a3
    WHY_DEP_002: { bg: 'bg-violet-200', text: 'text-violet-800' }, // #ede9fe / #5b21b6
    WHY_DEP_003: { bg: 'bg-purple-200', text: 'text-purple-800' }, // #f3e8ff / #6b21a8
    WHY_OPS_001: { bg: 'bg-slate-300', text: 'text-slate-900' }, // #e2e8f0 / #1e293b
    WHY_OPS_002: { bg: 'bg-indigo-300', text: 'text-indigo-900' }, // #c7d2fe / #312e81
    WHY_OPS_003: { bg: 'bg-violet-300', text: 'text-violet-900' }, // #ddd6fe / #4c1d95
    WHY_INF_001: { bg: 'bg-teal-200', text: 'text-teal-800' }, // #ccfbf1 / #115e59
    WHY_INF_002: { bg: 'bg-sky-300', text: 'text-sky-900' }, // #bae6fd / #0c4a6e
    WHY_INF_003: { bg: 'bg-blue-300', text: 'text-blue-900' }, // #bfdbfe / #1e3a8a

    // 🌹 ローズ系（セキュリティ・データ）
    WHY_SEC_001: { bg: 'bg-rose-200', text: 'text-rose-800' }, // #ffe4e6 / #9f1239
    WHY_SEC_002: { bg: 'bg-pink-200', text: 'text-pink-800' }, // #fce7f3 / #9d174d
    WHY_SEC_003: { bg: 'bg-rose-300', text: 'text-rose-900' }, // #fecdd3 / #881337
    WHY_DAT_001: { bg: 'bg-fuchsia-200', text: 'text-fuchsia-800' }, // #fae8ff / #86198f
    WHY_DAT_002: { bg: 'bg-pink-300', text: 'text-pink-900' }, // #fbcfe8 / #831843
    WHY_DAT_003: { bg: 'bg-fuchsia-300', text: 'text-fuchsia-900' }, // #f5d0fe / #701a75

    // 🎨 プロセス関連（各カテゴリに異なる色系統を割り当て）
    WHY_PRC_001: { bg: 'bg-blue-200', text: 'text-blue-800' }, // 手順書不備 → 青系
    WHY_PRC_002: { bg: 'bg-green-200', text: 'text-green-800' }, // チェック体制不備 → 緑系
    WHY_PRC_003: { bg: 'bg-orange-200', text: 'text-orange-800' }, // 承認プロセス不備 → オレンジ系
    WHY_PRC_004: { bg: 'bg-purple-200', text: 'text-purple-800' }, // 評価指標の未整備 → 紫系
    WHY_PRC_005: { bg: 'bg-indigo-200', text: 'text-indigo-800' }, // 推論コストの見積もり誤り → インディゴ系
    WHY_PRC_006: { bg: 'bg-rose-200', text: 'text-rose-800' }, // RAGの更新フロー不備 → ローズ系
    WHY_PRC_007: { bg: 'bg-slate-200', text: 'text-slate-800' }, // キー/権限管理の不備 → スレート系
    WHY_PRC_008: { bg: 'bg-teal-200', text: 'text-teal-800' }, // モニタリング不足 → ティール系
    WHY_PRC_009: { bg: 'bg-cyan-200', text: 'text-cyan-800' }, // データ品質管理不備 → シアン系
    WHY_PRC_010: { bg: 'bg-red-200', text: 'text-red-800' }, // セキュリティ/PII取り扱いの不備 → 赤系
    WHY_COM_001: { bg: 'bg-lime-200', text: 'text-lime-800' }, // #ecfccb / #3f6212
    WHY_COM_002: { bg: 'bg-green-200', text: 'text-green-800' }, // #dcfce7 / #166534
    WHY_COM_003: { bg: 'bg-emerald-200', text: 'text-emerald-800' }, // #d1fae5 / #065f46
    WHY_HUM_001: { bg: 'bg-lime-300', text: 'text-lime-900' }, // #d9f99d / #365314
    WHY_HUM_002: { bg: 'bg-green-300', text: 'text-green-900' }, // #bbf7d0 / #14532d
    WHY_HUM_003: { bg: 'bg-emerald-300', text: 'text-emerald-900' }, // #a7f3d0 / #064e3b

    // ⚪ グレー系（外部・プロジェクト）
    WHY_EXT_001: { bg: 'bg-gray-200', text: 'text-gray-800' }, // #f3f4f6 / #1f2937
    WHY_EXT_002: { bg: 'bg-zinc-200', text: 'text-zinc-800' }, // #f4f4f5 / #27272a
    WHY_EXT_003: { bg: 'bg-neutral-200', text: 'text-neutral-800' }, // #f5f5f5 / #262626
    WHY_PJT_001: { bg: 'bg-stone-200', text: 'text-stone-800' }, // #f5f5f4 / #292524
    WHY_PJT_002: { bg: 'bg-slate-300', text: 'text-slate-900' }, // #e2e8f0 / #1e293b
    WHY_PJT_003: { bg: 'bg-gray-300', text: 'text-gray-900' }, // #e5e7eb / #111827

    // 🔘 スレート系（ツール・組織・環境）
    WHY_TOL_001: { bg: 'bg-slate-400', text: 'text-slate-900' }, // #cbd5e1 / #0f172a
    WHY_TOL_002: { bg: 'bg-zinc-300', text: 'text-zinc-900' }, // #e4e4e7 / #18181b
    WHY_TOL_003: { bg: 'bg-neutral-300', text: 'text-neutral-900' }, // #e5e5e5 / #171717
    WHY_ORG_001: { bg: 'bg-stone-300', text: 'text-stone-900' }, // #e7e5e4 / #1c1917
    WHY_ORG_002: { bg: 'bg-slate-400', text: 'text-slate-900' }, // #cbd5e1 / #0f172a
    WHY_ORG_003: { bg: 'bg-gray-400', text: 'text-gray-900' }, // #d1d5db / #111827
    WHY_ENV_001: { bg: 'bg-teal-200', text: 'text-teal-800' }, // #ccfbf1 / #115e59
    WHY_ENV_002: { bg: 'bg-cyan-200', text: 'text-cyan-800' }, // #cffafe / #155e75
    WHY_ENV_003: { bg: 'bg-sky-200', text: 'text-sky-800' }, // #e0f2fe / #075985

    // 🟢 エメラルド系（従来カテゴリ）
    LEGACY_001: { bg: 'bg-emerald-200', text: 'text-emerald-800' }, // #d1fae5 / #065f46
    LEGACY_002: { bg: 'bg-teal-200', text: 'text-teal-800' }, // #ccfbf1 / #115e59
    LEGACY_003: { bg: 'bg-green-200', text: 'text-green-800' }, // #dcfce7 / #166534
    LEGACY_004: { bg: 'bg-lime-200', text: 'text-lime-800' }, // #ecfccb / #3f6212
    LEGACY_005: { bg: 'bg-emerald-300', text: 'text-emerald-900' }, // #a7f3d0 / #064e3b
  };

  return colorMap[code] || { bg: 'bg-gray-200', text: 'text-gray-800' };
}
