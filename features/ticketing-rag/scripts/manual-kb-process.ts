import { getContainer } from "./container";
//
import { BatchKnowledgeBase } from "../use-cases/batch-kb.usecase";

async function exec() {
  const kbId = "6dcbb4f4-6b44-44e8-8b5e-4a0dda59fdf1";
  const batchKbUC = getContainer().resolve(BatchKnowledgeBase);
  await batchKbUC.execute(kbId);
}

exec()
  .then(() => {
    console.log("Knowledge Base processed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error processing Knowledge Base:", err);
    process.exit(1);
  });
