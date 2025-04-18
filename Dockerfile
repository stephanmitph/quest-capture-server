FROM node:23-alpine AS base
# Builder stage for compiling applications
FROM base AS builder

WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./server/
COPY web/package*.json ./web/

# Install dependencies
RUN cd server && npm install --force
RUN cd web && npm install --force

# Copy source code
COPY . .

# Build the applications
RUN cd web && npm run build
RUN cd server && npm run build

# Production image
FROM base AS runner

ENV NODE_ENV=production

# Install production dependencies
RUN apk add --no-cache ffmpeg gawk
RUN npm install pm2 -g

# Create a non-root user
RUN addgroup --system --gid 1001 group 
RUN adduser --system --uid 1001 sipuser 

WORKDIR /app

# Copy built applications and configuration
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/web ./web
COPY --from=builder /app/server ./server

# Create data directory for file storage
RUN mkdir -p /app/data
RUN chown -R sipuser:group /app /app/data

USER sipuser

# Expose ports for both services
EXPOSE 3000 8080

# Run with PM2
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "docker"]