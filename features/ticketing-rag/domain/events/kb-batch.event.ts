import { DomainEvent } from "./domain.event";

export class KbBatchEvent extends DomainEvent {
  type = "KB_BATCH_EVENT";
  payload: { kbId: string };

  constructor(kbId: string) {
    super();
    this.payload = {
      kbId,
    };
  }
}
