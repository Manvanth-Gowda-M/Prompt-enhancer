import type { Domain, RiskLevel } from '../types.js';

export interface ClassificationResult {
  domain: Domain;
  risk_level: RiskLevel;
  safety_critical_detected: boolean;
  factual_request_detected: boolean;
}

const CODE_PATTERNS: RegExp[] = [
  /```[\s\S]*?```/m,
  /\b(function|class|interface|type|import|export|const|let|var|def|return)\b/i,
  /\b(node\.js|nodejs|typescript|javascript|python|java|c\+\+|c#|golang|rust|sql|regex)\b/i,
  /[{};]|=>/,
  /\b(api|sdk|library|framework|package|dependency|npm|pip|cargo|maven|gradle)\b/i,
];

const CONTENT_PATTERNS: RegExp[] = [
  /\b(write|draft|compose|script|story|caption|post|blog|newsletter|copy|narrative|poem)\b/i,
  /\b(tone|voice|style guide|headline|tagline|call to action)\b/i,
];

const RESEARCH_PATTERNS: RegExp[] = [
  /\b(research|study|studies|evidence|data|statistics|statistic|sources|citations|references)\b/i,
  /\b(explain|cause|causes|history|when did|how many|what is|who is)\b/i,
];

const REASONING_PATTERNS: RegExp[] = [
  /\b(why|how)\b/i,
  /\b(logic|reasoning|solve|prove|derive|deduce)\b/i,
];

const PLANNING_PATTERNS: RegExp[] = [
  /\b(plan|roadmap|strategy|process|steps|timeline|milestones|checklist)\b/i,
];

const DESIGN_PATTERNS: RegExp[] = [
  /\b(ui|ux|wireframe|layout|branding|logo|typography|color palette|visual design)\b/i,
];

const CONVERSION_PATTERNS: RegExp[] = [
  /\b(translate|summarize|convert|rewrite|transform|paraphrase|extract)\b/i,
];

const SAFETY_CRITICAL_PATTERNS: RegExp[] = [
  /\b(legal|law|contract|lawsuit|attorney|compliance|regulation|tax)\b/i,
  /\b(medical|diagnosis|treatment|symptom|dosage|drug|health)\b/i,
  /\b(security|vulnerability|exploit|malware|phishing|password|encryption)\b/i,
];

const FACTUAL_REQUEST_PATTERNS: RegExp[] = [
  /\b(how many|when|what year|date|statistics|data|percent|percentage|rate)\b/i,
  /\b(cite|citation|source|reference)\b/i,
  /\b(gdp|population|revenue|market size|inflation)\b/i,
];

function matchesAny(prompt: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(prompt));
}

function detectDomain(prompt: string): Domain {
  // Order matters: first match wins.
  if (matchesAny(prompt, CODE_PATTERNS)) return 'code';
  if (matchesAny(prompt, CONTENT_PATTERNS)) return 'content';
  if (matchesAny(prompt, RESEARCH_PATTERNS)) return 'research';
  if (matchesAny(prompt, REASONING_PATTERNS)) return 'reasoning';
  if (matchesAny(prompt, PLANNING_PATTERNS)) return 'planning';
  if (matchesAny(prompt, DESIGN_PATTERNS)) return 'design';
  if (matchesAny(prompt, CONVERSION_PATTERNS)) return 'conversion';
  return 'unknown';
}

function baseRiskForDomain(domain: Domain): RiskLevel {
  switch (domain) {
    case 'content':
    case 'design':
    case 'conversion':
      return 'low';
    case 'code':
    case 'reasoning':
    case 'planning':
      return 'medium';
    case 'research':
    case 'unknown':
      return 'high';
  }
}

export function classifyDomainAndRisk(
  prompt: string,
  strictness: 'normal' | 'strict' | 'auto' = 'auto'
): ClassificationResult {
  const domain = detectDomain(prompt);

  const safetyCritical = matchesAny(prompt, SAFETY_CRITICAL_PATTERNS);
  const factualRequest =
    matchesAny(prompt, FACTUAL_REQUEST_PATTERNS) ||
    (/[0-9]/.test(prompt) && matchesAny(prompt, [/\b(statistics|data|date|year|percent)\b/i]));

  let risk_level = baseRiskForDomain(domain);

  if (safetyCritical || factualRequest) {
    risk_level = 'high';
  }

  if (strictness === 'strict') {
    risk_level = 'high';
  }

  return {
    domain,
    risk_level,
    safety_critical_detected: safetyCritical,
    factual_request_detected: factualRequest,
  };
}
