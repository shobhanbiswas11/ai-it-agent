import { KbBatchEvent } from "../../domain/events/kb-batch.event";
import { EventBusPort } from "../../ports/event-bus.port";
import { KbBatchService } from "../../services/kb-batch.service";
import { BatchKnowledgeBase } from "../batch-kb.usecase";

describe("ProcessKnowledgeBase", () => {
  let useCase: BatchKnowledgeBase;
  let mockKbBatchService: jest.Mocked<KbBatchService>;
  let mockEventBus: jest.Mocked<EventBusPort>;

  beforeEach(() => {
    mockKbBatchService = {
      createBatch: jest.fn(),
    } as any;

    mockEventBus = {
      publish: jest.fn(),
    } as any;

    useCase = new BatchKnowledgeBase(mockKbBatchService, mockEventBus);
  });

  it("should call batch-service with kbId", async () => {
    // Arrange
    const kbId = "kb-123";
    mockKbBatchService.createBatch.mockResolvedValue(undefined);

    // Act
    await useCase.execute(kbId);

    // Assert
    expect(mockKbBatchService.createBatch).toHaveBeenCalledWith(kbId);
    expect(mockKbBatchService.createBatch).toHaveBeenCalledTimes(1);
  });

  it("should publish a batch event", async () => {
    // Arrange
    const kbId = "kb-123";
    mockKbBatchService.createBatch.mockResolvedValue(undefined);

    // Act
    await useCase.execute(kbId);

    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish.mock.calls[0][0]).toBeInstanceOf(KbBatchEvent);
  });
});
