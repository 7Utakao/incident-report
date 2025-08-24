import type { ProhibitedMatch } from '../types';

export function detectProhibitedInfo(text: string): ProhibitedMatch[] {
  const matches: ProhibitedMatch[] = [];

  // Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach((email) => {
      matches.push({
        original: email,
        suggested: '[メールアドレス]',
        type: 'email',
      });
    });
  }

  // Phone numbers (Japanese format)
  const phoneRegex = /(?:\d{2,4}-\d{2,4}-\d{4}|\d{10,11})/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches) {
    phoneMatches.forEach((phone) => {
      matches.push({
        original: phone,
        suggested: '[電話番号]',
        type: 'phone',
      });
    });
  }

  // Personal names (improved pattern for Japanese names)
  // 業務用語を除外するためのパターンを追加
  const businessTerms = [
    '管理',
    '運用',
    '開発',
    '設計',
    '企画',
    '営業',
    '経理',
    '総務',
    '人事',
    '法務',
    'システム',
    'サービス',
    'プロジェクト',
    'チーム',
    'グループ',
    '部門',
    '課長',
    '部長',
    '主任',
    '係長',
    'マネージャー',
    'リーダー',
    '担当',
    '責任者',
  ];

  const nameRegex =
    /[田中佐藤鈴木高橋渡辺伊藤山本中村小林加藤吉田山田松本井上木村林斎藤清水山口池田阿部橋本山下森川石川前田藤井岡田長谷川村上近藤石田後藤坂本遠藤青木藤原太田安田岡本奥田][一-龯]{1,3}(?:さん|くん|ちゃん|氏|様)/g;
  const nameMatches = text.match(nameRegex);
  if (nameMatches) {
    nameMatches.forEach((name) => {
      // 業務用語が含まれている場合は除外
      const nameWithoutHonorifics = name.replace(/(?:さん|くん|ちゃん|氏|様)$/, '');
      const isBusinessTerm = businessTerms.some((term) => nameWithoutHonorifics.includes(term));

      if (!isBusinessTerm) {
        matches.push({
          original: name,
          suggested: '[個人名]',
          type: 'name',
        });
      }
    });
  }

  // Company names (common patterns)
  const companyRegex =
    /(?:[株式会社|有限会社|合同会社|合資会社|合名会社]\s*[ァ-ヶー一-龯A-Za-z0-9]+|[ァ-ヶー一-龯A-Za-z0-9]+\s*(?:株式会社|有限会社|合同会社|Inc\.|Corp\.|Ltd\.))/g;
  const companyMatches = text.match(companyRegex);
  if (companyMatches) {
    companyMatches.forEach((company) => {
      matches.push({
        original: company,
        suggested: '[会社名]',
        type: 'company',
      });
    });
  }

  return matches;
}
