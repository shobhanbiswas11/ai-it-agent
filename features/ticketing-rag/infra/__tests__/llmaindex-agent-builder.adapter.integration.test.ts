import z from "zod";
import { LLmaLLMFactory } from "../llma-llm.factory";
import { LlmaindexAgentBuilderAdapter } from "../llmaindex-agent-builder.adapter";

describe("Llamaindex agent builder", () => {
  it("exec", async () => {
    const agentBuilder = new LlmaindexAgentBuilderAdapter(new LLmaLLMFactory());
    const agent = agentBuilder.createAgent({
      name: "Test Agent",
      description: "Test Description",
      systemPrompt: "You are a helpful assistant.",
      tools: [
        {
          name: "echo_tool",
          description: "echos the input",
          props: z.object({
            input: z.string().describe("input to echo"),
          }),
          executer: async ({ input }) => {
            return "Echo: " + input;
          },
        },
      ],
    });

    const res = await agent.run("Call the echo tool please with 'hey there!'");
    console.log(res);
  });
});
