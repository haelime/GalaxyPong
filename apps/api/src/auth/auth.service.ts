import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";
import bcrypt from "bcryptjs";
import { LoginInput, RegisterCompleteInput } from "@galaxy-pong/shared";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";

type SessionPayload = { sub: string; username: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService
  ) {}

  async startRegistration(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException("Email is already registered");
    }
    await this.email.createVerification(email);
  }

  async completeRegistration(input: RegisterCompleteInput) {
    await this.email.consumeVerification(input.email, input.code);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        displayName: input.username,
        passwordHash
      }
    });
    return this.createSession(user.id, user.username);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { username: input.username } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { online: true } });
    return this.createSession(user.id, user.username);
  }

  async sessionUser(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      statusMessage: user.statusMessage,
      avatarUrl: user.avatarUrl,
      online: user.online
    };
  }

  createSession(id: string, username: string) {
    const payload: SessionPayload = { sub: id, username };
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
      expiresIn: "15m"
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
      expiresIn: "7d"
    });
    return {
      accessToken,
      refreshToken,
      user: { id, username }
    };
  }

  setSessionCookies(response: Response, session: { accessToken: string; refreshToken: string }) {
    const secure = process.env.NODE_ENV === "production";
    response.cookie("accessToken", session.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });
    response.cookie("refreshToken", session.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  clearSessionCookies(response: Response) {
    response.clearCookie("accessToken");
    response.clearCookie("refreshToken");
  }
}
