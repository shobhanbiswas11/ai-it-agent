import { randomUUID } from "crypto";

export type LogSourceConfig = Record<string, any>;

interface Create {
  type: string;
  name: string;
  description?: string;
  config?: LogSourceConfig;
}

interface Init extends Create {
  id: string;
}

export class LogSource {
  constructor(private _init: Init) {}

  get id() {
    return this._init.id;
  }

  get name() {
    return this._init.name;
  }

  get description() {
    return this._init.description;
  }

  get type() {
    return this._init.type;
  }

  get config() {
    return this._init.config;
  }

  static create(create: Create): LogSource {
    return new LogSource({
      id: randomUUID(),
      ...create,
    });
  }
}
