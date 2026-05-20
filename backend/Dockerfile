# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# OpenSSL is needed by Prisma's query engine on alpine
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

EXPOSE 3000
CMD ["./scripts/start-prod.sh"]
