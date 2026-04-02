import { Socket } from "socket.io";
import { BaseEvents } from "../base.events";
import SocketManager from "../socket.manager";
import TaskUseCase, { CreateTaskInput, UpdateTaskStatusInput } from "@usecases/task.usecase";
import { TaskStatus } from "../../generated/prisma/client";

class TaskEvents extends BaseEvents {
  private taskUseCase: TaskUseCase;

  constructor() {
    super();
    this.taskUseCase = new TaskUseCase();
  }

  registerEvents(manager: SocketManager, socket: Socket): void {
    const userId = socket.data.user.userId;

    socket.on("task:create", async (data: CreateTaskInput, ack) => {
      try {
        await this.taskUseCase.create(userId, data);
        if (ack) ack({ success: true });
      } catch (error) {
        if (ack) ack({ success: false, message: (error as Error).message });
      }
    });

    socket.on("task:get-all", async (ack) => {
      try {
        const tasks = await this.taskUseCase.getAllForUser(userId);
        if (ack) ack({ success: true, data: tasks });
      } catch (error) {
        if (ack) ack({ success: false, message: (error as Error).message });
      }
    });

    socket.on("task:update-status", async (data: { taskId: string; status: TaskStatus }, ack) => {
      try {
        await this.taskUseCase.updateStatus(data.taskId, userId, { status: data.status });
        if (ack) ack({ success: true });
      } catch (error) {
        if (ack) ack({ success: false, message: (error as Error).message });
      }
    });
  }
}

export default TaskEvents;
