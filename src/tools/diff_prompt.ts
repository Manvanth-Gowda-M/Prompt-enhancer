import { enhancePromptInternal } from './enhance_prompt.js';
import type { DiffPromptRequest, DiffPromptResponse } from '../types.js';

export function diffPrompt(request: DiffPromptRequest): DiffPromptResponse {
  const enhanced = enhancePromptInternal({ prompt: request.prompt });

  const changes_made: string[] = [];
  changes_made.push('section additions');
  changes_made.push('guard injections');

  if (enhanced.metadata.risk_level === 'high') {
    changes_made.push('high-risk guard injections');
  }

  if (enhanced.ambiguity_detected) {
    changes_made.push('ambiguity handling');
  }

  return {
    raw: request.prompt,
    enhanced: enhanced.enhanced_prompt,
    changes_made,
    metadata: enhanced.metadata,
  };
}
