FROM node:24-alpine AS base

# ----------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Save sqlite3 version for final install
RUN npm list sqlite3 | grep sqlite3 | awk '{print $2}' > SQLITE3

# ----------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ----------------------------
FROM base AS runner
WORKDIR /app

# Restore sqlite3 manually
COPY --from=deps /app/SQLITE3 ./
RUN npm install $(cat SQLITE3)
RUN rm SQLITE3

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy build outputs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client and migrations
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

# Install minimal prisma CLI (not the whole dev deps)
RUN npm install prisma --no-save

ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH} \
    NODE_ENV=production \
    DB_PATH=data/prod.db \
    DATABASE_URL=file:../data/prod.db

USER nextjs

EXPOSE 3000

# Run migrations and then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
