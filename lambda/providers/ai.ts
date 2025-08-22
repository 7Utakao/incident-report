import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getAICategoryList } from '../constants/categories';

// Types
interface AIResponse {
  title: string;
  category: string;
  summary: string;
  improvements: string;
  suggestedReplacements: any[];
}

interface ProhibitedMatch {
  original: string;
  suggested: string;
  type: string;
}

// Prohibited information detection
function detectProhibitedInfo(text: string): ProhibitedMatch[] {
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

  // Personal names (simple pattern for Japanese names)
  const nameRegex =
    /[田中佐藤鈴木高橋渡辺伊藤山本中村小林加藤吉田山田松本井上木村林斎藤清水山口池田阿部橋本山下森川石川前田藤井岡田長谷川村上近藤石田後藤坂本遠藤青木藤原太田安田岡本奥田][一-龯]{1,3}(?:さん|くん|ちゃん|氏|様)?/g;
  const nameMatches = text.match(nameRegex);
  if (nameMatches) {
    nameMatches.forEach((name) => {
      matches.push({
        original: name,
        suggested: '[個人名]',
        type: 'name',
      });
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

// Bedrock provider
async function generateWithBedrock(content: string): Promise<AIResponse> {
  const region = process.env.BEDROCK_REGION || 'ap-northeast-1';
  const modelId = process.env.BEDROCK_MODEL || 'anthropic.claude-instant-v1';

  if (!process.env.BEDROCK_REGION && !process.env.AWS_REGION) {
    throw new Error('BEDROCK_REGION or AWS_REGION environment variable is required');
  }

  const bedrockClient = new BedrockRuntimeClient({ region });

  const categoryList = getAICategoryList();

  const prompt = `
以下のインシデント報告の原文を分析し、必ずJSON形式で回答してください。

原文:
${content}

利用可能なカテゴリ:
${categoryList}

以下のJSON形式で回答してください（他の文章は一切含めないでください）:
{
  "title": "適切なタイトル（50文字以内）",
  "category": "WHY_XXX_XXX形式のカテゴリコード",
  "summary": "要約された内容（個人情報を匿名化済み）",
  "improvements": "具体的な改善提案（箇条書き形式）",
  "suggestedReplacements": []
}

注意事項:
- 個人情報（名前、メールアドレス、電話番号など）は匿名化してください
- カテゴリは必ず上記のカテゴリリストから最も適切なコード（例：WHY_REQ_001）を選択してください
- インシデントの根本原因を分析し、最も適切なカテゴリを選んでください
- 改善提案は具体的で実行可能なものにしてください
- JSONの形式を厳密に守ってください
`;

  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    body: JSON.stringify(requestBody),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  const responseText = responseBody.content[0].text;
  const aiResult = JSON.parse(responseText);

  // Add prohibited information detection
  aiResult.suggestedReplacements = detectProhibitedInfo(content);

  return aiResult;
}

// OpenAI provider (for future use)
async function generateWithOpenAI(content: string): Promise<AIResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  // Import OpenAI dynamically to avoid bundling issues
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const categoryList = getAICategoryList();

  const prompt = `
以下のインシデント報告の原文を分析し、必ずJSON形式で回答してください。

原文:
${content}

利用可能なカテゴリ:
${categoryList}

以下のJSON形式で回答してください（他の文章は一切含めないでください）:
{
  "title": "適切なタイトル（50文字以内）",
  "category": "WHY_XXX_XXX形式のカテゴリコード",
  "summary": "要約された内容（個人情報を匿名化済み）",
  "improvements": "具体的な改善提案（箇条書き形式）",
  "suggestedReplacements": []
}

注意事項:
- 個人情報（名前、メールアドレス、電話番号など）は匿名化してください
- カテゴリは必ず上記のカテゴリリストから最も適切なコード（例：WHY_REQ_001）を選択してください
- インシデントの根本原因を分析し、最も適切なカテゴリを選んでください
- 改善提案は具体的で実行可能なものにしてください
- JSONの形式を厳密に守ってください
`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const responseText = response.choices[0].message.content || '';
  const aiResult = JSON.parse(responseText);

  // Add prohibited information detection
  aiResult.suggestedReplacements = detectProhibitedInfo(content);

  return aiResult;
}

// Main AI generation function
export async function generateAIReport(content: string): Promise<AIResponse> {
  const provider = process.env.AI_PROVIDER || 'bedrock';

  console.log(`Using AI provider: ${provider}`);

  switch (provider) {
    case 'bedrock':
      return await generateWithBedrock(content);
    case 'openai':
      return await generateWithOpenAI(content);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
