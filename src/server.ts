#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { validateInput, executeEnhancer } from './tools/enhancer.js';

const ENHANCE_PROMPT_TOOL: Tool = {
  name: 'enhance_prompt',
  description: 'Transforms a raw, unstructured prompt into a high-quality, structured LLM-optimized prompt following the ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT FORMAT/QUALITY BAR structure.',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The raw prompt to enhance',
        minLength: 10,
        maxLength: 5000,
      },
    },
    required: ['prompt'],
  },
};

class PromptEnhancerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'prompt-enhancer-mcp',
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
      tools: [ENHANCE_PROMPT_TOOL],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'enhance_prompt') {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      try {
        if (!validateInput(request.params.arguments)) {
          throw new Error('Invalid input: prompt must be a string between 10 and 5000 characters');
        }

        const enhancedPrompt = executeEnhancer(request.params.arguments);

        return {
          content: [
            {
              type: 'text',
              text: enhancedPrompt,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to enhance prompt: ${errorMessage}`);
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
    console.error('Prompt Enhancer MCP Server running on stdio');
  }
}

const server = new PromptEnhancerServer();
server.run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
