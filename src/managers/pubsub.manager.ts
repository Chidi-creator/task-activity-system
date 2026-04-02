import Redis from "ioredis";
import { redisConfig, PubSubChannel } from "@config/redis.config";

type MessageHandler<T = unknown> = (data: T) => void;

class PubSubManager {
  private static instance: PubSubManager;
  private pubClient: Redis;
  private subClient: Redis;
  private handlers: Map<string, MessageHandler> = new Map();

  private constructor() {
    this.pubClient = new Redis(redisConfig.url);
    this.subClient = new Redis(redisConfig.url);

    this.pubClient.on("error", (err) => console.error("[pubsub]: pub error —", err.message));
    this.subClient.on("error", (err) => console.error("[pubsub]: sub error —", err.message));

    this.subClient.on("message", (channel: string, message: string) => {
      const handler = this.handlers.get(channel);
      if (handler) {
        try {
          handler(JSON.parse(message));
        } catch (err) {
          console.error(`[pubsub]: Failed to handle message on ${channel}`, err);
        }
      }
    });
  }

  static getInstance(): PubSubManager {
    if (!PubSubManager.instance) {
      PubSubManager.instance = new PubSubManager();
    }
    return PubSubManager.instance;
  }

  publish<T>(channel: PubSubChannel, data: T): void {
    this.pubClient.publish(channel, JSON.stringify(data));
  }

  subscribe<T>(channel: PubSubChannel, handler: MessageHandler<T>): void {
    this.subClient.subscribe(channel);
    this.handlers.set(channel, handler as MessageHandler);
    console.log(`[pubsub]: Subscribed to ${channel}`);
  }

  unsubscribe(channel: PubSubChannel): void {
    this.subClient.unsubscribe(channel);
    this.handlers.delete(channel);
  }
}

export default PubSubManager;
