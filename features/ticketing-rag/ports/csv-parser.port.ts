import { Ticket } from "../domain/ticket.entity";

export interface CSVParseOptions {
  hasHeader?: boolean;
  delimiter?: string;
  textColumns?: string[]; // Columns to use for vector embedding
  metadataColumns?: string[]; // Columns to store as structured metadata
}

/**
 * Port for parsing CSV files into Ticket entities
 */
export interface CSVParserPort {
  /**
   * Parse CSV buffer into Ticket entities
   * @param buffer - CSV file buffer
   * @param options - Parsing options
   */
  parse(buffer: Buffer, options?: CSVParseOptions): Promise<Ticket[]>;
}
