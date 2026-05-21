import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException("Authentication required");
    }

    try {
      request.user = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret"
      });
      return true;
    } catch {
      throw new UnauthorizedException("Invalid session");
    }
  }
}
