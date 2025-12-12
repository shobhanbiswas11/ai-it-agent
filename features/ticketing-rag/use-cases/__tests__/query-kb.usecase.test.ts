import { AgenticKbService } from "../../services/agentic-kb.service";
import { QueryKnowledgeBase } from "../query-kb.usecase";

describe("query knowledge bases", () => {
  // User will send the kbIds and the query
  // we'll send the query to the agent
  // Whatever answer is the agent is giving back, we'll send that back to the user

  let queryKnowledgeBase: QueryKnowledgeBase;
  let agenticKbService: Mocked<AgenticKbService>;

  beforeEach(() => {
    agenticKbService = {
      query: vi.fn(),
    } as any;

    queryKnowledgeBase = new QueryKnowledgeBase(agenticKbService);
  });

  it("should call the agentic-kb and pass the query and the kbIds", async () => {
    await queryKnowledgeBase.execute({
      kbIds: ["kb1", "kb2"],
      query: "How many vpn related tickets last month?",
    });

    expect(agenticKbService.query).toHaveBeenCalledTimes(1);
    expect(agenticKbService.query).toHaveBeenCalledWith(
      ["kb1", "kb2"],
      "How many vpn related tickets last month?"
    );
  });
});
