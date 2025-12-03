import "reflect-metadata";
import { container } from "tsyringe";
import { FileSystemFactory } from "./infra/file-system.factory";
import { IFileSystemFactoryToken } from "./ports/file-system.factory.port";
import { LoggingService } from "./services/logging.service";
import { LanguageLibraryCleaner } from "./tools/language-library-cleaner.tool";
import { setupToolRegistry, ToolRegistry } from "./tools/tool.registry";
import { ManuallyTriggerTool } from "./use-cases/manually-trigger-tool.usecase";

container.registerSingleton(IFileSystemFactoryToken, FileSystemFactory);
container.registerSingleton(LoggingService);
container.registerSingleton(ToolRegistry);
container.registerSingleton(ManuallyTriggerTool);

// Tools
container.registerSingleton(LanguageLibraryCleaner);

// Initialize tool registry with all tools
setupToolRegistry(container);

export { container };
