import { Router } from "express";
import authHandler from "@handlers/auth.handler";
import { authenticate } from "@middleware/auth.middleware";

const router = Router();

router.post("/register", (req, res) => authHandler.register(req, res));
router.post("/login", (req, res) => authHandler.login(req, res));
router.post("/logout", authenticate, (req, res) => authHandler.logout(req, res));

export default router;
