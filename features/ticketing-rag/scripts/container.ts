import { config } from "dotenv";
import "reflect-metadata";
import { container } from "tsyringe";
import { DiskFileSystemAdapter } from "../infra/disk-file-system.adapter";
import { MemoryEventBusAdapter } from "../infra/memory-event-bus.adapter";
import { SqlKbRepoAdapter } from "../infra/sql-kb-repo.adapter";
import { SqlTicketRepoAdapter } from "../infra/sql-ticket-repo.adapter";
import { EventBusPort, EventBusPortKey } from "../ports/event-bus.port";
import { FileSystemPort, FileSystemPortKey } from "../ports/file-system.port";
import { KbRepoPort, KbRepoPortKey } from "../ports/kb-repo.port";
import { TicketRepoPort, TicketRepoPortKey } from "../ports/ticket.repo";
config();

export const getContainer = () => {
  container.registerSingleton<EventBusPort>(
    EventBusPortKey,
    MemoryEventBusAdapter
  );
  container.registerSingleton<FileSystemPort>(
    FileSystemPortKey,
    DiskFileSystemAdapter
  );
  container.registerSingleton<KbRepoPort>(
    KbRepoPortKey, //
    SqlKbRepoAdapter
  );
  container.registerSingleton<TicketRepoPort>(
    TicketRepoPortKey,
    SqlTicketRepoAdapter
  );

  return container;
};
