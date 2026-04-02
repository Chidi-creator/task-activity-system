import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "@utils/jwt.util";
import { jwtConfig } from "@config/jwt.config";

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.[jwtConfig.cookieName];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};
