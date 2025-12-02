import { ZabbixLogSource } from "../zabbix-log-source";

describe("Zabbix Test", () => {
  let zabbixLogSource: ZabbixLogSource;

  beforeEach(() => {
    zabbixLogSource = new ZabbixLogSource({
      host: process.env.ZABBIX_HOST!,
      username: process.env.ZABBIX_USERNAME!,
      password: process.env.ZABBIX_PASSWORD!,
    });
  });

  test("connection", async () => {
    const res = await zabbixLogSource.testConnection();
    expect(res.success).toBe(true);
  });

  test("fetch logs", async () => {
    const res = await zabbixLogSource.fetchLogs();
    console.log(res);
    expect(res.count).toBeGreaterThan(0);
  });
});
