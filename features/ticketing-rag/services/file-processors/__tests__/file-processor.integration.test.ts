import { Readable } from "stream";
import { CSVProcessor } from "../csv.file-processor";
import { FileProcessorFactory } from "../file-processor.factory";
import { ZipProcessor } from "../zip.file-processor";

describe("File Processor", () => {
  it("should return CSV processor for CSV content", async () => {
    const res = await fetch(
      "https://drive.google.com/uc?id=18vlOi20KcMR328ewc2NBsoBNPrV3vL9Q&export=download"
    );

    const factory = new FileProcessorFactory();
    const processor = await factory.getFileProcessor(
      Readable.fromWeb(res.body as any)
    );

    expect(processor).toBeInstanceOf(CSVProcessor);
  });

  it("should return ZIP processor for ZIP content", async () => {
    const res = await fetch(
      "https://drive.google.com/uc?id=1wtYMAcAHHwdgoSQoe6BJfTHDnkXrJt2d&export=download"
    );
    const factory = new FileProcessorFactory();
    const processor = await factory.getFileProcessor(
      Readable.fromWeb(res.body as any)
    );

    expect(processor).toBeInstanceOf(ZipProcessor);
  });

  it("should throw error for invalid file type", async () => {
    const res = await fetch(
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    );

    const factory = new FileProcessorFactory();

    await expect(
      factory.getFileProcessor(Readable.fromWeb(res.body as any))
    ).rejects.toThrow("File is neither a ZIP nor a valid CSV file");
  });
});
