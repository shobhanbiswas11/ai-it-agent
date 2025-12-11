import { DomainEvent } from "./domain.event";

export class KbUploadEvent extends DomainEvent {
  type = "KB_UPLOAD_EVENT";
  payload: { kbId: string };

  constructor(kbId: string) {
    super();
    this.payload = {
      kbId,
    };
  }
}
