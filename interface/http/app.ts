import express from "express";
import { treeifyError, ZodError } from "zod";
import { container } from "../../di/container";
import { KnowledgeBaseController } from "./controllers/kb.controller";
import { LogAnalysisController } from "./controllers/log-analysis.controller";
import { ToolController } from "./controllers/tool.controller";

const app = express();
app.use(express.json());

const logAnalysisController = container.resolve(LogAnalysisController);
const toolController = container.resolve(ToolController);
const kbController = new KnowledgeBaseController();

// Knowledge Base routes
app.use("/api/kb", kbController.router);

app.post("/test-log-source-connection", async (req, res) => {
  const result = await logAnalysisController.testLogSourceConnection(req.body);
  return res.status(200).json(result);
});

app.post("/test-log-anomaly-detection", async (req, res) => {
  const result = await logAnalysisController.testLogAnomalyDetection(req.body);
  return res.status(200).json(result);
});

app.post("/trigger-tool", async (req, res) => {
  const result = await toolController.triggerTool(req.body);
  return res.status(200).json(result || { message: "Tool triggered" });
});

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
