import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const isRedisConfigured = (): boolean => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
};

export const CACHE_TTL = {
  OPERATIONS: 300,
  USER_DATA: 600,
  EXPENSES: 300,
  PROJECTIONS: 1800,
  CURRENCY_SYMBOL: 3600,
  MARKET_NEWS: 3600,
} as const;

export const CACHE_KEYS = {
  operations: (userId: string) => `operations:${userId}`,
  userData: (userId: string) => `userData:${userId}`,
  expenses: (userId: string) => `expenses:${userId}`,
  teamExpenses: (teamId: string) => `teamExpenses:${teamId}`,
  projections: (userId: string) => `projections:${userId}`,
  currencySymbol: (userId: string) => `currencySymbol:${userId}`,
  marketNews: () => `marketNews`,
} as const;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`[Redis] Error getting cache for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error(`[Redis] Error setting cache for key ${key}:`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[Redis] Error invalidating cache for key ${key}:`, error);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
    }
  } catch (error) {
    console.error(
      `[Redis] Error invalidating cache pattern ${pattern}:`,
      error
    );
  }
}

export { redis };
