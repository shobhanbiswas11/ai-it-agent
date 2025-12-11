import z, { ZodType } from "zod";

interface Tool<T extends ZodType = ZodType> {
  name: string;
  description: string;
  props?: T;
  executer(props: z.infer<T>): Promise<string>;
}

export interface Agent {
  run(): Promise<string>;
}

export interface AgentBuilderPort {
  createAgent(props: {
    name: string;
    description: string;
    systemPrompt: string;
    tools: Tool[];
  }): Agent;
}

export const AgentBuilderPortKey = Symbol("AgentBuilderPort");
