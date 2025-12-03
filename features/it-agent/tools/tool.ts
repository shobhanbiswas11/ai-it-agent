import { ZodType } from "zod";
import { ToolInput, ToolNames } from "../dtos/tool";

export abstract class Tool {
  abstract name: ToolNames;
  abstract description: string;
  abstract inputSchema?: ZodType;
  abstract execute(props: ToolInput["params"]): any;
}
