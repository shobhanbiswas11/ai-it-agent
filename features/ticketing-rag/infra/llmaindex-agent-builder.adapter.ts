import {
  Agent,
  AgentBuilderPort,
  AgentBuilderProps,
} from "../ports/agent-builder.port";

import { agent } from "@llamaindex/workflow";
import { Settings, tool } from "llamaindex";
import { singleton } from "tsyringe";
import { LLmaLLMFactory } from "./llma-llm.factory";

@singleton()
export class LlmaindexAgentBuilderAdapter implements AgentBuilderPort {
  constructor(private llmFactory: LLmaLLMFactory) {
    Settings.llm = this.llmFactory.getLLM();
  }

  createAgent({
    name,
    description,
    systemPrompt,
    tools,
  }: AgentBuilderProps): Agent {
    const agentInstance = agent({
      name,
      description,
      systemPrompt,
      tools: tools.map((toolConfig) =>
        tool({
          name: toolConfig.name,
          description: toolConfig.description,
          parameters: toolConfig.props,
          execute: toolConfig.executer,
        })
      ),
    });

    return {
      run: async (input: string) => {
        const result = await agentInstance.run(input);
        return result.data.result as string;
      },
    };
  }
}
