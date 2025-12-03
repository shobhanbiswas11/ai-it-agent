import z from "zod";
import { fileSystemSchema } from "./fileSystem";

export enum ToolNames {
  LanguageLibraryCleaner = "language_library_cleaner",
}

export const languageLibraryCleanerInputSchema = z.object({
  fileSystemConfig: fileSystemSchema,
  config: z.object({
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
  }),
});

export type LanguageLibraryCleanerInput = z.infer<
  typeof languageLibraryCleanerInputSchema
>;

export const toolInputSchema = z.discriminatedUnion("toolName", [
  z.object({
    toolName: z.literal(ToolNames.LanguageLibraryCleaner),
    params: languageLibraryCleanerInputSchema,
  }),
]);
export type ToolInput = z.infer<typeof toolInputSchema>;
