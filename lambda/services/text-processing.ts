// Text processing utilities for handling long inputs
export interface TextProcessingOptions {
  maxDirectLength?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  summaryLength?: number;
}

const DEFAULT_OPTIONS: Required<TextProcessingOptions> = {
  maxDirectLength: 3000, // Characters
  chunkSize: 1500, // Characters per chunk
  chunkOverlap: 200, // Overlap between chunks
  summaryLength: 800, // Target summary length
};

export interface ProcessedText {
  content: string;
  isProcessed: boolean;
  originalLength: number;
  processedLength: number;
  chunks?: string[];
}

export async function preprocessText(
  text: string,
  options: TextProcessingOptions = {},
): Promise<ProcessedText> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const originalLength = text.length;

  // Short text - process directly
  if (originalLength <= config.maxDirectLength) {
    return {
      content: text,
      isProcessed: false,
      originalLength,
      processedLength: originalLength,
    };
  }

  console.log(`Processing long text: ${originalLength} characters`);

  // Long text - apply map-reduce preprocessing
  const chunks = splitIntoChunks(text, config.chunkSize, config.chunkOverlap);
  const summaries = await Promise.all(chunks.map((chunk) => summarizeChunk(chunk)));
  const combinedSummary = summaries.join('\n\n');

  // If combined summary is still too long, summarize again
  let finalContent = combinedSummary;
  if (combinedSummary.length > config.maxDirectLength) {
    finalContent = await summarizeFinal(combinedSummary, config.summaryLength);
  }

  return {
    content: finalContent,
    isProcessed: true,
    originalLength,
    processedLength: finalContent.length,
    chunks,
  };
}

function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentenceEnd = Math.max(
        chunk.lastIndexOf('。'),
        chunk.lastIndexOf('！'),
        chunk.lastIndexOf('？'),
        chunk.lastIndexOf('.'),
        chunk.lastIndexOf('!'),
        chunk.lastIndexOf('?'),
      );

      if (lastSentenceEnd > chunkSize * 0.7) {
        chunk = chunk.slice(0, lastSentenceEnd + 1);
      }
    }

    chunks.push(chunk.trim());
    start = end - overlap;

    // Prevent infinite loop
    if (start >= end) {
      start = end;
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

async function summarizeChunk(chunk: string): Promise<string> {
  // Simple extractive summarization for preprocessing
  // In a real implementation, you might use a lightweight model or rule-based approach

  const sentences = splitIntoSentences(chunk);

  // Keep important sentences (those with keywords, numbers, etc.)
  const importantSentences = sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    return (
      sentence.length > 20 && // Not too short
      (lowerSentence.includes('問題') ||
        lowerSentence.includes('エラー') ||
        lowerSentence.includes('障害') ||
        lowerSentence.includes('原因') ||
        lowerSentence.includes('対策') ||
        lowerSentence.includes('改善') ||
        lowerSentence.includes('発生') ||
        lowerSentence.includes('影響') ||
        /\d/.test(sentence) || // Contains numbers
        sentence.includes('：') || // Contains colons (often important)
        sentence.includes('、')) // Contains commas (often detailed)
    );
  });

  // If we have important sentences, use them; otherwise, take first few sentences
  const selectedSentences =
    importantSentences.length > 0
      ? importantSentences.slice(0, Math.max(3, Math.floor(sentences.length * 0.4)))
      : sentences.slice(0, Math.max(2, Math.floor(sentences.length * 0.3)));

  return selectedSentences.join('');
}

async function summarizeFinal(text: string, targetLength: number): Promise<string> {
  // Final summarization to meet target length
  const sentences = splitIntoSentences(text);
  const targetSentenceCount = Math.max(
    2,
    Math.floor(sentences.length * (targetLength / text.length)),
  );

  // Prioritize sentences with key information
  const scoredSentences = sentences.map((sentence) => ({
    sentence,
    score: calculateSentenceScore(sentence),
  }));

  scoredSentences.sort((a, b) => b.score - a.score);

  const selectedSentences = scoredSentences
    .slice(0, targetSentenceCount)
    .map((item) => item.sentence);

  return selectedSentences.join('');
}

function splitIntoSentences(text: string): string[] {
  // Split by Japanese and English sentence endings
  const sentences = text.split(/[。！？\.!?]+/).filter((s) => s.trim().length > 0);
  return sentences.map((s) => s.trim() + (s.match(/[。！？\.!?]$/) ? '' : '。'));
}

function calculateSentenceScore(sentence: string): number {
  let score = 0;
  const lowerSentence = sentence.toLowerCase();

  // Keyword scoring
  const keywords = [
    '問題',
    'エラー',
    '障害',
    '原因',
    '対策',
    '改善',
    '発生',
    '影響',
    'システム',
    'サーバ',
    'データ',
    'ユーザ',
    '処理',
    '機能',
  ];

  keywords.forEach((keyword) => {
    if (lowerSentence.includes(keyword)) {
      score += 2;
    }
  });

  // Length scoring (prefer medium-length sentences)
  const length = sentence.length;
  if (length >= 20 && length <= 100) {
    score += 1;
  } else if (length > 100 && length <= 200) {
    score += 0.5;
  }

  // Number presence
  if (/\d/.test(sentence)) {
    score += 1;
  }

  // Structural elements
  if (sentence.includes('：') || sentence.includes(':')) {
    score += 1;
  }

  return score;
}

// Helper to check if text needs preprocessing
export function needsPreprocessing(text: string, maxLength: number = 3000): boolean {
  return text.length > maxLength;
}

// Helper to get processing stats
export function getProcessingStats(processed: ProcessedText): string {
  if (!processed.isProcessed) {
    return `Direct processing (${processed.originalLength} chars)`;
  }

  const reductionPercent = Math.round(
    ((processed.originalLength - processed.processedLength) / processed.originalLength) * 100,
  );

  return `Preprocessed: ${processed.originalLength} → ${processed.processedLength} chars (-${reductionPercent}%)`;
}
