#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { enhancePrompt } from './tools/enhance_prompt.js';
import { classifyPrompt } from './tools/classify_prompt.js';
import { diffPrompt } from './tools/diff_prompt.js';
import {
  parseClassifyPromptRequest,
  parseDiffPromptRequest,
  parseEnhancePromptRequest,
} from './utils/validators.js';

const ENHANCE_PROMPT_TOOL: Tool = {
  name: 'enhance_prompt',
  description:
    'Transform a raw user prompt into a semantically equivalent, hallucination-resistant, deterministic enhanced prompt.',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Raw, unmodified user prompt',
        minLength: 10,
        maxLength: 5000,
      },
      options: {
        type: 'object',
        properties: {
          language: { type: ['string', 'null'] },
          force_output_format: { type: ['boolean', 'null'], default: false },
          strictness: { type: 'string', enum: ['normal', 'strict', 'auto'], default: 'auto' },
        },
        required: [],
      },
    },
    required: ['prompt'],
  },
};

const CLASSIFY_PROMPT_TOOL: Tool = {
  name: 'classify_prompt',
  description:
    'Classify a prompt into domain and hallucination risk level, without performing enhancement.',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Raw user prompt to classify',
        minLength: 10,
        maxLength: 5000,
      },
    },
    required: ['prompt'],
  },
};

const DIFF_PROMPT_TOOL: Tool = {
  name: 'diff_prompt',
  description: 'Return raw vs enhanced comparison for debugging transformations.',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Raw user prompt to enhance and diff',
        minLength: 10,
        maxLength: 5000,
      },
    },
    required: ['prompt'],
  },
};

class PromptReliabilityServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'prompt-reliability-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [ENHANCE_PROMPT_TOOL, CLASSIFY_PROMPT_TOOL, DIFF_PROMPT_TOOL],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const args = request.params.arguments;

        if (toolName === 'enhance_prompt') {
          const parsed = parseEnhancePromptRequest(args);
          const result = enhancePrompt(parsed);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
          };
        }

        if (toolName === 'classify_prompt') {
          const parsed = parseClassifyPromptRequest(args);
          const result = classifyPrompt(parsed);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
          };
        }

        if (toolName === 'diff_prompt') {
          const parsed = parseDiffPromptRequest(args);
          const result = diffPrompt(parsed);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
          };
        }

        throw new Error(`Unknown tool: ${toolName}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Tool execution failed: ${message}`);
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Prompt Reliability MCP Server running on stdio');
  }
}

const server = new PromptReliabilityServer();
server.run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
