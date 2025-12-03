import { FileSystemConfig } from "../dtos/fileSystem";
import { IFileSystem } from "./IFileSystem";

export interface IFileSystemFactory {
  getFileSystem(fileSystemConfig: FileSystemConfig): IFileSystem;
}
export const IFileSystemFactoryToken = "IFileSystemFactory";
