import { describe, expect, it } from "vitest";
import {
  DetectionModelConfig,
  DetectionModelType,
} from "../../domain/value-objects/detection-model-config.vo";

describe("DetectionModelConfig Value Object", () => {
  describe("create", () => {
    it("should create a valid config with defaults", () => {
      const config = DetectionModelConfig.create(
        DetectionModelType.STATISTICAL
      );

      expect(config.modelType).toBe(DetectionModelType.STATISTICAL);
      expect(config.threshold).toBe(0.7);
      expect(config.sensitivity).toBe(0.5);
    });

    it("should create a valid config with custom values", () => {
      const config = DetectionModelConfig.create(
        DetectionModelType.ML_BASED,
        0.8,
        0.6,
        { custom: "param" }
      );

      expect(config.modelType).toBe(DetectionModelType.ML_BASED);
      expect(config.threshold).toBe(0.8);
      expect(config.sensitivity).toBe(0.6);
      expect(config.parameters).toEqual({ custom: "param" });
    });

    it("should throw error for invalid threshold", () => {
      expect(() => {
        DetectionModelConfig.create(DetectionModelType.STATISTICAL, 1.5);
      }).toThrow("Threshold must be between 0 and 1");
    });

    it("should throw error for invalid sensitivity", () => {
      expect(() => {
        DetectionModelConfig.create(DetectionModelType.STATISTICAL, 0.7, -0.1);
      }).toThrow("Sensitivity must be between 0 and 1");
    });
  });

  describe("createLLM", () => {
    it("should create LLM-based config", () => {
      const config = DetectionModelConfig.createLLM(
        "gpt-4",
        "Analyze these logs for anomalies",
        0.75
      );

      expect(config.modelType).toBe(DetectionModelType.LLM_BASED);
      expect(config.llmModel).toBe("gpt-4");
      expect(config.llmPrompt).toBe("Analyze these logs for anomalies");
      expect(config.threshold).toBe(0.75);
    });

    it("should throw error when llmModel is missing for LLM type", () => {
      expect(() => {
        new DetectionModelConfig({
          modelType: DetectionModelType.LLM_BASED,
        });
      }).toThrow("LLM model name is required for LLM-based detection");
    });
  });

  describe("isLLMBased", () => {
    it("should return true for LLM-based model", () => {
      const config = DetectionModelConfig.createLLM("gpt-4");

      expect(config.isLLMBased()).toBe(true);
    });

    it("should return false for non-LLM model", () => {
      const config = DetectionModelConfig.create(
        DetectionModelType.STATISTICAL
      );

      expect(config.isLLMBased()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for equal configs", () => {
      const config1 = DetectionModelConfig.create(
        DetectionModelType.STATISTICAL,
        0.7,
        0.5
      );
      const config2 = DetectionModelConfig.create(
        DetectionModelType.STATISTICAL,
        0.7,
        0.5
      );

      expect(config1.equals(config2)).toBe(true);
    });

    it("should return false for different configs", () => {
      const config1 = DetectionModelConfig.create(
        DetectionModelType.STATISTICAL,
        0.7
      );
      const config2 = DetectionModelConfig.create(
        DetectionModelType.ML_BASED,
        0.7
      );

      expect(config1.equals(config2)).toBe(false);
    });
  });
});
