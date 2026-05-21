import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import type { Server, Socket } from "socket.io";
import { GameInputSchema } from "@galaxy-pong/shared";
import { authenticateSocket, SocketUser } from "../chat/socket-auth";
import { GameService } from "./game.service";

type AuthedSocket = Socket & { user?: SocketUser; activeMatchId?: string };

@WebSocketGateway({ namespace: "/realtime", cors: { origin: true, credentials: true } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly loops = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly jwt: JwtService,
    private readonly game: GameService
  ) {}

  handleConnection(socket: AuthedSocket) {
    socket.user = authenticateSocket(socket, this.jwt) ?? socket.user;
  }

  handleDisconnect(socket: AuthedSocket) {
    if (socket.user) {
      this.game.leaveQuick(socket.user.sub);
    }
  }

  @SubscribeMessage("matchmaking:quick-join")
  async quickJoin(@ConnectedSocket() socket: AuthedSocket) {
    if (!socket.user) return;
    const match = await this.game.joinQuick(socket.user.sub, socket.user.username);
    if (!match) {
      socket.emit("matchmaking:queued");
      return;
    }

    const sockets = await this.server.in("lobby").fetchSockets();
    const participants = sockets.filter((candidate) =>
      match.players.some((player) => player.userId === (candidate as unknown as AuthedSocket).user?.sub)
    );

    for (const participant of participants) {
      const authed = participant as unknown as AuthedSocket;
      authed.activeMatchId = match.id;
      await authed.join(`match:${match.id}`);
      const opponent = match.players.find((player) => player.userId !== authed.user?.sub);
      authed.emit("matchmaking:matched", { matchId: match.id, opponent: opponent?.username ?? "opponent" });
    }

    this.startLoop(match.id);
  }

  @SubscribeMessage("matchmaking:quick-leave")
  quickLeave(@ConnectedSocket() socket: AuthedSocket) {
    if (socket.user) this.game.leaveQuick(socket.user.sub);
  }

  @SubscribeMessage("game:input")
  input(@ConnectedSocket() socket: AuthedSocket, @MessageBody() body: unknown) {
    if (!socket.user) return;
    const input = GameInputSchema.parse(body);
    this.game.setInput(input.matchId, socket.user.sub, input.direction);
  }

  private startLoop(matchId: string) {
    if (this.loops.has(matchId)) return;
    const loop = setInterval(async () => {
      const state = this.game.tick(matchId);
      if (!state) {
        clearInterval(loop);
        this.loops.delete(matchId);
        return;
      }
      this.server.to(`match:${matchId}`).emit("game:state", state);
      if (state.status === "ended") {
        const record = await this.game.finishIfEnded(matchId);
        if (record) this.server.to(`match:${matchId}`).emit("game:ended", record);
        clearInterval(loop);
        this.loops.delete(matchId);
      }
    }, 1000 / 30);
    this.loops.set(matchId, loop);
  }
}
