import fs from "fs";
import path from "path";

interface NewsItem {
  title: string;
  summary: string;
  source?: string;
  url?: string;
}

interface CachedNews {
  news: NewsItem[];
  region: string;
  lastUpdated: string;
  nextUpdate: string;
}

function getCacheDirectory(): string {
  const isLambda =
    process.cwd().includes("/var/task") ||
    process.cwd().includes("/var/runtime");
  const isVercel = process.env.VERCEL === "1";
  const isNetlify = process.env.NETLIFY === "true";

  if (
    isLambda ||
    isVercel ||
    isNetlify ||
    process.env.NODE_ENV === "production"
  ) {
    return "/tmp";
  }

  return path.join(process.cwd(), "cache");
}

const CACHE_DIR = getCacheDirectory();
const NEWS_CACHE_FILE = path.join(CACHE_DIR, "market-news.json");

let inMemoryCache: CachedNews | null = null;
let lastMemoryCacheTime = 0;
const MEMORY_CACHE_TTL = 3 * 60 * 60 * 1000;

function ensureCacheDir() {
  try {
    if (CACHE_DIR === "/tmp") {
      return;
    }

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
}

function isUpdateTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 7 && hour <= 22; // 7am a 10pm
}

function getNextUpdateTime(): Date {
  const now = new Date();
  const currentHour = now.getHours();

  const updateHours = [7, 10, 13, 16, 19, 22];

  for (const hour of updateHours) {
    if (hour > currentHour) {
      const nextUpdate = new Date();
      nextUpdate.setHours(hour, 0, 0, 0);
      return nextUpdate;
    }
  }

  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 1);
  nextUpdate.setHours(7, 0, 0, 0);
  return nextUpdate;
}

function getMemoryCache(region: string): CachedNews | null {
  if (!inMemoryCache) return null;

  const now = Date.now();
  if (now - lastMemoryCacheTime > MEMORY_CACHE_TTL) {
    inMemoryCache = null;
    return null;
  }

  if (inMemoryCache.region !== region) {
    return null;
  }

  return inMemoryCache;
}

function setMemoryCache(news: NewsItem[], region: string): void {
  inMemoryCache = {
    news,
    region,
    lastUpdated: new Date().toISOString(),
    nextUpdate: getNextUpdateTime().toISOString(),
  };
  lastMemoryCacheTime = Date.now();
}

export function getCachedNews(region: string = "Argentina"): CachedNews | null {
  if (process.env.NODE_ENV === "production") {
    return getMemoryCache(region);
  }

  try {
    ensureCacheDir();

    if (fs.existsSync(NEWS_CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(NEWS_CACHE_FILE, "utf8"));

      if (cacheData.region === region) {
        return cacheData;
      }
    }
  } catch (error) {
    console.error("Error reading filesystem cache:", error);
  }

  return getMemoryCache(region);
}

export function shouldUpdateCache(region: string = "Argentina"): boolean {
  const cached = getCachedNews(region);

  if (!cached) {
    return isUpdateTime(); // Solo actualizar si estamos en horario
  }

  const now = new Date();
  const nextUpdate = new Date(cached.nextUpdate);

  return now >= nextUpdate && isUpdateTime();
}

export function setCachedNews(
  news: NewsItem[],
  region: string = "Argentina"
): void {
  setMemoryCache(news, region);

  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    ensureCacheDir();

    const cacheData: CachedNews = {
      news,
      region,
      lastUpdated: new Date().toISOString(),
      nextUpdate: getNextUpdateTime().toISOString(),
    };

    fs.writeFileSync(NEWS_CACHE_FILE, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error("Error writing filesystem cache:", error);
  }
}

export function getCacheStatus(region: string = "Argentina") {
  const cached = getCachedNews(region);

  if (!cached) {
    return {
      hasCache: false,
      shouldUpdate: isUpdateTime(),
      isUpdateTime: isUpdateTime(),
      nextUpdate: null,
      cacheType:
        process.env.NODE_ENV === "production"
          ? "memory-only"
          : "filesystem+memory",
    };
  }

  return {
    hasCache: true,
    lastUpdated: cached.lastUpdated,
    nextUpdate: cached.nextUpdate,
    shouldUpdate: shouldUpdateCache(region),
    isUpdateTime: isUpdateTime(),
    cacheType:
      process.env.NODE_ENV === "production"
        ? "memory-only"
        : "filesystem+memory",
  };
}
