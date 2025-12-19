import { injectable } from "tsyringe";

export enum DetectionModelType {
  STATISTICAL = "STATISTICAL",
  PATTERN_BASED = "PATTERN_BASED",
  ML_BASED = "ML_BASED",
  LLM_BASED = "LLM_BASED",
  RULE_BASED = "RULE_BASED",
}

export interface DetectionModelConfigProps {
  modelType: DetectionModelType;
  threshold?: number;
  sensitivity?: number;
  parameters?: Record<string, any>;
  modelPath?: string;
  llmModel?: string;
  llmPrompt?: string;
}

@injectable()
export class DetectionModelConfig {
  private props: DetectionModelConfigProps;

  constructor(props: DetectionModelConfigProps) {
    this.props = {
      threshold: 0.7,
      sensitivity: 0.5,
      ...props,
    };
    this.validate();
  }

  private validate(): void {
    if (!this.props.modelType) {
      throw new Error("Model type is required");
    }
    if (
      this.props.threshold !== undefined &&
      (this.props.threshold < 0 || this.props.threshold > 1)
    ) {
      throw new Error("Threshold must be between 0 and 1");
    }
    if (
      this.props.sensitivity !== undefined &&
      (this.props.sensitivity < 0 || this.props.sensitivity > 1)
    ) {
      throw new Error("Sensitivity must be between 0 and 1");
    }
    if (
      this.props.modelType === DetectionModelType.LLM_BASED &&
      !this.props.llmModel
    ) {
      throw new Error("LLM model name is required for LLM-based detection");
    }
  }

  get modelType(): DetectionModelType {
    return this.props.modelType;
  }

  get threshold(): number | undefined {
    return this.props.threshold;
  }

  get sensitivity(): number | undefined {
    return this.props.sensitivity;
  }

  get parameters(): Record<string, any> | undefined {
    return this.props.parameters;
  }

  get modelPath(): string | undefined {
    return this.props.modelPath;
  }

  get llmModel(): string | undefined {
    return this.props.llmModel;
  }

  get llmPrompt(): string | undefined {
    return this.props.llmPrompt;
  }

  isLLMBased(): boolean {
    return this.props.modelType === DetectionModelType.LLM_BASED;
  }

  equals(other: DetectionModelConfig): boolean {
    return (
      this.props.modelType === other.props.modelType &&
      this.props.threshold === other.props.threshold &&
      this.props.sensitivity === other.props.sensitivity
    );
  }

  toJSON(): DetectionModelConfigProps {
    return { ...this.props };
  }

  static create(
    modelType: DetectionModelType,
    threshold: number = 0.7,
    sensitivity: number = 0.5,
    parameters?: Record<string, any>
  ): DetectionModelConfig {
    return new DetectionModelConfig({
      modelType,
      threshold,
      sensitivity,
      parameters,
    });
  }

  static createLLM(
    llmModel: string,
    llmPrompt?: string,
    threshold?: number,
    parameters?: Record<string, any>
  ): DetectionModelConfig {
    return new DetectionModelConfig({
      modelType: DetectionModelType.LLM_BASED,
      llmModel,
      llmPrompt,
      threshold,
      parameters,
    });
  }
}
