import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { GameState } from "@galaxy-pong/shared";
import { PrismaService } from "../prisma/prisma.service";

type PlayerRuntime = {
  userId: string;
  username: string;
  score: number;
  paddleX: number;
  input: "left" | "right" | "idle";
};

type MatchRuntime = {
  id: string;
  status: "waiting" | "countdown" | "playing" | "ended";
  players: [PlayerRuntime, PlayerRuntime];
  ball: { x: number; y: number; vx: number; vy: number };
};

const BOARD_WIDTH = 300;
const BOARD_HEIGHT = 400;
const PADDLE_HALF = 24;
const PADDLE_SPEED = 8;
const BALL_SPEED = 7;
const WIN_SCORE = 5;

@Injectable()
export class GameService {
  private readonly quickQueue: Array<{ userId: string; username: string }> = [];
  private readonly matches = new Map<string, MatchRuntime>();

  constructor(private readonly prisma: PrismaService) {}

  async joinQuick(userId: string, username: string) {
    if (this.quickQueue.some((entry) => entry.userId === userId)) {
      return null;
    }

    const opponent = this.quickQueue.shift();
    if (!opponent) {
      this.quickQueue.push({ userId, username });
      return null;
    }

    const match = await this.createMatch(opponent, { userId, username });
    return match;
  }

  leaveQuick(userId: string) {
    const index = this.quickQueue.findIndex((entry) => entry.userId === userId);
    if (index >= 0) this.quickQueue.splice(index, 1);
  }

  setInput(matchId: string, userId: string, direction: "left" | "right" | "idle") {
    const match = this.matches.get(matchId);
    const player = match?.players.find((candidate) => candidate.userId === userId);
    if (player) player.input = direction;
  }

  tick(matchId: string): GameState | null {
    const match = this.matches.get(matchId);
    if (!match || match.status === "ended") return null;

    match.status = "playing";
    for (const player of match.players) {
      if (player.input === "left") player.paddleX -= PADDLE_SPEED;
      if (player.input === "right") player.paddleX += PADDLE_SPEED;
      player.paddleX = Math.max(-BOARD_WIDTH / 2 + PADDLE_HALF, Math.min(BOARD_WIDTH / 2 - PADDLE_HALF, player.paddleX));
    }

    match.ball.x += match.ball.vx;
    match.ball.y += match.ball.vy;

    if (Math.abs(match.ball.x) > BOARD_WIDTH / 2) {
      match.ball.vx *= -1;
    }

    this.handlePaddleCollision(match, 0, -BOARD_HEIGHT / 2 + 18);
    this.handlePaddleCollision(match, 1, BOARD_HEIGHT / 2 - 18);

    if (match.ball.y > BOARD_HEIGHT / 2) {
      this.score(match, 0);
    }
    if (match.ball.y < -BOARD_HEIGHT / 2) {
      this.score(match, 1);
    }

    return this.toState(match);
  }

  async finishIfEnded(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match || match.status !== "ended") return null;
    const [first, second] = match.players;
    const winner = first.score > second.score ? first : second;
    const loser = first.score > second.score ? second : first;

    const record = await this.prisma.pongRecord.create({
      data: {
        matchId,
        winnerId: winner.userId,
        loserId: loser.userId,
        winnerScore: winner.score,
        loserScore: loser.score
      },
      include: { winner: true, loser: true }
    });

    await this.prisma.match.update({ where: { id: matchId }, data: { status: "ENDED", endedAt: new Date() } });
    this.matches.delete(matchId);

    return {
      id: record.id,
      winnerUsername: record.winner.username,
      loserUsername: record.loser.username,
      winnerScore: record.winnerScore,
      loserScore: record.loserScore,
      endedAt: record.endedAt.toISOString()
    };
  }

  private async createMatch(
    first: { userId: string; username: string },
    second: { userId: string; username: string }
  ) {
    const match = await this.prisma.match.create({
      data: {
        id: randomUUID(),
        status: "PLAYING",
        players: {
          create: [
            { userId: first.userId, slot: 0 },
            { userId: second.userId, slot: 1 }
          ]
        }
      }
    });

    const runtime: MatchRuntime = {
      id: match.id,
      status: "playing",
      players: [
        { ...first, score: 0, paddleX: 0, input: "idle" },
        { ...second, score: 0, paddleX: 0, input: "idle" }
      ],
      ball: { x: 0, y: 0, vx: BALL_SPEED, vy: BALL_SPEED }
    };
    this.matches.set(runtime.id, runtime);
    return runtime;
  }

  private handlePaddleCollision(match: MatchRuntime, playerIndex: 0 | 1, paddleY: number) {
    const player = match.players[playerIndex];
    const ball = match.ball;
    const verticalHit = playerIndex === 0 ? ball.y <= paddleY : ball.y >= paddleY;
    const horizontalHit = ball.x >= player.paddleX - PADDLE_HALF && ball.x <= player.paddleX + PADDLE_HALF;
    if (verticalHit && horizontalHit) {
      const offset = (ball.x - player.paddleX) / PADDLE_HALF;
      ball.vx = offset * BALL_SPEED;
      ball.vy = playerIndex === 0 ? BALL_SPEED : -BALL_SPEED;
    }
  }

  private score(match: MatchRuntime, playerIndex: 0 | 1) {
    match.players[playerIndex].score += 1;
    if (match.players[playerIndex].score >= WIN_SCORE) {
      match.status = "ended";
      return;
    }
    match.ball = { x: 0, y: 0, vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), vy: BALL_SPEED * (playerIndex === 0 ? -1 : 1) };
  }

  private toState(match: MatchRuntime): GameState {
    return {
      matchId: match.id,
      status: match.status,
      players: match.players.map((player) => ({
        username: player.username,
        score: player.score,
        paddleX: player.paddleX
      })),
      ball: match.ball,
      serverTime: Date.now()
    };
  }
}
