FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN rm -rf /usr/local/lib/node_modules/npm && rm -f /usr/local/bin/npm /usr/local/bin/npx

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=api build
# Prune to production-only files for the api package
RUN pnpm --filter=api --prod deploy /app/pruned

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestapi

# Copy the self-contained pruned workspace from the builder stage
COPY --from=builder /app/pruned ./

USER nestapi
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => { if (r.statusCode === 200 || r.statusCode === 404) process.exit(0); else process.exit(1); })"

CMD ["node", "services/api/dist/main.js"]
