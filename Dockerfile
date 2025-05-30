FROM node:24-alpine AS base



FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm list sqlite3 | grep sqlite3 | awk '{print $2}' > SQLITE3



FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build



FROM base AS runner
WORKDIR /app

# the standalone output of Next.js was missing sqlite3
COPY --from=deps /app/SQLITE3 ./
RUN npm install $(cat SQLITE3)
RUN rm SQLITE3

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations

ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH} NODE_ENV=production

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
