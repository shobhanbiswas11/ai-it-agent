import { IFileSystem } from "../ports/IFileSystem";
import { LoggingService } from "./loggingService";

interface CleanUpLanguageDirectoryProps {
  basePath: string;
  libs?: ("node_modules" | ".venv")[];
  recursive?: boolean;
}

export class DiskUtilityService {
  constructor(
    private fileSystem: IFileSystem,
    private logger: LoggingService
  ) {}

  async cleanUpLanguageLibDirectories(
    props: CleanUpLanguageDirectoryProps
  ): Promise<void> {
    const {
      basePath,
      libs = ["node_modules", ".venv"],
      recursive = false,
    } = props;

    const findAndRemoveDirectories = async (
      currentPath: string
    ): Promise<void> => {
      try {
        const entries = await this.fileSystem.readDirectory(currentPath);

        for (const entry of entries) {
          const fullPath = this.joinPath(currentPath, entry);

          if (await this.fileSystem.isDirectory(fullPath)) {
            if (libs.includes(entry as any)) {
              this.logger.log(`Removing ${entry} at: ${fullPath}`);
              await this.fileSystem.removeDirectory(fullPath);
            } else if (recursive) {
              await findAndRemoveDirectories(fullPath);
            }
          }
        }
      } catch (error) {
        this.logger.log(`Error processing directory ${currentPath}: ${error}`);
      }
    };

    await findAndRemoveDirectories(basePath);
  }

  private joinPath(...segments: string[]): string {
    // Platform-agnostic path joining
    return segments.join("/").replace(/\/+/g, "/");
  }
}
