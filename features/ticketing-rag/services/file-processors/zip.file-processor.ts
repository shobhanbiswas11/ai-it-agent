import { Readable } from "stream";
import unzipper from "unzipper";
import { CSVProcessor } from "./csv.file-processor";
import { FileProcessor } from "./file-processor";

export class ZipProcessor extends FileProcessor {
  async process(
    stream: Readable,
    onProcessTicketEntry: (entry: Record<string, any>) => Promise<void>
  ): Promise<void> {
    const csvProcessor = new CSVProcessor();
    const parser = stream.pipe(unzipper.Parse());

    return new Promise<void>((resolve, reject) => {
      parser.on("entry", async (entry) => {
        const fileName = entry.path;
        parser.pause();

        try {
          if (fileName.endsWith(".csv")) {
            await csvProcessor.process(entry, onProcessTicketEntry);
          } else {
            entry.autodrain();
          }
        } catch (err) {
          reject(err);
          return;
        } finally {
          parser.resume();
        }
      });

      parser.on("finish", () => resolve());
      parser.on("error", (err) => reject(err));
    });
  }
}
