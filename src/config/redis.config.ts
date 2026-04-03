const isProd = process.env.NODE_ENV === "production";

export const redisConfig = {
  url: (isProd ? process.env.REDIS_URL_PROD : process.env.REDIS_URL_DEV) as string,
  defaultTTL: 60 * 60, // 1 hour in seconds
};

export const pubSubChannels = {
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
} as const;

export type PubSubChannel = typeof pubSubChannels[keyof typeof pubSubChannels];
