import { createReadStream, createWriteStream, promises as fs } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { FileSystemPort } from "../ports/file-system.port";

export class DiskFileSystemAdapter implements FileSystemPort {
  constructor(private baseDir: string = "./data/files") {}

  async writeFromStream(key: string, data: Readable): Promise<string> {
    const fullPath = join(this.baseDir, key);

    // Ensure directory exists
    await fs.mkdir(dirname(fullPath), { recursive: true });

    // Write stream to disk
    const writeStream = createWriteStream(fullPath);
    await pipeline(data, writeStream);

    return key;
  }

  async list(path: string): Promise<string[]> {
    const fullPath = join(this.baseDir, path);

    try {
      await fs.access(fullPath);
    } catch {
      // Path doesn't exist, return empty array
      return [];
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const relativePath = join(path, entry.name);
      if (entry.isDirectory()) {
        // Recursively list files in subdirectories
        const subFiles = await this.list(relativePath);
        files.push(...subFiles);
      } else {
        files.push(relativePath);
      }
    }

    return files;
  }

  async readAsStream(key: string): Promise<Readable> {
    const fullPath = join(this.baseDir, key);

    try {
      await fs.access(fullPath);
    } catch {
      throw new Error(`File with key: ${key} not found in disk file system`);
    }

    return createReadStream(fullPath);
  }
}
