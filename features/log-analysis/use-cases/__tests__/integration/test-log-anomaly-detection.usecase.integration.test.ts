import { LogSourceFactory } from "../../../factories/log-source.factory";
import { ZabbixLogSource } from "../../../infra/zabbix-log-source.adapter";
import { TestLogAnomalyDetection } from "../../test-log-anomaly-detection.usecase";

describe("Test log anomaly detection", () => {
  test("should fetch logs and run anomaly detection", async () => {
    const logSource = new LogSourceFactory(new ZabbixLogSource({})).create({
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
