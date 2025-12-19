## Outcome
Users can connect to various log sources (e.g., Zabbix, Prometheus), collect logs on an ad-hoc or scheduled (pull) basis, analyze those logs using a pluggable anomaly detection model (including LLM-based models for demo purposes), and view results as alerts, reports, or dashboards.

## Domain
### Entities
- **LogSource**: Represents an external system or service providing logs (e.g., Zabbix, Prometheus).
- **LogEntry**: A single log record collected from a source.
- **AnalysisResult**: The outcome of analyzing a set of logs (may include anomalies, scores, etc.).

### Value Objects
- **LogSourceConfig**: Configuration details for connecting to a log source (endpoint, credentials, etc.).
- **TimeRange**: Defines the period for log collection or analysis.
- **DetectionModelConfig**: Parameters for the anomaly detection model (type, thresholds, etc.).

### Aggregates
- **LogAnalysisSession**: Aggregate root encapsulating a log collection and analysis cycle, including source, time range, model, and results.

## Use-cases
- Register a new log source (with config)
- Collect logs from a source (ad-hoc or scheduled pull)
- Configure/select anomaly detection model (including LLM)
- Run anomaly detection on collected logs
- View analysis results as:
	- Alerts (real-time or batch)
	- Reports (summaries, downloadable)
	- Dashboards (visualizations)

## Notes / Open Questions
- Only the pull model for log collection will be implemented initially.
- Detection model is pluggable and can include LLMs.
- Results will be available as alerts, reports, and dashboards.