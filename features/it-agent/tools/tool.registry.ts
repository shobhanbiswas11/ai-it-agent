import { DependencyContainer, injectable } from "tsyringe";
import { ZodType } from "zod";
import { LanguageLibraryCleaner } from "./language-library-cleaner.tool";
import { Tool } from "./tool";

interface ToolDetails {
  tool: Tool;
  name: string;
  description: string;
  paramSchema?: ZodType;
}

@injectable()
export class ToolRegistry {
  private tools: Map<string, ToolDetails> = new Map();

  registerTool(toolDetails: ToolDetails) {
    this.tools.set(toolDetails.name, toolDetails);
  }

  getTool(name: string): ToolDetails {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool with name ${name} not found in registry.`);
    }
    return tool;
  }

  getAllTools(): ToolDetails[] {
    return Array.from(this.tools.values());
  }
}

export function setupToolRegistry(container: DependencyContainer) {
  const registry = container.resolve(ToolRegistry);
  registry.registerTool({
    tool: container.resolve(LanguageLibraryCleaner),
    name: LanguageLibraryCleaner.toolName,
    description: LanguageLibraryCleaner.description,
    paramSchema: LanguageLibraryCleaner.paramsSchema,
  });
}
