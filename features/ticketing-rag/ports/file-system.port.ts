import { Readable } from "stream";

export type ContentType = "zip" | "csv";
export interface FileSystemPort {
  writeFromStream(key: string, data: Readable): Promise<string>;
  list(path: string): Promise<string[]>;
  readAsStream(key: string): Promise<Readable>;
}

export const FileSystemPortKey = Symbol("FileSystemPort");
