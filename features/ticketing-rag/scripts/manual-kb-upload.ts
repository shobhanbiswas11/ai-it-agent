import { getContainer } from "./container";
//
import { createReadStream } from "fs";
import { resolve } from "path";
import { Readable } from "stream";
import { UploadKnowledgeBase } from "../use-cases/upload-kb.usecase";

async function exec() {
  const path = resolve(process.cwd(), "tmp/tickets.csv");
  const uploadKbUC = getContainer().resolve(UploadKnowledgeBase);
  return uploadKbUC.execute({
    stream: Readable.from(createReadStream(path)),
    name: "Test KB",
    description: "KB for testing ticket uploads",
    fieldMap: {
      title: "title",
      description: "description",
    },
  });
}

exec()
  .then((d) => {
    console.log(d);
    console.log("Knowledge Base uploaded successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error uploading Knowledge Base:", err);
    process.exit(1);
  });
