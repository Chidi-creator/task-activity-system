import { User, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import prisma from "@db/prisma.client";

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput
> {
  constructor() {
    super(prisma.user);
  }
}
