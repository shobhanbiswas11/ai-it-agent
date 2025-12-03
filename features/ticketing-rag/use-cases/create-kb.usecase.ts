import { injectable } from "tsyringe";
import { KnowledgeBase } from "../domain/kb.entity";
import { CreateKBDto } from "../dtos/kb.dto";
import { CSVParserPort } from "../ports/csv-parser.port";
import { TicketRepositoryPort } from "../ports/ticket.repository.port";
import { VectorStorePort } from "../ports/vector-store.port";
import { KBRepository } from "../repos/kb.repo";

export interface CreateKBResult {
  knowledgeBaseId: string;
  name: string;
  ticketCount: number;
  vectorStorePath: string;
}
@injectable()
export class CreateKnowledgeBase {
  constructor(
    private _kbRepo: KBRepository,
    private _csvParser: CSVParserPort,
    private _vectorStore: VectorStorePort,
    private _ticketRepo: TicketRepositoryPort
  ) {}

  async execute(props: CreateKBDto): Promise<CreateKBResult> {
    try {
      const tickets = await this._csvParser.parse(props.fileBuffer);

      if (tickets.length === 0) {
        throw new Error("No valid tickets found in CSV");
      }

      // 2. Create KB entity
      const kb = new KnowledgeBase({
        name: props.name,
        description: props.description,
      });

      await this._kbRepo.save(kb);

      // 3. Store structured data in SQL database
      await this._ticketRepo.saveTickets(kb.id, tickets);

      // 4. Create vectors and store on disk
      await this._vectorStore.storeTickets(kb.id, tickets);

      // 5. Get storage path and mark KB as active
      const vectorStorePath = this._vectorStore.getStoragePath(kb.id);
      kb.markAsActive(tickets.length, vectorStorePath);
      await this._kbRepo.save(kb);

      console.log(
        `✓ Knowledge base '${kb.name}' created successfully with ${tickets.length} tickets`
      );

      return {
        knowledgeBaseId: kb.id,
        name: kb.name,
        ticketCount: tickets.length,
        vectorStorePath,
      };
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
      throw error;
    }
  }
}
