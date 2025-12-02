import { config } from "dotenv";
import { join } from "path";
import { app } from "./interface/http/app";
config({ path: join(__dirname, "./.env") });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
