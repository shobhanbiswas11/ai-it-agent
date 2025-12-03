import { GptLogAnomalyDetector } from "../../../infra/gpt-log-anomaly-detector.adapter";
import { LogSourceFactory } from "../../../infra/log-source.factory";
import { ILogAnomalyDetector } from "../../../ports/log-anomaly-detector.port";
import { ILogSourceFactory } from "../../../ports/log-source.factory.port";
import { TestLogAnomalyDetection } from "../../test-log-anomaly-detection.usecase";

describe("Test log anomaly detection", () => {
  test("should fetch logs and run anomaly detection", async () => {
    const logSource = new LogSourceFactory().getLogSource({
      type: "zabbix",
      config: {
        host: process.env.ZABBIX_HOST || "",
        username: process.env.ZABBIX_USERNAME || "",
        password: process.env.ZABBIX_PASSWORD || "",
      },
    });

    const anomalyDetector = new GptLogAnomalyDetector();

    const uc = new TestLogAnomalyDetection(
      {
        getLogSource: () => logSource,
      } as ILogSourceFactory,
      anomalyDetector as ILogAnomalyDetector
    );

    const report = await uc.execute({
      type: "zabbix",
      config: {
        host: process.env.ZABBIX_HOST || "",
        username: process.env.ZABBIX_USERNAME || "",
        password: process.env.ZABBIX_PASSWORD || "",
      },
    });

    console.log("Anomaly Detection Report:", report);
  });
});
