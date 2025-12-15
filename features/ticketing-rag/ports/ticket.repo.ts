import z from "zod";
import { Ticket } from "../domain/entities/ticket.entity";

export const QueryFilterSchema = z.object({
  id: z.string().optional(),
  kbId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  createdBefore: z.iso.datetime().optional(), // ISO 8601 string format
  createdAfter: z.iso.datetime().optional(), // ISO 8601 string format
});
export type QueryFilter = z.infer<typeof QueryFilterSchema>;

export interface TicketRepoPort {
  batchWrite(tickets: Ticket[]): Promise<void>;
  query(filter: QueryFilter): Promise<Ticket[]>;
}

export interface SemanticQueryProps {
  text: string;
  topK?: number;
  filter?: QueryFilter;
}
export interface TicketSemanticRepoPort {
  batchWrite(tickets: Ticket[]): Promise<void>;
  semanticQuery(props: SemanticQueryProps): Promise<Ticket[]>;
}

export const TicketRepoPortKey = Symbol("TicketRepoPort");
export const TicketSemanticRepoPortKey = Symbol("TicketSemanticRepoPort");
