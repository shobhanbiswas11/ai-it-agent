import { randomUUID } from "crypto";

interface Create {
  name: string;
  description?: string;
  fieldMap: Record<string, any>; // This will tell which filed to use during processing {title : heading}
}

interface Init extends Create {
  id: string;
}

export class KnowledgeBase {
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

  get fieldMap() {
    return this._init.fieldMap;
  }

  static create(create: Create) {
    return new KnowledgeBase({
      ...create,
      id: randomUUID(),
    });
  }
}
