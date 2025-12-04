import { config } from "dotenv";
import { join } from "path";
import { createApp } from "./interface/http/app";
config({ path: join(__dirname, "./.env") });

const app = createApp();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
