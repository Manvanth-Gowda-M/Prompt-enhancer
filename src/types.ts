export interface PromptStructure {
  role: string;
  task: string;
  context: string;
  constraints: string;
  outputFormat: string;
  qualityBar: string;
}

export interface EnhancementResult {
  enhanced: string;
  metadata: {
    originalLength: number;
    enhancedLength: number;
    sectionsInferred: string[];
  };
}

export interface AnalysisResult {
  hasStructure: boolean;
  detectedSections: string[];
  taskType: 'decision-making' | 'informational' | 'implementation' | 'analysis';
  domainLevel: 'beginner' | 'intermediate' | 'expert';
  impliedRole?: string;
  coreTask?: string;
}
