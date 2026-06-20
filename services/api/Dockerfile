FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS installer
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=api build

FROM base AS production-deps
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestapi

COPY --from=installer /app/services/api/dist ./services/api/dist
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/services/api/node_modules ./services/api/node_modules
COPY --from=installer /app/services/api/package.json ./services/api/package.json

USER nestapi
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => { if (r.statusCode === 200 || r.statusCode === 404) process.exit(0); else process.exit(1); })"

CMD ["node", "services/api/dist/main.js"]
