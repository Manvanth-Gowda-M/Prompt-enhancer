import type { Domain } from '../types.js';

export interface AmbiguityResult {
  ambiguity_detected: boolean;
  inject_uncertainty_rules: boolean;
}

const AMBIGUITY_PATTERNS: RegExp[] = [
  /\betc\.?\b/i,
  /\band so on\b/i,
  /\bwhatever\b/i,
  /\banything\b/i,
  /\bsomething\b/i,
  /\bvarious\b/i,
  /\bseveral\b/i,
  /\ba few\b/i,
  /\bkind of\b/i,
  /\bsort of\b/i,
  /\bmaybe\b/i,
  /\bapproximately\b/i,
  /\bas needed\b/i,
  /\bas appropriate\b/i,
  /\bto be determined\b/i,
  /\btbd\b/i,
  /<[^>]+>/,
  /\[[^\]]+\]/,
];

function matchesAny(prompt: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(prompt));
}

export function resolveAmbiguity(prompt: string, domain: Domain): AmbiguityResult {
  const ambiguity_detected = matchesAny(prompt, AMBIGUITY_PATTERNS) || prompt.trim().split(/\s+/).length <= 3;

  const inject_uncertainty_rules =
    ambiguity_detected &&
    (domain === 'code' ||
      domain === 'planning' ||
      domain === 'research' ||
      domain === 'reasoning' ||
      domain === 'unknown');

  return { ambiguity_detected, inject_uncertainty_rules };
}
