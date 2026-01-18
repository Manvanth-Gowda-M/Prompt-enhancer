# Prompt Enhancer MCP Server

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that transforms raw, unstructured prompts into high-quality, structured LLM-optimized prompts.

## Problem Statement

AI developers and automation systems frequently need to transform vague or unstructured prompts into well-formatted, comprehensive instructions for LLMs. This server solves that problem by acting as a deterministic "prompt enhancement" node in AI-to-AI workflows, ensuring consistent, high-quality prompt structures across all LLM interactions.

### Why This Matters

- **Consistency**: Ensures all prompts follow a proven structure (ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT FORMAT/QUALITY BAR)
- **Quality**: Transforms vague requests into comprehensive, actionable prompts
- **Determinism**: Same input always produces the same output (no randomness)
- **Integration**: Works seamlessly with any MCP client (Claude Desktop, VS Code, custom tools)
- **Zero Dependencies**: Fully rule-based, no external API calls required

## Features

- ✅ **Single-purpose tool**: `enhance_prompt` - does one thing exceptionally well
- ✅ **Deterministic transformations**: Same input → same output, always
- ✅ **Rule-based logic**: No external API calls, purely algorithmic
- ✅ **MCP compliant**: Full protocol support via stdio transport
- ✅ **Type-safe**: Written in TypeScript with strict mode enabled
- ✅ **Production-ready**: Comprehensive error handling and validation
- ✅ **Well-documented**: Extensive examples and usage patterns

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd prompt-enhancer-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Running the Server

### Development Mode

```bash
npm run dev
```

This compiles TypeScript and starts the server in one command.

### Production Mode

```bash
# Build first
npm run build

# Then run
npm start
```

The server runs on **stdio transport** and communicates via standard input/output, making it compatible with all MCP clients.

## Connecting to MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prompt-enhancer": {
      "command": "node",
      "args": ["/absolute/path/to/prompt-enhancer-mcp/dist/server.js"]
    }
  }
}
```

Restart Claude Desktop, and the `enhance_prompt` tool will be available.

### VS Code / Cursor

Configure in your MCP settings:

```json
{
  "mcp.servers": {
    "prompt-enhancer": {
      "command": "node",
      "args": ["/absolute/path/to/prompt-enhancer-mcp/dist/server.js"],
      "transport": "stdio"
    }
  }
}
```

### Custom Integration

Any MCP client can connect via stdio transport:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/prompt-enhancer-mcp/dist/server.js']
});

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// Use the tool
const result = await client.callTool({
  name: 'enhance_prompt',
  arguments: {
    prompt: 'write a function to validate emails'
  }
});

console.log(result.content[0].text);
```

## API Reference

### Tool: `enhance_prompt`

Transforms raw prompts into structured, LLM-optimized prompts.

#### Input Schema

```typescript
{
  prompt: string  // Required, 10-5000 characters
}
```

#### Output

Returns a string containing the enhanced prompt in the following format:

```
### ROLE
[Who/what the LLM is acting as]

### TASK
[Primary objective, what to do]

### CONTEXT
[Background, constraints, domain information]

### CONSTRAINTS
[Limits, format requirements, safety guardrails]

### OUTPUT FORMAT
[Structure and format of desired response]

### QUALITY BAR
[Success criteria, quality expectations]
```

#### Example

**Input:**
```json
{
  "prompt": "I need to write a function that validates email addresses"
}
```

**Output:**
```
### ROLE
You are an experienced software engineer specializing in writing clean, maintainable, and production-ready code.

### TASK
Write a function that validates email addresses.

### CONTEXT
This solution is intended for production use where code quality, maintainability, and reliability are important. Email validation/handling must follow industry standards (RFC 5322 where applicable) while remaining practical for real-world use.

### CONSTRAINTS
- Code must be production-ready with proper error handling
- Include type safety and input validation
- Follow language-specific best practices and conventions
- Follow industry best practices
- Ensure clarity and maintainability

### OUTPUT FORMAT
1. Complete, runnable code with proper structure
2. Function signature with type annotations or JSDoc
3. Implementation with clear logic flow
4. Usage examples or test cases demonstrating functionality

### QUALITY BAR
- Production-ready code that can be deployed with confidence
- Handles edge cases and error conditions gracefully
- Well-documented and easy to understand
- Follows established design patterns and conventions
- Efficient and performant for typical use cases
```

## Usage Examples

### Command Line (via MCP client)

Using the MCP CLI (if available):

```bash
echo '{"prompt": "create a REST API"}' | mcp-client call enhance_prompt
```

### Python Client

```python
from mcp import Client, StdioTransport

async def enhance():
    transport = StdioTransport(
        command='node',
        args=['/path/to/dist/server.js']
    )
    
    async with Client(transport) as client:
        result = await client.call_tool(
            'enhance_prompt',
            {'prompt': 'build a caching system'}
        )
        print(result['content'][0]['text'])

# Run
import asyncio
asyncio.run(enhance())
```

