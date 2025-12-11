import { Readable } from "stream";
import { FileSystemPort } from "../ports/file-system.port";

const fileSystem = new Map<string, Buffer>();

export class MemoryFileSystemAdapter implements FileSystemPort {
  writeFromStream(key: string, data: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      data.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      data.on("end", () => {
        const buffer = Buffer.concat(chunks);
        fileSystem.set(key, buffer);
        resolve(key);
      });
      data.on("error", (err) => {
        reject(err);
      });
    });
  }
  list(path: string): Promise<string[]> {
    const keys = Array.from(fileSystem.keys()).filter((key) =>
      key.startsWith(path)
    );
    return Promise.resolve(keys);
  }
  readAsStream(key: string): Promise<Readable> {
    const buffer = fileSystem.get(key);
    if (!buffer) {
      throw new Error(`File with key: ${key} not found in memory file system`);
    }
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signal end of stream
    return Promise.resolve(stream);
  }
}
