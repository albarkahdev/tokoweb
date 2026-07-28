import { AwsClient } from "aws4fetch";
import type { StorageBody, StoragePort } from "@/domain/storage";

export type S3Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
};

export function createS3Storage(config: S3Config): StoragePort {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: config.region ?? "auto",
  });

  const objectUrl = (key: string) =>
    `${config.endpoint.replace(/\/$/, "")}/${config.bucket}/${key}`;

  return {
    async put(key: string, body: StorageBody, contentType: string): Promise<void> {
      const response = await client.fetch(objectUrl(key), {
        method: "PUT",
        body,
        headers: { "content-type": contentType },
      });
      if (!response.ok) {
        throw new Error(`Storage put failed for ${key}: ${response.status}`);
      }
    },

    async get(key: string): Promise<Response | null> {
      const response = await client.fetch(objectUrl(key));
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Storage get failed for ${key}: ${response.status}`);
      }
      return response;
    },

    async delete(key: string): Promise<void> {
      const response = await client.fetch(objectUrl(key), { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Storage delete failed for ${key}: ${response.status}`);
      }
    },

    async signedUrl(key: string, expiresInSeconds: number): Promise<string> {
      const url = new URL(objectUrl(key));
      url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
      const signed = await client.sign(new Request(url, { method: "GET" }), {
        aws: { signQuery: true },
      });
      return signed.url;
    },
  };
}
