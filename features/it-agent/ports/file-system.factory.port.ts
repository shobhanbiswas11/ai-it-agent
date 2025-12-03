import { FileSystemConfig } from "../dtos/file-system.dto";
import { IFileSystem } from "./file-system.port";

export interface IFileSystemFactory {
  getFileSystem(fileSystemConfig: FileSystemConfig): IFileSystem;
}
export const IFileSystemFactoryToken = "IFileSystemFactory";
