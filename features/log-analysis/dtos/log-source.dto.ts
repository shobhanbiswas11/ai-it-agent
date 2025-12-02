import z from "zod";

export const logSourceConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("zabbix"),
    config: z.object({
      host: z.string().url(),
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  }),
]);

export type LogSourceConnectionResponse = {
  success: boolean;
  message?: string;
};

export type LogSourceConfig = z.infer<typeof logSourceConfigSchema>;
