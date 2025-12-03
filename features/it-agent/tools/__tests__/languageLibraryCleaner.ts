import { IFileSystem } from "../../ports/IFileSystem";
import { LanguageLibraryCleaner } from "../languageLibraryCleaner";

describe("Language Library Cleaner", () => {
  let languageLibraryCleaner: LanguageLibraryCleaner;
  let fileSystemMock: jest.Mocked<IFileSystem>;

  beforeEach(() => {
    fileSystemMock = {
      isDirectory: jest.fn(),
      readDirectory: jest.fn(),
      removeDirectory: jest.fn(),
    };

    languageLibraryCleaner = new LanguageLibraryCleaner(
      {
        getFileSystem: jest.fn().mockReturnValue(fileSystemMock),
      },
      {
        log: jest.fn(),
      }
    );
  });

  it("Clean up all the language library directories", async () => {
    fileSystemMock.readDirectory.mockResolvedValueOnce([
      "node_modules",
      "src",
      ".venv",
      "README.md",
    ]);
    fileSystemMock.isDirectory.mockImplementation(async (path: string) => {
      if (
        path.endsWith("node_modules") ||
        path.endsWith(".venv") ||
        path.endsWith("src")
      ) {
        return true;
      }
      return false;
    });

    await languageLibraryCleaner.execute({
      config: { basePath: "/project" },
      fileSystemConfig: {} as any,
    });

    expect(fileSystemMock.readDirectory).toHaveBeenCalledWith("/project");
    expect(fileSystemMock.removeDirectory).toHaveBeenCalledTimes(2);
    expect(fileSystemMock.removeDirectory).toHaveBeenCalledWith(
      "/project/node_modules"
    );
    expect(fileSystemMock.removeDirectory).toHaveBeenCalledWith(
      "/project/.venv"
    );
  });
});
