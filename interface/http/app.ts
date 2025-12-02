import express from "express";
import "reflect-metadata";
import { treeifyError, ZodError } from "zod";
import { LogAnalysisController } from "./controllers//logAnalysisController";

const app = express();
app.use(express.json());

const logAnalysisController = new LogAnalysisController();

app.post("/test-log-source-connection", async (req, res) => {
  const result = await logAnalysisController.testLogSourceConnection(req.body);
  return res.status(200).json(result);
});

app.post("/test-log-anomaly-detection", async (req, res) => {
  const result = await logAnalysisController.testLogAnomalyDetection(req.body);
  return res.status(200).json(result);
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
