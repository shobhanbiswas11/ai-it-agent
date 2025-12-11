import { ClientSecretCredential } from "@azure/identity";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import OpenAI from "openai";
import { singleton } from "tsyringe";

class ChromaCustomEmbeddingFunction {
  private openaiClient: OpenAI;
  private deploymentName: string;

  constructor(
    endpoint: string,
    tenantId: string,
    clientId: string,
    clientSecret: string,
    embeddingDeploymentName: string
  ) {
    this.deploymentName = embeddingDeploymentName;

    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );

    // Get token synchronously in constructor - will refresh in generate method
    this.openaiClient = new OpenAI({
      apiKey: "dummy", // Will be replaced with actual token
      baseURL: `${endpoint}/openai/deployments/${embeddingDeploymentName}`,
      defaultQuery: {
        "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-02-01",
      },
    });

    // Store credential for token refresh
    (this.openaiClient as any)._credential = credential;
  }

  async generate(texts: string[]): Promise<number[][]> {
    // Refresh token before each request
    const credential = (this.openaiClient as any)
      ._credential as ClientSecretCredential;
    const { token } = await credential.getToken(
      "https://cognitiveservices.azure.com/.default"
    );

    // Update the API key with fresh token
    (this.openaiClient as any).apiKey = token;

    const response = await this.openaiClient.embeddings.create({
      input: texts,
      model: this.deploymentName,
    });

    return response.data.map((item) => item.embedding);
  }
}

@singleton()
export class EmbeddingFunctionFactory {
  async get() {
    const apiKey = process.env.OPENAI_API_KEY;

    // If OpenAI API key exists, use default OpenAI embedding function
    if (apiKey) {
      return new OpenAIEmbeddingFunction({
        apiKey: apiKey,
        modelName: "text-embedding-3-small",
      });
    }

    // Otherwise, use Azure OpenAI with client credentials
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const tenantId = process.env.AZURE_TENANT_ID!;
    const clientId = process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.AZURE_CLIENT_SECRET!;
    const embeddingDeploymentName =
      process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME!;

    return new ChromaCustomEmbeddingFunction(
      endpoint,
      tenantId,
      clientId,
      clientSecret,
      embeddingDeploymentName
    );
  }
}
