import { logSourceRegistry } from "./log-source.registry";
import { LogSourceEntityBase, logSourceRepo } from "./log-source.repo";
import {
  FetchLogParams,
  FetchLogsResponse,
  LogSource,
  LogSourceConfig,
  LogSourceConnectionCheckResponse,
} from "./log-source.type";

function getSource(type: string): LogSource {
  const source = logSourceRegistry.get(type);
  if (!source) throw new Error(`Log source type ${type} is not supported.`);
  return source;
}

export const logSourceService = {
  getSupportedLogSources() {
    return logSourceRegistry.entries();
  },
  checkConnection(
    type: string,
    config: LogSourceConfig
  ): Promise<LogSourceConnectionCheckResponse> {
    const source = getSource(type);
    return source.checkConnection(config);
  },

  async fetchLogsAdHoc(
    type: string,
    config: LogSourceConfig,
    params: FetchLogParams
  ): Promise<FetchLogsResponse> {
    const source = getSource(type);
    return source.fetchLogs(config, params);
  },

  async fetchLogs(
    sourceId: string,
    params: FetchLogParams
  ): Promise<FetchLogsResponse> {
    const sourceEntity = await logSourceRepo.getById(sourceId);

    if (!sourceEntity)
      throw new Error(`Log source with ID ${sourceId} not found.`);

    return this.fetchLogsAdHoc(sourceEntity.type, sourceEntity.config, params);
  },

  // CRUD for entities
  create(props: LogSourceEntityBase) {
    return logSourceRepo.create(props);
  },

  update(id: string, props: Partial<LogSourceEntityBase>) {
    return logSourceRepo.update(id, props);
  },

  getById(id: string) {
    return logSourceRepo.getById(id);
  },

  getByOwnerId(ownerId: string) {
    return logSourceRepo.getByOwnerId(ownerId);
  },

  delete(id: string) {
    return logSourceRepo.delete(id);
  },
};
