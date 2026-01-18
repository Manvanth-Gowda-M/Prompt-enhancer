# Implementation Summary — Prompt Reliability MCP Server (v1.0)

This repository implements a production-ready MCP server that acts as a **Prompt Reliability & Enhancement Layer**.

It does **not** execute tasks. It does **not** call external services. It deterministically transforms raw user prompts into structured prompts with fixed hallucination guards and an explicit semantic integrity contract.

## What’s Implemented

### Tools

- `enhance_prompt`
  - Input: `{ prompt, options? }`
  - Output: `{ enhanced_prompt, metadata: { domain, risk_level, determinism_hash } }`

- `classify_prompt`
  - Input: `{ prompt }`
  - Output: `{ domain, risk_level, ambiguity_detected }`

- `diff_prompt`
  - Input: `{ prompt }`
  - Output: `{ raw, enhanced, changes_made, metadata }`

### Deterministic 7-Stage Pipeline

1. **Domain & Risk Classification** (`src/classifier/domain_classifier.ts`)
   - Deterministic, rule-based, first-match-wins order
   - Risk overrides for safety-critical topics, factual/numbered requests, and strict mode

2. **Ambiguity Detection** (`src/enhancer/ambiguity_resolver.ts`)
   - Conservative ambiguity heuristics
   - Optional uncertainty-rule injection when ambiguity could affect correctness

3. **Constraint Synthesis** (`src/enhancer/constraint_synthesizer.ts`)
   - Always preserves intent and forbids scope expansion
   - Adds domain-specific constraints without inventing new requirements

4. **Guard Injection** (`src/enhancer/hallucination_guard_injector.ts`)
   - Fixed global guards (always)
   - Fixed verification rules (always)
   - High-risk verification additions (conditional)

5. **Prompt Formatting** (`src/enhancer/prompt_formatter.ts`)
   - Exactly 8 sections in strict order with `###` headers

6. **Semantic Integrity Contract** (`src/constants.ts`)
   - Mandatory clause preventing scope drift

7. **Determinism Hash** (`src/utils/determinism.ts`)
   - `sha256(normalize(enhanced_prompt))`
   - `normalize = unicode NFKC + trim + lowercase`

## Notes

- The server uses MCP stdio transport (`src/server.ts`).
- TypeScript is compiled to `dist/` via `npm run build`.
- Example prompts and expected classifications live in `examples/`.
