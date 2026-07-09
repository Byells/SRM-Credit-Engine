function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * 2 ** attempt),
        );
      }
    }
  }
  throw lastError;
}

interface FetchWithCacheOptions {
  retries?: number;
  retryDelayMs?: number;
}

export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  { retries = 2, retryDelayMs = 300 }: FetchWithCacheOptions = {},
): Promise<T> {
  const cached = readCache<T>(cacheKey);
  if (cached !== null) return cached;

  const data = await withRetry(fetcher, retries, retryDelayMs);
  writeCache(cacheKey, data);
  return data;
}
