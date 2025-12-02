import serverless from "serverless-http";
import { app } from "../../interface/http/app";

export const handler = serverless(app);
