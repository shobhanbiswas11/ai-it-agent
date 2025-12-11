import { inject, singleton } from "tsyringe";
import { KbBatchEvent } from "../domain/events/kb-batch.event";
import { EventBusPort, EventBusPortKey } from "../ports/event-bus.port";
import { KbBatchService } from "../services/kb-batch.service";

@singleton()
export class BatchKnowledgeBase {
  constructor(
    private _kbBatchService: KbBatchService,
    @inject(EventBusPortKey) private _eventBus: EventBusPort
  ) {}

  async execute(kbId: string) {
    await this._kbBatchService.createBatch(kbId);
    await this._eventBus.publish(new KbBatchEvent(kbId));
  }
}
