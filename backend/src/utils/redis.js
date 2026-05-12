const Redis = require("ioredis");

let redis;

try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    console.warn("Redis connection error, falling back to in-memory cache:", err.message);
  });

  redis.connect().catch(() => {
    console.warn("Redis not available, using in-memory cache");
    redis = null;
  });
} catch {
  console.warn("Redis init failed, using in-memory cache");
  redis = null;
}

const memoryCache = new Map();

const getCache = async (key) => {
  if (redis) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      }
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = async (key, value, ttl = 3600) => {
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
      return;
    } catch {
      }
  }
  memoryCache.set(key, { data: value, expiry: Date.now() + ttl * 1000 });
};

const delCache = async (pattern) => {
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(keys);
      return;
    } catch {
      }
  }
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) memoryCache.delete(key);
  }
};

const clearAllCache = async () => {
  if (redis) {
    try {
      await redis.flushall();
      return;
    } catch {
      }
  }
  memoryCache.clear();
};

module.exports = { getCache, setCache, delCache, clearAllCache };
