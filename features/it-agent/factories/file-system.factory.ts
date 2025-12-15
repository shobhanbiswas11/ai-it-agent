import { inject, singleton } from "tsyringe";
import { FileSystemConfig } from "../dtos/file-system.dto";
import { LocalFileSystemAdapter } from "../infra/local-file-system.adapter";
import { FileSystemPort, FileSystemPortKeys } from "../ports/file-system.port";

@singleton()
export class FileSystemFactory {
  constructor(
    @inject(FileSystemPortKeys.local)
    private _localFileSystemAdapter: LocalFileSystemAdapter
  ) {}

  getFileSystem(config: FileSystemConfig): FileSystemPort {
    switch (config.type) {
      case "local":
        return this._localFileSystemAdapter;
      default:
        throw new Error(`Unknown file system type: ${(config as any).type}`);
    }
  }
}
