import Redis from "ioredis";
import { redisConfig } from "@config/redis.config";

class CacheManager {
  private client: Redis;

  constructor() {
    this.client = new Redis(redisConfig.url);

    this.client.on("connect", () => console.log("[redis]: Connected"));
    this.client.on("error", (err) => console.error("[redis]: Error —", err.message));
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttl: number = redisConfig.defaultTTL): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }
}

export default CacheManager;
