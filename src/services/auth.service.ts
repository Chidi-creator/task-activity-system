import { Response } from "express";
import { signToken, JwtPayload } from "@utils/jwt.util";
import { jwtConfig } from "@config/jwt.config";

class AuthService {
  issueToken(payload: JwtPayload): string {
    return signToken(payload);
  }

  setSessionCookie(res: Response, payload: JwtPayload): void {
    const token = this.issueToken(payload);
    res.cookie(jwtConfig.cookieName, token, jwtConfig.cookieOptions);
  }

  clearSessionCookie(res: Response): void {
    res.clearCookie(jwtConfig.cookieName);
  }
}

export default new AuthService();
