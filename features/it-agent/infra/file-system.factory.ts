import { injectable } from "tsyringe";
import { FileSystemConfig } from "../dtos/file-system.dto";
import { IFileSystemFactory } from "../ports/file-system.factory.port";
import { IFileSystem } from "../ports/file-system.port";
import { LocalFileSystem } from "./local-file-system.adapter";

@injectable()
export class FileSystemFactory implements IFileSystemFactory {
  getFileSystem(config: FileSystemConfig): IFileSystem {
    switch (config.type) {
      case "local":
        return new LocalFileSystem();
      default:
        throw new Error(`Unknown file system type: ${(config as any).type}`);
    }
  }
}
