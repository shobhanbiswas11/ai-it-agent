import z from "zod";

export const sshSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535).optional().default(22),
  username: z.string().min(1),
  password: z.string().min(1).optional(),
  privateKey: z.string().min(1).optional(),
});

export type SshConfig = z.infer<typeof sshSchema>;
