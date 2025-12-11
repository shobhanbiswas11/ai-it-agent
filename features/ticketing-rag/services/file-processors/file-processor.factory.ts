import { loadEsm } from "load-esm";
import { Readable } from "stream";
import { injectable } from "tsyringe";
import { CSVProcessor } from "./csv.file-processor";
import { FileProcessor } from "./file-processor";
import { ZipProcessor } from "./zip.file-processor";

@injectable()
export class FileProcessorFactory {
  async getFileProcessor(stream: Readable): Promise<FileProcessor> {
    // Try to detect if it's a ZIP file (binary format)
    const { fileTypeStream } = await loadEsm<typeof import("file-type")>(
      "file-type"
    );

    const streamWithFileType = await fileTypeStream(stream);
    const isZip = streamWithFileType.fileType?.mime === "application/zip";

    if (isZip) {
      return new ZipProcessor();
    }

    // Validate if it's actually a CSV before returning processor
    const isCsv = await CSVProcessor.isValidCsv(streamWithFileType);
    if (!isCsv) {
      throw new Error("File is neither a ZIP nor a valid CSV file");
    }

    return new CSVProcessor();
  }
}
