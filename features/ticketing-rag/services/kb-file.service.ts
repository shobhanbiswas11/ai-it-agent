import { randomUUID } from "crypto";
import { Readable } from "stream";
import { inject, injectable } from "tsyringe";
import { FileSystemPort, FileSystemPortKey } from "../ports/file-system.port";

@injectable()
export class KbFileService {
  private BASE_PATH = "";
  private UPLOADS_PATH = "uploads";

  constructor(
    @inject(FileSystemPortKey)
    private _fileSystem: FileSystemPort
  ) {}

  upload(stream: Readable, kbId: string) {
    const key = this.getUploadFilePath(kbId);
    return this._fileSystem.writeFromStream(key, stream);
  }

  listUploads(kbId: string) {
    return this._fileSystem.list(this.getUploadPath(kbId));
  }

  private getUploadFilePath(kbId: string) {
    return this.buildPath(this.getUploadPath(kbId), randomUUID());
  }

  private getUploadPath(kbId: string) {
    return this.buildPath(this.BASE_PATH, kbId, this.UPLOADS_PATH);
  }

  private buildPath(...segments: string[]) {
    return segments.filter((segment) => Boolean(segment)).join("/");
  }
}
