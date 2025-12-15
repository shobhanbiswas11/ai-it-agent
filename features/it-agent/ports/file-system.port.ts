export interface FileSystemPort {
  readDirectory(path: string): Promise<string[]>; // ['cat.png', 'dog.png', 'photos']
  isDirectory(path: string): Promise<boolean>;
  removeDirectory(path: string): Promise<void>;
}

export const FileSystemPortKeys = {
  local: Symbol("LocalFileSystem"),
  s3: Symbol("S3FileSystem"),
};
