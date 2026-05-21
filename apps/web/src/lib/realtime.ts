import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@galaxy-pong/shared";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("/realtime", {
      withCredentials: true,
      transports: ["websocket"]
    });
  }
  return socket;
}

export function resetSocket() {
  socket?.disconnect();
  socket = null;
}
