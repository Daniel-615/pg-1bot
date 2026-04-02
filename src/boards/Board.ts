export interface Board<T = any> {
  type: string;
  getGenerator(): T;
  registerBlocks?(): void;
}
