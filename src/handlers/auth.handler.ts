import { Request, Response } from "express";
import AuthUseCase from "@usecases/auth.usecase";
import AuthService from "@services/auth.service";
import { responseManager } from "@managers/index";
import { validateRegister, validateLogin } from "@validation/auth.validation";

class AuthHandler {
  private authUseCase: AuthUseCase;
  private authService: AuthService;

  constructor() {
    this.authUseCase = new AuthUseCase();
    this.authService = new AuthService();
  }
  register = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateRegister(req.body);
    if (error) {
      responseManager.validationError(res, error.details.map((d) => d.message));
      return;
    }
    try {
      const user = await this.authUseCase.register(req.body);
      this.authService.setSessionCookie(res, { userId: user.id, email: user.email });
      responseManager.success(res, user, "Account created successfully", 201);
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateLogin(req.body);
    if (error) {
      responseManager.validationError(res, error.details.map((d) => d.message));
      return;
    }
    try {
      const user = await this.authUseCase.login(req.body);
      this.authService.setSessionCookie(res, { userId: user.id, email: user.email });
      responseManager.success(res, user, "Login successful");
    } catch (error) {
      responseManager.handleError(res, error as Error);
    }
  }

  logout = async (_req: Request, res: Response): Promise<void> => {
    this.authService.clearSessionCookie(res);
    responseManager.success(res, {}, "Logged out successfully");
  }
}

export default AuthHandler
