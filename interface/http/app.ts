import express from "express";
import { treeifyError, ZodError } from "zod";
import { container } from "../../di/container";
import { LogAnalysisController } from "./controllers/log-analysis.controller";
import { ToolController } from "./controllers/tool.controller";

const app = express();
app.use(express.json());

const logAnalysisController = container.resolve(LogAnalysisController);
const toolController = container.resolve(ToolController);

app.use("/api/log-analysis", logAnalysisController.router);
app.use("/api/tools", toolController.router);

// Global error handler middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: treeifyError(err),
      });
    }

    // Handle other errors
    console.error("Unhandled error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message || "An unexpected error occurred",
    });
  }
);

export { app };
