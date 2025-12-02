import { ZodType } from "zod";
import { ToolNames } from "./tool-names";

export abstract class Tool {
  abstract name: ToolNames;
  abstract description: string;
  abstract inputSchema?: ZodType;
  abstract execute(props: any): any;
}
