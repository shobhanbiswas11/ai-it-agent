import OpenAI from "openai";
import { injectable } from "tsyringe";
import {
  AnomalyDetectionPayload,
  AnomalyDetectionResponse,
  ILogAnomalyDetector,
} from "../ports/log-anomaly-detector.port";

@injectable()
export class GptLogAnomalyDetector implements ILogAnomalyDetector {
  private client: OpenAI;
  private model: string = "gpt-4o-mini";

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    this.client = new OpenAI({ apiKey });
  }

  async detectAnomalies(
    payload: AnomalyDetectionPayload
  ): Promise<AnomalyDetectionResponse> {
    const prompt = this.buildPrompt(payload.logs);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert log analyzer. Analyze the provided logs and identify anomalies such as errors, warnings, unusual patterns, security threats, or performance issues. Return your analysis as a JSON array.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { anomalousLogs: [] };
    }

    const result = JSON.parse(content);
    return {
      anomalousLogs: result.anomalousLogs || [],
    };
  }

  private buildPrompt(logs: string[]): string {
    const logsWithIndex = logs.map((log, index) => ({
      index,
      log,
    }));

    return `Analyze the following logs and identify any anomalies. For each anomalous log, provide:
- The original log text
- The original index (0-based)
- A score between 0 and 1 (optional, where 1 is most anomalous)
- A brief reason explaining why it's anomalous

Return the result as JSON in this exact format:
{
  "anomalousLogs": [
    {
      "log": "the original log text",
      "originalIndex": 0,
      "score": 0.9,
      "reason": "explanation of the anomaly"
    }
  ]
}

Logs to analyze:
${logsWithIndex.map((item) => `[${item.index}] ${item.log}`).join("\n")}`;
  }
}
