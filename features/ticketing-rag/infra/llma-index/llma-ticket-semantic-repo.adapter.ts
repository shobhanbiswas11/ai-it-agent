import {
  Document,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { singleton } from "tsyringe";
import { Ticket } from "../../domain/entities/ticket.entity";
import { TicketSemanticRepoPort } from "../../ports/ticket.repo";
import { LLmaLLMFactory } from "./llma-llm.factory";
import { LLmaVectorStoreFactory } from "./llma-vector-store.factory";

@singleton()
export class LLmaTicketSemanticRepoAdapter implements TicketSemanticRepoPort {
  constructor(
    private _llmaVectorStoreFactory: LLmaVectorStoreFactory,
    private _llmaLLMFactory: LLmaLLMFactory
  ) {
    Settings.llm = this._llmaLLMFactory.getLLM();
  }

  async batchWrite(tickets: Ticket[]): Promise<void> {
    const documents = tickets.map(
      (ticket) =>
        new Document({
          text: ticket.text,
          metadata: { ticketId: ticket.id, kbId: ticket.kbId },
        })
    );

    const vectorStore = await this._llmaVectorStoreFactory.getVectorStore();
    const storageContext = await storageContextFromDefaults({
      vectorStore,
    });

    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
  }

  async semanticQuery(): Promise<Ticket[]> {
    throw new Error("Method not implemented.");
  }
}
