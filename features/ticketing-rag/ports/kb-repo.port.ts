import { KnowledgeBase } from "../domain/entities/knowledge-base.entity";

export interface KbRepoPort {
  save(kb: KnowledgeBase): Promise<void>;
  findById(kbId: string): Promise<KnowledgeBase | null>;
}

export const KbRepoPortKey = Symbol("KbRepoPort");
