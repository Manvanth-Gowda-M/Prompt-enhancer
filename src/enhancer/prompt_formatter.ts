import {
  DEFAULT_OUTPUT_FORMAT,
  SECTION_HEADERS,
  SEMANTIC_INTEGRITY_RULE,
} from '../constants.js';
import type { Domain, PromptStructure } from '../types.js';

function roleForDomain(domain: Domain): string {
  switch (domain) {
    case 'code':
      return 'You are an expert software engineer focused on correctness and reliability.';
    case 'content':
      return 'You are a professional writer and editor focused on clarity and accuracy.';
    case 'research':
      return 'You are a careful research assistant focused on factual accuracy and clear uncertainty handling.';
    case 'reasoning':
      return 'You are a rigorous reasoning assistant focused on logical correctness and explicit uncertainty.';
    case 'planning':
      return 'You are a pragmatic planner focused on actionable, realistic guidance.';
    case 'design':
      return 'You are a UI/UX designer focused on usability and clear communication.';
    case 'conversion':
      return 'You are a precise text transformation assistant focused on fidelity to the original content.';
    case 'unknown':
      return 'You are a careful assistant focused on following instructions and avoiding fabrication.';
  }
}

export function buildPromptStructure(params: {
  raw_prompt: string;
  domain: Domain;
  constraints: string;
  global_guards: string;
  verification_rules: string;
  output_format: string | null;
}): PromptStructure {
  const task = params.raw_prompt.trim();

  const contextLines: string[] = [];
  contextLines.push('No additional context was provided beyond the user prompt.');

  const constraintsParts: string[] = [];
  constraintsParts.push(params.global_guards);
  constraintsParts.push(params.constraints);

  return {
    role: roleForDomain(params.domain),
    task,
    context: contextLines.join(' '),
    constraints: constraintsParts.join('\n'),
    verification_rules: params.verification_rules,
    output_format: params.output_format ?? DEFAULT_OUTPUT_FORMAT,
    semantic_integrity_rule: SEMANTIC_INTEGRITY_RULE,
    quality_bar: qualityBarForDomain(params.domain),
  };
}

function qualityBarForDomain(domain: Domain): string {
  const lines: string[] = [];

  lines.push('- Fully addresses the user request in TASK.');
  lines.push('- Does not add, remove, or expand scope beyond the original request.');
  lines.push('- Treats missing information as unknown and states uncertainty clearly when needed.');
  lines.push('- Is clear, well-organized, and internally consistent.');

  if (domain === 'code') {
    lines.push('- Uses correct, idiomatic code and avoids assuming unspecified dependencies or versions.');
  }

  if (domain === 'research' || domain === 'unknown') {
    lines.push('- Avoids unsupported factual claims and does not invent citations or sources.');
  }

  return lines.join('\n');
}

export function formatEnhancedPrompt(structure: PromptStructure): string {
  const parts: string[] = [];

  parts.push(SECTION_HEADERS.ROLE);
  parts.push(structure.role.trim());
  parts.push('');

  parts.push(SECTION_HEADERS.TASK);
  parts.push(structure.task.trim());
  parts.push('');

  parts.push(SECTION_HEADERS.CONTEXT);
  parts.push(structure.context.trim());
  parts.push('');

  parts.push(SECTION_HEADERS.CONSTRAINTS);
  parts.push(structure.constraints.trim());
  parts.push('');

  parts.push(SECTION_HEADERS['VERIFICATION RULES']);
  parts.push(structure.verification_rules.trim());
  parts.push('');

  parts.push(SECTION_HEADERS['OUTPUT FORMAT']);
  parts.push(structure.output_format.trim());
  parts.push('');

  parts.push(SECTION_HEADERS['SEMANTIC INTEGRITY RULE']);
  parts.push(structure.semantic_integrity_rule.trim());
  parts.push('');

  parts.push(SECTION_HEADERS['QUALITY BAR']);
  parts.push(structure.quality_bar.trim());

  return parts.join('\n');
}
