export interface IFileSystem {
  readDirectory(path: string): Promise<string[]>; // ['cat.png', 'dog.png', 'photos']
  isDirectory(path: string): Promise<boolean>;
  removeDirectory(path: string): Promise<void>;
}
