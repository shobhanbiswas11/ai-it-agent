import { randomUUID } from "crypto";
import { injectable } from "tsyringe";
import { Ticket } from "../domain/ticket.entity";
import { CSVParseOptions, CSVParserPort } from "../ports/csv-parser.port";

/**
 * CSV parser adapter
 * Parses CSV buffer into Ticket domain entities
 */
@injectable()
export class CSVParserAdapter implements CSVParserPort {
  async parse(buffer: Buffer, options?: CSVParseOptions): Promise<Ticket[]> {
    const hasHeader = options?.hasHeader ?? true;
    const delimiter = options?.delimiter ?? ",";

    // Parse CSV
    const content = buffer.toString("utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }

    // Extract headers
    const headers = this.parseLine(lines[0], delimiter);
    const startIndex = hasHeader ? 1 : 0;

    // Determine text and metadata columns
    const textColumns = options?.textColumns || headers;
    const metadataColumns = options?.metadataColumns || headers;

    const tickets: Ticket[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);

      if (values.length !== headers.length) {
        console.warn(
          `Line ${i + 1} has ${values.length} values but expected ${
            headers.length
          }`
        );
        continue;
      }

      // Build row object
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });

      // Combine text columns for embedding
      const textParts = textColumns.map((col) => row[col]).filter(Boolean);
      const text = textParts.join(" | ");

      // Extract metadata
      const metadata: Record<string, any> = {};
      metadataColumns.forEach((col) => {
        if (row[col] !== undefined) {
          // Try to parse numbers
          const numValue = Number(row[col]);
          metadata[col] = isNaN(numValue) ? row[col] : numValue;
        }
      });

      tickets.push(
        new Ticket({
          id: randomUUID(),
          text,
          metadata,
        })
      );
    }

    console.log(`Parsed ${tickets.length} tickets from CSV`);
    return tickets;
  }

  /**
   * Parse a CSV line respecting quoted values
   */
  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }
}
