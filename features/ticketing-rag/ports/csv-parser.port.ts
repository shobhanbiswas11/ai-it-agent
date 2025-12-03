import { Ticket } from "../domain/ticket.entity";

export interface CSVParserPort {
  parse(buffer: Buffer): Promise<Ticket[]>;
}
