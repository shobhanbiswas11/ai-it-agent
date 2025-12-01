import { ILogSourceConnectionChecker } from "../ports/ILogSourceConnectionChecker";

export class CheckLogSourceConnection {
  constructor(private _connectionChecker: ILogSourceConnectionChecker) {}
  execute() {
    return this._connectionChecker.checkConnection();
  }
}
