import * as fs from "fs/promises";
import { singleton } from "tsyringe";
import { FileSystemPort } from "../ports/file-system.port";

@singleton()
export class LocalFileSystemAdapter implements FileSystemPort {
  async readDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath);
      return entries;
    } catch (error) {
      throw new Error(`Failed to read directory ${dirPath}: ${error}`);
    }
  }

  async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to remove directory ${dirPath}: ${error}`);
    }
  }
}
