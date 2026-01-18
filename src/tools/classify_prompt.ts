import { classifyDomainAndRisk } from '../classifier/domain_classifier.js';
import { resolveAmbiguity } from '../enhancer/ambiguity_resolver.js';
import type { ClassifyPromptRequest, ClassifyPromptResponse } from '../types.js';

export function classifyPrompt(request: ClassifyPromptRequest): ClassifyPromptResponse {
  const classification = classifyDomainAndRisk(request.prompt, 'auto');
  const ambiguity = resolveAmbiguity(request.prompt, classification.domain);

  return {
    domain: classification.domain,
    risk_level: classification.risk_level,
    ambiguity_detected: ambiguity.ambiguity_detected,
  };
}
