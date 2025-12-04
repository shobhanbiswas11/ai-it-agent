import { Request, Response, Router } from "express";
import { injectable } from "tsyringe";
import { triggerToolDtoSchema } from "../../../features/it-agent/dtos/tool.dto";
import { ToolRegistry } from "../../../features/it-agent/tools/tool.registry";

@injectable()
export class ToolController {
  public router: Router;

  constructor(private toolRegistry: ToolRegistry) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post("/trigger", this.triggerTool.bind(this));
  }

  async triggerTool(req: Request, res: Response) {
    const { toolName, config } = triggerToolDtoSchema.parse(req.body);
    const entry = this.toolRegistry.getTool(toolName);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: `Tool with name ${toolName} not found`,
      });
    }
    const { tool, paramSchema } = entry;
    const result = await tool.execute(paramSchema && paramSchema.parse(config));
    return res.json({
      success: true,
      data: result,
    });
  }
}
