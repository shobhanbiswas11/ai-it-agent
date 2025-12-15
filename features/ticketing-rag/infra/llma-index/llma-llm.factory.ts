import {
  ClientSecretCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAI } from "@llamaindex/azure";
import { OpenAI } from "@llamaindex/openai";
import { BaseLLM } from "llamaindex";
import { singleton } from "tsyringe";

@singleton()
export class LLmaLLMFactory {
  private _llm: BaseLLM;

  constructor() {
    const provider = process.env.LLMA_LLM_PROVIDER;
    if (!provider) {
      throw new Error(
        "LLMA_LLM_PROVIDER environment variable is missing. (openai | azure-openai)"
      );
    }

    switch (provider) {
      case "openai":
        this._llm = this.getOpenAiLLM();
        break;
      case "azure-openai":
        this._llm = this.getAzureOpenAiLLM();
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private getOpenAiLLM() {
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is missing.");
    }

    return new OpenAI({
      apiKey: openAIApiKey,
    });
  }

  private getAzureOpenAiLLM() {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (
      !tenantId ||
      !clientId ||
      !clientSecret ||
      !endpoint ||
      !deployment ||
      !apiVersion
    ) {
      throw new Error(
        "One or more required Azure OpenAI environment variables are missing."
      );
    }

    return new AzureOpenAI({
      azureADTokenProvider: getBearerTokenProvider(
        new ClientSecretCredential(tenantId, clientId, clientSecret),
        "https://cognitiveservices.azure.com/.default"
      ),
      endpoint: endpoint,
      deployment: deployment,
      apiVersion: apiVersion,
      apiKey: undefined,
    });
  }

  getLLM() {
    return this._llm;
  }
}
