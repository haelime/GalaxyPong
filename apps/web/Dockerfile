FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY packages/shared/src packages/shared/src
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
COPY apps/web/src apps/web/src
COPY apps/web/index.html apps/web/index.html
COPY apps/web/tsconfig.json apps/web/tsconfig.json
COPY apps/web/vite.config.ts apps/web/vite.config.ts
COPY apps/web/tailwind.config.ts apps/web/tailwind.config.ts
COPY apps/web/postcss.config.js apps/web/postcss.config.js
COPY apps/web/nginx.conf apps/web/nginx.conf
RUN pnpm --filter @galaxy-pong/shared build
RUN pnpm --filter @galaxy-pong/web build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
