export type Domain =
  | 'code'
  | 'content'
  | 'research'
  | 'reasoning'
  | 'planning'
  | 'design'
  | 'conversion'
  | 'unknown';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface EnhancePromptRequest {
  prompt: string;
  options?: {
    language?: string | null;
    force_output_format?: boolean | null;
    strictness?: 'normal' | 'strict' | 'auto';
  };
}

export interface EnhancePromptResponse {
  enhanced_prompt: string;
  metadata: {
    domain: Domain;
    risk_level: RiskLevel;
    determinism_hash: string;
  };
}

export interface ClassifyPromptRequest {
  prompt: string;
}

export interface ClassifyPromptResponse {
  domain: Domain;
  risk_level: RiskLevel;
  ambiguity_detected: boolean;
}

export interface DiffPromptRequest {
  prompt: string;
}

export interface DiffPromptResponse {
  raw: string;
  enhanced: string;
  changes_made: string[];
  metadata: {
    domain: Domain;
    risk_level: RiskLevel;
    determinism_hash: string;
  };
}

export interface PromptStructure {
  role: string;
  task: string;
  context: string;
  constraints: string;
  verification_rules: string;
  output_format: string;
  semantic_integrity_rule: string;
  quality_bar: string;
}
