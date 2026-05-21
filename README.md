# GalaxyPong

GalaxyPong is now structured as a modern TypeScript web project: React/Vite on the frontend, NestJS on the backend, PostgreSQL via Prisma, and Socket.IO for realtime chat and server-authoritative Pong matches.

## Stack

- Web: React, Vite, TypeScript, Tailwind CSS, Radix primitives, Three.js
- API: NestJS, Prisma, PostgreSQL, cookie-based JWT auth
- Realtime: Socket.IO for chat, matchmaking, and game state
- Infra: Docker Compose with K8s-ready service boundaries

## Features

- Email-verified registration and password login
- HttpOnly cookie sessions
- Arcade lobby with quick matchmaking
- Realtime chat with whisper command support
- Server-authoritative online Pong simulation
- Profile and match records
- Korean/English UI language support

42 OAuth was intentionally removed.

## Local Setup

```bash
cp .example_env .env
corepack pnpm install
corepack pnpm --filter @galaxy-pong/api prisma:generate
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

The web app runs at `http://localhost:5173` and proxies API/WebSocket traffic to `http://localhost:3000`.

## Docker

```bash
cp .example_env .env
docker compose up --build -d
```

Open `http://localhost:8080`.

## Project Structure

```text
apps/
  api/     NestJS API, Prisma schema, realtime gateways
  web/     React/Vite arcade SPA
packages/
  shared/  DTO schemas, shared types, socket contracts
infra/
  nginx/   edge proxy config
```

The legacy `backend/` and `frontend/` directories are retained as reference material during the rewrite and should not be used by the new runtime.
