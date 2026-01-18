import {
  AMBIGUITY_VERIFICATION_ADDITIONS,
  BASE_VERIFICATION_RULES,
  GLOBAL_GUARDS,
  HIGH_RISK_VERIFICATION_ADDITIONS,
} from '../constants.js';
import type { RiskLevel } from '../types.js';

export interface GuardInjectionResult {
  global_guards: string;
  verification_rules: string;
}

export function injectHallucinationGuards(params: {
  risk_level: RiskLevel;
  inject_ambiguity_rules: boolean;
}): GuardInjectionResult {
  const globalGuardLines = GLOBAL_GUARDS.map((g) => `- ${g}`).join('\n');

  const verificationLines: string[] = [];
  for (const rule of BASE_VERIFICATION_RULES) {
    verificationLines.push(`- ${rule}`);
  }

  if (params.risk_level === 'high') {
    for (const rule of HIGH_RISK_VERIFICATION_ADDITIONS) {
      verificationLines.push(`- ${rule}`);
    }
  }

  if (params.inject_ambiguity_rules) {
    for (const rule of AMBIGUITY_VERIFICATION_ADDITIONS) {
      verificationLines.push(`- ${rule}`);
    }
  }

  return {
    global_guards: globalGuardLines,
    verification_rules: verificationLines.join('\n'),
  };
}
