import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ProfileUpdateSchema, UsernameActionSchema } from "@galaxy-pong/shared";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtGuard } from "../auth/jwt.guard";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@CurrentUser() user: CurrentUser) {
    return this.users.listUsers(user.sub);
  }

  @Get("me")
  me(@CurrentUser() user: CurrentUser) {
    return this.users.profile(user.sub);
  }

  @Put("me")
  updateMe(@CurrentUser() user: CurrentUser, @Body() body: unknown) {
    return this.users.updateProfile(user.sub, ProfileUpdateSchema.parse(body));
  }

  @Get("relations/friends")
  friends(@CurrentUser() user: CurrentUser) {
    return this.users.friends(user.sub);
  }

  @Post("relations/friends")
  addFriend(@CurrentUser() user: CurrentUser, @Body() body: unknown) {
    return this.users.addFriend(user.sub, UsernameActionSchema.parse(body).username);
  }

  @Delete("relations/friends/:username")
  removeFriend(@CurrentUser() user: CurrentUser, @Param("username") username: string) {
    return this.users.removeFriend(user.sub, username);
  }

  @Get("relations/mutes")
  mutes(@CurrentUser() user: CurrentUser) {
    return this.users.mutes(user.sub);
  }

  @Post("relations/mutes")
  mute(@CurrentUser() user: CurrentUser, @Body() body: unknown) {
    return this.users.mute(user.sub, UsernameActionSchema.parse(body).username);
  }

  @Delete("relations/mutes/:username")
  unmute(@CurrentUser() user: CurrentUser, @Param("username") username: string) {
    return this.users.unmute(user.sub, username);
  }

  @Get(":username")
  byUsername(@Param("username") username: string) {
    return this.users.profileByUsername(username);
  }
}
