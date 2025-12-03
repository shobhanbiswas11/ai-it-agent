import { injectable } from "tsyringe";
import {
  TriggerToolDto,
  triggerToolDtoSchema,
} from "../../../features/it-agent/dtos/tool.dto";
import { ToolRegistry } from "../../../features/it-agent/tools/tool.registry";

@injectable()
export class ToolController {
  constructor(private toolRegistry: ToolRegistry) {}

  triggerTool(dto: TriggerToolDto) {
    const { toolName, config } = triggerToolDtoSchema.parse(dto);
    const entry = this.toolRegistry.getTool(toolName);
    if (!entry) {
      throw new Error(`Tool with name ${toolName} not found`);
    }
    const { tool, paramSchema } = entry;
    return tool.execute(paramSchema && paramSchema.parse(config));
  }
}
