import {
  ClientSecretCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAI } from "@llamaindex/azure";
import { OpenAI } from "@llamaindex/openai";
import { LLM } from "llamaindex";
import { singleton } from "tsyringe";

@singleton()
export class LLmaLLMFactory {
  getLLM(): LLM {
    const llmModel = process.env.LLMA_LLM_MODEL || "openai";

    if (llmModel === "azure-openai") {
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

    if (llmModel === "openai") {
      const openAIApiKey = process.env.OPENAI_API_KEY;
      if (!openAIApiKey) {
        throw new Error("OPENAI_API_KEY environment variable is missing.");
      }

      return new OpenAI({
        apiKey: openAIApiKey,
      });
    }

    throw new Error(`Unsupported LLM model: ${llmModel}`);
  }
}
