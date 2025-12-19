# Log Analysis Feature

A Domain-Driven Design (DDD) implementation of a log analysis system that collects logs from various sources (Prometheus, Zabbix) and detects anomalies using pluggable detection models including LLM-based detection.

## Architecture

This feature follows Clean Architecture and DDD principles with clear separation of concerns:

### Domain Layer
- **Entities**: `LogSource`, `LogEntry`, `AnalysisResult`
- **Value Objects**: `TimeRange`, `LogSourceConfig`, `DetectionModelConfig`
- **Aggregates**: `LogAnalysisSession` (aggregate root)
- **Events**: `LogCollectedEvent`, `AnomalyDetectedEvent`, `AnalysisCompletedEvent`

### Application Layer
- **Use Cases**:
  - `RegisterLogSourceUseCase`: Register new log sources
  - `CollectLogsUseCase`: Collect logs from sources
  - `RunAnomalyDetectionUseCase`: Run complete analysis session
  - `ViewAnalysisResultsUseCase`: View results as alerts/reports/dashboards

### Infrastructure Layer
- **Repositories**: In-memory implementations (can be replaced with SQL/NoSQL)
- **Log Collectors**: `PrometheusLogCollector`, `ZabbixLogCollector`
- **Anomaly Detectors**: `LLMAnomalyDetector` (pluggable)
- **Event Bus**: In-memory event bus

### Interface Layer
- **DTOs**: Data transfer objects for API communication
- **Mappers**: Convert between domain entities and DTOs

## Features

✅ Register and manage multiple log sources (Prometheus, Zabbix, Custom)
✅ Pull-based log collection with configurable time ranges
✅ Pluggable anomaly detection models (Statistical, Pattern-based, ML, LLM, Rule-based)
✅ LLM-based anomaly detection for demo purposes
✅ Multiple output formats: Alerts, Reports, Dashboards
✅ Domain events for integration with other systems
✅ Comprehensive unit tests

## Usage

### Setup

```typescript
import { configureContainer, getUseCase } from './container';
import { RegisterLogSourceUseCase } from './use-cases/register-log-source.usecase';

// Configure dependency injection
configureContainer();

// Get use case
const registerLogSource = getUseCase(RegisterLogSourceUseCase);
```

### Register a Log Source

```typescript
import { LogSourceType } from './domain/entities/log-source.entity';

const logSourceDTO = await registerLogSource.execute({
  name: 'Production Prometheus',
  type: LogSourceType.PROMETHEUS,
  endpoint: 'http://prometheus.prod:9090',
  credentials: { apiKey: 'your-api-key' }
});
```

### Run Anomaly Detection

```typescript
import { RunAnomalyDetectionUseCase } from './use-cases/run-anomaly-detection.usecase';
import { DetectionModelType } from './domain/value-objects/detection-model-config.vo';

const runDetection = getUseCase(RunAnomalyDetectionUseCase);

const session = await runDetection.execute({
  sourceId: logSourceDTO.id,
  timeRange: {
    start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    end: new Date().toISOString()
  },
  modelConfig: {
    modelType: DetectionModelType.LLM_BASED,
    threshold: 0.7,
    llmModel: 'gpt-4',
    llmPrompt: 'Analyze these logs and detect anomalies'
  }
});
```

### View Results

```typescript
import { ViewAnalysisResultsUseCase } from './use-cases/view-analysis-results.usecase';

const viewResults = getUseCase(ViewAnalysisResultsUseCase);

// Get dashboard
const dashboard = await viewResults.getDashboard(10);

// Get specific result
const result = await viewResults.getResultById(session.analysisResultId);

// Get report
const report = await viewResults.getReportById(session.analysisResultId);

// Get alerts for a source
const alerts = await viewResults.getAlertsForSource(logSourceDTO.id);
```

## Testing

Run unit tests:

```bash
npm test -- features/log-analysis
```

Run specific test file:

```bash
npm test -- features/log-analysis/__tests__/domain/log-source.entity.test.ts
```

## Extending

### Add a New Log Collector

1. Implement `ILogCollector` interface
2. Register in container

```typescript
import { ILogCollector } from './ports/log-collector.port';

export class CustomLogCollector implements ILogCollector {
  async collect(sourceId: string, timeRange: TimeRange): Promise<LogEntry[]> {
    // Implementation
  }

  async testConnection(sourceId: string): Promise<boolean> {
    // Implementation
  }
}
```

### Add a New Anomaly Detector

1. Implement `IAnomalyDetector` interface
2. Register in container

```typescript
import { IAnomalyDetector } from './ports/anomaly-detector.port';

export class StatisticalAnomalyDetector implements IAnomalyDetector {
  async analyze(logs: LogEntry[], config: DetectionModelConfig): Promise<Anomaly[]> {
    // Implementation
  }

  getModelType(): string {
    return 'STATISTICAL';
  }
}
```

## Domain Events

The system emits domain events that can be subscribed to:

```typescript
import { IEventBus } from './ports/event-bus.port';

const eventBus = container.resolve<IEventBus>('IEventBus');

eventBus.subscribe('AnomalyDetected', async (event) => {
  console.log('Anomaly detected!', event);
  // Send notifications, trigger workflows, etc.
});
```

## Future Enhancements

- [ ] Add persistent storage (SQL/NoSQL repositories)
- [ ] Implement real Prometheus/Zabbix API integrations
- [ ] Add actual LLM integration (OpenAI, Anthropic, etc.)
- [ ] Implement scheduled log collection
- [ ] Add WebSocket support for real-time alerts
- [ ] Create REST API endpoints
- [ ] Add authentication and authorization
- [ ] Implement log retention policies
- [ ] Add metrics and observability
