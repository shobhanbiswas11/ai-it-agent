import { injectable } from "tsyringe";
import { TriggerToolDto } from "../dtos/tool.dto";
import { ToolRegistry } from "../tools/tool.registry";

@injectable()
export class ManuallyTriggerTool {
  constructor(private toolRegistry: ToolRegistry) {}

  execute({ toolName, config }: TriggerToolDto) {
    const entry = this.toolRegistry.getTool(toolName);
    if (!entry) {
      throw new Error(`Tool with name ${toolName} not found.`);
    }
    return entry.tool.execute(config);
  }
}
