export type StorageBody = ReadableStream | ArrayBuffer | Uint8Array;

export interface StoragePort {
  put(key: string, body: StorageBody, contentType: string): Promise<void>;
  get(key: string): Promise<Response | null>;
  delete(key: string): Promise<void>;
  signedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
