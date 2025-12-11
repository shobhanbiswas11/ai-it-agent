import { Readable } from "stream";
import { FileSystemPort } from "../../ports/file-system.port";
import { KbRepoPort } from "../../ports/kb-repo.port";
import { TicketRepoPort } from "../../ports/ticket.repo";
import { FileProcessor } from "../file-processors/file-processor";
import { FileProcessorFactory } from "../file-processors/file-processor.factory";
import { KbBatchService } from "../kb-batch.service";
import { KbFileService } from "../kb-file.service";

describe("KbBatchService", () => {
  let service: KbBatchService;
  let mockKbFileService: jest.Mocked<KbFileService>;
  let mockFileSystemPort: jest.Mocked<FileSystemPort>;
  let mockFileProcessorFactory: jest.Mocked<FileProcessorFactory>;
  let mockFileProcessor: jest.Mocked<FileProcessor>;
  let mockTicketRepo: jest.Mocked<TicketRepoPort>;
  let mockKbRepo: jest.Mocked<KbRepoPort>;

  beforeEach(() => {
    // Create mocks
    mockKbFileService = {
      listUploads: jest.fn(),
    } as any;

    mockFileSystemPort = {
      readAsStream: jest.fn(),
      writeFromStream: jest.fn(),
      list: jest.fn(),
    };

    mockFileProcessor = {
      process: jest.fn(),
    } as any;

    mockFileProcessorFactory = {
      getFileProcessor: jest.fn().mockResolvedValue(mockFileProcessor),
    } as any;

    mockTicketRepo = {
      batchWrite: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockKbRepo = {
      findById: jest.fn().mockResolvedValue({
        id: "kb-123",
        fieldMap: { title: "title" },
      }),
    } as any;

    // Create service instance
    service = new KbBatchService(
      mockKbFileService,
      mockFileSystemPort,
      mockFileProcessorFactory,
      mockTicketRepo,
      mockKbRepo
    );
  });

  describe("process", () => {
    it("should process all uploads for a knowledge base", async () => {
      // Arrange
      const kbId = "kb-123";
      const uploads = ["upload1.csv", "upload2.csv"];
      const mockStream = new Readable();

      mockKbFileService.listUploads.mockResolvedValue(uploads);
      mockFileSystemPort.readAsStream.mockResolvedValue(mockStream);

      // Act
      await service.createBatch(kbId);

      // Assert
      expect(mockKbFileService.listUploads).toHaveBeenCalledWith(kbId);
      expect(mockKbFileService.listUploads).toHaveBeenCalledTimes(1);
      expect(mockFileSystemPort.readAsStream).toHaveBeenCalledTimes(4); // 2 times per upload (factory + process)
      expect(mockFileProcessorFactory.getFileProcessor).toHaveBeenCalledTimes(
        2
      );
      expect(mockFileProcessor.process).toHaveBeenCalledTimes(2);
    });

    it("should throw error when no uploads found", async () => {
      // Arrange
      const kbId = "kb-empty";
      mockKbFileService.listUploads.mockResolvedValue([]);

      // Act & Assert
      await expect(service.createBatch(kbId)).rejects.toThrow(
        `No uploads found for knowledge base with id: ${kbId} to process`
      );
    });

    it("should call file processor with correct stream and callback", async () => {
      // Arrange
      const kbId = "kb-456";
      const uploads = ["upload.csv"];
      const mockStream = new Readable();

      mockKbFileService.listUploads.mockResolvedValue(uploads);
      mockFileSystemPort.readAsStream.mockResolvedValue(mockStream);

      // Act
      await service.createBatch(kbId);

      // Assert
      expect(mockFileProcessor.process).toHaveBeenCalledWith(
        mockStream,
        expect.any(Function)
      );
    });

    it("should get correct processor for each upload", async () => {
      // Arrange
      const kbId = "kb-789";
      const uploads = ["file1.csv", "file2.zip"];
      const mockStream1 = new Readable();
      const mockStream2 = new Readable();

      mockKbFileService.listUploads.mockResolvedValue(uploads);
      mockFileSystemPort.readAsStream
        .mockResolvedValueOnce(mockStream1)
        .mockResolvedValueOnce(mockStream1)
        .mockResolvedValueOnce(mockStream2)
        .mockResolvedValueOnce(mockStream2);

      // Act
      await service.createBatch(kbId);

      // Assert
      expect(mockFileProcessorFactory.getFileProcessor).toHaveBeenNthCalledWith(
        1,
        mockStream1
      );
      expect(mockFileProcessorFactory.getFileProcessor).toHaveBeenNthCalledWith(
        2,
        mockStream2
      );
    });

    it("should handle processing errors gracefully", async () => {
      // Arrange
      const kbId = "kb-error";
      const uploads = ["upload.csv"];
      const mockStream = new Readable();
      const error = new Error("Processing failed");

      mockKbFileService.listUploads.mockResolvedValue(uploads);
      mockFileSystemPort.readAsStream.mockResolvedValue(mockStream);
      mockFileProcessor.process.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createBatch(kbId)).rejects.toThrow(
        "Processing failed"
      );
    });

    it("should read stream from file system for each upload", async () => {
      // Arrange
      const kbId = "kb-stream";
      const uploadKey = "uploads/file.csv";
      const mockStream = new Readable();

      mockKbFileService.listUploads.mockResolvedValue([uploadKey]);
      mockFileSystemPort.readAsStream.mockResolvedValue(mockStream);

      // Act
      await service.createBatch(kbId);

      // Assert
      expect(mockFileSystemPort.readAsStream).toHaveBeenCalledWith(uploadKey);
    });
  });

  describe("processTicketEntry", () => {
    it("should call batchWrite when batch size reaches 100 tickets", async () => {
      const kbId = "kb-123";
      const uploads = ["upload.csv"];
      const mockStream = new Readable();

      // Simulate processing 150 tickets
      const ticketEntries = Array.from({ length: 150 }, (_, i) => ({
        title: `Ticket ${i}`,
      }));

      mockKbFileService.listUploads.mockResolvedValue(uploads);
      mockFileSystemPort.readAsStream.mockResolvedValue(mockStream);

      mockFileProcessor.process.mockImplementation(async (stream, callback) => {
        for (const entry of ticketEntries) {
          await callback(entry);
        }
      });

      await service.createBatch(kbId);

      // Should call batchWrite twice: once at 100, once at the end for remaining 50
      expect(mockTicketRepo.batchWrite).toHaveBeenCalledTimes(2);

      // First call should have 100 tickets
      const firstBatch = mockTicketRepo.batchWrite.mock.calls[0][0];
      expect(firstBatch.length).toBe(100);

      // Second call should have 50 tickets (final flush)
      const secondBatch = mockTicketRepo.batchWrite.mock.calls[1][0];
      expect(secondBatch.length).toBe(50);
    });
  });
});
