import csvParser from "csv-parser";
import { createReadStream } from "fs";
import { loadEsm } from "load-esm";
import { resolve } from "path";

describe("Ticketing RAG", () => {
  test("ticketing-rag", async () => {
    const zipPath = resolve(process.cwd(), "tmp/sample_kb_dataset.zip");
    const csvPath = resolve(process.cwd(), "tmp/sample-tickets.csv");
    const excelPath = resolve(process.cwd(), "tmp/sample_excel.xlsx");

    const { fileTypeStream } = await loadEsm<typeof import("file-type")>(
      "file-type"
    );

    return new Promise<void>((resolve, reject) => {
      const stream = createReadStream(zipPath);
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          console.log("row:", data);
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          resolve();
        })
        .on("error", (err) => {
          console.log(err);
          reject(err);
        });
    });
  }, 100000);
});
