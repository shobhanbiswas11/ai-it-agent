import fs from "fs";
import { Ticket } from "../../domain/entities/ticket.entity";
import { SqlTicketRepoAdapter } from "../sql-ticket-repo.adapter";

describe("SqlTicketRepoAdapter", () => {
  let repo: SqlTicketRepoAdapter;
  const testDbPath = "./data/test-tickets.db";

  beforeEach(() => {
    // Clean up test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    repo = new SqlTicketRepoAdapter(testDbPath);
  });

  afterEach(() => {
    repo.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe("batchWrite", () => {
    it("should save tickets to database", async () => {
      const tickets = [
        Ticket.create({
          kbId: "kb-1",
          title: "Test Ticket 1",
          description: "Description 1",
          priority: "high",
        }),
        Ticket.create({
          kbId: "kb-1",
          title: "Test Ticket 2",
          description: "Description 2",
          priority: "low",
        }),
      ];

      await repo.batchWrite(tickets);

      const results = await repo.query({ kbId: "kb-1" });
      expect(results).toHaveLength(2);
      expect(results[0].title).toBe("Test Ticket 1");
      expect(results[1].title).toBe("Test Ticket 2");
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      const tickets = [
        Ticket.create({
          kbId: "kb-1",
          title: "Ticket 1",
          priority: "high",
          status: "open",
        }),
        Ticket.create({
          kbId: "kb-1",
          title: "Ticket 2",
          priority: "low",
          status: "closed",
        }),
        Ticket.create({
          kbId: "kb-2",
          title: "Ticket 3",
          priority: "high",
          status: "open",
        }),
      ];

      await repo.batchWrite(tickets);
    });

    it("should filter by kbId", async () => {
      const results = await repo.query({ kbId: "kb-1" });
      expect(results).toHaveLength(2);
    });

    it("should filter by status", async () => {
      const results = await repo.query({ status: "open" });
      expect(results).toHaveLength(2);
    });

    it("should filter by priority", async () => {
      const results = await repo.query({ priority: "high" });
      expect(results).toHaveLength(2);
    });

    it("should combine filters", async () => {
      const results = await repo.query({
        kbId: "kb-1",
        status: "open",
        priority: "high",
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Ticket 1");
    });
  });

  describe("semanticQuery", () => {
    it("should find tickets by semantic similarity", async () => {
      const tickets = [
        Ticket.create({
          kbId: "kb-1",
          title: "Email server not working",
          description: "Cannot send emails from Outlook",
        }),
        Ticket.create({
          kbId: "kb-1",
          title: "Printer issue",
          description: "Printer is jammed",
        }),
      ];

      await repo.batchWrite(tickets);

      const results = await repo.semanticQuery({
        text: "email problem",
        topK: 5,
      });

      expect(results.length).toBeGreaterThan(0);
      // The email-related ticket should be ranked higher
      expect(results[0].title).toContain("Email");
    });
  });
});
