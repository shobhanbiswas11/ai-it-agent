import axios, { AxiosInstance } from "axios";
import { ILogSource } from "../ports/ILogSource";

export class ZabbixLogSource implements ILogSource {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(
    private _config: { host: string; username: string; password: string }
  ) {
    this.client = axios.create({
      baseURL: `${this._config.host}/api_jsonrpc.php`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      await this.authenticate();
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
  }

  async fetchLogs(): Promise<{ logs: string[]; count: number }> {
    try {
      await this.authenticate();

      const response = await this.client.post(
        "",
        {
          jsonrpc: "2.0",
          method: "history.get",
          params: {
            output: "extend",
            history: 2, // Log type
            sortfield: "clock",
            sortorder: "DESC",
            limit: 50,
          },
          id: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
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
  }

  private async authenticate(): Promise<void> {
    if (this.authToken) {
      return;
    }

    try {
      const response = await this.client.post("", {
        jsonrpc: "2.0",
        method: "user.login",
        params: {
          username: this._config.username,
          password: this._config.password,
        },
        id: 1,
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      this.authToken = response.data.result;
    } catch (error) {
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
