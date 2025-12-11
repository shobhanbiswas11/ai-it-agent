import { singleton } from "tsyringe";
import { AgenticKbService } from "../services/agentic-kb.service";

interface Props {
  kbIds: string[];
  query: string;
}

@singleton()
export class QueryKnowledgeBase {
  constructor(private _agenticKbService: AgenticKbService) {}

  async execute(props: Props) {
    return this._agenticKbService.query(props.kbIds, props.query);
  }
}
