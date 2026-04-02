import { BaseSubscription } from "./base.subscription";
import PubSubManager from "@managers/pubsub.manager";
import SocketManager from "../socket/socket.manager";
import { pubSubChannels } from "@config/redis.config";
import { Task } from "../generated/prisma/client";

interface TaskPayload {
  userId: string;
  task: Task;
}

class TaskSubscription extends BaseSubscription {
  register(pubSub: PubSubManager, socket: SocketManager): void {
    pubSub.subscribe<TaskPayload>(pubSubChannels.TASK_CREATED, ({ userId, task }) => {
      socket.emitToUser(userId, "task:created", task);
    });

    pubSub.subscribe<TaskPayload>(pubSubChannels.TASK_UPDATED, ({ userId, task }) => {
      socket.emitToUser(userId, "task:updated", task);
    });
  }
}

export default TaskSubscription;
