import { createS3Storage } from "@/db/s3-storage";
import type { StoragePort } from "@/domain/storage";
import type { Bindings } from "@/env";

export function storageFromEnv(env: Bindings): StoragePort {
  return createS3Storage({
    endpoint: env.STORAGE_ENDPOINT,
    bucket: env.STORAGE_BUCKET,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  });
}
