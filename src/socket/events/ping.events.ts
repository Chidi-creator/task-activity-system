import { Socket } from "socket.io";
import { BaseEvents } from "../base.events";
import SocketManager from "../socket.manager";

class PingEvents extends BaseEvents {
  registerEvents(manager: SocketManager, socket: Socket): void {
    socket.on("ping:check", () => {
      manager.emitToUser(socket.data.user.userId, "ping:response", {
        status: "connected",
        userId: socket.data.user.userId,
        connectedUsers: manager.getConnectedUsers().size,
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default PingEvents;
