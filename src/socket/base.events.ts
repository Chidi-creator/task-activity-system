import { Socket } from "socket.io";
import SocketManager from "./socket.manager";

export abstract class BaseEvents {
  abstract registerEvents(manager: SocketManager, socket: Socket): void;
}
