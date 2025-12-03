import z from "zod";

export const queryKBDtoSchema = z.object({
  knowledgeBaseIds: z.array(z.string()).min(1),
  query: z.string().min(1),
  topK: z.number().optional().default(10),
});

export type QueryKBDto = z.infer<typeof queryKBDtoSchema>;
