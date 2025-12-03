import { inject, injectable } from "tsyringe";
import {
  LanguageLibraryCleanerInput,
  languageLibraryCleanerInputSchema,
  ToolNames,
} from "../dtos/tool";
import {
  IFileSystemFactory,
  IFileSystemFactoryToken,
} from "../ports/IFileSystemFactory";
import { LoggingService } from "../services/loggingService";
import { Tool } from "./tool";

@injectable()
export class LanguageLibraryCleaner extends Tool {
  name: ToolNames.LanguageLibraryCleaner;
  description: "Cleans up unnecessary language library directories (node_modules, venv) from the file system.";
  inputSchema = languageLibraryCleanerInputSchema;

  constructor(
    @inject(IFileSystemFactoryToken)
    private _fileSystemFactory: IFileSystemFactory,
    private _logger: LoggingService
  ) {
    super();
  }

  async execute({
    config,
    fileSystemConfig,
  }: LanguageLibraryCleanerInput): Promise<void> {
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
      }
    };

    await findAndRemoveDirectories(basePath);
  }

  private joinPath(...segments: string[]): string {
    return segments.join("/").replace(/\/+/g, "/");
  }
}
