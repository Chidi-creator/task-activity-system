import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import AuthHandler from "@handlers/auth.handler";

const router = Router();
const authHandler = new AuthHandler();

router.post("/register", authHandler.register);
router.post("/login", authHandler.login);
router.post("/logout", authenticate, authHandler.logout);

export default router;
