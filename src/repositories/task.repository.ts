import { Task, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "@db/prisma.client";

export class TaskRepository extends BaseRepository<
  Task,
  Prisma.TaskCreateInput,
  Prisma.TaskUpdateInput,
  Prisma.TaskWhereUniqueInput,
  Prisma.TaskWhereInput
> {
  constructor() {
    super(prisma.task);
  }
}
