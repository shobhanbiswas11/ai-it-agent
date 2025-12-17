import z from "zod";

export const TestLogAnomalyDetectionRequestDtoSchema = z.object({
  sourceType: z.string(),
  sourceConfig: z.record(z.string(), z.any()),
});
export type TestLogAnomalyDetectionRequestDto = z.infer<
  typeof TestLogAnomalyDetectionRequestDtoSchema
>;
