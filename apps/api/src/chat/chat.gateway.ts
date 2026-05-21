import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { ChatMessageSchema } from "@galaxy-pong/shared";
import { PrismaService } from "../prisma/prisma.service";
import { authenticateSocket, SocketUser } from "./socket-auth";

type AuthedSocket = Socket & { user?: SocketUser };

@WebSocketGateway({ namespace: "/realtime", cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async handleConnection(socket: AuthedSocket) {
    const user = authenticateSocket(socket, this.jwt);
    if (!user) {
      socket.disconnect(true);
      return;
    }
    socket.user = user;
    socket.join("lobby");
    await this.prisma.user.update({ where: { id: user.sub }, data: { online: true } });
    this.server.to("lobby").emit("presence:update", { username: user.username, online: true });
    this.logger.log(`${user.username} connected`);
  }

  async handleDisconnect(socket: AuthedSocket) {
    if (!socket.user) return;
    await this.prisma.user.update({ where: { id: socket.user.sub }, data: { online: false } });
    this.server.to("lobby").emit("presence:update", { username: socket.user.username, online: false });
  }

  @SubscribeMessage("chat:send")
  async send(@ConnectedSocket() socket: AuthedSocket, @MessageBody() body: unknown) {
    if (!socket.user) return;
    const payload = ChatMessageSchema.parse(body);
    const message = {
      id: randomUUID(),
      username: socket.user.username,
      message: payload.message,
      whisper: Boolean(payload.toUsername),
      createdAt: new Date().toISOString()
    };

    if (payload.toUsername) {
      const sockets = await this.server.in("lobby").fetchSockets();
      for (const target of sockets) {
        const user = (target as unknown as AuthedSocket).user;
        if (user?.username === payload.toUsername || user?.username === socket.user.username) {
          target.emit("chat:message", message);
        }
      }
      return;
    }

    this.server.to("lobby").emit("chat:message", message);
  }
}
