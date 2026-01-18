import { classifyDomainAndRisk } from '../classifier/domain_classifier.js';
import { resolveAmbiguity } from '../enhancer/ambiguity_resolver.js';
import { synthesizeConstraints } from '../enhancer/constraint_synthesizer.js';
import { injectHallucinationGuards } from '../enhancer/hallucination_guard_injector.js';
import {
  buildPromptStructure,
  formatEnhancedPrompt,
} from '../enhancer/prompt_formatter.js';
import { computeDeterminismHash } from '../utils/determinism.js';
import type {
  Domain,
  EnhancePromptRequest,
  EnhancePromptResponse,
} from '../types.js';

export interface EnhancePromptInternalResult {
  enhanced_prompt: string;
  metadata: EnhancePromptResponse['metadata'];
  ambiguity_detected: boolean;
}

function isFormatRequested(prompt: string): boolean {
  return /\b(format|structure|schema|json|yaml|xml|csv|markdown|table|bullet|list|timeline|steps|step-by-step|outline)\b/i.test(
    prompt
  );
}

function deriveOutputFormat(params: {
  prompt: string;
  domain: Domain;
  force_output_format: boolean;
}): string | null {
  const { prompt, domain, force_output_format } = params;

  const needsDetailedFormat =
    force_output_format || domain === 'conversion' || isFormatRequested(prompt);

  if (!needsDetailedFormat) {
    return null;
  }

  const lower = prompt.toLowerCase();

  if (lower.includes('json')) {
    return 'Return a valid JSON object as the entire response.';
  }

  if (lower.includes('yaml')) {
    return 'Return a valid YAML document as the entire response.';
  }

  if (lower.includes('xml')) {
    return 'Return a valid XML document as the entire response.';
  }

  if (lower.includes('csv')) {
    return 'Return a valid CSV document as the entire response.';
  }

  if (lower.includes('markdown')) {
    return 'Respond in Markdown.';
  }

  if (lower.includes('table')) {
    return 'Use a table for structured comparisons or structured data.';
  }

  if (lower.includes('timeline')) {
    return 'Include a timeline as part of the response.';
  }

  if (lower.includes('step-by-step') || lower.includes('steps')) {
    return 'Provide the response as step-by-step instructions.';
  }

  if (lower.includes('outline')) {
    return 'Provide the response as a clear outline with headings and subpoints.';
  }

  if (lower.includes('bullet') || lower.includes('list')) {
    return 'Use bullet points or numbered lists where appropriate.';
  }

  if (domain === 'conversion') {
    return 'Provide the transformed output requested in TASK.';
  }

  return 'Provide the response in the format explicitly requested in TASK. If no explicit format is requested, use a clear structure.';
}

export function enhancePromptInternal(
  request: EnhancePromptRequest
): EnhancePromptInternalResult {
  const strictness = request.options?.strictness ?? 'auto';
  const language = request.options?.language ?? null;
  const force_output_format = request.options?.force_output_format ?? false;

  const classification = classifyDomainAndRisk(
    request.prompt,
    strictness === 'auto' ? 'auto' : strictness
  );

  const ambiguity = resolveAmbiguity(request.prompt, classification.domain);

  const constraints = synthesizeConstraints({
    domain: classification.domain,
    language,
  });

  const guards = injectHallucinationGuards({
    risk_level: classification.risk_level,
    inject_ambiguity_rules: ambiguity.inject_uncertainty_rules,
  });

  const outputFormat = deriveOutputFormat({
    prompt: request.prompt,
    domain: classification.domain,
    force_output_format,
  });

  const structure = buildPromptStructure({
    raw_prompt: request.prompt,
    domain: classification.domain,
    constraints,
    global_guards: guards.global_guards,
    verification_rules: guards.verification_rules,
    output_format: outputFormat,
  });

  const enhanced_prompt = formatEnhancedPrompt(structure);
  const determinism_hash = computeDeterminismHash(enhanced_prompt);

  const metadata: EnhancePromptResponse['metadata'] = {
    domain: classification.domain,
    risk_level: classification.risk_level,
    determinism_hash,
  };

  return {
    enhanced_prompt,
    metadata,
    ambiguity_detected: ambiguity.ambiguity_detected,
  };
}

export function enhancePrompt(request: EnhancePromptRequest): EnhancePromptResponse {
  const result = enhancePromptInternal(request);
  return {
    enhanced_prompt: result.enhanced_prompt,
    metadata: result.metadata,
  };
}
