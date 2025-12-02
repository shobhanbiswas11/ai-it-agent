import z from "zod";
import { DiskUtilityService } from "../services/diskUtilityService";
import { Tool } from "./tool";
import { ToolNames } from "./tool-names";

const inputSchema = z.object({
  basePath: z.string().describe("The base path to start cleaning from."),
  libs: z
    .array(z.enum(["node_modules", ".venv"]))
    .optional()
    .describe(
      "The language library directories to clean up. Defaults to ['node_modules', '.venv']."
    ),
  recursive: z
    .boolean()
    .optional()
    .describe(
      "Whether to clean up directories recursively. Defaults to false."
    ),
});

export class LanguageLibraryCleaner extends Tool {
  name: ToolNames.LanguageLibraryCleaner;
  description: "Cleans up unnecessary language library directories (node_modules, venv) from the file system.";
  inputSchema = inputSchema;

  constructor(private _diskUtilityService: DiskUtilityService) {
    super();
  }

  execute(props: z.infer<typeof inputSchema>) {
    const { basePath, libs, recursive } = inputSchema.parse(props);
    return this._diskUtilityService.cleanUpLanguageLibDirectories({
      basePath,
      libs,
      recursive,
    });
  }
}
