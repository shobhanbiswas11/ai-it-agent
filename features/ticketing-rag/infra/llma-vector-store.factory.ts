import { AstraDBVectorStore } from "@llamaindex/astra";
import { PineconeVectorStore } from "@llamaindex/pinecone";
import { Settings } from "llamaindex";
import { singleton } from "tsyringe";
import { LLMAEmbeddingFactory } from "./llma-embedding.factory";

@singleton()
export class LLmaVectorStoreFactory {
  constructor(private _llmaEmbeddingFactory: LLMAEmbeddingFactory) {
    Settings.embedModel = this._llmaEmbeddingFactory.getEmbedding();
  }

  private async getAstraStore() {
    const endpoint = process.env.ASTRA_ENDPOINT;
    const token = process.env.ASTRA_TOKEN;
    const collection = process.env.ASTRA_COLLECTION;

    if (!endpoint || !token || !collection) {
      throw new Error(
        "One or more required Astra environment variables are missing. (ASTRA_ENDPOINT, ASTRA_TOKEN, ASTRA_COLLECTION)"
      );
    }

    const store = new AstraDBVectorStore({
      params: {
        endpoint,
        token,
      },
    });

    await store.connect(collection);
    return store;
  }

  private async getPineconeStore() {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !indexName) {
      throw new Error(
        "One or more required Pinecone environment variables are missing. (PINECONE_API_KEY, PINECONE_INDEX_NAME)"
      );
    }

    return new PineconeVectorStore({
      apiKey: apiKey,
      indexName: indexName,
    });
  }

  async getVectorStore() {
    const type = process.env.LLMA_VECTOR_STORE;
    if (!type) {
      throw new Error(
        "LLMA_VECTOR_STORE environment variable is missing. (pinecone | astra)"
      );
    }

    switch (type) {
      case "pinecone":
        return this.getPineconeStore();
      case "astra":
        return this.getAstraStore();
      default:
        throw new Error(`Unsupported vector store type: ${type}`);
    }
  }
}
