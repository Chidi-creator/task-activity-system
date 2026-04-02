import CacheManager from "@managers/cache.manager";

class CacheService {
  private manager: CacheManager;

  constructor() {
    this.manager = new CacheManager();
  }

  async get<T>(key: string): Promise<T | null> {
    return this.manager.get<T>(key);
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    return this.manager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    return this.manager.del(key);
  }

  async remember<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.manager.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.manager.set(key, fresh, ttl);
    return fresh;
  }
}

export default CacheService;
