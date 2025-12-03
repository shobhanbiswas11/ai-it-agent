import { Request, Response, Router } from "express";
import multer from "multer";
import { container } from "tsyringe";
import { createKBDtoSchema } from "../../../features/ticketing-rag/dtos/kb.dto";
import { queryKBDtoSchema } from "../../../features/ticketing-rag/dtos/query-kb.dto";
import { KBRepository } from "../../../features/ticketing-rag/repos/kb.repo";
import { CreateKnowledgeBase } from "../../../features/ticketing-rag/use-cases/create-kb.usecase";
import { QueryKnowledgeBase } from "../../../features/ticketing-rag/use-cases/query-kb.usecase";

const upload = multer({ storage: multer.memoryStorage() });

export class KnowledgeBaseController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Create KB from CSV upload
    this.router.post("/", upload.single("file"), this.createKB.bind(this));

    // Query KBs (hybrid RAG)
    this.router.post("/query", this.queryKB.bind(this));

    // List all KBs
    this.router.get("/", this.listKBs.bind(this));

    // Get KB by ID
    this.router.get("/:id", this.getKB.bind(this));
  }

  async createKB(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const dto = createKBDtoSchema.parse({
        name: req.body.name,
        description: req.body.description,
        fileBuffer: req.file.buffer,
      });

      const useCase = container.resolve(CreateKnowledgeBase);
      const result = await useCase.execute(dto);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Create KB error:", error);
      return res.status(500).json({
        error: error.message || "Failed to create knowledge base",
      });
    }
  }

  async queryKB(req: Request, res: Response) {
    try {
      const dto = queryKBDtoSchema.parse(req.body);

      const useCase = container.resolve(QueryKnowledgeBase);
      const result = await useCase.execute(dto);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Query KB error:", error);
      return res.status(500).json({
        error: error.message || "Failed to query knowledge base",
      });
    }
  }

  async listKBs(req: Request, res: Response) {
    try {
      const repo = container.resolve(KBRepository);
      const kbs = await repo.findAll();

      return res.status(200).json({
        success: true,
        data: kbs.map((kb) => kb.toJSON()),
      });
    } catch (error: any) {
      console.error("List KBs error:", error);
      return res.status(500).json({
        error: error.message || "Failed to list knowledge bases",
      });
    }
  }

  async getKB(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = container.resolve(KBRepository);
      const kb = await repo.findById(id);

      if (!kb) {
        return res.status(404).json({
          error: "Knowledge base not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: kb.toJSON(),
      });
    } catch (error: any) {
      console.error("Get KB error:", error);
      return res.status(500).json({
        error: error.message || "Failed to get knowledge base",
      });
    }
  }
}
