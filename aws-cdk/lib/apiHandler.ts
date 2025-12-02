import { APIGatewayProxyHandler } from "aws-lambda";
import { CheckLogSourceConnectionDTO } from "../../dtos/checkLogSourceConnection.dto";
import { ZabbixLogSource } from "../../infra/zabbix-log-source";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (
      event.httpMethod === "POST" &&
      event.path === "/check-log-source-connection"
    ) {
      const body = JSON.parse(
        event.body || "{}"
      ) as CheckLogSourceConnectionDTO;
      const host = body.config.host;
      const username = body.config.username;
      const password = body.config.password;

      if (body.type !== "zabbix")
        throw new Error("Unsupported log source type");
      if (!host || !username || !password)
        throw new Error("Missing log source configuration");

      const zabbixLogSource = new ZabbixLogSource({
        host,
        username,
        password,
      });

      const res = await zabbixLogSource.checkConnection();

      return {
        body: JSON.stringify(res),
        statusCode: 200,
      };
    }
  } catch (error) {
    return {
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      }),
      statusCode: 500,
    };
  }

  return {
    body: "Not Found",
    statusCode: 404,
  };
};
