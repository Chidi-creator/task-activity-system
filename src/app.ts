import dotenv from "dotenv";
import http from "http";
import middleware from "./middleware";
import SocketManager from "./socket/socket.manager";
import PingEvents from "./socket/events/ping.events";
import TaskEvents from "./socket/events/task.events";
import PubSubManager from "@managers/pubsub.manager";
import { registerSubscriptions } from "./subscriptions";
import prisma from "./db/prisma.client";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(middleware.getApp());
const socketManager = SocketManager.getInstance();
const pubSubManager = PubSubManager.getInstance();

// Register socket event modules
socketManager.register("ping", new PingEvents());
socketManager.register("task", new TaskEvents());

prisma.$connect()
  .then(() => console.log("[db]: Connected"))
  .catch((err: Error) => console.error("[db]: Connection failed —", err.message));

socketManager.attach(server).then(() => {
  registerSubscriptions(pubSubManager, socketManager);
  server.listen(PORT, () => {
    console.log(`[server]: Running on port ${PORT}`);
  });
});

process.on("SIGINT", () => {
  console.log("\n[server]: Shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
