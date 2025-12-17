import z from "zod";
import { LogSourceType } from "../domain/log-source.entity";

export const LogSourceConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal<LogSourceType>("zabbix"),
    config: z.object({
      host: z.url(),
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  }),
]);

export type LogSourceConnectionResponse = {
  success: boolean;
  message?: string;
};

export type LogSourceConfig = z.infer<typeof LogSourceConfigSchema>;

export class LogSourceDTO {
  type!: LogSourceType;
  config!: LogSourceConfig;
}
