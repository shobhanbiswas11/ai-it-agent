import { inject, injectable } from "tsyringe";
import { KnowledgeBase } from "../domain/entities/knowledge-base.entity";
import { Ticket } from "../domain/entities/ticket.entity";
import { TicketMapper } from "../mappers/ticket.mapper";
import { FileSystemPort, FileSystemPortKey } from "../ports/file-system.port";
import { KbRepoPort, KbRepoPortKey } from "../ports/kb-repo.port";
import { TicketRepoPort, TicketRepoPortKey } from "../ports/ticket.repo";
import { FileProcessorFactory } from "./file-processors/file-processor.factory";
import { KbFileService } from "./kb-file.service";

@injectable()
export class KbBatchService {
  private readonly BATCH_SIZE = 100;
  private _currentBatch: Ticket[] = [];
  private _kb!: KnowledgeBase;

  constructor(
    private _kbFileService: KbFileService,
    @inject(FileSystemPortKey)
    private _fileSystemPort: FileSystemPort,
    private _fileProcessorFactory: FileProcessorFactory,
    @inject(TicketRepoPortKey)
    private _ticketRepo: TicketRepoPort,
    @inject(KbRepoPortKey)
    private _kbRepo: KbRepoPort
  ) {}

  async createBatch(kbId: string) {
    const kb = await this._kbRepo.findById(kbId);
    if (!kb) {
      throw new Error(`Knowledge base with id: ${kbId} not found`);
    }
    this._kb = kb;

    for (const upload of await this.getUploads(kbId)) {
      const processor = await this._fileProcessorFactory.getFileProcessor(
        await this.getUploadStream(upload)
      );
      await processor.process(
        await this.getUploadStream(upload),
        this.processTicketEntry.bind(this)
      );
    }

    // Final flush for any remaining tickets
    if (this._currentBatch.length > 0) {
      await this.writeBatch(this._currentBatch);
      this._currentBatch = [];
    }
  }

  private getUploadStream(key: string) {
    return this._fileSystemPort.readAsStream(key);
  }

  private async getUploads(kbId: string) {
    const uploads = await this._kbFileService.listUploads(kbId);
    if (uploads.length === 0) {
      throw new Error(
        `No uploads found for knowledge base with id: ${kbId} to process`
      );
    }
    return uploads;
  }

  private async processTicketEntry(entry: Record<string, any>) {
    if (this._currentBatch.length >= this.BATCH_SIZE) {
      await this.writeBatch(this._currentBatch);
      this._currentBatch = [];
    }

    const mapper = TicketMapper.getTicketMapper(this._kb.fieldMap, this._kb.id);
    try {
      const ticket = mapper(entry);
      this._currentBatch.push(ticket);
    } catch (error) {}
  }

  private writeBatch(batch: Ticket[]) {
    return this._ticketRepo.batchWrite(batch);
  }
}
