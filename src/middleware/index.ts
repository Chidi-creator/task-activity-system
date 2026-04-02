import Middleware from "./middleware";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";
import authRoutes from "@deliverymen/auth.delivery";

const app = express();
const middleware = new Middleware(app);

const setUpRoutes = (middleware: Middleware) => {
  const router = express.Router();

  router.get("/healthcheck", (_req: Request, res: Response) => {
    res.status(200).send("task-activity Server is up and running!");
  });

  router.use("/auth", authRoutes);

  middleware.addMiddleware("/api/v1", router);
};

const setUpMiddleware = () => {
  middleware.addMiddleware(cors());
  middleware.addMiddleware(helmet());
  middleware.addMiddleware(express.json());
  middleware.addMiddleware(cookieParser());
  middleware.addMiddleware(passport.initialize());

  setUpRoutes(middleware);
};

setUpMiddleware();
export default middleware;
