import { injectable } from "tsyringe";
import z from "zod";
import { fileSystemSchema } from "../dtos/file-system.dto";
import { FileSystemFactory } from "../factories/file-system.factory";
import { LoggingService } from "../services/logging.service";
import { Tool } from "./tool";

@injectable()
export class LanguageLibraryCleaner extends Tool {
  static toolName = "language_library_cleaner";
  static description =
    "Cleans up unnecessary language library directories (node_modules, venv) from the file system.";
  static paramsSchema = z.object({
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

  constructor(
    private _fileSystemFactory: FileSystemFactory,
    private _logger: LoggingService
  ) {
    super();
  }

  async execute({
    config,
    fileSystemConfig,
  }: z.infer<typeof LanguageLibraryCleaner.paramsSchema>): Promise<void> {
    const {
      basePath,
      libs = ["node_modules", ".venv"],
      recursive = false,
    } = config;
    let fileSystem = this._fileSystemFactory.getFileSystem(fileSystemConfig);

    const findAndRemoveDirectories = async (
      currentPath: string
    ): Promise<void> => {
      try {
        const entries = await fileSystem.readDirectory(currentPath);

        for (const entry of entries) {
          const fullPath = this.joinPath(currentPath, entry);

          if (await fileSystem.isDirectory(fullPath)) {
            if (libs.includes(entry as any)) {
              this._logger.log(`Removing ${entry} at: ${fullPath}`);
              await fileSystem.removeDirectory(fullPath);
            } else if (recursive) {
              await findAndRemoveDirectories(fullPath);
            }
          }
        }
      } catch (error) {
        this._logger.log(`Error processing directory ${currentPath}: ${error}`);
        throw new Error(`Error processing directory ${currentPath}: ${error}`);
      }
    };

    await findAndRemoveDirectories(basePath);
  }

  private joinPath(...segments: string[]): string {
    return segments.join("/").replace(/\/+/g, "/");
  }
}
