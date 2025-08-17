// AIモック処理

/**
 * basic-policy.txtで定義されたカテゴリ
 */
const CATEGORIES = [
  '技術的知識不足',
  '環境設定ミス',
  'コミュニケーション不足',
  '工数/スケジュール管理',
  '要件定義・仕様理解',
  'その他',
];

/**
 * NGワード検出パターン
 */
const NG_PATTERNS = [
  // メールアドレス
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // 電話番号（日本の形式）
  /0\d{1,4}-\d{1,4}-\d{4}/g,
  /0\d{9,10}/g,
  // 顧客名っぽいパターン（株式会社、有限会社など）
  /(株式会社|有限会社|合同会社|合資会社|合名会社)[^\s、。]+/g,
  /[^\s、。]+(株式会社|有限会社|合同会社|合資会社|合名会社)/g,
  // 個人名っぽいパターン（田中さん、佐藤部長など）
  /[一-龯]{2,4}(さん|君|ちゃん|部長|課長|主任|係長|取締役|社長|専務|常務|部長|課長|主任|係長|先輩|後輩)/g,
];

/**
 * 簡易NGワード検出
 */
function detectNgWords(text) {
  const detectedWords = [];
  const flags = {
    containsDisallowed: false,
  };

  for (const pattern of NG_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      flags.containsDisallowed = true;
      detectedWords.push(...matches);
    }
  }

  return {
    flags,
    detectedWords: [...new Set(detectedWords)], // 重複除去
  };
}

/**
 * 決定論的なハッシュ関数（文字列から数値を生成）
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

/**
 * 決定論的なカテゴリ選択
 */
function selectCategory(title, body) {
  const combined = title + body;
  const hash = simpleHash(combined);
  return CATEGORIES[hash % CATEGORIES.length];
}

/**
 * 決定論的なタグ生成
 */
function generateTags(title, body, category) {
  const combined = title + body + category;
  const hash = simpleHash(combined);

  const tagPool = [
    'データベース',
    '環境設定',
    'API',
    'フロントエンド',
    'バックエンド',
    'デプロイ',
    'テスト',
    'セキュリティ',
    'パフォーマンス',
    'ドキュメント',
    'コードレビュー',
    'バージョン管理',
    'ライブラリ',
    'フレームワーク',
    'ツール',
    'コミュニケーション',
    'スケジュール',
    '要件',
    '仕様',
    '設計',
  ];

  const numTags = (hash % 3) + 1; // 1-3個のタグ
  const selectedTags = [];

  for (let i = 0; i < numTags; i++) {
    const tagIndex = (hash + i * 7) % tagPool.length;
    const tag = tagPool[tagIndex];
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
  }

  return selectedTags;
}

/**
 * 決定論的な要約生成
 */
function generateSummary(title, body, category) {
  const templates = [
    `${category}に関する問題が発生しました。`,
    `${category}により作業に支障が生じました。`,
    `${category}が原因で予定通り進まない状況です。`,
    `${category}について対応が必要な事案です。`,
    `${category}に起因する課題が判明しました。`,
  ];

  const combined = title + body;
  const hash = simpleHash(combined);
  const template = templates[hash % templates.length];

  // タイトルの一部を含める
  const titleWords = title.split(/\s+/).slice(0, 3).join(' ');
  return `${titleWords}について、${template}`;
}

/**
 * 匿名化処理
 */
function anonymizeText(text, detectedWords) {
  let anonymized = text;
  const replacements = [];

  for (const word of detectedWords) {
    let replacement;

    // メールアドレス
    if (word.includes('@')) {
      replacement = '[メールアドレス]';
    }
    // 電話番号
    else if (/^\d/.test(word)) {
      replacement = '[電話番号]';
    }
    // 会社名
    else if (/(株式会社|有限会社|合同会社|合資会社|合名会社)/.test(word)) {
      replacement = '[顧客企業名]';
    }
    // 個人名
    else {
      replacement = '[個人名]';
    }

    anonymized = anonymized.replace(
      new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replacement,
    );
    replacements.push({
      from: word,
      to: replacement,
    });
  }

  return {
    anonymizedText: anonymized,
    suggestedReplacements: replacements,
  };
}

/**
 * AIモック処理のメイン関数
 */
function processWithMock(title, body) {
  // NGワード検出
  const ngDetection = detectNgWords(title + ' ' + body);

  // カテゴリ選択
  const category = selectCategory(title, body);

  // タグ生成
  const tags = generateTags(title, body, category);

  // 要約生成
  const summary = generateSummary(title, body, category);

  // 匿名化処理
  const anonymization = anonymizeText(body, ngDetection.detectedWords);

  const result = {
    summary,
    tags,
    category,
    anonymizedText: anonymization.anonymizedText,
    suggestedReplacements: anonymization.suggestedReplacements,
  };

  return {
    aiResult: result,
    flags: ngDetection.flags,
  };
}

module.exports = {
  processWithMock,
  detectNgWords,
  CATEGORIES,
};
