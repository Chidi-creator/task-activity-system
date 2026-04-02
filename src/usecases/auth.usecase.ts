import bcrypt from "bcrypt";
import { UserRepository } from "@repositories/user.repository";
import { ConflictError, UnauthorizedError } from "@managers/error.manager";
import { User } from "../generated/prisma/client";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

class AuthUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(input: RegisterInput): Promise<Omit<User, "password">> {
    const existing = await this.userRepository.findFirst({ email: input.email });

    if (existing) {
      throw new ConflictError("Email is already in use");
    }

    const hashed = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      ...input,
      password: hashed,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async login(input: LoginInput): Promise<Omit<User, "password">> {
    const user = await this.userRepository.findFirst({ email: input.email });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);

    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}

export default AuthUseCase;
