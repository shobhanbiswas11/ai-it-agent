import "reflect-metadata";
import { container } from "tsyringe";
import { registerITAgentModule } from "../features/it-agent/it-agent.module";
import { registerLogAnalysisModule } from "../features/log-analysis/log-analysis.module";
import { registerTicketingRAGModule } from "../features/ticketing-rag/ticketing-rag.module";
import { registerHttpModule } from "../interface/http/http.module";

registerLogAnalysisModule(container);
registerITAgentModule(container);
registerTicketingRAGModule();
registerHttpModule(container);

export { container };
