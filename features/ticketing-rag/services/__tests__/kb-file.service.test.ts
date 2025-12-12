import { Readable } from "stream";
import { FileSystemPort } from "../../ports/file-system.port";
import { KbFileService } from "../kb-file.service";

describe("KbFileService", () => {
  let service: KbFileService;
  let mockFileSystem: Mocked<FileSystemPort>;

  beforeEach(() => {
    mockFileSystem = {
      writeFromStream: vi.fn(),
      list: vi.fn(),
      readAsStream: vi.fn(),
    };

    service = new KbFileService(mockFileSystem);
  });

  describe("upload", () => {
    it("should upload file and return key", async () => {
      // Arrange
      const kbId = "kb-123";
      const stream = new Readable();
      const expectedKey = "kb-123/uploads/some-uuid";

      mockFileSystem.writeFromStream.mockResolvedValue(expectedKey);

      // Act
      const result = await service.upload(stream, kbId);

      // Assert
      expect(mockFileSystem.writeFromStream).toHaveBeenCalledWith(
        expect.stringContaining("kb-123/uploads/"),
        stream
      );
      expect(result).toBe(expectedKey);
    });
  });

  describe("listUploads", () => {
    it("should list all uploads for a knowledge base", async () => {
      // Arrange
      const kbId = "kb-456";
      const uploads = ["file1.csv", "file2.zip"];

      mockFileSystem.list.mockResolvedValue(uploads);

      // Act
      const result = await service.listUploads(kbId);

      // Assert
      expect(mockFileSystem.list).toHaveBeenCalledWith("kb-456/uploads");
      expect(result).toEqual(uploads);
    });
  });
});
