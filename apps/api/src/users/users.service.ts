import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ProfileUpdateInput } from "@galaxy-pong/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(currentUserId: string) {
    const users = await this.prisma.user.findMany({ orderBy: { username: "asc" } });
    return users.filter((user) => user.id !== currentUserId).map(this.toPublicUser);
  }

  async profile(id: string) {
    return this.toPublicUser(await this.prisma.user.findUniqueOrThrow({ where: { id } }));
  }

  async profileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException("User not found");
    return this.toPublicUser(user);
  }

  async updateProfile(id: string, input: ProfileUpdateInput) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        displayName: input.displayName,
        statusMessage: input.statusMessage
      }
    });
    return this.toPublicUser(user);
  }

  async friends(id: string) {
    const rows = await this.prisma.friendship.findMany({
      where: { requesterId: id },
      include: { receiver: true },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => this.toPublicUser(row.receiver));
  }

  async addFriend(id: string, username: string) {
    const target = await this.findTarget(id, username);
    await this.prisma.friendship.upsert({
      where: { requesterId_receiverId: { requesterId: id, receiverId: target.id } },
      update: {},
      create: { requesterId: id, receiverId: target.id }
    });
    return { ok: true };
  }

  async removeFriend(id: string, username: string) {
    const target = await this.findTarget(id, username);
    await this.prisma.friendship.deleteMany({ where: { requesterId: id, receiverId: target.id } });
    return { ok: true };
  }

  async mutes(id: string) {
    const rows = await this.prisma.userMute.findMany({
      where: { muterId: id },
      include: { muted: true },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => this.toPublicUser(row.muted));
  }

  async mute(id: string, username: string) {
    const target = await this.findTarget(id, username);
    await this.prisma.userMute.upsert({
      where: { muterId_mutedId: { muterId: id, mutedId: target.id } },
      update: {},
      create: { muterId: id, mutedId: target.id }
    });
    return { ok: true };
  }

  async unmute(id: string, username: string) {
    const target = await this.findTarget(id, username);
    await this.prisma.userMute.deleteMany({ where: { muterId: id, mutedId: target.id } });
    return { ok: true };
  }

  private async findTarget(id: string, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username } });
    if (!target) throw new NotFoundException("User not found");
    if (target.id === id) throw new BadRequestException("Cannot target yourself");
    return target;
  }

  private toPublicUser(user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    statusMessage: string;
    avatarUrl: string | null;
    online: boolean;
  }) {
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
}
