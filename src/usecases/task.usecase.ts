import { Task, TaskStatus } from "../generated/prisma/client";
import { TaskRepository } from "@repositories/task.repository";
import { NotFoundError, ForbiddenError } from "@managers/error.manager";
import PubSubManager from "@managers/pubsub.manager";
import CacheService from "@services/cache.service";
import { pubSubChannels } from "@config/redis.config";

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}

class TaskUseCase {
  private taskRepository: TaskRepository;
  private pubSubManager: PubSubManager;
  private cacheService: CacheService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.pubSubManager = PubSubManager.getInstance();
    this.cacheService = new CacheService();
  }

  private cacheKey(userId: string): string {
    return `tasks:${userId}`;
  }

  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const task = await this.taskRepository.create({
      ...input,
      user: { connect: { id: userId } },
    });

    await this.cacheService.del(this.cacheKey(userId));

    this.pubSubManager.publish(pubSubChannels.TASK_CREATED, { userId, task });

    return task;
  }

  async getAllForUser(userId: string): Promise<Task[]> {
    return this.cacheService.remember(
      this.cacheKey(userId),
      3600,
      () => this.taskRepository.findMany({ userId })
    );
  }

  async updateStatus(taskId: string, userId: string, input: UpdateTaskStatusInput): Promise<Task> {
    const task = await this.taskRepository.findOne({ id: taskId });

    if (!task) throw new NotFoundError("Task not found");
    if (task.userId !== userId) throw new ForbiddenError("You do not own this task");

    const updated = await this.taskRepository.update(
      { id: taskId },
      { status: input.status }
    );

    await this.cacheService.del(this.cacheKey(userId));

    this.pubSubManager.publish(pubSubChannels.TASK_UPDATED, { userId, task: updated });

    return updated;
  }
}

export default TaskUseCase;
