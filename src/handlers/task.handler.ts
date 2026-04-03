import { Request, Response } from "express";
import TaskUseCase from "@usecases/task.usecase";
import { responseManager } from "@managers/index";
import { validateCreateTask, validateUpdateTaskStatus } from "@validation/task.validation";

class TaskHandler {
  private taskUseCase: TaskUseCase;

  constructor() {
    this.taskUseCase = new TaskUseCase();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateCreateTask(req.body);
    if (error) {
      responseManager.validationError(res, error.details.map((d) => d.message));
      return;
    }
    try {
      const task = await this.taskUseCase.create(req.user!.userId, req.body);
      responseManager.success(res, task, "Task created", 201);
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskUseCase.getAllForUser(req.user!.userId);
      responseManager.success(res, tasks, "Tasks retrieved");
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateUpdateTaskStatus(req.body);
    if (error) {
      responseManager.validationError(res, error.details.map((d) => d.message));
      return;
    }
    try {
      const task = await this.taskUseCase.updateStatus(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      responseManager.success(res, task, "Task status updated");
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  };
}

export default TaskHandler;
