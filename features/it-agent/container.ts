import "reflect-metadata";
import { container } from "tsyringe";
import { ToolNames } from "./dtos/tool";
import { FileSystemFactory } from "./infra/fileSystemFactory";
import { IFileSystemFactoryToken } from "./ports/IFileSystemFactory";
import { LoggingService } from "./services/loggingService";
import { LanguageLibraryCleaner } from "./tools/languageLibraryCleaner";
import { ToolRegistry } from "./tools/tool-registry";
import { ManuallyTriggerTool } from "./use-cases/manuallyTriggerTool";

// Factories
container.registerSingleton(IFileSystemFactoryToken, FileSystemFactory);

// Services
container.registerSingleton(LoggingService);

// Tool Registry
container.registerSingleton(ToolRegistry);

// Tools
container.registerSingleton(LanguageLibraryCleaner);

// Use Cases
container.registerSingleton(ManuallyTriggerTool);

// Initialize tool registry with all tools
const registry = container.resolve(ToolRegistry);
registry.registerTool(
  ToolNames.LanguageLibraryCleaner,
  container.resolve(LanguageLibraryCleaner)
);

export { container, registry };
