import { Request, Response } from "express";
import authUseCase from "@usecases/auth.usecase";
import authService from "@services/auth.service";
import { responseManager } from "@managers/index";

class AuthHandler {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await authUseCase.register(req.body);
      authService.setSessionCookie(res, { userId: user.id, email: user.email });
      responseManager.success(res, user, "Account created successfully", 201);
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const user = await authUseCase.login(req.body);
      authService.setSessionCookie(res, { userId: user.id, email: user.email });
      responseManager.success(res, user, "Login successful");
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    authService.clearSessionCookie(res);
    responseManager.success(res, {}, "Logged out successfully");
  }
}

export default new AuthHandler();
