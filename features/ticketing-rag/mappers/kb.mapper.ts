import { KnowledgeBase } from "../domain/entities/knowledge-base.entity";
import { KbDto } from "../dtos/kb.dto";

export class KbMapper {
  static toDTO(kb: KnowledgeBase): KbDto {
    return {
      id: kb.id,
      name: kb.name,
      description: kb.description,
    };
  }
}
