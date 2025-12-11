import { Readable } from "stream";
import { CSVProcessor } from "../csv.file-processor";

describe("CSV file processor", () => {
  it("should process the csv file properly", async () => {
    const dummyCsv = "name,age\nAlice,30\nBob,25\nCharlie,35";
    const stream = Readable.from(Buffer.from(dummyCsv));

    const fn = jest.fn();

    const processor = new CSVProcessor();
    await processor.process(stream, fn);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, { name: "Alice", age: "30" });
    expect(fn).toHaveBeenNthCalledWith(2, { name: "Bob", age: "25" });
    expect(fn).toHaveBeenNthCalledWith(3, { name: "Charlie", age: "35" });
  });
});
