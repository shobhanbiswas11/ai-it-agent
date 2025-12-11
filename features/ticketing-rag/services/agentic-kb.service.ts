import { inject, injectable } from "tsyringe";
import {
  QueryFilterSchema,
  TicketRepoPort,
  TicketRepoPortKey,
} from "../ports/ticket.repo";

import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { tool } from "llamaindex";
import { z } from "zod";

@injectable()
export class AgenticKbService {
  constructor(@inject(TicketRepoPortKey) private _ticketRepo: TicketRepoPort) {}

  private initSemanticSearchTool() {
    return tool({
      name: "semanticSearchTool",
      description:
        "Search tickets in the knowledge base using semantic search. Use this when you need to find tickets based on meaning or similarity.",
      parameters: z.object({
        text: z.string().describe("The search query text"),
        topK: z
          .number()
          .optional()
          .describe("Number of top results to return (default: 5)"),
        filter: QueryFilterSchema.optional().describe(
          "Optional filters for status, priority, kbId, etc."
        ),
      }),
      execute: async ({ text, topK, filter }) => {
        const results = await this._ticketRepo.semanticQuery({
          text,
          topK,
          filter,
        });

        return JSON.stringify(
          results.map((ticket) => ({
            id: ticket.id,
            kbId: ticket.kbId,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            category: ticket.category,
            status: ticket.status,
            createdAt: ticket.createdAt,
            metadata: ticket.metadata,
          })),
          null,
          2
        );
      },
    });
  }

  private initQuantitativeSearchTool() {
    return tool({
      name: "quantitativeSearchTool",
      description:
        "Search tickets using exact filters like status, priority, kbId, or date ranges. Use this when you need to find tickets matching specific criteria.",
      parameters: z.object({
        filter: QueryFilterSchema.describe("Filter criteria to search tickets"),
      }),
      execute: async ({ filter }) => {
        const results = await this._ticketRepo.query(filter);

        return JSON.stringify(
          results.map((ticket) => ({
            id: ticket.id,
            kbId: ticket.kbId,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            category: ticket.category,
            status: ticket.status,
            createdAt: ticket.createdAt,
            metadata: ticket.metadata,
          })),
          null,
          2
        );
      },
    });
  }

  async query(kbIds: string[], query: string) {
    // Initialize tools
    const semanticTool = this.initSemanticSearchTool();
    const quantitativeTool = this.initQuantitativeSearchTool();

    // Create OpenAI LLM
    const llm = openai({
      model: "gpt-4o",
      temperature: 0,
    });

    // Create agent with tools
    const agentInstance = agent({
      name: "TicketingKBAgent",
      llm,
      tools: [semanticTool, quantitativeTool],
      systemPrompt: `You are a helpful assistant that helps users search through IT support tickets in a knowledge base.
You have access to two tools:
1. semanticSearchTool - for finding tickets based on meaning and similarity
2. quantitativeSearchTool - for finding tickets using exact filters

The user is querying knowledge bases with IDs: ${kbIds.join(", ")}
When searching, make sure to filter by kbId if needed.

Always provide clear, helpful responses based on the ticket data you find.`,
    });

    // Run the agent with the user query
    const response = await agentInstance.run(query);
    return response.data.result;
  }
}
