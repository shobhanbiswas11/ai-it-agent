import { injectable } from "tsyringe";
import { ToolInput } from "../dtos/tool";
import { ToolRegistry } from "../tools/tool-registry";

@injectable()
export class ManuallyTriggerTool {
  constructor(private toolRegistry: ToolRegistry) {}

  execute({ toolName, params }: ToolInput) {
    const tool = this.toolRegistry.getTool(toolName);
    return tool.execute(params);
  }
}
