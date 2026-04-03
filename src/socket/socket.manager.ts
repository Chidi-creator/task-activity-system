import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { parse as parseCookie } from "cookie";
import { verifyToken } from "@utils/jwt.util";
import { jwtConfig } from "@config/jwt.config";
import { redisConfig } from "@config/redis.config";
import { BaseEvents } from "./base.events";

class SocketManager {
  private static instance: SocketManager;
  private io: Server | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId (local instance only)
  private eventModules: Map<string, BaseEvents> = new Map();

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  async attach(server: HttpServer): Promise<void> {
    this.io = new Server(server, {
      cors: { origin: "*", credentials: true },
    });

    // Two separate Redis clients required by the adapter (pub + sub)
    const pubClient = new Redis(redisConfig.url);
    const subClient = pubClient.duplicate();

    this.io.adapter(createAdapter(pubClient, subClient));
    console.log("[socket]: Redis adapter attached — multi-instance ready");

    this.io.use((socket: Socket, next) => {
      try {
        // 1. cookie (browser)
        // 2. auth object (socket.io client: { auth: { token } })
        // 3. Authorization header (testing tools: Bearer <token>)
        const raw = socket.handshake.headers.cookie ?? "";
        const cookies = parseCookie(raw);
        const authHeader = Array.isArray(socket.handshake.headers.authorization)
          ? socket.handshake.headers.authorization[0]
          : socket.handshake.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
          ? authHeader.slice(7)
          : undefined;
        const token = cookies[jwtConfig.cookieName] ?? socket.handshake.auth?.token ?? bearerToken;


        if (!token) return next(new Error("Unauthorized"));

        socket.data.user = verifyToken(token);
        next();
      } catch {
        next(new Error("Invalid or expired session"));
      }
    });

    this.io.on("connection", (socket: Socket) => {
      const { userId } = socket.data.user;

      // Join a user-specific room so emitToUser works across instances
      socket.join(`user:${userId}`);
      this.connectedUsers.set(userId, socket.id);
      console.log(`[socket]: Connected — ${userId} (${socket.id})`);

      this.eventModules.forEach((mod) => mod.registerEvents(this, socket));

      socket.on("disconnect", () => {
        this.connectedUsers.delete(userId);
        console.log(`[socket]: Disconnected — ${userId}`);
      });
    });

    console.log("[socket]: Initialized");
  }

  register(name: string, mod: BaseEvents): void {
    this.eventModules.set(name, mod);
  }

  // Uses room `user:<userId>` — works across all instances via Redis adapter
  emitToUser(userId: string, event: string, data: unknown): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io?.to(socketId).emit(event, data);
    } else {
      this.io?.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToAll(event: string, data: unknown): void {
    this.io?.emit(event, data);
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    this.io?.to(room).emit(event, data);
  }

  joinRoom(socket: Socket, room: string): void {
    socket.join(room);
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers(): Map<string, string> {
    return this.connectedUsers;
  }
}

export default SocketManager;
