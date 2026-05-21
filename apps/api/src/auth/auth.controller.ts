import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { LoginSchema, RegisterCompleteSchema, RegisterStartSchema } from "@galaxy-pong/shared";
import { CurrentUser } from "./current-user.decorator";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register/start")
  async startRegistration(@Body() body: unknown) {
    const input = RegisterStartSchema.parse(body);
    await this.auth.startRegistration(input.email);
    return { ok: true };
  }

  @Post("register/complete")
  async completeRegistration(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = RegisterCompleteSchema.parse(body);
    const session = await this.auth.completeRegistration(input);
    this.auth.setSessionCookies(response, session);
    return { user: session.user };
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = LoginSchema.parse(body);
    const session = await this.auth.login(input);
    this.auth.setSessionCookies(response, session);
    return { user: session.user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    this.auth.clearSessionCookies(response);
    return { ok: true };
  }

  @Get("session")
  @UseGuards(JwtGuard)
  async session(@CurrentUser() user: CurrentUser) {
    return { user: await this.auth.sessionUser(user.sub) };
  }
}
