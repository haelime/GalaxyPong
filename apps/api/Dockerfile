FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY packages/shared/src packages/shared/src
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
COPY apps/api/src apps/api/src
COPY apps/api/prisma apps/api/prisma
COPY apps/api/tsconfig.json apps/api/tsconfig.json
COPY apps/api/nest-cli.json apps/api/nest-cli.json
COPY apps/api/jest.config.js apps/api/jest.config.js
RUN pnpm --filter @galaxy-pong/shared build
RUN pnpm --filter @galaxy-pong/api prisma:generate
RUN pnpm --filter @galaxy-pong/api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/packages/shared packages/shared
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/package.json apps/api/package.json
EXPOSE 3000
CMD ["sh", "-c", "node apps/api/node_modules/prisma/build/index.js db push --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]
