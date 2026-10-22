import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type KnowledgeChunk = {
  source: string;
  heading: string;
  text: string;
  tokens: string[];
};

const MAX_CHUNK_CHARACTERS = 1500;

export function tokenize(value: string): string[] {
  const normalized = value
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, '')
    .replace(/ـ/gu, '')
    .replace(/[إأآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .toLocaleLowerCase('ar-EG');
  return normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
}

function splitLongBlock(block: string): string[] {
  if (block.length <= MAX_CHUNK_CHARACTERS) return [block];
  const sentences = block.split(/(?<=[.!؟؛])\s+/u);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (!sentence) continue;
    if (sentence.length > MAX_CHUNK_CHARACTERS) {
      if (current) chunks.push(current);
      current = '';
      for (let offset = 0; offset < sentence.length; offset += MAX_CHUNK_CHARACTERS) {
        chunks.push(sentence.slice(offset, offset + MAX_CHUNK_CHARACTERS));
      }
      continue;
    }
    if (current && current.length + sentence.length + 1 > MAX_CHUNK_CHARACTERS) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function chunkFile(source: string, contents: string): KnowledgeChunk[] {
  const blocks = contents
    .replace(/\r\n?/gu, '\n')
    .split(/\n{2,}/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks: KnowledgeChunk[] = [];
  let currentHeading = path.basename(source, path.extname(source));
  let current = '';

  const addChunk = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    chunks.push({
      source,
      heading: currentHeading,
      text: cleanText,
      tokens: tokenize(cleanText),
    });
  };

  for (const block of blocks) {
    const heading = block.match(/^#{1,3}\s+(.+)$/mu)?.[1]?.trim();
    if (heading) {
      if (current) addChunk(current);
      current = '';
      currentHeading = heading;
    }
    for (const piece of splitLongBlock(block)) {
      if (current && current.length + piece.length + 2 > MAX_CHUNK_CHARACTERS) {
        addChunk(current);
        current = '';
      }
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }

  if (current) addChunk(current);
  return chunks;
}

export function loadKnowledgeChunks(knowledgeDirectory: string): KnowledgeChunk[] {
  let fileNames: string[];
  try {
    fileNames = readdirSync(knowledgeDirectory)
      .filter((name) => /\.(md|txt|json)$/iu.test(name))
      .filter((name) => name.toLocaleLowerCase('en') !== 'readme.md')
      .sort((left, right) => left.localeCompare(right, 'en'));
  } catch {
    return [];
  }

  const chunks: KnowledgeChunk[] = [];
  for (const fileName of fileNames) {
    const filePath = path.join(knowledgeDirectory, fileName);
    try {
      const content = readFileSync(filePath, 'utf8');
      chunks.push(...chunkFile(fileName, content));
    } catch {
      // A malformed or unreadable knowledge file is skipped without exposing its path or contents.
    }
  }
  return chunks;
}

export function findRelevantKnowledge(
  question: string,
  chunks: KnowledgeChunk[],
  limit = 8
): KnowledgeChunk[] {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0 || chunks.length === 0) return [];

  const documentFrequency = new Map<string, number>();
  for (const chunk of chunks) {
    for (const token of new Set(chunk.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }
  const averageLength = chunks.reduce((sum, chunk) => sum + chunk.tokens.length, 0) / chunks.length || 1;
  const termFrequencyByChunk = chunks.map((chunk) => {
    const frequency = new Map<string, number>();
    for (const token of chunk.tokens) frequency.set(token, (frequency.get(token) ?? 0) + 1);
    return frequency;
  });

  const scores = chunks.map((chunk, index) => {
    const frequencies = termFrequencyByChunk[index];
    let score = 0;
    for (const token of queryTokens) {
      const frequency = frequencies.get(token) ?? 0;
      if (frequency === 0) continue;
      const docsWithToken = documentFrequency.get(token) ?? 0;
      const inverseDocumentFrequency = Math.log(
        1 + (chunks.length - docsWithToken + 0.5) / (docsWithToken + 0.5)
      );
      const k1 = 1.5;
      const b = 0.75;
      const lengthFactor = frequency + k1 * (1 - b + b * (chunk.tokens.length / averageLength));
      score += inverseDocumentFrequency * ((frequency * (k1 + 1)) / lengthFactor);
    }
    return { chunk, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

export function formatKnowledgeContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return 'لم يتم العثور على مقاطع مناسبة في ملفات المعرفة.';
  return chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.heading} — ${chunk.source}\n${chunk.text}`)
    .join('\n\n');
}
