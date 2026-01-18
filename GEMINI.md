# Prompt Reliability MCP Server - Gemini CLI Configuration

## Project Overview

This is a **Prompt Reliability MCP Server** that transforms raw prompts into semantically equivalent, hallucination-resistant, deterministic enhanced prompts. It acts as a prompt preprocessing layer, NOT an executor.

## What This Server Does

- **Transforms** vague prompts into structured, deterministic enhanced prompts
- **Classifies** prompts by domain (code, content, research, reasoning, planning, design, conversion)
- **Assigns risk levels** (low, medium, high) based on hallucination potential
- **Injects guard text** to prevent scope creep and fabrication

## Project Structure

```
Prompt-enhancer/
├── src/
│   ├── server.ts                 # MCP server entry point
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # Guard text, fixed strings
│   ├── classifier/
│   │   └── domain_classifier.ts  # Domain & risk classification
│   ├── enhancer/
│   │   ├── ambiguity_resolver.ts
│   │   ├── constraint_synthesizer.ts
│   │   ├── hallucination_guard_injector.ts
│   │   └── prompt_formatter.ts
│   ├── tools/
│   │   ├── enhance_prompt.ts     # Main enhancement tool
│   │   ├── classify_prompt.ts    # Classification-only
│   │   └── diff_prompt.ts        # Debug comparison
│   └── utils/
│       ├── determinism.ts        # Hash generation
│       └── validators.ts         # Input validation
├── dist/                         # Compiled JavaScript (after build)
├── examples/                     # Sample inputs/outputs
├── package.json
└── tsconfig.json
```

## Available Tools

### enhance_prompt
Transform raw prompt into structured 8-section format

```json
// Input
{ "prompt": "Write a function to validate emails" }

// Output
{
  "enhanced_prompt": "### ROLE\n...\n### TASK\n...",
  "metadata": {
    "domain": "code",
    "risk_level": "low",
    "determinism_hash": "abc123..."
  }
}
```

### classify_prompt
Get domain and risk without enhancement

```json
// Input
{ "prompt": "What is the GDP of France?" }

// Output
{
  "domain": "research",
  "risk_level": "high",
  "ambiguity_detected": false
}
```

### diff_prompt
Debug tool showing transformation

```json
// Input
{ "prompt": "Create a marketing plan" }

// Output
{
  "raw": "Create a marketing plan",
  "enhanced": "### ROLE\n...",
  "changes_made": ["section additions", "guard injections"],
  "metadata": { ... }
}
```

## Development

```bash
# Setup
npm install

# Build TypeScript
npm run build

# Run server (stdio transport)
npm run dev     # build + run
npm start       # run compiled only
```

## Enhanced Prompt Structure

All enhanced prompts have exactly 8 sections:

1. `### ROLE` - Agent persona
2. `### TASK` - Core objective
3. `### CONTEXT` - Background information
4. `### CONSTRAINTS` - Limitations and boundaries
5. `### VERIFICATION RULES` - Self-check requirements
6. `### OUTPUT FORMAT` - Structure requirements
7. `### SEMANTIC INTEGRITY RULE` - Anti-hallucination guard
8. `### QUALITY BAR` - Acceptance criteria

## Domain Classification

| Domain | Description | Example |
|--------|-------------|---------|
| `code` | Programming tasks | "Write a function..." |
| `content` | Writing, copywriting | "Write a blog post..." |
| `research` | Fact-finding | "What is the population..." |
| `reasoning` | Analysis, logic | "Why do projects fail..." |
| `planning` | Strategy, roadmaps | "Create a 90-day plan..." |
| `design` | Architecture, UX | "Design a database schema..." |
| `conversion` | Transformation | "Summarize this text..." |
| `unknown` | Unclassified | Ambiguous requests |

## Risk Levels

| Level | Meaning |
|-------|---------|
| `low` | Low hallucination risk (code, conversion) |
| `medium` | Moderate risk (planning, content) |
| `high` | High hallucination risk (research, reasoning with facts) |

## MCP Integration

This server uses stdio transport. To integrate with MCP-compatible clients:

```json
{
  "mcpServers": {
    "prompt-reliability": {
      "command": "node",
      "args": ["/path/to/Prompt-enhancer/dist/server.js"]
    }
  }
}
```

## Design Philosophy

1. **Treat prompts like code** - deterministic compilation
2. **Never resolve ambiguity with assumptions** - flag it instead
3. **Prefer conservative behavior** - reject speculation
4. **Preserve semantics** - enhancement must not change intent

## When Modifying

- Keep guard text **exact** (no paraphrasing)
- Keep classification **deterministic** (reproducible results)
- Preserve **8-section format** (no additions/removals)
- Avoid **adding assumptions** (stay conservative)
