import { Readable } from "stream";

export abstract class FileProcessor {
  abstract process(
    stream: Readable,
    onProcessTicketEntry: (entry: Record<string, any>) => Promise<void>
  ): Promise<void>;
}
