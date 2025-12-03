import { injectable } from "tsyringe";
import { ToolNames } from "../dtos/tool";
import { Tool } from "./tool";

@injectable()
export class ToolRegistry {
  private tools: Map<ToolNames, Tool> = new Map();

  registerTool(name: ToolNames, tool: Tool) {
    this.tools.set(name, tool);
  }

  getTool(name: ToolNames): Tool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool with name ${name} not found in registry.`);
    }
    return tool;
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
