import axios, { AxiosInstance } from "axios";
import z from "zod";
import {
  FetchLogParams,
  FetchLogsResponse,
  LogSource,
  LogSourceConfig,
  LogSourceConnectionCheckResponse,
} from "./log-source.type";

let authToken: string | undefined;

async function authenticate(
  client: AxiosInstance,
  config: LogSourceConfig
): Promise<string> {
  if (authToken) {
    return authToken;
  }

  try {
    const response = await client.post("", {
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        username: config.username,
        password: config.password,
      },
      id: 1,
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    authToken = response.data.result;
    if (!authToken) {
      throw new Error("Authentication failed: No token received");
    }
    return authToken;
  } catch (error) {
    throw new Error(
      `Authentication failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export const zabbixLogSource: LogSource = {
  name: "zabbix",
  description: "Zabbix Log Source",
  configSchema: z.object({
    host: z.url(),
    username: z.string().min(1),
    password: z.string().min(1),
  }),

  checkConnection: async function (
    config: LogSourceConfig
  ): Promise<LogSourceConnectionCheckResponse> {
    try {
      const client = axios.create({
        baseURL: `${config.host}/api_jsonrpc.php`,
        headers: {
          "Content-Type": "application/json",
        },
      });

      await authenticate(client, config);
      return {
        success: true,
        message: "Successfully connected to Zabbix",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  },

  fetchLogs: async function (
    config: LogSourceConfig,
    params: FetchLogParams
  ): Promise<FetchLogsResponse> {
    try {
      const client = axios.create({
        baseURL: `${config.host}/api_jsonrpc.php`,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const token = await authenticate(client, config);

      const response = await client.post(
        "",
        {
          jsonrpc: "2.0",
          method: "history.get",
          params: {
            output: "extend",
            history: 2, // Log type
            sortfield: "clock",
            sortorder: "DESC",
            limit: params.limit || 50,
          },
          id: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const historyItems = response.data.result || [];

      return {
        logs: historyItems.map((item: any) => item.value),
        count: historyItems.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch logs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
