import { randomUUID } from "crypto";

interface Init {
  id?: string;
  text: string;
  metadata?: Record<string, any>;
  vector?: number[];
}

export class Ticket {
  private _id: string;

  constructor(private init: Init) {
    this._id = init.id || randomUUID();
  }

  get id(): string {
    return this._id;
  }

  get text(): string {
    return this.init.text;
  }

  get metadata(): Record<string, any> | undefined {
    return this.init.metadata;
  }

  get vector(): number[] | undefined {
    return this.init.vector;
  }
}
