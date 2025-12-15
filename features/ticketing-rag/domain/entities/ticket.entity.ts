interface Create {
  kbId: string;
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  status?: string;
  createdAt?: Date;
  metadata?: Record<string, any>;
}

interface Init extends Create {
  id: string;
}

export class Ticket {
  constructor(private _init: Init) {}

  get id() {
    return this._init.id;
  }
  get kbId() {
    return this._init.kbId;
  }
  get title() {
    return this._init.title;
  }
  get description() {
    return this._init.description;
  }
  get priority() {
    return this._init.priority;
  }
  get category() {
    return this._init.category;
  }
  get status() {
    return this._init.status;
  }
  get createdAt() {
    return this._init.createdAt;
  }
  get metadata() {
    return this._init.metadata;
  }

  get text() {
    return `${this.title}\n${this.description ?? ""}`.trim();
  }

  static create(props: Create): Ticket {
    return new Ticket({
      id: crypto.randomUUID(),
      ...props,
    });
  }

  static fromData(init: Init): Ticket {
    return new Ticket(init);
  }
}
