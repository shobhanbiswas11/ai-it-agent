import { ZodType } from "zod";

export abstract class Tool {
  static toolName: string;
  static description: string;
  static paramsSchema?: ZodType;

  abstract execute(params: any): Promise<any> | any;
}
