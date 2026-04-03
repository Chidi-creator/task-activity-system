import joi from "joi";
import { CreateTaskInput, UpdateTaskStatusInput } from "@usecases/task.usecase";

export const validateCreateTask = (object: CreateTaskInput) => {
  const schema = joi.object({
    title: joi.string().min(1).max(100).required(),
    description: joi.string().max(500).optional(),
  });
  return schema.validate(object, { abortEarly: false });
};

export const validateUpdateTaskStatus = (object: UpdateTaskStatusInput) => {
  const schema = joi.object({
    status: joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED").required(),
  });
  return schema.validate(object, { abortEarly: false });
};
