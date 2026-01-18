# Prompt Reliability MCP Server - Claude Code Configuration

## Project Overview

This is a **Prompt Reliability MCP Server** that transforms raw prompts into semantically equivalent, hallucination-resistant, deterministic enhanced prompts. It is NOT an agent - it never executes tasks, only transforms prompts.

## Architecture

```
7-stage pipeline:
1. Parsed → Domain & Risk Classifier (src/classifier/domain_classifier.ts)
2. Normalized → Ambiguity Resolver (src/enhancer/ambiguity_resolver.ts)
3. Compiled → Constraint Synthesizer (src/enhancer/constraint_synthesizer.ts)
4. Guarded → Hallucination Guard Injector (src/enhancer/hallucination_guard_injector.ts)
5. Formatted → Prompt Formatter (src/enhancer/prompt_formatter.ts)
6. Verified → Semantic Integrity Rule (mandatory section)
7. Hashed → Determinism Engine (src/utils/determinism.ts)
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/server.ts` | MCP server entry point, tool definitions |
| `src/tools/enhance_prompt.ts` | Main enhancement tool |
| `src/tools/classify_prompt.ts` | Classification-only tool |
| `src/tools/diff_prompt.ts` | Debug comparison tool |
| `src/classifier/domain_classifier.ts` | Domain & risk classification |
| `src/enhancer/*.ts` | Enhancement pipeline stages |
| `src/utils/determinism.ts` | Hash generation for reproducibility |
| `src/utils/validators.ts` | Input validation |
| `src/types.ts` | TypeScript types |
| `src/constants.ts` | Guard text and constants |

## MCP Tools Exposed

### 1. `enhance_prompt`
Transforms raw prompt → structured 8-section enhanced prompt

**Input**: `{ prompt: string, options?: { language?, force_output_format?, strictness? } }`

**Output**: `{ enhanced_prompt: string, metadata: { domain, risk_level, determinism_hash } }`

### 2. `classify_prompt`
Returns metadata without enhancement

**Input**: `{ prompt: string }`

**Output**: `{ domain, risk_level, ambiguity_detected }`

### 3. `diff_prompt`
Debug tool showing raw vs enhanced comparison

**Input**: `{ prompt: string }`

**Output**: `{ raw, enhanced, changes_made[], metadata }`

## Development Commands

```bash
npm install      # Install dependencies
npm run build    # Compile TypeScript → dist/
npm run dev      # Build + run server
npm start        # Run compiled server
```

## Output Format (Non-negotiable)

Enhanced prompts always contain exactly 8 sections in fixed order:
```
### ROLE
### TASK
### CONTEXT
### CONSTRAINTS
### VERIFICATION RULES
### OUTPUT FORMAT
### SEMANTIC INTEGRITY RULE
### QUALITY BAR
```

## Design Principles

- **Determinism**: same input → same enhanced prompt → same hash
- **No scope expansion**: semantic integrity contract prevents feature creep
- **Hallucination resistance**: fixed guard text injected every time
- **Strict structure**: 8 sections, fixed order, `###` headers

## When Modifying Code

1. **Keep guard text EXACT** - do not paraphrase hallucination guards
2. **Keep classification DETERMINISTIC** - same input must produce same domain/risk
3. **Preserve 8-section format** - do not add/remove/reorder sections
4. **Avoid adding assumptions** - this server is conservative by design

## Using This MCP Server

To use this server with Claude Code, add to your MCP configuration:

```json
{
  "mcpServers": {
    "prompt-reliability": {
      "command": "node",
      "args": ["/data/data/com.termux/files/home/Prompt-enhancer/dist/server.js"]
    }
  }
}
```

Then use tools like:
- `mcp__prompt-reliability__enhance_prompt`
- `mcp__prompt-reliability__classify_prompt`
- `mcp__prompt-reliability__diff_prompt`

## Test Examples

```typescript
// Code task
enhance_prompt({ prompt: "Write a TypeScript function that validates email addresses." })

// Research (high risk)
classify_prompt({ prompt: "What is the population of Japan in 2020? Provide sources." })

// Debug comparison
diff_prompt({ prompt: "Create a 90-day marketing plan for a SaaS startup." })
```
