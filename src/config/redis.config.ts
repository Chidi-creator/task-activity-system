export const redisConfig = {
  url: process.env.REDIS_URL as string,
  defaultTTL: 60 * 60, // 1 hour in seconds
};
