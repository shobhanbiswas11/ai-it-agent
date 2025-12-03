import z from "zod";

export const createKBDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fileBuffer: z.instanceof(Buffer),
});

export type CreateKBDto = z.infer<typeof createKBDtoSchema>;
