import { injectable } from "tsyringe";
import { FileSystemConfig } from "../dtos/fileSystem";
import { IFileSystem } from "../ports/IFileSystem";
import { IFileSystemFactory } from "../ports/IFileSystemFactory";
import { LocalFileSystem } from "./localFileSystem";

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
