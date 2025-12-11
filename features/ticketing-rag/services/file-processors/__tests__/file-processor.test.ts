import { Readable } from "stream";
import { CSVProcessor } from "../csv.file-processor";
import { FileProcessorFactory } from "../file-processor.factory";
import { ZipProcessor } from "../zip.file-processor";

describe("File Processor", () => {
  it("should return CSV processor for CSV content", async () => {
    const csvContent =
      "name,email,age\nJohn,john@example.com,30\nJane,jane@example.com,25";
    const stream = Readable.from(Buffer.from(csvContent));

    const factory = new FileProcessorFactory();
    const processor = await factory.getFileProcessor(stream);

    expect(processor).toBeInstanceOf(CSVProcessor);
  });

  it("should return ZIP processor for ZIP content", async () => {
    // ZIP file signature: PK (0x504B)
    const zipSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    const stream = Readable.from([zipSignature]);

    const factory = new FileProcessorFactory();
    const processor = await factory.getFileProcessor(stream);

    expect(processor).toBeInstanceOf(ZipProcessor);
  });

  it("should throw error for invalid file type", async () => {
    const invalidContent = "This is just plain text without any delimiters";
    const stream = Readable.from(Buffer.from(invalidContent));

    const factory = new FileProcessorFactory();

    await expect(factory.getFileProcessor(stream)).rejects.toThrow(
      "File is neither a ZIP nor a valid CSV file"
    );
  });
});
