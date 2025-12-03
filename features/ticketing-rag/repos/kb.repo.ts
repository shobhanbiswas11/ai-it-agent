import { injectable } from "tsyringe";
import { KnowledgeBase } from "../domain/kb.entity";

const kbStorage: Map<string, KnowledgeBase> = new Map();

@injectable()
export class KBRepository {
  async save(kb: KnowledgeBase): Promise<void> {
    kbStorage.set(kb.id, kb);
  }

  async findById(id: string): Promise<KnowledgeBase | null> {
    return kbStorage.get(id) || null;
  }

  async findAll(): Promise<KnowledgeBase[]> {
    return Array.from(kbStorage.values());
  }

  async findByIds(ids: string[]): Promise<KnowledgeBase[]> {
    return ids
      .map((id) => kbStorage.get(id))
      .filter((kb): kb is KnowledgeBase => kb !== undefined);
  }

  async delete(id: string): Promise<void> {
    kbStorage.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return kbStorage.has(id);
  }
}