### JavaScript/Node.js Client

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function enhancePrompt(rawPrompt) {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['/path/to/dist/server.js']
  });

  const client = new Client({
    name: 'enhancer-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  await client.connect(transport);

  const result = await client.callTool({
    name: 'enhance_prompt',
    arguments: { prompt: rawPrompt }
  });

  await client.close();
  
  return result.content[0].text;
}

const enhanced = await enhancePrompt('write unit tests for a React component');
console.log(enhanced);
```

## Design Philosophy

### Core Principles

1. **Preserve User Intent**: The enhancement process never adds requirements or assumptions not implied by the original prompt
2. **Deterministic Output**: Same input always produces the same output - no randomness or external API calls
3. **Conservative Enhancement**: When ambiguous, make conservative assumptions rather than hallucinating details
4. **Structured Consistency**: All outputs follow the exact 6-section format for maximum LLM compatibility
5. **Production Focus**: Enhancements assume production-quality expectations unless stated otherwise

### Enhancement Process

The server follows a 4-phase enhancement pipeline:

1. **Input Analysis**: Detect existing structure, task type, domain level
2. **Structural Inference**: Extract or infer ROLE, TASK, CONTEXT, CONSTRAINTS, OUTPUT FORMAT, QUALITY BAR
3. **Optimization**: Remove redundancy, clarify ambiguity, strengthen directives
4. **Validation**: Ensure original intent is preserved and no hallucinations added

### Design Decisions

- **Why TypeScript?** Type safety prevents runtime errors and provides excellent IDE support
- **Why stdio transport?** Maximum compatibility with all MCP clients and execution environments
- **Why rule-based?** Determinism and zero latency - no network calls or unpredictable LLM behavior
- **Why single tool?** Focused, maintainable, and easy to understand - does one thing exceptionally well

## Project Structure

```
prompt-enhancer-mcp/
├── src/
│   ├── server.ts              # MCP server entry point, request handlers
│   ├── tools/
│   │   └── enhancer.ts        # Tool definition and validation logic
│   ├── types.ts               # TypeScript interfaces and types
│   └── utils/
│       └── prompt-logic.ts    # Core enhancement algorithms
├── examples/
│   ├── input-examples.json    # Example raw prompts
│   └── output-examples.json   # Corresponding enhanced outputs
├── dist/                      # Compiled JavaScript (generated)
├── package.json               # Project metadata and dependencies
├── tsconfig.json              # TypeScript configuration
├── .gitignore                 # Git ignore patterns
├── README.md                  # This file
└── LICENSE                    # MIT License
```

## Extensibility

While this server is designed as a single-purpose tool, it can be extended:

### Adding More Tools

1. Create a new file in `src/tools/` (e.g., `analyzer.ts`)
2. Implement validation and execution logic
3. Register the tool in `src/server.ts`:

```typescript
const NEW_TOOL: Tool = {
  name: 'analyze_prompt',
  description: 'Analyzes prompt quality and suggests improvements',
  inputSchema: { /* ... */ }
};

// Add to ListToolsRequestSchema handler
this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [ENHANCE_PROMPT_TOOL, NEW_TOOL],
}));

// Add to CallToolRequestSchema handler
if (request.params.name === 'analyze_prompt') {
  // Handle new tool
}
```

### Customizing Enhancement Logic

Edit `src/utils/prompt-logic.ts` to adjust:

- Role inference patterns (`inferRole`)
- Task detection rules (`detectTaskType`)
- Context extraction (`inferContext`)
- Constraint generation (`inferConstraints`)
- Output format templates (`inferOutputFormat`)
- Quality criteria (`inferQualityBar`)

## Testing

While automated tests are not included in v1.0, you can manually test using the examples:

```bash
# Build the project
npm run build

# Test with example inputs (requires jq)
cat examples/input-examples.json | jq -r '.[0].prompt' | \
  node -e "
    const { enhancePrompt } = require('./dist/utils/prompt-logic.js');
    let input = '';
    process.stdin.on('data', d => input += d);
    process.stdin.on('end', () => {
      const result = enhancePrompt(input.trim());
      console.log(result.enhanced);
    });
  "
```

### Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Handles valid prompts (10-5000 chars)
- [ ] Rejects prompts < 10 characters
- [ ] Rejects prompts > 5000 characters
- [ ] Output always has 6 sections in correct order
- [ ] Same input produces identical output
- [ ] Preserves user's original intent
- [ ] No hallucinated requirements

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style**: Follow existing TypeScript conventions
2. **Type Safety**: Maintain strict TypeScript compliance
3. **Determinism**: Ensure all enhancements remain deterministic
4. **Testing**: Test thoroughly with diverse prompt types
5. **Documentation**: Update README for any API changes

### Contribution Ideas

- Add automated test suite (Jest, Vitest)
- Implement prompt quality scoring
- Add support for multiple output formats
- Create web-based testing UI
- Add telemetry/analytics (opt-in)
- Improve domain-specific inference rules

## Troubleshooting

### Server won't start

- Ensure Node.js >= 18.0.0: `node --version`
- Check dependencies are installed: `npm install`
- Verify build succeeded: `npm run build`
- Check for port conflicts (none expected with stdio)

### Tool not appearing in Claude Desktop

- Verify config path is correct and absolute
- Restart Claude Desktop completely
- Check server builds successfully: `npm run build`
- Test server manually: `npm run dev`

### Enhanced prompts seem incorrect

- Check input prompt length (10-5000 chars)
- Verify original prompt is clear enough to infer structure
- Review `src/utils/prompt-logic.ts` inference rules
- File an issue with input/output examples

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Inspired by prompt engineering best practices from OpenAI, Anthropic, and the broader AI community

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/prompt-enhancer-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prompt-enhancer-mcp/discussions)
- **Documentation**: This README and inline code comments

---

**Built with ❤️ for the MCP community**
