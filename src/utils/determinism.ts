import { createHash } from 'node:crypto';

export function normalizeForDeterminismHash(text: string): string {
  return text.normalize('NFKC').trim().toLowerCase();
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function computeDeterminismHash(enhancedPrompt: string): string {
  return sha256Hex(normalizeForDeterminismHash(enhancedPrompt));
}
