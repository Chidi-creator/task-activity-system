import { Router } from "express";
import TaskHandler from "@handlers/task.handler";
import { authenticate } from "@middleware/auth.middleware";

const router = Router();
const taskHandler = new TaskHandler();

router.use(authenticate);

router.post("/", taskHandler.create);
router.get("/", taskHandler.getAll);
router.patch("/:id", taskHandler.updateStatus);

export default router;
