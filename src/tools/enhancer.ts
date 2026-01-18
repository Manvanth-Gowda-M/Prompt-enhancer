import { enhancePrompt } from '../utils/prompt-logic.js';

export interface EnhancePromptInput {
  prompt: string;
}

export function validateInput(input: unknown): input is EnhancePromptInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  const obj = input as Record<string, unknown>;
  
  if (typeof obj.prompt !== 'string') {
    return false;
  }
  
  if (obj.prompt.length < 10) {
    throw new Error('Prompt must be at least 10 characters long');
  }
  
  if (obj.prompt.length > 5000) {
    throw new Error('Prompt must not exceed 5000 characters');
  }
  
  return true;
}

export function executeEnhancer(input: EnhancePromptInput): string {
  const result = enhancePrompt(input.prompt);
  return result.enhanced;
}
