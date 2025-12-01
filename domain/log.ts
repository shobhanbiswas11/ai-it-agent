export class Log {
  private _isAnomalous: boolean = false;
  private _anomalyScore?: number;
  private _anomalyReason?: string;

  constructor(private _raw: string) {}

  markAnomalous(anomaly: { score?: number; reason?: string } = {}) {
    this._isAnomalous = true;
    this._anomalyScore = anomaly.score;
    this._anomalyReason = anomaly.reason;
  }

  get raw(): string {
    return this._raw;
  }

  get isAnomalous(): boolean {
    return this._isAnomalous;
  }

  get anomalyScore(): number | undefined {
    return this._anomalyScore;
  }

  get anomalyReason(): string | undefined {
    return this._anomalyReason;
  }
}
