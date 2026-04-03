# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client before build
RUN npx prisma generate

RUN npm run build

# ─── Stage 3: Production runtime ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what's needed to run
COPY --from=builder /app/public*          ./public/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/prisma           ./prisma
COPY --from=builder /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma        ./node_modules/@prisma

USER appuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
