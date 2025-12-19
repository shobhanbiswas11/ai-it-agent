import { describe, expect, it } from "vitest";
import { TimeRange } from "../../domain/value-objects/time-range.vo";

describe("TimeRange Value Object", () => {
  describe("create", () => {
    it("should create a valid time range", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T01:00:00Z");

      const timeRange = TimeRange.create(start, end);

      expect(timeRange.start).toEqual(start);
      expect(timeRange.end).toEqual(end);
    });

    it("should throw error when start is after end", () => {
      const start = new Date("2024-01-01T01:00:00Z");
      const end = new Date("2024-01-01T00:00:00Z");

      expect(() => {
        TimeRange.create(start, end);
      }).toThrow("Start time must be before end time");
    });

    it("should throw error when start equals end", () => {
      const date = new Date("2024-01-01T00:00:00Z");

      expect(() => {
        TimeRange.create(date, date);
      }).toThrow("Start time must be before end time");
    });
  });

  describe("duration calculations", () => {
    it("should calculate duration in milliseconds", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T01:00:00Z");
      const timeRange = TimeRange.create(start, end);

      expect(timeRange.durationMs).toBe(3600000); // 1 hour in ms
    });

    it("should calculate duration in seconds", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T01:00:00Z");
      const timeRange = TimeRange.create(start, end);

      expect(timeRange.durationSeconds).toBe(3600); // 1 hour in seconds
    });

    it("should calculate duration in minutes", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T01:30:00Z");
      const timeRange = TimeRange.create(start, end);

      expect(timeRange.durationMinutes).toBe(90);
    });

    it("should calculate duration in hours", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T03:00:00Z");
      const timeRange = TimeRange.create(start, end);

      expect(timeRange.durationHours).toBe(3);
    });
  });

  describe("contains", () => {
    it("should return true for date within range", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T02:00:00Z");
      const timeRange = TimeRange.create(start, end);

      const date = new Date("2024-01-01T01:00:00Z");

      expect(timeRange.contains(date)).toBe(true);
    });

    it("should return false for date before range", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T02:00:00Z");
      const timeRange = TimeRange.create(start, end);

      const date = new Date("2023-12-31T23:00:00Z");

      expect(timeRange.contains(date)).toBe(false);
    });

    it("should return false for date after range", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T02:00:00Z");
      const timeRange = TimeRange.create(start, end);

      const date = new Date("2024-01-01T03:00:00Z");

      expect(timeRange.contains(date)).toBe(false);
    });
  });

  describe("overlaps", () => {
    it("should return true for overlapping ranges", () => {
      const range1 = TimeRange.create(
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-01T02:00:00Z")
      );
      const range2 = TimeRange.create(
        new Date("2024-01-01T01:00:00Z"),
        new Date("2024-01-01T03:00:00Z")
      );

      expect(range1.overlaps(range2)).toBe(true);
    });

    it("should return false for non-overlapping ranges", () => {
      const range1 = TimeRange.create(
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-01T01:00:00Z")
      );
      const range2 = TimeRange.create(
        new Date("2024-01-01T02:00:00Z"),
        new Date("2024-01-01T03:00:00Z")
      );

      expect(range1.overlaps(range2)).toBe(false);
    });
  });

  describe("static factory methods", () => {
    it("should create lastHour range", () => {
      const range = TimeRange.lastHour();

      expect(range.durationHours).toBe(1);
      expect(range.end.getTime()).toBeCloseTo(Date.now(), -2);
    });

    it("should create lastDay range", () => {
      const range = TimeRange.lastDay();

      expect(range.durationHours).toBe(24);
    });

    it("should create lastWeek range", () => {
      const range = TimeRange.lastWeek();

      expect(range.durationHours).toBe(168); // 7 * 24
    });

    it("should create range from duration", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const range = TimeRange.fromDuration(start, 3600000); // 1 hour

      expect(range.durationHours).toBe(1);
      expect(range.start).toEqual(start);
    });
  });

  describe("equals", () => {
    it("should return true for equal ranges", () => {
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-01T01:00:00Z");
      const range1 = TimeRange.create(start, end);
      const range2 = TimeRange.create(start, end);

      expect(range1.equals(range2)).toBe(true);
    });

    it("should return false for different ranges", () => {
      const range1 = TimeRange.create(
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-01T01:00:00Z")
      );
      const range2 = TimeRange.create(
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-01T02:00:00Z")
      );

      expect(range1.equals(range2)).toBe(false);
    });
  });
});
