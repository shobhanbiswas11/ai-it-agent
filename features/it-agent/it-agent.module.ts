import { DependencyContainer } from "tsyringe";
import { FileSystemFactory } from "./infra/file-system.factory";
import { IFileSystemFactoryToken } from "./ports/file-system.factory.port";
import { LoggingService } from "./services/logging.service";
import { LanguageLibraryCleaner } from "./tools/language-library-cleaner.tool";
import { setupToolRegistry, ToolRegistry } from "./tools/tool.registry";

export function registerITAgentModule(container: DependencyContainer) {
  container.registerSingleton(IFileSystemFactoryToken, FileSystemFactory);
  container.registerSingleton(LoggingService);
  container.registerSingleton(ToolRegistry);

  // Tools
  container.registerSingleton(LanguageLibraryCleaner);

  // Initialize tool registry with all tools
  setupToolRegistry(container);
}
