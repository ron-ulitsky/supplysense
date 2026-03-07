FROM node:22-alpine AS base

# ---------------------------------------------------------------------------
# Stage 1: Install Node.js dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: Install Python & ADK dependencies
# ---------------------------------------------------------------------------
FROM base AS python-deps
RUN apk add --no-cache python3 py3-pip
WORKDIR /app/agent

COPY agent/requirements.txt ./
RUN python3 -m pip install --break-system-packages --no-cache-dir -r requirements.txt

# ---------------------------------------------------------------------------
# Stage 3: Build the Next.js application
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 4: Production image (Next.js + Python ADK server)
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

# Install Python runtime and pip packages
RUN apk add --no-cache python3 py3-pip
COPY agent/ ./agent/
RUN python3 -m pip install --break-system-packages --no-cache-dir -r agent/requirements.txt

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the startup script
COPY --chown=nextjs:nodejs start.sh ./
RUN chmod +x start.sh

USER nextjs

EXPOSE 3000 8000

ENV PORT=3000
ENV ADK_BACKEND_URL=http://localhost:8000

# Start both the ADK Python server and the Next.js server
CMD ["sh", "start.sh"]
