import z from "zod";

export const triggerToolDtoSchema = z.object({
  toolName: z.string(),
  config: z.any().optional(),
});

export type TriggerToolDto = z.infer<typeof triggerToolDtoSchema>;
