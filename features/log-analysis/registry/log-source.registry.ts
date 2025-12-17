import { container, singleton } from "tsyringe";
import z, { ZodType } from "zod";

export interface LogSourceDescriptor {
  name: string;
  description: string;
  configSchema: ZodType;
}

export const ZabbixLogSourceDescriptor: LogSourceDescriptor = {
  name: "Zabbix",
  description: "Log source integration for Zabbix monitoring system.",
  configSchema: z.object({
    host: z.url(),
    username: z.string().min(1),
    password: z.string().min(1),
  }),
};

@singleton()
export class LogSourceRegistry {
  private sources = new Map<string, LogSourceDescriptor>();

  register(descriptor: LogSourceDescriptor): void {
    this.sources.set(descriptor.name, descriptor);
  }

  get(sourceName: string): LogSourceDescriptor | null {
    const entry = this.sources.get(sourceName);
    if (!entry) return null;
    return entry;
  }
}

export function setupLogSourceRegistry() {
  const registry = container.resolve(LogSourceRegistry);
  registry.register(ZabbixLogSourceDescriptor);
}
