import { Ticket } from "../domain/entities/ticket.entity";
import { FieldMap } from "../dtos/ticket.dto";

export class TicketMapper {
  static getTicketMapper(fieldMap: FieldMap, kbId: string) {
    return (data: Record<string, any>): Ticket => {
      // Map incoming fields to ticket fields using the fieldMap
      const mappedData: Record<string, any> = {
        kbId,
        title: fieldMap.title ? data[fieldMap.title] : undefined,
        description: fieldMap.description
          ? data[fieldMap.description]
          : undefined,
        priority: fieldMap.priority ? data[fieldMap.priority] : undefined,
        category: fieldMap.category ? data[fieldMap.category] : undefined,
        status: fieldMap.status ? data[fieldMap.status] : undefined,
        createdAt: fieldMap.createdAt
          ? new Date(data[fieldMap.createdAt])
          : undefined,
      };

      // Remove undefined values except for optional fields
      const cleanedData = Object.entries(mappedData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // Ensure required field 'title' exists
      if (!cleanedData.title) {
        throw new Error("Title field is required but not found in mapped data");
      }

      // Store unmapped fields in metadata
      const mappedFields = new Set(Object.values(fieldMap).filter(Boolean));
      const metadata = Object.entries(data).reduce((acc, [key, value]) => {
        if (!mappedFields.has(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(metadata).length > 0) {
        cleanedData.metadata = metadata;
      }

      return Ticket.create(cleanedData as any);
    };
  }
}
