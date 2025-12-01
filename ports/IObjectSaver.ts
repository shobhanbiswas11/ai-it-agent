export interface IObjectSaver {
  save(path: string, data: Buffer): Promise<void>;
}
