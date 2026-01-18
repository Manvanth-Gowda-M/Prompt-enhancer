import type { Domain } from '../types.js';

export interface ConstraintSynthesisInput {
  domain: Domain;
  language?: string | null;
}

export function synthesizeConstraints(input: ConstraintSynthesisInput): string {
  const lines: string[] = [];

  lines.push('- Preserve the original user intent exactly.');
  lines.push('- Do not add new requirements, features, or scope.');

  if (input.language) {
    lines.push(`- Write the response in ${input.language}.`);
  }

  switch (input.domain) {
    case 'code':
      lines.push('- Use standard language features unless otherwise specified.');
      lines.push('- Do not assume framework versions.');
      break;
    case 'content':
      lines.push('- Maintain neutral, clear tone unless otherwise specified.');
      break;
    case 'planning':
      lines.push('- Base recommendations on common defaults only.');
      break;
    case 'research':
      lines.push('- Avoid unsupported claims.');
      break;
    default:
      break;
  }

  return lines.join('\n');
}
