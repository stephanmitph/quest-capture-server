FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
COPY --from=builder /public ./public
COPY --from=builder /build/standalone ./
COPY --from=builder /build/static ./.next/static
COPY --from=builder /server.js ./server.js

# Create directories for file-based storage
RUN mkdir -p /data/collections
RUN mkdir -p /data/received_frames
RUN mkdir -p /public/videos

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
EXPOSE 8080

ENV PORT 3000
ENV TCP_SERVER_PORT 8080

CMD ["node", "server.js"]

