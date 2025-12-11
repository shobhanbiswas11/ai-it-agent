import AdmZip from "adm-zip";
import { Readable } from "stream";
import { ZipProcessor } from "../zip.file-processor";

describe("Zip file processor integration test", () => {
  it("should process the files inside a zip", async () => {
    const buffer1 = Buffer.from(
      "age,name\n30,Alice\n25,Bob\n35,Charlie",
      "utf-8"
    );
    const buffer2 = Buffer.from(
      "city,country\nNew York,USA\nLondon,UK\nParis,France",
      "utf-8"
    );

    const zip = new AdmZip();
    zip.addFile("file1.csv", buffer1);
    zip.addFile("directory/file2.csv", buffer2);
    zip.addFile("notes.txt", Buffer.from("This is a text file", "utf-8"));

    const zipBuffer = zip.toBuffer();
    const stream = Readable.from([zipBuffer]);

    const processor = new ZipProcessor();

    const fn = jest.fn();
    await processor.process(stream, fn);

    expect(fn).toHaveBeenCalledTimes(6);
  });
});
