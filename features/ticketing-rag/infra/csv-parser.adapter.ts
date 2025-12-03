import { randomUUID } from "crypto";
import Papa from "papaparse";
import { injectable } from "tsyringe";
import { Ticket } from "../domain/ticket.entity";
import { CSVParserPort } from "../ports/csv-parser.port";

@injectable()
export class CSVParserAdapter implements CSVParserPort {
  async parse(buffer: Buffer): Promise<Ticket[]> {
    const content = buffer.toString("utf-8");

    // Parse CSV using papaparse
    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      console.warn("CSV parsing warnings:", result.errors);
    }

    if (!result.data || result.data.length === 0) {
      throw new Error("CSV file is empty or could not be parsed");
    }

    // Convert parsed rows to Ticket entities
    const tickets: Ticket[] = result.data.map((row) => {
      // Combine all fields into text for embedding
      const text = Object.values(row).filter(Boolean).join(" | ");

      // All fields become metadata
      const metadata: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        const numValue = Number(value);
        metadata[key] = isNaN(numValue) ? value : numValue;
      });

      return new Ticket({
        id: randomUUID(),
        text,
        metadata,
      });
    });

    console.log(`Parsed ${tickets.length} tickets from CSV`);
    return tickets;
  }
}
