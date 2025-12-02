import serverless from "serverless-http";
import { app } from "../../io/http/app";

export const handler = serverless(app);
