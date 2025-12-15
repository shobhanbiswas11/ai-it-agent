import { AgentBuilderPort } from "../../ports/agent-builder.port";
import {
  TicketRepoPort,
  TicketSemanticRepoPort,
} from "../../ports/ticket.repo";
import { AgenticKbService } from "../agentic-kb.service";

describe("AgenticKbService", () => {
  let service: AgenticKbService;
  let mockTicketRepo: Mocked<TicketRepoPort>;
  let mockAgentBuilder: Mocked<AgentBuilderPort>;
  let mockTicketSemanticRepo: Mocked<TicketSemanticRepoPort>;
  let mockAgent: { run: MockedFn<any> };

  beforeEach(() => {
    mockTicketRepo = {
      query: vi.fn(),
    } as any;

    mockTicketSemanticRepo = {
      semanticQuery: vi.fn(),
    } as any;

    mockAgent = {
      run: vi.fn(),
    };

    mockAgentBuilder = {
      createAgent: vi.fn().mockReturnValue(mockAgent),
    } as any;

    service = new AgenticKbService(
      mockTicketRepo,
      mockAgentBuilder,
      mockTicketSemanticRepo
    );
  });

  describe("query", () => {
    it("should create an agent with correct configuration", async () => {
      const kbIds = ["kb-1", "kb-2"];
      const query = "find tickets about login issues";

      mockAgent.run.mockResolvedValue("Agent response");

      await service.query(kbIds, query);

      expect(mockAgentBuilder.createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "TicketingKBAgent",
          description: expect.any(String),
          systemPrompt: expect.stringContaining("kb-1, kb-2"),
          tools: expect.arrayContaining([
            expect.objectContaining({ name: "semanticSearchTool" }),
            expect.objectContaining({ name: "quantitativeSearchTool" }),
          ]),
        })
      );
    });

    it("should run the agent with the user query", async () => {
      const kbIds = ["kb-1"];
      const query = "show me high priority tickets";

      mockAgent.run.mockResolvedValue("Agent response");

      const result = await service.query(kbIds, query);

      expect(mockAgent.run).toHaveBeenCalledWith(query);
      expect(result).toBe("Agent response");
    });

    it("should handle empty kbIds array", async () => {
      const kbIds: string[] = [];
      const query = "find tickets";

      mockAgent.run.mockResolvedValue("Agent response");

      await service.query(kbIds, query);

      expect(mockAgentBuilder.createAgent).toHaveBeenCalled();
      expect(mockAgent.run).toHaveBeenCalledWith(query);
    });

    it("should propagate errors from agent execution", async () => {
      const kbIds = ["kb-1"];
      const query = "find tickets";
      const error = new Error("Agent execution failed");

      mockAgent.run.mockRejectedValue(error);

      await expect(service.query(kbIds, query)).rejects.toThrow(
        "Agent execution failed"
      );
    });
  });
});
