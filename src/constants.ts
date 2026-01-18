export const SECTION_ORDER = [
  'ROLE',
  'TASK',
  'CONTEXT',
  'CONSTRAINTS',
  'VERIFICATION RULES',
  'OUTPUT FORMAT',
  'SEMANTIC INTEGRITY RULE',
  'QUALITY BAR',
] as const;

export const SECTION_HEADERS: Record<(typeof SECTION_ORDER)[number], string> = {
  ROLE: '### ROLE',
  TASK: '### TASK',
  CONTEXT: '### CONTEXT',
  CONSTRAINTS: '### CONSTRAINTS',
  'VERIFICATION RULES': '### VERIFICATION RULES',
  'OUTPUT FORMAT': '### OUTPUT FORMAT',
  'SEMANTIC INTEGRITY RULE': '### SEMANTIC INTEGRITY RULE',
  'QUALITY BAR': '### QUALITY BAR',
};

export const GLOBAL_GUARDS = [
  'Do not fabricate facts, data, sources, APIs, citations, or functionality.',
  'If required information is missing or unknown, explicitly state that it is unknown.',
  'Do not assume unstated user preferences, constraints, or context.',
  'Do not infer intent beyond what is explicitly requested.',
] as const;

export const BASE_VERIFICATION_RULES = [
  'Treat missing information as unknown.',
  'Prefer conservative, factual responses over speculative or creative ones.',
  'Clearly state uncertainty when certainty is not possible.',
  'Never guess to fill gaps in information.',
] as const;

export const HIGH_RISK_VERIFICATION_ADDITIONS = [
  'Do not provide estimates unless explicitly requested.',
  'Avoid absolute claims unless directly supported by provided information.',
  'If factual accuracy cannot be ensured, say so explicitly.',
] as const;

export const AMBIGUITY_VERIFICATION_ADDITIONS = [
  'If required details are missing, respond using general best practices.',
  'Explicitly state any assumptions made.',
] as const;

export const DEFAULT_OUTPUT_FORMAT =
  'Provide a clear, well-organized response using appropriate structure.';

export const SEMANTIC_INTEGRITY_RULE =
  'The response must satisfy the original user request exactly, without adding, removing, or expanding scope.';
