import dotenv from "dotenv";
import middleware from "./middleware";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = middleware.getApp().listen(PORT, () => {
  console.log(`[server]: Running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("\n[server]: Shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
