import { KbUploadEvent } from "../../domain/events/kb-upload.event";
import { EventBusPort } from "../../ports/event-bus.port";
import { KbRepoPort } from "../../ports/kb-repo.port";
import { KbFileService } from "../../services/kb-file.service";
import { UploadKnowledgeBase } from "../upload-kb.usecase";

describe("upload knowledge-base usecase", () => {
  let kbFileService: Mocked<KbFileService>;
  let kbRepo: Mocked<KbRepoPort>;
  let eventBus: Mocked<EventBusPort>;

  beforeEach(() => {
    kbFileService = {
      upload: vi.fn(),
    } as unknown as Mocked<KbFileService>;

    kbRepo = {
      save: vi.fn(),
    } as unknown as Mocked<KbRepoPort>;

    eventBus = {
      publish: vi.fn(),
    };
  });

  it("should create knowledge-base, save it to repo upload and then publish the event and return the dto", async () => {
    const uc = new UploadKnowledgeBase(kbFileService, kbRepo, eventBus);

    const result = await uc.execute({
      stream: "stream" as any,
      name: "Test KB",
      description: "A test knowledge base",
      fieldMap: { title: "title" },
    });

    expect(kbRepo.save).toHaveBeenCalledTimes(1);
    const savedKb = kbRepo.save.mock.calls[0][0];
    expect(savedKb.name).toBe("Test KB");
    expect(savedKb.description).toBe("A test knowledge base");

    expect(kbFileService.upload).toHaveBeenCalledTimes(1);
    expect(kbFileService.upload).toHaveBeenCalledWith("stream", savedKb.id);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = eventBus.publish.mock.calls[0][0];
    expect(publishedEvent).toBeInstanceOf(KbUploadEvent);

    expect(result).toEqual({
      id: savedKb.id,
      name: "Test KB",
      description: "A test knowledge base",
    });
  });
});
