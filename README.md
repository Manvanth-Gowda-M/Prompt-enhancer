# Prompt Reliability MCP Server (v1.0)

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that acts as a **Prompt Reliability & Enhancement Layer**.

It is **not** an agent. It **never executes tasks**. It only transforms raw user prompts into **semantically equivalent**, **hallucination-resistant**, **deterministic** enhanced prompts that are safe for AI-to-AI workflows.

## Problem Statement

LLM “executor” agents often fail in predictable ways:
- they fabricate missing details,
- they silently assume constraints,
- they blur scope boundaries,
- they produce inconsistent output structures.

This server sits between the user (or upstream system) and the executor model to produce a **reliable prompt contract**.

## Reliability Guarantees

This server guarantees that for `enhance_prompt`:
- **Determinism**: same input → same enhanced prompt → same `determinism_hash`.
- **No scope expansion**: the enhanced prompt includes a mandatory semantic integrity contract.
- **Hallucination resistance**: fixed, non-paraphrased guard text is injected every time.
- **Strict structure**: output prompt is exactly **8 sections**, in a fixed order, with `###` headers.

This server does **not** guarantee factual correctness of the executor model’s output; it only injects rules that force conservative behavior.

## Architecture (7-stage pipeline)

1. **Parsed** → Domain & Risk Classifier (`src/classifier/domain_classifier.ts`)
2. **Normalized** → Ambiguity Resolver (`src/enhancer/ambiguity_resolver.ts`)
3. **Compiled** → Constraint Synthesizer (`src/enhancer/constraint_synthesizer.ts`)
4. **Guarded** → Hallucination Guard Injector (`src/enhancer/hallucination_guard_injector.ts`)
5. **Formatted** → Prompt Formatter (`src/enhancer/prompt_formatter.ts`)
6. **Verified** → Semantic Integrity Rule (mandatory section)
7. **Hashed** → Determinism Engine (`src/utils/determinism.ts`)

## Installation

### Prerequisites

- Node.js >= 18

### Setup

```bash
npm install
npm run build
```

## Running

```bash
# build + run
npm run dev

# run compiled output
npm start
```

The server uses **stdio transport**, so it works with Claude Desktop, Cursor/VS Code, and any MCP-compatible client.

## MCP Client Integration

### Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "prompt-reliability": {
      "command": "node",
      "args": ["/absolute/path/to/prompt-reliability-mcp/dist/server.js"]
    }
  }
}
```

## Tools

### 1) `enhance_prompt`

Transforms a raw user prompt into a semantically equivalent, hallucination-resistant enhanced prompt.

#### Input (strict)

```json
{
  "prompt": "string (required)",
  "options": {
    "language": "string | null",
    "force_output_format": "boolean | null",
    "strictness": "normal | strict | auto"
  }
}
```

#### Output (strict)

Returned as JSON text:

```json
{
  "enhanced_prompt": "string",
  "metadata": {
    "domain": "code | content | research | reasoning | planning | design | conversion | unknown",
    "risk_level": "low | medium | high",
    "determinism_hash": "string"
  }
}
```

#### Enhanced prompt structure (non-negotiable)

The `enhanced_prompt` always contains exactly 8 sections in this order:

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

### 2) `classify_prompt`

Returns metadata only (no enhancement).

#### Input

```json
{ "prompt": "string" }
```

#### Output

```json
{
  "domain": "code | content | research | reasoning | planning | design | conversion | unknown",
  "risk_level": "low | medium | high",
  "ambiguity_detected": true
}
```

### 3) `diff_prompt`

Convenience tool for debugging prompt transformations.

#### Input

```json
{ "prompt": "string" }
```

#### Output

```json
{
  "raw": "string",
  "enhanced": "string",
  "changes_made": ["section additions", "guard injections"],
  "metadata": {
    "domain": "...",
    "risk_level": "...",
    "determinism_hash": "..."
  }
}
```

## Examples

See:
- `examples/input_examples.md`
- `examples/output_examples.md`
- `examples/test_cases.json`

## Design Philosophy

- **Treat prompts like code**: deterministic compilation from input → output.
- **Never resolve ambiguity with assumptions**.
- **Prefer conservative behavior** over speculative “helpfulness”.
- **Preserve semantics**: enhancement must not change the fundamental request.

## Failure Modes / Limitations

This server will not:
- execute tasks,
- fetch external data,
- invent missing context,
- ask clarifying questions,
- add extra sections or reorder sections.

## Contributing

When extending rules:
- keep guard text **exact** (do not paraphrase),
- keep classification **deterministic**,
- preserve the 8-section format,
- avoid adding new assumptions.

## License

MIT (see `LICENSE`).
