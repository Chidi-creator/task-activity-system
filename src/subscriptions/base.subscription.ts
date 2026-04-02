import PubSubManager from "@managers/pubsub.manager";
import SocketManager from "../socket/socket.manager";

export abstract class BaseSubscription {
  abstract register(pubSub: PubSubManager, socket: SocketManager): void;
}
