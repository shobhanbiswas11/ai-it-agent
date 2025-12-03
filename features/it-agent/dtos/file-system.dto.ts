import z from "zod";
import { sshSchema } from "./ssh.dto";

export const fileSystemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("local"),
  }),
  z.object({
    type: z.literal("remote"),
    connection: sshSchema,
  }),
]);

export type FileSystemConfig = z.infer<typeof fileSystemSchema>;
