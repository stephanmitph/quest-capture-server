FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --force

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install ffmpeg in the runner image
RUN apk add --no-cache ffmpeg

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /dist ./dist

# Create directories for video processing
RUN mkdir -p /app/received_frames
RUN mkdir -p /app/public/videos
RUN mkdir -p /app/tmp

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Run migrations and seed the database
RUN mkdir -p /app/prisma/migrations
RUN npx prisma migrate deploy
RUN npx prisma db seed

USER nextjs

EXPOSE 3000
EXPOSE 8080

ENV PORT 3000
ENV TCP_SERVER_PORT 8080

CMD ["node", "server.js"]

