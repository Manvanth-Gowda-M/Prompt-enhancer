import type {
  ClassifyPromptRequest,
  DiffPromptRequest,
  EnhancePromptRequest,
} from '../types.js';

const PROMPT_MIN_LENGTH = 10;
const PROMPT_MAX_LENGTH = 5000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertValidPrompt(prompt: unknown): asserts prompt is string {
  if (typeof prompt !== 'string') {
    throw new Error('Invalid input: prompt must be a string');
  }

  if (prompt.length < PROMPT_MIN_LENGTH) {
    throw new Error(`Invalid input: prompt must be at least ${PROMPT_MIN_LENGTH} characters long`);
  }

  if (prompt.length > PROMPT_MAX_LENGTH) {
    throw new Error(`Invalid input: prompt must not exceed ${PROMPT_MAX_LENGTH} characters`);
  }
}

export function parseEnhancePromptRequest(input: unknown): EnhancePromptRequest {
  if (!isPlainObject(input)) {
    throw new Error('Invalid input: expected an object');
  }

  assertValidPrompt(input.prompt);

  const optionsRaw = input.options;
  if (optionsRaw === undefined) {
    return { prompt: input.prompt };
  }

  if (optionsRaw === null) {
    return { prompt: input.prompt, options: {} };
  }

  if (!isPlainObject(optionsRaw)) {
    throw new Error('Invalid input: options must be an object or null');
  }

  const language = optionsRaw.language;
  const forceOutputFormat = optionsRaw.force_output_format;
  const strictness = optionsRaw.strictness;

  if (
    language !== undefined &&
    language !== null &&
    typeof language !== 'string'
  ) {
    throw new Error('Invalid input: options.language must be a string or null');
  }

  if (
    forceOutputFormat !== undefined &&
    forceOutputFormat !== null &&
    typeof forceOutputFormat !== 'boolean'
  ) {
    throw new Error(
      'Invalid input: options.force_output_format must be a boolean or null'
    );
  }

  if (
    strictness !== undefined &&
    strictness !== null &&
    strictness !== 'auto' &&
    strictness !== 'normal' &&
    strictness !== 'strict'
  ) {
    throw new Error(
      'Invalid input: options.strictness must be one of: auto, normal, strict'
    );
  }

  return {
    prompt: input.prompt,
    options: {
      language: language ?? undefined,
      force_output_format: forceOutputFormat ?? undefined,
      strictness: (strictness ?? undefined) as 'auto' | 'normal' | 'strict' | undefined,
    },
  };
}

export function parseClassifyPromptRequest(input: unknown): ClassifyPromptRequest {
  if (!isPlainObject(input)) {
    throw new Error('Invalid input: expected an object');
  }

  assertValidPrompt(input.prompt);
  return { prompt: input.prompt };
}

export function parseDiffPromptRequest(input: unknown): DiffPromptRequest {
  if (!isPlainObject(input)) {
    throw new Error('Invalid input: expected an object');
  }

  assertValidPrompt(input.prompt);
  return { prompt: input.prompt };
}
