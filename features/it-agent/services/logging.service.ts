import { singleton } from "tsyringe";

@singleton()
export class LoggingService {
  log(message: string) {
    console.log(`[LoggingService]: ${message}`);
  }
}
