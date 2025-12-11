import { getContainer } from "./container";
//
import { QueryKnowledgeBase } from "../use-cases/query-kb.usecase";

async function exec() {
  const uc = getContainer().resolve(QueryKnowledgeBase);
  const res = await uc.execute({
    kbIds: ["6dcbb4f4-6b44-44e8-8b5e-4a0dda59fdf1"],
    query: "Is there any vpn related ticket?",
  });

  return res;
}

exec()
  .then((data) => {
    console.log(data);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error Querying KB", err);
    process.exit(1);
  });
