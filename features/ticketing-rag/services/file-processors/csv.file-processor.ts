import csvParser from "csv-parser";
import { Readable } from "stream";
import { FileProcessor } from "./file-processor";

export class CSVProcessor extends FileProcessor {
  async process(
    stream: Readable,
    onProcessTicketEntry: (entry: Record<string, any>) => Promise<void>
  ): Promise<void> {
    const parser = stream.pipe(csvParser());

    for await (const row of parser) {
      await onProcessTicketEntry(row);
    }
  }

  static async isValidCsv(stream: Readable): Promise<boolean> {
    try {
      const chunks: Buffer[] = [];
      const maxBytes = 1024; // Read first 1KB to check

      for await (const chunk of stream) {
        chunks.push(chunk);

        const totalBytes = chunks.reduce((sum, c) => sum + c.length, 0);
        if (totalBytes >= maxBytes) {
          stream.destroy();
          break;
        }
      }

      const sample = Buffer.concat(chunks).slice(0, maxBytes).toString("utf8");
      const lines = sample.split("\n").filter((l) => l.trim());

      if (lines.length === 0) {
        return false;
      }

      const firstLine = lines[0];
      const hasDelimiters = /[,;\t]/.test(firstLine);
      const looksLikeText = /^[\x20-\x7E\s]*$/.test(sample.substring(0, 100));

      return hasDelimiters && looksLikeText;
    } catch (error) {
      return false;
    }
  }
}
