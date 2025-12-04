import { ClientSecretCredential } from "@azure/identity";
import OpenAI from "openai";
import { injectable } from "tsyringe";

export interface OpenAIClientConfig {
  client: OpenAI;
  model: string;
}

@injectable()
export class OpenAIClientFactory {
  createClient(): OpenAIClientConfig {
    const authType = process.env.OPENAI_AUTH_TYPE || "openai";

    if (authType === "azure") {
      return this.createAzureClient();
    } else {
      return this.createOpenAIClient();
    }
  }

  private createAzureClient(): OpenAIClientConfig {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !clientId || !clientSecret || !tenantId || !deployment) {
      throw new Error(
        "Azure OpenAI requires AZURE_OPENAI_ENDPOINT, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, and AZURE_OPENAI_DEPLOYMENT environment variables"
      );
    }

    // Create Azure credential
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );

    // Get access token for Azure OpenAI
    const getAzureToken = async () => {
      const tokenResponse = await credential.getToken(
        "https://cognitiveservices.azure.com/.default"
      );
      return tokenResponse.token;
    };

    // Create OpenAI client with Azure configuration
    const client = new OpenAI({
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: {
        "api-version":
          process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
      },
      apiKey: "dummy", // Required by OpenAI SDK but not used with Azure AD
      // Override fetch to add Azure AD token
      fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
        const token = await getAzureToken();
        const headers = new Headers(init?.headers);
        headers.set("Authorization", `Bearer ${token}`);

        return fetch(url, {
          ...init,
          headers,
        });
      },
    });

    return {
      client,
      model: deployment,
    };
  }

  private createOpenAIClient(): OpenAIClientConfig {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    return {
      client,
      model,
    };
  }
}
