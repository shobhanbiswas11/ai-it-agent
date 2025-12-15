import {
  ClientSecretCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAIEmbedding } from "@llamaindex/azure";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { BaseEmbedding } from "llamaindex";
import { singleton } from "tsyringe";

@singleton()
export class LLMAEmbeddingFactory {
  private _embedding: BaseEmbedding;

  constructor() {
    const embeddingModel = process.env.LLMA_EMBEDDING_PROVIDER;
    if (!embeddingModel)
      throw new Error(
        "LLMA_EMBEDDING_PROVIDER is not defined. (openai | azure-openai)"
      );

    switch (embeddingModel) {
      case "openai":
        this._embedding = this.getOpenAIEmbedding();
        break;
      case "azure-openai":
        this._embedding = this.getAzureOpenAIEmbedding();
        break;
      default:
        throw new Error(`Unsupported embedding model: ${embeddingModel}`);
    }
  }

  private getOpenAIEmbedding() {
    const model = process.env.OPENAI_EMBEDDING_MODEL;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!model || !apiKey)
      throw new Error(
        "One or more OpenAI embedding configurations are missing.(OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL)"
      );

    return new OpenAIEmbedding({
      apiKey,
      model,
    });
  }

  private getAzureOpenAIEmbedding() {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (
      !tenantId ||
      !clientId ||
      !clientSecret ||
      !endpoint ||
      !embeddingDeployment ||
      !apiVersion
    ) {
      throw new Error(
        "One or more required Azure OpenAI environment variables are missing.(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_EMBEDDING_DEPLOYMENT, AZURE_OPENAI_API_VERSION)"
      );
    }

    return new AzureOpenAIEmbedding({
      azureADTokenProvider: getBearerTokenProvider(
        new ClientSecretCredential(tenantId, clientId, clientSecret),
        "https://cognitiveservices.azure.com/.default"
      ),
      endpoint: endpoint,
      deployment: embeddingDeployment,
      apiVersion: apiVersion,
      apiKey: undefined,
    });
  }

  getEmbedding(): BaseEmbedding {
    return this._embedding;
  }
}
