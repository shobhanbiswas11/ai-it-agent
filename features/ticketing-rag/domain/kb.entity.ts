import { randomUUID } from "crypto";

export enum KnowledgeBaseStatus {
  CREATING = "creating",
  ACTIVE = "active",
  FAILED = "failed",
  DELETED = "deleted",
}

interface Init {
  id?: string;
  name: string;
  description?: string;
  status?: KnowledgeBaseStatus;
  ticketCount?: number;
  vectorStorePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class KnowledgeBase {
  private _id: string;
  private _status: KnowledgeBaseStatus;
  private _ticketCount: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(private _init: Init) {
    this._id = _init.id || randomUUID();
    this._status = _init.status || KnowledgeBaseStatus.CREATING;
    this._ticketCount = _init.ticketCount || 0;
    this._createdAt = _init.createdAt || new Date();
    this._updatedAt = _init.updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._init.name;
  }

  get description(): string | undefined {
    return this._init.description;
  }

  get status(): KnowledgeBaseStatus {
    return this._status;
  }

  get ticketCount(): number {
    return this._ticketCount;
  }

  get vectorStorePath(): string | undefined {
    return this._init.vectorStorePath;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get metadata(): Record<string, any> | undefined {
    return this._init.metadata;
  }

  markAsActive(ticketCount: number, vectorStorePath: string): void {
    this._status = KnowledgeBaseStatus.ACTIVE;
    this._ticketCount = ticketCount;
    this._init.vectorStorePath = vectorStorePath;
    this._updatedAt = new Date();
  }

  markAsFailed(): void {
    this._status = KnowledgeBaseStatus.FAILED;
    this._updatedAt = new Date();
  }

  markAsDeleted(): void {
    this._status = KnowledgeBaseStatus.DELETED;
    this._updatedAt = new Date();
  }

  updateTicketCount(count: number): void {
    this._ticketCount = count;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      name: this._init.name,
      description: this._init.description,
      status: this._status,
      ticketCount: this._ticketCount,
      vectorStorePath: this._init.vectorStorePath,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._init.metadata,
    };
  }
}
