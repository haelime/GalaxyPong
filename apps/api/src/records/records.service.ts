import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const rows = await this.prisma.pongRecord.findMany({
      where: { OR: [{ winnerId: userId }, { loserId: userId }] },
      include: { winner: true, loser: true },
      orderBy: { endedAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      winnerUsername: row.winner.username,
      loserUsername: row.loser.username,
      winnerScore: row.winnerScore,
      loserScore: row.loserScore,
      endedAt: row.endedAt.toISOString()
    }));
  }
}
