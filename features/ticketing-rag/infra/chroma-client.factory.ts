import { ChromaClient, CloudClient } from "chromadb";
import { singleton } from "tsyringe";

@singleton()
export class ChromaClientFactory {
  create(): ChromaClient {
    const useCloud = process.env.CHROMA_CLOUD === "true";

    if (useCloud) {
      // Use Chroma Cloud
      const apiKey = process.env.CHROMA_CLOUD_API_KEY!;
      const tenant = process.env.CHROMA_CLOUD_TENANT!;
      const database = process.env.CHROMA_CLOUD_DATABASE || "default";

      return new CloudClient({
        apiKey,
        tenant,
        database,
      });
    }

    // Use local Chroma instance
    const path = process.env.CHROMA_SERVER_URL || "http://localhost:8000";

    return new ChromaClient({
      path,
    });
  }
}
