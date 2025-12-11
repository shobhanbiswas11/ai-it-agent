import { Readable } from "stream";
import { inject, singleton } from "tsyringe";
import { KnowledgeBase } from "../domain/entities/knowledge-base.entity";
import { KbUploadEvent } from "../domain/events/kb-upload.event";
import { FieldMap } from "../dtos/ticket.dto";
import { KbMapper } from "../mappers/kb.mapper";
import { EventBusPort, EventBusPortKey } from "../ports/event-bus.port";
import { KbRepoPort, KbRepoPortKey } from "../ports/kb-repo.port";
import { KbFileService } from "../services/kb-file.service";

interface Props {
  stream: Readable;
  name: string;
  description?: string;
  fieldMap: FieldMap;
}

@singleton()
export class UploadKnowledgeBase {
  constructor(
    private _kbFileService: KbFileService,
    @inject(KbRepoPortKey)
    private _kbRepo: KbRepoPort,
    @inject(EventBusPortKey)
    private _eventBus: EventBusPort
  ) {}

  async execute({ stream, ...props }: Props) {
    const kb = KnowledgeBase.create(props);
    await this._kbRepo.save(kb);
    await this._kbFileService.upload(stream, kb.id);
    await this._eventBus.publish(new KbUploadEvent(kb.id));
    return KbMapper.toDTO(kb);
  }
}
