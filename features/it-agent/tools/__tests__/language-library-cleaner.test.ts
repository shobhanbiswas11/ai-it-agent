import { IFileSystem } from "../../ports/file-system.port";
import { LanguageLibraryCleaner } from "../language-library-cleaner.tool";

describe("Language Library Cleaner", () => {
  let languageLibraryCleaner: LanguageLibraryCleaner;
  let fileSystemMock: Mocked<IFileSystem>;

  beforeEach(() => {
    fileSystemMock = {
      isDirectory: vi.fn(),
      readDirectory: vi.fn(),
      removeDirectory: vi.fn(),
    };

    languageLibraryCleaner = new LanguageLibraryCleaner(
      {
        getFileSystem: vi.fn().mockReturnValue(fileSystemMock),
      },
      {
        log: vi.fn(),
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
