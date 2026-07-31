export type Bindings = {
  DB: D1Database;
  BASE_DOMAIN: string;
  STORAGE_ENDPOINT: string;
  STORAGE_BUCKET: string;
  STORAGE_ACCESS_KEY_ID: string;
  STORAGE_SECRET_ACCESS_KEY: string;
  TRACKER_SALT_SECRET: string;
  AUTH_SECRET: string;
  CONTACT_WA_NUMBER: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  ENVIRONMENT?: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: { session?: import("@/domain/session").SessionPayload };
};
