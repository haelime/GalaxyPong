import { JwtService } from "@nestjs/jwt";
import { parse } from "cookie";
import type { Socket } from "socket.io";

export type SocketUser = { sub: string; username: string };

export function authenticateSocket(socket: Socket, jwt: JwtService): SocketUser | null {
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) return null;
  const token = parse(rawCookie).accessToken;
  if (!token) return null;
  try {
    return jwt.verify<SocketUser>(token, {
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret"
    });
  } catch {
    return null;
  }
}
