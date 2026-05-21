import { z } from "zod";

export const LocaleSchema = z.enum(["ko", "en"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const LoginSchema = z.object({
  username: z.string().min(2).max(32),
  password: z.string().min(8).max(128)
});

export const RegisterStartSchema = z.object({
  email: z.string().email()
});

export const RegisterCompleteSchema = LoginSchema.extend({
  email: z.string().email(),
  code: z.string().length(6)
});

export const ProfileUpdateSchema = z.object({
  statusMessage: z.string().max(100).optional(),
  displayName: z.string().min(2).max(40).optional()
});

export const UsernameActionSchema = z.object({
  username: z.string().min(2).max(32)
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  toUsername: z.string().min(2).max(32).optional()
});

export const GameInputSchema = z.object({
  matchId: z.string(),
  direction: z.enum(["left", "right", "idle"]),
  sequence: z.number().int().nonnegative()
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterStartInput = z.infer<typeof RegisterStartSchema>;
export type RegisterCompleteInput = z.infer<typeof RegisterCompleteSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type GameInput = z.infer<typeof GameInputSchema>;

export type PublicUser = {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  statusMessage: string;
  avatarUrl: string | null;
  online: boolean;
};

export type PongRecord = {
  id: string;
  winnerUsername: string;
  loserUsername: string;
  winnerScore: number;
  loserScore: number;
  endedAt: string;
};

export type ServerToClientEvents = {
  "chat:message": (payload: {
    id: string;
    username: string;
    message: string;
    whisper: boolean;
    createdAt: string;
  }) => void;
  "presence:update": (payload: { username: string; online: boolean }) => void;
  "matchmaking:queued": () => void;
  "matchmaking:matched": (payload: { matchId: string; opponent: string }) => void;
  "game:state": (payload: GameState) => void;
  "game:ended": (payload: PongRecord) => void;
  "error": (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  "chat:send": (payload: ChatMessageInput) => void;
  "matchmaking:quick-join": () => void;
  "matchmaking:quick-leave": () => void;
  "game:input": (payload: GameInput) => void;
};

export type GameState = {
  matchId: string;
  status: "waiting" | "countdown" | "playing" | "ended";
  players: Array<{ username: string; score: number; paddleX: number }>;
  ball: { x: number; y: number; vx: number; vy: number };
  serverTime: number;
};
