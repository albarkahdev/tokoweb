export type RateLimiter = {
  allow(key: string, nowMs: number): boolean;
};

export function createFixedWindowLimiter(
  limit: number,
  windowMs: number,
  maxKeys = 10_000,
): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    allow(key, nowMs) {
      const current = windows.get(key);
      if (!current || nowMs - current.start >= windowMs) {
        if (windows.size >= maxKeys) windows.clear();
        windows.set(key, { start: nowMs, count: 1 });
        return true;
      }
      current.count += 1;
      return current.count <= limit;
    },
  };
}
