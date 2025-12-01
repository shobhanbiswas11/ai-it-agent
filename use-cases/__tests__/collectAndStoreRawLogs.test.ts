import { ILogFetcher } from "../../ports/ILogFetcher";
import { IObjectSaver } from "../../ports/IObjectSaver";
import { CollectAndStoreRawLogs } from "../collectAndStoreRawLogs";

describe("collect logs", () => {
  let collectAndStoreRawLogs: CollectAndStoreRawLogs;
  let logFetcher: jest.Mocked<ILogFetcher>;
  let objectStorage: jest.Mocked<IObjectSaver>;

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(1234);

    logFetcher = {
      fetchLogs: jest.fn(),
    };

    objectStorage = {
      save: jest.fn(),
    };

    collectAndStoreRawLogs = new CollectAndStoreRawLogs(
      logFetcher,
      objectStorage,
      { id: "job-1" } as any
    );
  });

  test("Should Collect and make proper amount of batches", async () => {
    const logs = Array.from({ length: 250 }, (_, i) => `log-${i + 1}`);
    logFetcher.fetchLogs.mockResolvedValue({ logs, count: logs.length });

    await collectAndStoreRawLogs.execute();

    expect(objectStorage.save).toHaveBeenCalledTimes(3);

    expect(objectStorage.save).toHaveBeenNthCalledWith(
      1,
      "jobs/job-1/batches/1234/1.json",
      expect.any(Buffer)
    );

    expect(objectStorage.save).toHaveBeenNthCalledWith(
      2,
      "jobs/job-1/batches/1234/2.json",
      expect.any(Buffer)
    );

    expect(objectStorage.save).toHaveBeenNthCalledWith(
      3,
      "jobs/job-1/batches/1234/3.json",
      expect.any(Buffer)
    );
  });
});
