import { BaseSubscription } from "./base.subscription";
import TaskSubscription from "./task.subscription";
import PubSubManager from "@managers/pubsub.manager";
import SocketManager from "../socket/socket.manager";

const subscriptions: BaseSubscription[] = [
  new TaskSubscription(),
];

export const registerSubscriptions = (
  pubSub: PubSubManager,
  socket: SocketManager
): void => {
  subscriptions.forEach((sub) => sub.register(pubSub, socket));
};
